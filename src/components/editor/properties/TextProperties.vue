<template>
  <div class="flex items-center gap-4">
    <!-- Text Content -->
    <Popover>
      <PopoverTrigger as-child>
        <button class="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors">
          <Type class="w-4 h-4" />
          <span class="truncate max-w-[120px]">{{ layer.text || 'Edit Text' }}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent class="w-80">
        <div class="space-y-3">
          <label class="text-sm font-medium">Text Content</label>
          <textarea
            v-model="layer.text"
            rows="3"
            class="w-full px-3 py-2 bg-muted rounded-lg text-sm outline-none resize-none"
            @change="updateLayer('text', layer.text)"
          />
        </div>
      </PopoverContent>
    </Popover>

    <div class="w-px h-6 bg-border" />

    <!-- Font Family -->
    <select
      v-model="layer.fontFamily"
      class="px-2 py-1.5 bg-muted rounded text-sm outline-none"
      @change="updateLayer('fontFamily', layer.fontFamily)"
    >
      <option value="Arial">Arial</option>
      <option value="Georgia">Georgia</option>
      <option value="Times New Roman">Times New Roman</option>
      <option value="Courier New">Courier New</option>
      <option value="Verdana">Verdana</option>
      <option value="Helvetica">Helvetica</option>
    </select>

    <div class="w-px h-6 bg-border" />

    <!-- Font Size -->
    <div class="flex items-center gap-2">
      <span class="text-xs text-muted-foreground">Size</span>
      <input
        v-model.number="layer.fontSize"
        type="number"
        class="w-14 px-2 py-1 bg-muted rounded text-xs"
        @change="updateLayer('fontSize', layer.fontSize)"
      />
    </div>

    <div class="w-px h-6 bg-border" />

    <!-- Text Color -->
    <Popover>
      <PopoverTrigger as-child>
        <button
          class="w-8 h-8 rounded border-2 border-border shadow-sm hover:scale-110 transition-transform"
          :style="{ backgroundColor: layer.fill || '#000000' }"
          title="Text Color"
        />
      </PopoverTrigger>
      <PopoverContent class="p-0 w-auto">
        <ColorPicker
          :model-value="layer.fill || '#000000'"
          @update:model-value="(val) => updateLayer('fill', val)"
        />
      </PopoverContent>
    </Popover>

    <div class="w-px h-6 bg-border" />

    <!-- Dimensions -->
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
  </div>
</template>

<script setup lang="ts">
import { Type } from "lucide-vue-next";
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
