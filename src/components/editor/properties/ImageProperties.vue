<template>
  <div class="flex items-center gap-4">
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

    <div class="w-px h-6 bg-border" />

    <!-- Replace Image -->
    <button
      @click="triggerImageReplace"
      class="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors"
    >
      <ImageIcon class="w-4 h-4" />
      <span>Replace</span>
    </button>
    <input
      ref="imageInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleImageReplace"
    />

    <div class="w-px h-6 bg-border" />

    <!-- Opacity is already in CommonProperties, but we can add image-specific filters here later -->
    <span class="text-xs text-muted-foreground">Image filters coming soon</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Image as ImageIcon } from "lucide-vue-next";
import { useEditorStore } from "../../../stores/editor";
import type { EditorLayer } from "../../../types";

const editorStore = useEditorStore();

const props = defineProps<{
  layer: EditorLayer;
}>();

const emit = defineEmits<{
  update: [key: keyof EditorLayer, value: any];
}>();

const imageInput = ref<HTMLInputElement | null>(null);

function updateLayer(key: keyof EditorLayer, value: any) {
  emit("update", key, value);
}

function triggerImageReplace() {
  imageInput.value?.click();
}

function handleImageReplace(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const src = e.target?.result as string;
    emit("update", "src", src);
    
    // Reset dimensions to auto when replacing
    const img = new Image();
    img.src = src;
    img.onload = () => {
      emit("update", "width", img.width);
      emit("update", "height", img.height);
    };
  };
  reader.readAsDataURL(file);

  input.value = "";
}
</script>
