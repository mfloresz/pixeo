<template>
  <div class="space-y-6">
    <!-- Select Image Button -->
    <div>
      <button
        @click="triggerImageUpload"
        class="w-full p-4 border-2 border-dashed border-primary/30 rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center gap-2"
      >
        <ImagePlus class="w-8 h-8 text-primary" />
        <span class="text-sm font-medium">Select Image</span>
        <span class="text-xs text-muted-foreground">Click to upload from files</span>
      </button>
      <input
        ref="imageInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleImageUpload"
      />
    </div>

    <!-- Library Section -->
    <div v-if="filteredImages.length > 0">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium">Library</span>
        <span class="text-xs text-muted-foreground">{{ filteredImages.length }} images</span>
      </div>

      <!-- Image Grid -->
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="item in filteredImages"
          :key="item.id"
          @click="addImageFromLibrary(item.id)"
          class="relative aspect-square rounded-lg overflow-hidden border hover:border-primary hover:ring-2 hover:ring-primary/20 transition-all group"
          :title="`Add ${getModeLabel(item.mode)} image`"
        >
          <img
            v-if="thumbnailUrls[item.id]"
            :src="thumbnailUrls[item.id]"
            class="w-full h-full object-cover"
            alt="Library thumbnail"
          />
          <div
            v-else
            class="w-full h-full bg-muted flex items-center justify-center"
          >
            <ImageIcon class="w-8 h-8 text-muted-foreground/50" />
          </div>
          
          <!-- Hover overlay -->
          <div class="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Plus class="w-6 h-6 text-primary" />
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { ImagePlus, Image as ImageIcon, Plus } from "lucide-vue-next";
import { useEditorStore } from "../../../stores/editor";
import { useHistoryStore } from "../../../stores/history";
import { getModeDefaultLabel } from "../../../lib/modeIcons";
import { toast } from "vue-sonner";

const editorStore = useEditorStore();
const historyStore = useHistoryStore();

const imageInput = ref<HTMLInputElement | null>(null);
const thumbnailUrls = ref<Record<string, string>>({});
const objectUrls: string[] = [];

// Filter only image type with specific modes
const filteredImages = computed(() => {
  const allowedModes = ["text2image", "image-edit", "inpaint"];
  return historyStore.items.filter(
    (item) => item.type === "image" && allowedModes.includes(item.mode)
  );
});

// Load thumbnails when component mounts
onMounted(async () => {
  await historyStore.initDB();
  await loadThumbnails();
});

// Cleanup object URLs when component unmounts
onUnmounted(() => {
  objectUrls.forEach((url) => URL.revokeObjectURL(url));
});

async function loadThumbnails() {
  for (const item of filteredImages.value) {
    try {
      const thumbBlob = await historyStore.getThumbnail(item.id);
      if (thumbBlob) {
        const url = URL.createObjectURL(thumbBlob);
        thumbnailUrls.value[item.id] = url;
        objectUrls.push(url);
      }
    } catch (error) {
      console.error(`Failed to load thumbnail for ${item.id}:`, error);
    }
  }
}

function getModeLabel(mode: string): string {
  return getModeDefaultLabel(mode);
}

function triggerImageUpload() {
  imageInput.value?.click();
}

async function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      editorStore.addLayer("image", {
        src,
        x: editorStore.canvasWidth / 2,
        y: editorStore.canvasHeight / 2,
      });
      toast.success("Image added to canvas");
    };
    reader.readAsDataURL(file);
  } catch (error) {
    toast.error("Failed to load image");
    console.error(error);
  }

  input.value = "";
}

async function addImageFromLibrary(itemId: string) {
  try {
    const blob = await historyStore.getBlob(itemId);
    if (!blob) {
      toast.error("Image not found in library");
      return;
    }

    const src = URL.createObjectURL(blob);
    objectUrls.push(src);

    editorStore.addLayer("image", {
      src,
      x: editorStore.canvasWidth / 2,
      y: editorStore.canvasHeight / 2,
    });

    toast.success("Image added from library");
  } catch (error) {
    toast.error("Failed to add image from library");
    console.error(error);
  }
}
</script>
