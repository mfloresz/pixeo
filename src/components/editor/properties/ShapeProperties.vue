<template>
  <div class="flex items-center gap-4">
    <!-- Fill Color -->
    <Popover>
      <PopoverTrigger as-child>
        <button class="flex items-center gap-2 px-3 py-1.5 hover:bg-muted rounded-lg transition-colors">
          <div
            class="w-5 h-5 rounded border shadow-sm"
            :style="{ backgroundColor: layer.fill || '#3b82f6' }"
          />
          <span class="text-sm">Fill</span>
        </button>
      </PopoverTrigger>
      <PopoverContent class="p-0 w-auto">
        <ColorPicker
          :model-value="layer.fill || '#3b82f6'"
          @update:model-value="(val) => updateLayer('fill', val)"
        />
      </PopoverContent>
    </Popover>

    <div class="w-px h-6 bg-border" />

    <!-- Stroke Color -->
    <Popover>
      <PopoverTrigger as-child>
        <button class="flex items-center gap-2 px-3 py-1.5 hover:bg-muted rounded-lg transition-colors">
          <div
            class="w-5 h-5 rounded border shadow-sm"
            :style="{ backgroundColor: layer.stroke || 'transparent' }"
          />
          <span class="text-sm">Stroke</span>
        </button>
      </PopoverTrigger>
      <PopoverContent class="p-0 w-auto">
        <ColorPicker
          :model-value="layer.stroke || '#000000'"
          @update:model-value="(val) => updateLayer('stroke', val)"
        />
      </PopoverContent>
    </Popover>

    <div class="w-px h-6 bg-border" />

    <!-- Stroke Width -->
    <div class="flex items-center gap-2">
      <span class="text-xs text-muted-foreground">Stroke</span>
      <input
        v-model.number="layer.strokeWidth"
        type="number"
        min="0"
        class="w-14 px-2 py-1 bg-muted rounded text-xs"
        @change="updateLayer('strokeWidth', layer.strokeWidth)"
      />
    </div>

    <div class="w-px h-6 bg-border" />

    <!-- Dimensions (for rect) -->
    <template v-if="layer.type === 'rect'">
      <div class="flex items-center gap-2">
        <span class="text-xs text-muted-foreground">W</span>
        <input
          v-model.number="layer.width"
          type="number"
          class="w-14 px-2 py-1 bg-muted rounded text-xs"
          @change="updateLayer('width', layer.width)"
        />
        <span class="text-xs text-muted-foreground">H</span>
        <input
          v-model.number="layer.height"
          type="number"
          class="w-14 px-2 py-1 bg-muted rounded text-xs"
          @change="updateLayer('height', layer.height)"
        />
      </div>
    </template>

    <!-- Radius (for circle) -->
    <template v-if="layer.type === 'circle'">
      <div class="flex items-center gap-2">
        <span class="text-xs text-muted-foreground">Radius</span>
        <input
          v-model.number="layer.radius"
          type="number"
          class="w-16 px-2 py-1 bg-muted rounded text-xs"
          @change="updateLayer('radius', layer.radius)"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from "../../../stores/editor";
import type { EditorLayer } from "../../../types";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
