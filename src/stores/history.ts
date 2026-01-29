// src/stores/history.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import { openDB, type IDBPDatabase } from "idb";
import type { HistoryItem } from "../types";

const DB_NAME = "pixeo_db";
const STORE_NAME = "history";
const BLOB_STORE = "blobs";
const THUMB_STORE = "thumbnails";

export const useHistoryStore = defineStore("history", () => {
  const items = ref<HistoryItem[]>([]);
  const sessionItems = ref<HistoryItem[]>([]);
  let db: IDBPDatabase | null = null;
  const blobCache = new Map<string, Blob>();
  const thumbCache = new Map<string, Blob>();
  const CACHE_MAX_SIZE = 50;

  async function generateThumbnail(blob: Blob, type: string): Promise<Blob | null> {
    if (type === 'image') {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.src = url;
      await new Promise(resolve => img.onload = resolve);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = 256;
      canvas.height = 256;
      const aspect = img.width / img.height;
      let sw, sh, sx, sy;
      if (aspect > 1) {
        sw = img.height;
        sh = img.height;
        sx = (img.width - sw) / 2;
        sy = 0;
      } else {
        sw = img.width;
        sh = img.width;
        sx = 0;
        sy = (img.height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 256, 256);
      URL.revokeObjectURL(url);
      return new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.8));
    } else if (type === 'video') {
      const video = document.createElement('video');
      const url = URL.createObjectURL(blob);
      video.src = url;
      video.preload = 'metadata';
      await new Promise(resolve => video.onloadedmetadata = resolve);
      video.currentTime = 0;
      await new Promise(resolve => video.onseeked = resolve);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = 256;
      canvas.height = 256;
      ctx.drawImage(video, 0, 0, 256, 256);
      URL.revokeObjectURL(url);
      return new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.8));
    } else {
      return null;
    }
  }

  async function initDB() {
    if (db) return;
    db = await openDB(DB_NAME, 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(BLOB_STORE)) {
          db.createObjectStore(BLOB_STORE);
        }
        if (!db.objectStoreNames.contains(THUMB_STORE)) {
          db.createObjectStore(THUMB_STORE);
        }
      },
    });
    await loadItems();
  }

  async function loadItems() {
    if (!db) await initDB();
    const allItems = await db!.getAll(STORE_NAME);
    items.value = allItems.sort(
      (a, b) => (b.timestamp as any) - (a.timestamp as any),
    );
  }

  async function migrateTimestamps(): Promise<number> {
    if (!db) await initDB();
    const allItems = await db!.getAll(STORE_NAME);
    let migrated = 0;

    for (const item of allItems) {
      if (typeof item.timestamp === 'string') {
        const updated = { ...item, timestamp: new Date(item.timestamp) };
        await db!.put(STORE_NAME, updated);
        migrated++;
      }
    }

    await loadItems();
    return migrated;
  }

  async function migrateModes(): Promise<number> {
    if (!db) await initDB();
    const allItems = await db!.getAll(STORE_NAME);
    let migrated = 0;

    for (const item of allItems) {
      // Skip items that already have a mode
      if (item.mode) continue;

      // Infer mode from type
      let inferredMode = 'text2image';
      if (item.type === 'video') {
        inferredMode = 'text2video';
      } else if (item.type === 'audio') {
        inferredMode = 'text2speech';
      }

      // If item has image_b64s or similar fields in params, it might be image-edit
      if (item.params && (item.params.image_b64s || item.params.image || item.params.img_b64)) {
        inferredMode = 'image-edit';
      }

      // If it's an inpaint-type image, it's inpaint
      const inpaintKeywords = ['inpaint', 'edit', 'enhance'];
      const promptLower = (item.params?.prompt || '').toLowerCase();
      if (inpaintKeywords.some(keyword => promptLower.includes(keyword))) {
        inferredMode = 'inpaint';
      }

      const updated = { ...item, mode: inferredMode };
      await db!.put(STORE_NAME, updated);
      migrated++;
    }

    await loadItems();
    return migrated;
  }

  async function addItem(item: Omit<HistoryItem, "timestamp">, blob: Blob) {
    if (!db) await initDB();
    const fullItem: HistoryItem = { ...item, timestamp: new Date() };

    await db!.put(STORE_NAME, fullItem);
    await db!.put(BLOB_STORE, blob, fullItem.id);

    const thumb = await generateThumbnail(blob, item.type);
    if (thumb) {
      await db!.put(THUMB_STORE, thumb, fullItem.id);
    }

    items.value.unshift(fullItem);
    sessionItems.value.unshift(fullItem);
  }

  function clearSession() {
    sessionItems.value = [];
  }

  async function getBlob(id: string): Promise<Blob | null> {
    if (!db) await initDB();

    if (blobCache.has(id)) {
      return blobCache.get(id)!;
    }

    const blob = await db!.get(BLOB_STORE, id);
    if (blob) {
      if (blobCache.size >= CACHE_MAX_SIZE) {
        const firstKey = blobCache.keys().next().value;
        if (firstKey) {
          blobCache.delete(firstKey);
        }
      }
      blobCache.set(id, blob);
    }
    return blob;
  }

  async function getThumbnail(id: string): Promise<Blob | null> {
    if (!db) await initDB();

    if (thumbCache.has(id)) {
      return thumbCache.get(id)!;
    }

    const thumb = await db!.get(THUMB_STORE, id);
    if (thumb) {
      if (thumbCache.size >= CACHE_MAX_SIZE) {
        const firstKey = thumbCache.keys().next().value;
        if (firstKey) {
          thumbCache.delete(firstKey);
        }
      }
      thumbCache.set(id, thumb);
    }
    return thumb;
  }

  async function removeItem(id: string) {
    if (!db) await initDB();
    await db!.delete(STORE_NAME, id);
    await db!.delete(BLOB_STORE, id);
    await db!.delete(THUMB_STORE, id);
    blobCache.delete(id);
    thumbCache.delete(id);
    items.value = items.value.filter((i) => i.id !== id);
  }

  async function clearAll() {
    if (!db) await initDB();
    await db!.clear(STORE_NAME);
    await db!.clear(BLOB_STORE);
    await db!.clear(THUMB_STORE);
    items.value = [];
    blobCache.clear();
    thumbCache.clear();
  }

  async function clearOrphanedThumbnails() {
    if (!db) await initDB();
    const allThumbKeys = await db!.getAllKeys(THUMB_STORE);
    const allItemIds = items.value.map(i => i.id);
    for (const key of allThumbKeys) {
      if (!allItemIds.includes(key as string)) {
        await db!.delete(THUMB_STORE, key);
        thumbCache.delete(key as string);
      }
    }
  }

  async function regenerateThumbnails() {
    if (!db) await initDB();
    thumbCache.clear();
    for (const item of items.value) {
      const blob = await db!.get(BLOB_STORE, item.id);
      if (blob) {
        const thumb = await generateThumbnail(blob, item.type);
        if (thumb) {
          await db!.put(THUMB_STORE, thumb, item.id);
        }
      }
    }
  }

  async function exportProject(): Promise<void> {
    if (!db) await initDB();

    const allItems = await db!.getAll(STORE_NAME);
    const blobs: Record<string, string> = {};
    const thumbnails: Record<string, string> = {};

    for (const item of allItems) {
      const blob = await db!.get(BLOB_STORE, item.id);
      if (blob) {
        blobs[item.id] = await blobToBase64(blob);
      }

      const thumb = await db!.get(THUMB_STORE, item.id);
      if (thumb) {
        thumbnails[item.id] = await blobToBase64(thumb);
      }
    }

    const exportData = {
      version: 1,
      exportDate: new Date().toISOString(),
      items: allItems,
      blobs,
      thumbnails
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixeo-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importProject(file: File): Promise<{ imported: number; skipped: number }> {
    if (!db) await initDB();

    const text = await file.text();
    const data = JSON.parse(text);

    if (data.version !== 1) {
      throw new Error('Versión de archivo no compatible');
    }

    const existingIds = new Set((await db!.getAllKeys(STORE_NAME)).map(k => k as string));
    let imported = 0;
    let skipped = 0;

    for (const item of data.items) {
      if (existingIds.has(item.id)) {
        skipped++;
        continue;
      }

      const itemWithDate = {
        ...item,
        timestamp: new Date(item.timestamp)
      };
      await db!.put(STORE_NAME, itemWithDate);

      if (data.blobs && data.blobs[item.id]) {
        const blob = base64ToBlob(data.blobs[item.id]);
        await db!.put(BLOB_STORE, blob, item.id);
      }

      if (data.thumbnails && data.thumbnails[item.id]) {
        const thumb = base64ToBlob(data.thumbnails[item.id]);
        await db!.put(THUMB_STORE, thumb, item.id);
      }

      imported++;
    }

    await loadItems();
    return { imported, skipped };
  }

  async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function base64ToBlob(base64: string): Blob {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  async function exportAllAsZip(): Promise<void> {
    if (!db) await initDB();

    const allItems = await db!.getAll(STORE_NAME);
    if (allItems.length === 0) return;

    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    for (const item of allItems) {
      const blob = await db!.get(BLOB_STORE, item.id);
      if (blob) {
        const extension = blob.type.split('/')[1] || 'png';
        const filename = `${item.prompt?.substring(0, 50) || 'image'}_${item.id}.${extension}`;
        zip.file(filename, blob);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixeo-images-${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return {
    items,
    sessionItems,
    addItem,
    getBlob,
    getThumbnail,
    removeItem,
    clearAll,
    clearOrphanedThumbnails,
    regenerateThumbnails,
    exportProject,
    importProject,
    exportAllAsZip,
    initDB,
    clearSession,
    migrateTimestamps,
    migrateModes,
  };
});
