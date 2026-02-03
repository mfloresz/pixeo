<template>
  <div class="flex items-center gap-4">
    <!-- Stroke Color -->
    <Popover>
      <PopoverTrigger as-child>
        <button class="flex items-center gap-2 px-3 py-1.5 hover:bg-muted rounded-lg transition-colors">
          <div
            class="w-5 h-5 rounded border shadow-sm"
            :style="{ backgroundColor: layer.stroke || '#000000' }"
          />
          <span class="text-sm">Color</span>
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
      <span class="text-xs text-muted-foreground">Width</span>
      <input
        v-model.number="layer.strokeWidth"
        type="number"
        min="1"
        class="w-14 px-2 py-1 bg-muted rounded text-xs"
        @change="updateLayer('strokeWidth', layer.strokeWidth)"
      />
    </div>

    <div class="w-px h-6 bg-border" />

    <!-- Line Points -->
    <Popover>
      <PopoverTrigger as-child>
        <button class="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors">
          <span>Edit Points</span>
        </button>
      </PopoverTrigger>
      <PopoverContent class="w-64">
        <div class="space-y-2">
          <label class="text-sm font-medium">Line Points</label>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <span class="text-xs text-muted-foreground">X1</span>
              <input
                v-model.number="points[0]"
                type="number"
                class="w-full px-2 py-1 bg-muted rounded text-xs"
                @change="updatePoints"
              />
            </div>
            <div>
              <span class="text-xs text-muted-foreground">Y1</span>
              <input
                v-model.number="points[1]"
                type="number"
                class="w-full px-2 py-1 bg-muted rounded text-xs"
                @change="updatePoints"
              />
            </div>
            <div>
              <span class="text-xs text-muted-foreground">X2</span>
              <input
                v-model.number="points[2]"
                type="number"
                class="w-full px-2 py-1 bg-muted rounded text-xs"
                @change="updatePoints"
              />
            </div>
            <div>
              <span class="text-xs text-muted-foreground">Y2</span>
              <input
                v-model.number="points[3]"
                type="number"
                class="w-full px-2 py-1 bg-muted rounded text-xs"
                @change="updatePoints"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
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

const points = computed({
  get: () => props.layer.points || [0, 0, 100, 0],
  set: (val) => {
    emit("update", "points", val);
  }
});

function updateLayer(key: keyof EditorLayer, value: any) {
  emit("update", key, value);
}

function updatePoints() {
  emit("update", "points", [...points.value]);
}
</script>
