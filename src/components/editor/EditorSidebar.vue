<template>
  <div
    v-if="editorStore.sidebarVisible"
    class="w-[320px] border-r bg-muted/20 flex flex-col shrink-0 transition-all duration-300"
  >
    <!-- Header with close button -->
    <div class="flex items-center justify-between p-3 border-b">
      <span class="text-sm font-medium">{{ getSidebarTitle() }}</span>
      <button
        @click="editorStore.closeSidebar"
        class="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        title="Close sidebar"
      >
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Dynamic Content based on active tool -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Text Panel -->
      <TextPanel v-if="editorStore.activeTool === 'text'" />
      
      <!-- Elements Panel -->
      <ElementsPanel v-else-if="editorStore.activeTool === 'elements'" />
      
      <!-- Settings Panel -->
      <SettingsPanel v-else-if="editorStore.activeTool === 'settings'" />
      
      <!-- Image Library Panel -->
      <ImageLibraryPanel v-else-if="editorStore.activeTool === 'image'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { X } from "lucide-vue-next";
import { useEditorStore } from "../../stores/editor";
import TextPanel from "./sidebar/TextPanel.vue";
import ElementsPanel from "./sidebar/ElementsPanel.vue";
import SettingsPanel from "./sidebar/SettingsPanel.vue";
import ImageLibraryPanel from "./sidebar/ImageLibraryPanel.vue";

const editorStore = useEditorStore();

function getSidebarTitle() {
  switch (editorStore.activeTool) {
    case "text":
      return "Text";
    case "elements":
      return "Elements";
    case "settings":
      return "Canvas Settings";
    case "image":
      return "Image Library";
    default:
      return "";
  }
}
</script>
