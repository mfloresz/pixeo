// src/stores/history.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { openDB, type IDBPDatabase } from 'idb';

export interface HistoryItem {
    id: string;
    type: 'image' | 'video' | 'audio';
    mode: string;
    model: string;
    params: any;
    timestamp: Date;
    blobKey: string;
}

const DB_NAME = 'pixeo_db';
const STORE_NAME = 'history';
const BLOB_STORE = 'blobs';

export const useHistoryStore = defineStore('history', () => {
    const items = ref<HistoryItem[]>([]);
    const sessionItems = ref<HistoryItem[]>([]);
    let db: IDBPDatabase | null = null;

    async function initDB() {
        if (db) return;
        db = await openDB(DB_NAME, 1, {
            upgrade(db) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                db.createObjectStore(BLOB_STORE);
            },
        });
        await loadItems();
    }

    async function loadItems() {
        if (!db) await initDB();
        const allItems = await db!.getAll(STORE_NAME);
        items.value = allItems.sort((a, b) => (b.timestamp as any) - (a.timestamp as any));
    }

    async function addItem(item: Omit<HistoryItem, 'timestamp'>, blob: Blob) {
        if (!db) await initDB();
        const fullItem: HistoryItem = { ...item, timestamp: new Date() };

        await db!.put(STORE_NAME, fullItem);
        await db!.put(BLOB_STORE, blob, fullItem.id);

        items.value.unshift(fullItem);
        sessionItems.value.unshift(fullItem);
    }

    function clearSession() {
        sessionItems.value = [];
    }

    async function getBlob(id: string): Promise<Blob | null> {
        if (!db) await initDB();
        return db!.get(BLOB_STORE, id);
    }

    async function removeItem(id: string) {
        if (!db) await initDB();
        await db!.delete(STORE_NAME, id);
        await db!.delete(BLOB_STORE, id);
        items.value = items.value.filter(i => i.id !== id);
    }

    return { items, sessionItems, addItem, getBlob, removeItem, initDB, clearSession };
});
