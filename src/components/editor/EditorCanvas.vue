<template>
  <div class="w-full h-full overflow-auto bg-muted/30 relative" ref="scrollContainerRef">
    <div
      class="flex min-w-full min-h-full p-8"
    >
      <div
        class="relative shadow-2xl transition-all duration-150 ease-out origin-center m-auto"
        :style="canvasContainerStyle"
      >
        <v-stage
          ref="stageRef"
          :config="stageConfig"
          @mousedown="handleStageMouseDown"
          @touchstart="handleStageMouseDown"
          class="block"
        >
          <v-layer :config="{ clearBeforeDraw: true }">
            <!-- Background - Full canvas coverage with clearBeforeDraw to prevent artifacts -->
            <v-rect
              :config="{
                x: 0,
                y: 0,
                width: editorStore.canvasWidth,
                height: editorStore.canvasHeight,
                fill: editorStore.backgroundColor,
                listening: false,
              }"
            />
            
            <!-- Background Image -->
            <v-image
              v-if="backgroundImageNode"
              :config="{
                image: backgroundImageNode,
                x: 0,
                y: 0,
                width: editorStore.canvasWidth,
                height: editorStore.canvasHeight,
              }"
            />
          </v-layer>
          
          <v-layer :config="{ clearBeforeDraw: true }">
            <!-- Layers -->
            <template v-for="layer in editorStore.visibleLayers" :key="layer.id">
              <!-- Text Layer -->
              <v-text
                v-if="layer.type === 'text'"
                :config="getLayerConfig(layer)"
                @dblclick="handleTextDblClick"
              />
              
              <!-- Rectangle Layer -->
              <v-rect
                v-else-if="layer.type === 'rect'"
                :config="getLayerConfig(layer)"
              />
              
              <!-- Circle Layer -->
              <v-circle
                v-else-if="layer.type === 'circle'"
                :config="getLayerConfig(layer)"
              />
              
              <!-- Line Layer -->
              <v-line
                v-else-if="layer.type === 'line'"
                :config="getLayerConfig(layer)"
              />
              
              <!-- Image Layer -->
              <v-image
                v-else-if="layer.type === 'image' && imageNodes[layer.id]"
                :config="getImageLayerConfig(layer)"
              />
            </template>
            
            <!-- Transformer for selected layer -->
            <v-transformer
              ref="transformerRef"
              :config="transformerStaticConfig"
            />
          </v-layer>
        </v-stage>
        
        <!-- Text Editor Overlay -->
        <div
          v-if="editingText"
          class="absolute bg-white border-2 border-primary shadow-lg"
          :style="textEditorStyle"
        >
          <textarea
            v-model="editingTextValue"
            class="w-full h-full p-2 outline-none resize-none"
            :style="{
              fontFamily: editingTextLayer?.fontFamily,
              color: editingTextLayer?.fill,
            }"
            @blur="finishTextEdit"
            @keydown.enter.prevent="finishTextEdit"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, markRaw } from "vue";
import Konva from "konva";
import { useEditorStore } from "../../stores/editor";
import type { EditorLayer } from "../../types";

const editorStore = useEditorStore();

// Watch for zoom changes to force redraw and prevent visual artifacts
watch(() => editorStore.zoom, async () => {
  await nextTick();
  if (stageRef.value) {
    const stage = stageRef.value.getStage() as Konva.Stage;
    // Force clear and redraw all layers
    stage.clear();
    stage.batchDraw();
    // Also redraw each layer individually to ensure clean render
    stage.getLayers().forEach(layer => {
      layer.clear();
      layer.batchDraw();
    });
  }
}, { flush: 'post' });

const scrollContainerRef = ref<HTMLDivElement | null>(null);
const stageRef = ref<any>(null);
const transformerRef = ref<any>(null);
const imageNodes = ref<Record<string, HTMLImageElement>>({});
const backgroundImageNode = ref<HTMLImageElement | null>(null);

// Track selected node reference - NOT reactive to avoid loops
let currentSelectedNode: Konva.Node | null = null;
let isProcessing = false;

// Text editing
const editingText = ref(false);
const editingTextValue = ref("");
const editingTextLayer = ref<EditorLayer | null>(null);
const textEditorStyle = ref({
  left: "0px",
  top: "0px",
  width: "200px",
  height: "100px",
  fontSize: "24px",
});

// Stage maintains pixel dimensions of the canvas
// Scaling is handled natively by Konva for better coordinate accuracy
const stageConfig = computed(() => {
  const zoom = editorStore.zoom;
  return {
    width: editorStore.canvasWidth * zoom,
    height: editorStore.canvasHeight * zoom,
    scaleX: zoom,
    scaleY: zoom,
  };
});

// Static config for transformer - no reactive dependencies
const transformerStaticConfig = {
  enabledAnchors: ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'],
  rotateEnabled: true,
  rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315],
  borderStroke: '#3b82f6',
  anchorStroke: '#3b82f6',
  anchorFill: '#ffffff',
};

// Canvas container style
const canvasContainerStyle = computed(() => {
  const zoom = editorStore.zoom;
  return {
    width: `${editorStore.canvasWidth * zoom}px`,
    height: `${editorStore.canvasHeight * zoom}px`,
    flexShrink: 0,
  };
});

// Load background image
watch(() => editorStore.backgroundImage, async (src) => {
  if (!src) {
    backgroundImageNode.value = null;
    return;
  }
  
  const img = new Image();
  img.src = src;
  await new Promise((resolve) => {
    img.onload = resolve;
  });
  backgroundImageNode.value = markRaw(img);
});

// Load image layers
watch(() => editorStore.layers, async (newLayers) => {
  for (const layer of newLayers) {
    if (layer.type === "image" && layer.src && !imageNodes.value[layer.id]) {
      const img = new Image();
      img.src = layer.src;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      // Set default dimensions if not set
      if (!layer.width) {
        editorStore.updateLayer(layer.id, { width: img.width, height: img.height });
      }
      
      imageNodes.value[layer.id] = markRaw(img);
    }
  }
  
  // Cleanup removed images
  const currentIds = new Set(newLayers.filter(l => l.type === "image").map(l => l.id));
  for (const id in imageNodes.value) {
    if (!currentIds.has(id)) {
      delete imageNodes.value[id];
    }
  }
}, { deep: false });

// Update transformer when selection changes - careful to avoid loops
watch(() => editorStore.selectedLayerId, async (layerId) => {
  if (isProcessing) return;
  isProcessing = true;
  
  if (!layerId || !stageRef.value) {
    currentSelectedNode = null;
    updateTransformer();
    isProcessing = false;
    return;
  }
  
  // Wait for DOM update
  await nextTick();
  await nextTick();
  
  const stage = stageRef.value.getStage() as Konva.Stage;
  const node = stage.findOne(`#${layerId}`);
  
  if (node) {
    currentSelectedNode = node;
    updateTransformer();
  }
  
  isProcessing = false;
}, { flush: 'post' });

function updateTransformer() {
  const transformer = transformerRef.value?.getNode() as Konva.Transformer;
  if (!transformer) return;
  
  if (currentSelectedNode) {
    transformer.nodes([currentSelectedNode]);
    transformer.show();
  } else {
    transformer.nodes([]);
    transformer.hide();
  }
  
  transformer.getLayer()?.batchDraw();
}

function getLayerConfig(layer: EditorLayer) {
  const baseConfig: any = {
    id: layer.id,
    x: layer.x,
    y: layer.y,
    rotation: layer.rotation,
    scaleX: layer.scaleX,
    scaleY: layer.scaleY,
    opacity: layer.opacity,
    draggable: layer.draggable && !layer.locked,
  };

  // Add type-specific config
  if (layer.type === 'text') {
    baseConfig.text = layer.text;
    baseConfig.fontSize = layer.fontSize;
    baseConfig.fontFamily = layer.fontFamily;
    baseConfig.fill = layer.fill;
    baseConfig.stroke = layer.stroke;
    baseConfig.strokeWidth = layer.strokeWidth;
    baseConfig.width = layer.width;
    baseConfig.height = layer.height;
  } else if (layer.type === 'rect') {
    baseConfig.width = layer.width;
    baseConfig.height = layer.height;
    baseConfig.fill = layer.fill;
    baseConfig.stroke = layer.stroke;
    baseConfig.strokeWidth = layer.strokeWidth;
  } else if (layer.type === 'circle') {
    baseConfig.radius = layer.radius;
    baseConfig.fill = layer.fill;
    baseConfig.stroke = layer.stroke;
    baseConfig.strokeWidth = layer.strokeWidth;
  } else if (layer.type === 'line') {
    baseConfig.points = layer.points;
    baseConfig.stroke = layer.stroke;
    baseConfig.strokeWidth = layer.strokeWidth;
  }

  return baseConfig;
}

function getImageLayerConfig(layer: EditorLayer) {
  return {
    id: layer.id,
    x: layer.x,
    y: layer.y,
    image: imageNodes.value[layer.id],
    width: layer.width,
    height: layer.height,
    rotation: layer.rotation,
    scaleX: layer.scaleX,
    scaleY: layer.scaleY,
    opacity: layer.opacity,
    draggable: layer.draggable && !layer.locked,
  };
}

function handleStageMouseDown(e: any) {
  // Clicked on stage (not on a layer) - deselect
  if (e.target === e.target.getStage()) {
    editorStore.selectLayer(null);
    currentSelectedNode = null;
    updateTransformer();
    return;
  }
  
  // Clicked on a layer - select it
  const clickedLayer = editorStore.layers.find(l => l.id === e.target.id());
  if (clickedLayer) {
    editorStore.selectLayer(clickedLayer.id);
    
    // Setup drag and transform handlers for this node
    const node = e.target as Konva.Node;
    currentSelectedNode = node;
    updateTransformer();
    
    // Remove previous handlers to avoid duplicates
    node.off('dragend');
    node.off('transformend');
    
    // Handle drag end
    node.on('dragend', () => {
      const layer = editorStore.layers.find(l => l.id === node.id());
      if (layer) {
        // Update store without triggering full re-render
        layer.x = node.x();
        layer.y = node.y();
      }
    });
    
    // Handle transform end
    node.on('transformend', () => {
      const layer = editorStore.layers.find(l => l.id === node.id());
      if (!layer) return;
      
      // Update position and rotation
      layer.x = node.x();
      layer.y = node.y();
      layer.rotation = node.rotation();
      
      // Update size for rects and images
      if (layer.type === "rect" || layer.type === "image") {
        layer.width = (layer.width || 100) * node.scaleX();
        layer.height = (layer.height || 100) * node.scaleY();
      }
      
      // Update radius for circles
      if (layer.type === "circle") {
        layer.radius = (layer.radius || 50) * node.scaleX();
      }
      
      // Reset node scale
      node.scaleX(1);
      node.scaleY(1);
    });
  }
}

function handleTextDblClick(e: any) {
  const node = e.target;
  const layer = editorStore.layers.find(l => l.id === node.id());
  if (!layer || layer.type !== "text") return;
  
  editingTextLayer.value = layer;
  editingTextValue.value = layer.text || "";
  editingText.value = true;
  
  // Calculate position for text editor
  // Since Konva is scaled, we account for zoom in the overlay's position and size
  const absPos = node.getAbsolutePosition();
  const zoom = editorStore.zoom;
  textEditorStyle.value = {
    left: `${absPos.x}px`,
    top: `${absPos.y}px`,
    width: `${(layer.width || 200) * zoom}px`,
    height: `${(layer.height || 100) * zoom}px`,
    fontSize: `${(layer.fontSize || 24) * zoom}px`,
  };
}

function finishTextEdit() {
  if (editingTextLayer.value) {
    editorStore.updateLayer(editingTextLayer.value.id, {
      text: editingTextValue.value,
    });
  }
  editingText.value = false;
  editingTextLayer.value = null;
}

// Export function
function exportToImage(format: "png" | "jpg" | "webp" = "png", quality: number = 0.9): string | null {
  if (!stageRef.value) return null;
  
  const stage = stageRef.value.getStage() as Konva.Stage;
  
  // Hide transformer before exporting
  const transformer = stage.findOne("Transformer") as Konva.Transformer;
  if (transformer) {
    transformer.hide();
  }
  
  const dataUrl = stage.toDataURL({
    pixelRatio: 2,
    mimeType: format === "jpg" ? "image/jpeg" : `image/${format}`,
    quality,
  });
  
  // Show transformer again
  if (transformer) {
    transformer.show();
  }
  
  return dataUrl;
}

// Expose export function and scroll container to parent
defineExpose({
  exportToImage,
  scrollContainerRef,
});
</script>

<style scoped>
/* Removed box-shadow from konvajs-content to prevent ghosting artifacts during zoom */
/* The shadow is now applied to the canvas container div instead */

/* Custom scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.5);
}
</style>
