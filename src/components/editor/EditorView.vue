<template>
  <div class="h-full flex flex-col bg-background">
    <!-- Top Bar - Project Info & Actions -->
    <div class="flex items-center justify-between px-4 py-2 border-b bg-muted/30 shrink-0">
      <div class="flex items-center gap-4">
        <input
          v-model="editorStore.projectName"
          type="text"
          class="bg-transparent font-semibold text-lg outline-none border-b border-transparent focus:border-primary px-2 py-1"
          placeholder="Project Name"
        />
        <span class="text-xs text-muted-foreground">
          {{ editorStore.canvasWidth }} × {{ editorStore.canvasHeight }}px
        </span>
      </div>
      
      <div class="flex items-center gap-2">
        <!-- Zoom Controls -->
        <button
          @click="editorStore.zoomOut"
          class="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          title="Zoom Out"
        >
          <ZoomOut class="w-4 h-4" />
        </button>
        <div class="text-xs text-center text-muted-foreground font-mono w-12">
          {{ Math.round(editorStore.zoom * 100) }}%
        </div>
        <button
          @click="editorStore.zoomIn"
          class="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          title="Zoom In"
        >
          <ZoomIn class="w-4 h-4" />
        </button>
        <button
          @click="fitCanvasToView"
          class="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          title="Fit to View"
        >
          <Minimize class="w-4 h-4" />
        </button>
        <div class="w-px h-6 bg-border mx-2" />
        <button
          @click="editorStore.undo"
          :disabled="!editorStore.canUndo"
          class="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo"
        >
          <Undo2 class="w-4 h-4" />
        </button>
        <button
          @click="editorStore.redo"
          :disabled="!editorStore.canRedo"
          class="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo"
        >
          <Redo2 class="w-4 h-4" />
        </button>
        <div class="w-px h-6 bg-border mx-2" />
        <button
          @click="showTemplates = true"
          class="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
        >
          <LayoutTemplate class="w-4 h-4 inline mr-1" />
          Templates
        </button>
        <button
          @click="exportImage"
          class="px-3 py-1.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
        >
          <Download class="w-4 h-4 inline mr-1" />
          Export
        </button>
        <button
          @click="saveProject"
          class="px-3 py-1.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
        >
          <Save class="w-4 h-4 inline mr-1" />
          Save
        </button>
      </div>
    </div>

    <!-- Dynamic Properties Toolbar -->
    <div 
      v-if="editorStore.selectedLayer"
      class="flex items-center gap-4 px-4 py-2 border-b bg-muted/20 shrink-0 overflow-x-auto"
    >
      <!-- Layer Name -->
      <div class="flex items-center gap-2 shrink-0">
        <component :is="getLayerIcon(editorStore.selectedLayer.type)" class="w-4 h-4 text-muted-foreground" />
        <input
          v-model="editorStore.selectedLayer.name"
          type="text"
          class="w-32 px-2 py-1 bg-transparent border-b border-transparent focus:border-primary text-sm outline-none"
          @change="updateLayer('name', editorStore.selectedLayer.name)"
        />
      </div>

      <div class="w-px h-6 bg-border shrink-0" />

      <!-- Type-specific Properties -->
      <div class="flex items-center gap-4 shrink-0">
        <TextProperties
          v-if="editorStore.selectedLayer.type === 'text'"
          :layer="editorStore.selectedLayer"
          @update="updateLayer"
        />
        <ShapeProperties
          v-else-if="['rect', 'circle'].includes(editorStore.selectedLayer.type)"
          :layer="editorStore.selectedLayer"
          @update="updateLayer"
        />
        <LineProperties
          v-else-if="editorStore.selectedLayer.type === 'line'"
          :layer="editorStore.selectedLayer"
          @update="updateLayer"
        />
        <ImageProperties
          v-else-if="editorStore.selectedLayer.type === 'image'"
          :layer="editorStore.selectedLayer"
          @update="updateLayer"
        />
      </div>

      <div class="w-px h-6 bg-border shrink-0" />

      <!-- Common Properties -->
      <CommonProperties
        :layer="editorStore.selectedLayer"
        @update="updateLayer"
      />
    </div>

    <!-- Main Editor Area -->
    <div class="flex-1 flex overflow-hidden min-h-0">
      <!-- Left Sidebar - Tools -->
      <EditorToolbar class="w-16 border-r bg-muted/20 shrink-0" />
      
      <!-- Center - Canvas Area (allows scrolling when zoomed) -->
      <div class="flex-1 min-w-0 min-h-0 flex">
        <EditorCanvas
          ref="canvasRef"
          class="w-full h-full min-w-full min-h-full"
        />
      </div>
      
      <!-- Right Sidebar - Layers -->
      <div class="w-64 border-l bg-muted/20 flex flex-col shrink-0">
        <div class="p-3 border-b">
          <span class="text-sm font-medium">Layers</span>
        </div>
        <div class="flex-1 overflow-hidden">
          <EditorLayers />
        </div>
      </div>
    </div>

    <!-- Templates Modal -->
    <EditorTemplates 
      :show="showTemplates"
      @close="showTemplates = false"
      @select="onTemplateSelect"
    />

    <!-- Export Modal -->
    <div
      v-if="showExportModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showExportModal = false"
    >
      <div class="bg-background rounded-xl p-6 w-96 shadow-xl">
        <h3 class="text-lg font-semibold mb-4">Export Image</h3>
        
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium mb-2 block">Format</label>
            <div class="flex gap-2">
              <button
                v-for="fmt in ['png', 'jpg', 'webp']"
                :key="fmt"
                @click="exportFormat = fmt"
                :class="[
                  'px-3 py-1.5 text-sm rounded-lg transition-colors',
                  exportFormat === fmt ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                ]"
              >
                {{ fmt.toUpperCase() }}
              </button>
            </div>
          </div>
          
          <div v-if="exportFormat === 'jpg'">
            <label class="text-sm font-medium mb-2 block">Quality: {{ exportQuality }}%</label>
            <input
              v-model.number="exportQuality"
              type="range"
              min="1"
              max="100"
              class="w-full"
            />
          </div>
          
          <div class="flex gap-2 pt-4">
            <button
              @click="showExportModal = false"
              class="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              @click="confirmExport"
              class="flex-1 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { toast } from "vue-sonner";
import { Undo2, Redo2, Download, Save, LayoutTemplate, Type, Image as ImageIcon, Square, Circle, Minus, ZoomIn, ZoomOut, Minimize } from "lucide-vue-next";
import { useEditorStore } from "../../stores/editor";
import type { EditorTemplate, EditorLayer, EditorLayerType } from "../../types";
import EditorToolbar from "./EditorToolbar.vue";
import EditorCanvas from "./EditorCanvas.vue";
import EditorLayers from "./EditorLayers.vue";
import EditorTemplates from "./EditorTemplates.vue";
import { CommonProperties, TextProperties, ShapeProperties, LineProperties, ImageProperties } from "./properties";

const editorStore = useEditorStore();
const canvasRef = ref<InstanceType<typeof EditorCanvas> | null>(null);

const showTemplates = ref(false);
const showExportModal = ref(false);
const exportFormat = ref<"png" | "jpg" | "webp">("png");
const exportQuality = ref(90);

function getLayerIcon(type: EditorLayerType) {
  switch (type) {
    case "text": return Type;
    case "image": return ImageIcon;
    case "rect": return Square;
    case "circle": return Circle;
    case "line": return Minus;
    default: return Square;
  }
}

function updateLayer(key: keyof EditorLayer, value: any) {
  if (!editorStore.selectedLayer) return;
  editorStore.updateLayer(editorStore.selectedLayer.id, { [key]: value });
}

function onTemplateSelect(template: EditorTemplate) {
  editorStore.loadTemplate(template);
  showTemplates.value = false;
  toast.success(`Template "${template.name}" loaded`);
}

function exportImage() {
  showExportModal.value = true;
}

async function confirmExport() {
  if (!canvasRef.value) return;
  
  try {
    const dataUrl = canvasRef.value.exportToImage(exportFormat.value, exportQuality.value / 100);
    if (!dataUrl) {
      toast.error("Failed to export image");
      return;
    }
    
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${editorStore.projectName}.${exportFormat.value}`;
    a.click();
    URL.revokeObjectURL(url);
    
    showExportModal.value = false;
    toast.success("Image exported successfully");
  } catch (error) {
    toast.error("Failed to export image");
    console.error(error);
  }
}

async function saveProject() {
  try {
    const id = await editorStore.saveToLibrary();
    toast.success("Project saved to library");
  } catch (error) {
    toast.error("Failed to save project");
    console.error(error);
  }
}

function fitCanvasToView() {
  // Get the canvas container from the canvas component
  const canvasContainer = canvasRef.value?.$el as HTMLElement;
  if (!canvasContainer) return;
  
  // Calculate available space (subtract padding - 64px is total horizontal/vertical padding)
  const availableWidth = canvasContainer.clientWidth - 64;
  const availableHeight = canvasContainer.clientHeight - 64;
  
  // Calculate zoom to fit canvas in view
  const zoomX = availableWidth / editorStore.canvasWidth;
  const zoomY = availableHeight / editorStore.canvasHeight;
  
  // Use the smaller zoom to ensure canvas fits completely
  const fitZoom = Math.min(zoomX, zoomY, 1); // Cap at 1 (100%) to avoid upscaling
  
  // Apply zoom
  editorStore.setZoom(Math.max(0.1, fitZoom));
}
</script>
