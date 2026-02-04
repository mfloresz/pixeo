<template>
  <div class="space-y-6">
    <div class="text-sm text-muted-foreground">
      Click a preset to add it to the canvas
    </div>

    <!-- Title Preset -->
    <button
      @click="addPresetText('title')"
      class="w-full p-4 border rounded-xl hover:border-primary hover:bg-muted/50 transition-all group"
    >
      <div class="text-left">
        <div class="text-2xl font-bold text-black mb-1">Title</div>
        <div class="text-xs text-muted-foreground">32px Arial</div>
      </div>
    </button>

    <!-- Subtitle Preset -->
    <button
      @click="addPresetText('subtitle')"
      class="w-full p-4 border rounded-xl hover:border-primary hover:bg-muted/50 transition-all group"
    >
      <div class="text-left">
        <div class="text-xl font-semibold text-black mb-1">Subtitle</div>
        <div class="text-xs text-muted-foreground">24px Arial</div>
      </div>
    </button>

    <!-- Paragraph Preset -->
    <button
      @click="addPresetText('paragraph')"
      class="w-full p-4 border rounded-xl hover:border-primary hover:bg-muted/50 transition-all group"
    >
      <div class="text-left">
        <div class="text-base text-black mb-2">Paragraph</div>
        <div class="text-sm text-muted-foreground leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </div>
        <div class="text-xs text-muted-foreground mt-1">16px Arial</div>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from "../../../stores/editor";
import { toast } from "vue-sonner";

const editorStore = useEditorStore();

const presets = {
  title: {
    text: "Title",
    fontSize: 32,
    fontFamily: "Arial",
    fill: "#000000",
    width: 300,
    height: 50,
  },
  subtitle: {
    text: "Subtitle",
    fontSize: 24,
    fontFamily: "Arial",
    fill: "#000000",
    width: 250,
    height: 40,
  },
  paragraph: {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    fontSize: 16,
    fontFamily: "Arial",
    fill: "#000000",
    width: 400,
    height: 80,
  },
};

function addPresetText(type: "title" | "subtitle" | "paragraph") {
  const preset = presets[type];
  const centerX = editorStore.canvasWidth / 2;
  const centerY = editorStore.canvasHeight / 2;

  editorStore.addLayer("text", {
    ...preset,
    x: centerX - preset.width / 2,
    y: centerY - preset.height / 2,
  });

  toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added`);
}
</script>
