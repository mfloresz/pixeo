<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between p-3 border-b">
      <span class="text-sm font-medium">Properties</span>
    </div>
    
    <!-- No Selection -->
    <div
      v-if="!editorStore.selectedLayer"
      class="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4"
    >
      <MousePointer2 class="w-8 h-8 mb-2 opacity-50" />
      <p class="text-sm text-center">Select a layer to edit its properties</p>
    </div>
    
    <!-- Properties Panel -->
    <div v-else class="flex-1 overflow-y-auto p-4 space-y-6">
      <!-- Layer Name -->
      <div class="space-y-2">
        <label class="text-xs font-medium text-muted-foreground uppercase">Name</label>
        <input
          v-model="layer.name"
          type="text"
          class="w-full px-3 py-2 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
          @change="updateLayer('name', layer.name)"
        />
      </div>
      
      <!-- Transform -->
      <div class="space-y-3">
        <label class="text-xs font-medium text-muted-foreground uppercase">Transform</label>
        
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-xs text-muted-foreground mb-1 block">X</label>
            <input
              v-model.number="layer.x"
              type="number"
              class="w-full px-2 py-1.5 bg-muted rounded text-sm"
              @change="updateLayer('x', layer.x)"
            />
          </div>
          <div>
            <label class="text-xs text-muted-foreground mb-1 block">Y</label>
            <input
              v-model.number="layer.y"
              type="number"
              class="w-full px-2 py-1.5 bg-muted rounded text-sm"
              @change="updateLayer('y', layer.y)"
            />
          </div>
        </div>
        
        <!-- Size (for rect, image, text) -->
        <div v-if="showSizeControls" class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-xs text-muted-foreground mb-1 block">Width</label>
            <input
              v-model.number="layer.width"
              type="number"
              class="w-full px-2 py-1.5 bg-muted rounded text-sm"
              @change="updateLayer('width', layer.width)"
            />
          </div>
          <div>
            <label class="text-xs text-muted-foreground mb-1 block">Height</label>
            <input
              v-model.number="layer.height"
              type="number"
              class="w-full px-2 py-1.5 bg-muted rounded text-sm"
              @change="updateLayer('height', layer.height)"
            />
          </div>
        </div>
        
        <!-- Radius (for circle) -->
        <div v-if="layer.type === 'circle'">
          <label class="text-xs text-muted-foreground mb-1 block">Radius</label>
          <input
            v-model.number="layer.radius"
            type="number"
            class="w-full px-2 py-1.5 bg-muted rounded text-sm"
            @change="updateLayer('radius', layer.radius)"
          />
        </div>
        
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-xs text-muted-foreground mb-1 block">Rotation</label>
            <input
              v-model.number="layer.rotation"
              type="number"
              class="w-full px-2 py-1.5 bg-muted rounded text-sm"
              @change="updateLayer('rotation', layer.rotation)"
            />
          </div>
          <div>
            <label class="text-xs text-muted-foreground mb-1 block">Opacity</label>
            <input
              v-model.number="layer.opacity"
              type="number"
              min="0"
              max="1"
              step="0.1"
              class="w-full px-2 py-1.5 bg-muted rounded text-sm"
              @change="updateLayer('opacity', layer.opacity)"
            />
          </div>
        </div>
      </div>
      
      <!-- Text Properties -->
      <div v-if="layer.type === 'text'" class="space-y-3">
        <label class="text-xs font-medium text-muted-foreground uppercase">Text</label>
        
        <div>
          <label class="text-xs text-muted-foreground mb-1 block">Content</label>
          <textarea
            v-model="layer.text"
            rows="3"
            class="w-full px-3 py-2 bg-muted rounded-lg text-sm outline-none resize-none"
            @change="updateLayer('text', layer.text)"
          />
        </div>
        
        <div>
          <label class="text-xs text-muted-foreground mb-1 block">Font Family</label>
          <select
            v-model="layer.fontFamily"
            class="w-full px-3 py-2 bg-muted rounded-lg text-sm outline-none"
            @change="updateLayer('fontFamily', layer.fontFamily)"
          >
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
            <option value="Helvetica">Helvetica</option>
          </select>
        </div>
        
        <div>
          <label class="text-xs text-muted-foreground mb-1 block">Font Size</label>
          <input
            v-model.number="layer.fontSize"
            type="number"
            class="w-full px-3 py-2 bg-muted rounded-lg text-sm"
            @change="updateLayer('fontSize', layer.fontSize)"
          />
        </div>
      </div>
      
      <!-- Appearance -->
      <div class="space-y-3">
        <label class="text-xs font-medium text-muted-foreground uppercase">Appearance</label>
        
        <!-- Fill Color -->
        <div v-if="showFillControl">
          <label class="text-xs text-muted-foreground mb-1 block">Fill Color</label>
          <div class="flex gap-2">
            <input
              v-model="fillColor"
              type="color"
              class="w-10 h-9 rounded cursor-pointer"
            />
            <input
              v-model="fillColor"
              type="text"
              class="flex-1 px-3 py-2 bg-muted rounded-lg text-sm uppercase"
            />
          </div>
        </div>
        
        <!-- Stroke -->
        <div v-if="showStrokeControl">
          <label class="text-xs text-muted-foreground mb-1 block">Stroke Color</label>
          <div class="flex gap-2">
            <input
              v-model="strokeColor"
              type="color"
              class="w-10 h-9 rounded cursor-pointer"
            />
            <input
              v-model="strokeColor"
              type="text"
              class="flex-1 px-3 py-2 bg-muted rounded-lg text-sm uppercase"
            />
          </div>
        </div>
        
        <!-- Stroke Width -->
        <div v-if="showStrokeControl">
          <label class="text-xs text-muted-foreground mb-1 block">Stroke Width</label>
          <input
            v-model.number="layer.strokeWidth"
            type="number"
            min="0"
            class="w-full px-3 py-2 bg-muted rounded-lg text-sm"
            @change="updateLayer('strokeWidth', layer.strokeWidth)"
          />
        </div>
      </div>
      
      <!-- Actions -->
      <div class="pt-4 border-t space-y-2">
        <button
          @click="editorStore.duplicateLayer(layer.id)"
          class="w-full px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Copy class="w-4 h-4" />
          Duplicate
        </button>
        <button
          @click="editorStore.deleteLayer(layer.id)"
          class="w-full px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 class="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { MousePointer2, Copy, Trash2 } from "lucide-vue-next";
import { useEditorStore } from "../../stores/editor";
import type { EditorLayer } from "../../types";

const editorStore = useEditorStore();

const layer = computed(() => {
  return editorStore.selectedLayer || ({} as EditorLayer);
});

const showSizeControls = computed(() => {
  return ["rect", "image", "text"].includes(layer.value.type);
});

const showFillControl = computed(() => {
  return ["text", "rect", "circle"].includes(layer.value.type);
});

const showStrokeControl = computed(() => {
  return ["rect", "circle", "line"].includes(layer.value.type);
});

// Computed properties for color values with defaults
const fillColor = computed({
  get: () => layer.value.fill || "#000000",
  set: (value: string) => {
    if (!editorStore.selectedLayer) return;
    editorStore.updateLayer(editorStore.selectedLayer.id, { fill: value });
  }
});

const strokeColor = computed({
  get: () => layer.value.stroke || "#000000",
  set: (value: string) => {
    if (!editorStore.selectedLayer) return;
    editorStore.updateLayer(editorStore.selectedLayer.id, { stroke: value });
  }
});

function updateLayer(key: keyof EditorLayer, value: any) {
  if (!editorStore.selectedLayer) return;
  editorStore.updateLayer(editorStore.selectedLayer.id, { [key]: value });
}
</script>
