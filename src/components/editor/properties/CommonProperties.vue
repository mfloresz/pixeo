<template>
  <div class="flex items-center gap-4">
    <!-- Position -->
    <div class="flex items-center gap-2">
      <span class="text-xs text-muted-foreground">X</span>
      <input
        v-model.number="layer.x"
        type="number"
        class="w-16 px-2 py-1 bg-muted rounded text-xs"
        @change="updateLayer('x', layer.x)"
      />
      <span class="text-xs text-muted-foreground">Y</span>
      <input
        v-model.number="layer.y"
        type="number"
        class="w-16 px-2 py-1 bg-muted rounded text-xs"
        @change="updateLayer('y', layer.y)"
      />
    </div>

    <div class="w-px h-6 bg-border" />

    <!-- Rotation -->
    <div class="flex items-center gap-2">
      <RotateCw class="w-3 h-3 text-muted-foreground" />
      <input
        v-model.number="layer.rotation"
        type="number"
        class="w-14 px-2 py-1 bg-muted rounded text-xs"
        @change="updateLayer('rotation', layer.rotation)"
      />
      <span class="text-xs text-muted-foreground">°</span>
    </div>

    <div class="w-px h-6 bg-border" />

    <!-- Opacity -->
    <div class="flex items-center gap-2">
      <Eye class="w-3 h-3 text-muted-foreground" />
      <input
        v-model.number="layer.opacity"
        type="number"
        min="0"
        max="1"
        step="0.1"
        class="w-14 px-2 py-1 bg-muted rounded text-xs"
        @change="updateLayer('opacity', layer.opacity)"
      />
    </div>

    <div class="w-px h-6 bg-border" />

    <!-- Layer Actions -->
    <div class="flex items-center gap-1">
      <button
        @click="editorStore.duplicateLayer(layer.id)"
        class="p-1.5 hover:bg-muted rounded transition-colors"
        title="Duplicate"
      >
        <Copy class="w-3 h-3" />
      </button>
      <button
        @click="editorStore.deleteLayer(layer.id)"
        class="p-1.5 hover:bg-destructive/10 text-destructive rounded transition-colors"
        title="Delete"
      >
        <Trash2 class="w-3 h-3" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RotateCw, Eye, Copy, Trash2 } from "lucide-vue-next";
import { useEditorStore } from "../../../stores/editor";
import type { EditorLayer } from "../../../types";

const editorStore = useEditorStore();

const props = defineProps<{
  layer: EditorLayer;
}>();

const emit = defineEmits<{
  update: [key: keyof EditorLayer, value: any];
}>();

function updateLayer(key: keyof EditorLayer, value: any) {
  emit("update", key, value);
}
</script>
