<template>
  <div class="flex flex-col items-center py-4 gap-2">
    <!-- Select Tool -->
    <button
      @click="setTool('select')"
      :class="[
        'p-3 rounded-xl transition-all',
        activeTool === 'select' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      ]"
      title="Select"
    >
      <MousePointer2 class="w-5 h-5" />
    </button>
    
    <div class="w-8 h-px bg-border my-1" />
    
    <!-- Text Tool - Opens sidebar with presets -->
    <button
      @click="toggleTextTool"
      :class="[
        'p-3 rounded-xl transition-all',
        isTextActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      ]"
      title="Text"
    >
      <Type class="w-5 h-5" />
    </button>
    
    <!-- Image Tool - Opens sidebar with library -->
    <button
      @click="toggleImageTool"
      :class="[
        'p-3 rounded-xl transition-all',
        isImageActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      ]"
      title="Add Image"
    >
      <ImageIcon class="w-5 h-5" />
    </button>
    
    <div class="w-8 h-px bg-border my-1" />
    
    <!-- Elements Tool - Opens sidebar with shapes and lines -->
    <button
      @click="toggleElementsTool"
      :class="[
        'p-3 rounded-xl transition-all',
        isElementsActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      ]"
      title="Elements (Shapes & Lines)"
    >
      <Shapes class="w-5 h-5" />
    </button>
    
    <div class="w-8 h-px bg-border my-1" />
    
    <!-- Settings Tool - Opens sidebar with canvas settings -->
    <button
      @click="toggleSettingsTool"
      :class="[
        'p-3 rounded-xl transition-all',
        isSettingsActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      ]"
      title="Canvas Settings"
    >
      <Settings class="w-5 h-5" />
    </button>
    
    <div class="flex-1" />
    
    <!-- Clear Canvas -->
    <AlertDialog>
      <AlertDialogTrigger as-child>
        <button
          class="p-3 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
          title="Clear Canvas"
        >
          <Trash2 class="w-5 h-5" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear Canvas?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove all layers from the canvas. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="editorStore.clearCanvas" class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Clear
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { MousePointer2, Type, Image as ImageIcon, Shapes, Settings, Trash2 } from "lucide-vue-next";
import { useEditorStore } from "../../stores/editor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const editorStore = useEditorStore();
const activeTool = ref("select");

const isTextActive = computed(() => editorStore.activeTool === "text" && editorStore.sidebarVisible);
const isElementsActive = computed(() => editorStore.activeTool === "elements" && editorStore.sidebarVisible);
const isSettingsActive = computed(() => editorStore.activeTool === "settings" && editorStore.sidebarVisible);
const isImageActive = computed(() => editorStore.activeTool === "image" && editorStore.sidebarVisible);

function setTool(tool: string) {
  activeTool.value = tool;
  // Close sidebar when selecting a non-sidebar tool
  if (tool !== "text" && tool !== "elements" && tool !== "settings" && tool !== "image") {
    editorStore.closeSidebar();
  }
}

function toggleTextTool() {
  editorStore.toggleTool("text");
  if (editorStore.sidebarVisible) {
    activeTool.value = "text";
  } else {
    activeTool.value = "select";
  }
}

function toggleElementsTool() {
  editorStore.toggleTool("elements");
  if (editorStore.sidebarVisible) {
    activeTool.value = "elements";
  } else {
    activeTool.value = "select";
  }
}

function toggleSettingsTool() {
  editorStore.toggleTool("settings");
  if (editorStore.sidebarVisible) {
    activeTool.value = "settings";
  } else {
    activeTool.value = "select";
  }
}

function toggleImageTool() {
  editorStore.toggleTool("image");
  if (editorStore.sidebarVisible) {
    activeTool.value = "image";
  } else {
    activeTool.value = "select";
  }
}
</script>
