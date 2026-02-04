<template>
  <div class="space-y-6">
    <!-- Canvas Size -->
    <div>
      <h3 class="text-sm font-medium mb-3">Canvas Size</h3>
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label class="text-xs text-muted-foreground mb-1 block">Width</label>
          <input
            v-model.number="canvasWidth"
            type="number"
            min="100"
            max="4000"
            class="w-full px-3 py-2 bg-background border rounded-lg text-sm"
            @change="updateCanvasSize"
          />
        </div>
        <div>
          <label class="text-xs text-muted-foreground mb-1 block">Height</label>
          <input
            v-model.number="canvasHeight"
            type="number"
            min="100"
            max="4000"
            class="w-full px-3 py-2 bg-background border rounded-lg text-sm"
            @change="updateCanvasSize"
          />
        </div>
      </div>
      <button
        @click="applyCanvasSize"
        class="w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
      >
        Apply Size
      </button>
    </div>

    <div class="h-px bg-border" />

    <!-- Background Color -->
    <div>
      <h3 class="text-sm font-medium mb-3">Background Color</h3>
      <div class="grid grid-cols-6 gap-2 mb-3">
        <button
          v-for="color in presetColors"
          :key="color"
          @click="setBackgroundColor(color)"
          :class="[
            'w-10 h-10 rounded-lg border-2 transition-all',
            editorStore.backgroundColor === color ? 'border-primary scale-110' : 'border-transparent hover:scale-105'
          ]"
          :style="{ backgroundColor: color }"
        />
      </div>
      <div class="flex items-center gap-3">
        <input
          v-model="editorStore.backgroundColor"
          type="color"
          class="w-12 h-10 rounded-lg cursor-pointer border"
        />
        <input
          v-model="editorStore.backgroundColor"
          type="text"
          class="flex-1 px-3 py-2 bg-background border rounded-lg text-sm font-mono uppercase"
        />
      </div>
    </div>

    <div class="h-px bg-border" />

    <!-- Background Image -->
    <div>
      <h3 class="text-sm font-medium mb-3">Background Image</h3>
      <div class="space-y-3">
        <div
          v-if="editorStore.backgroundImage"
          class="relative aspect-video rounded-lg overflow-hidden border"
        >
          <img
            :src="editorStore.backgroundImage"
            class="w-full h-full object-cover"
            alt="Background"
          />
          <button
            @click="clearBackgroundImage"
            class="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
        <div class="flex gap-2">
          <button
            @click="triggerBgImageUpload"
            class="flex-1 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors"
          >
            <Upload class="w-4 h-4 inline mr-1" />
            Upload Image
          </button>
          <button
            v-if="editorStore.backgroundImage"
            @click="clearBackgroundImage"
            class="px-3 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg text-sm transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <input
      ref="bgImageInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleBgImageUpload"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { X, Upload } from "lucide-vue-next";
import { useEditorStore } from "../../../stores/editor";
import { toast } from "vue-sonner";

const editorStore = useEditorStore();
const bgImageInput = ref<HTMLInputElement | null>(null);

const canvasWidth = ref(editorStore.canvasWidth);
const canvasHeight = ref(editorStore.canvasHeight);

const presetColors = [
  "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", "#cbd5e1", "#94a3b8",
  "#1e293b", "#0f172a", "#000000", "#ef4444", "#f97316", "#f59e0b",
  "#84cc16", "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
];

function setBackgroundColor(color: string) {
  editorStore.setBackgroundColor(color);
}

function triggerBgImageUpload() {
  bgImageInput.value?.click();
}

function handleBgImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const src = e.target?.result as string;
    editorStore.setBackgroundImage(src);
    toast.success("Background image added");
  };
  reader.readAsDataURL(file);

  input.value = "";
}

function clearBackgroundImage() {
  editorStore.setBackgroundImage(undefined);
  toast.success("Background image removed");
}

function updateCanvasSize() {
  // Clamp values
  canvasWidth.value = Math.max(100, Math.min(4000, canvasWidth.value));
  canvasHeight.value = Math.max(100, Math.min(4000, canvasHeight.value));
}

function applyCanvasSize() {
  editorStore.setCanvasSize(canvasWidth.value, canvasHeight.value);
  toast.success(`Canvas size updated to ${canvasWidth.value}×${canvasHeight.value}px`);
}
</script>
