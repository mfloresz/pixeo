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
              
              <!-- Ellipse Layer -->
              <v-ellipse
                v-else-if="layer.type === 'ellipse'"
                :config="getLayerConfig(layer)"
              />
              
              <!-- Star Layer -->
              <v-star
                v-else-if="layer.type === 'star'"
                :config="getLayerConfig(layer)"
              />
              
              <!-- Arrow Layer -->
              <v-arrow
                v-else-if="layer.type === 'arrow'"
                :config="getLayerConfig(layer)"
              />
              
              <!-- Polygon (RegularPolygon) Layer -->
              <v-regular-polygon
                v-else-if="layer.type === 'polygon'"
                :config="getLayerConfig(layer)"
              />
              
              <!-- Path Layer -->
              <v-path
                v-else-if="layer.type === 'path'"
                :config="getLayerConfig(layer)"
              />
              
              <!-- Group Layer -->
              <v-group
                v-else-if="layer.type === 'group' && layer.children"
                :config="getGroupConfig(layer)"
                @mousedown="handleGroupMouseDown($event, layer)"
                @touchstart="handleGroupMouseDown($event, layer)"
                @dblclick="handleGroupDblClick($event, layer)"
              >
                <!-- Invisible hit rect to capture clicks on empty space within group -->
                <v-rect
                  :config="getGroupHitRectConfig(layer)"
                />
                
                <template v-for="child in layer.children" :key="child.id">
                  <v-rect
                    v-if="child.type === 'rect'"
                    :config="getGroupChildConfig(child, layer)"
                    @mousedown="handleGroupChildMouseDown($event, layer, child)"
                    @touchstart="handleGroupChildMouseDown($event, layer, child)"
                  />
                  <v-circle
                    v-else-if="child.type === 'circle'"
                    :config="getGroupChildConfig(child, layer)"
                    @mousedown="handleGroupChildMouseDown($event, layer, child)"
                    @touchstart="handleGroupChildMouseDown($event, layer, child)"
                  />
                  <v-ellipse
                    v-else-if="child.type === 'ellipse'"
                    :config="getGroupChildConfig(child, layer)"
                    @mousedown="handleGroupChildMouseDown($event, layer, child)"
                    @touchstart="handleGroupChildMouseDown($event, layer, child)"
                  />
                  <v-regular-polygon
                    v-else-if="child.type === 'polygon'"
                    :config="getGroupChildConfig(child, layer)"
                    @mousedown="handleGroupChildMouseDown($event, layer, child)"
                    @touchstart="handleGroupChildMouseDown($event, layer, child)"
                  />
                  <v-star
                    v-else-if="child.type === 'star'"
                    :config="getGroupChildConfig(child, layer)"
                    @mousedown="handleGroupChildMouseDown($event, layer, child)"
                    @touchstart="handleGroupChildMouseDown($event, layer, child)"
                  />
                  <v-path
                    v-else-if="child.type === 'path'"
                    :config="getGroupChildConfig(child, layer)"
                    @mousedown="handleGroupChildMouseDown($event, layer, child)"
                    @touchstart="handleGroupChildMouseDown($event, layer, child)"
                  />
                  <v-text
                    v-else-if="child.type === 'text'"
                    :config="getGroupChildConfig(child, layer)"
                    @mousedown="handleGroupChildMouseDown($event, layer, child)"
                    @touchstart="handleGroupChildMouseDown($event, layer, child)"
                  />
                </template>
              </v-group>
              
              <!-- Image Layer - Show placeholder while loading -->
              <v-image
                v-else-if="layer.type === 'image' && imageNodes[layer.id]"
                :config="getImageLayerConfig(layer)"
              />
              <v-rect
                v-else-if="layer.type === 'image' && !imageNodes[layer.id]"
                :config="{
                  id: layer.id,
                  x: layer.x - 50,
                  y: layer.y - 50,
                  width: 100,
                  height: 100,
                  fill: '#e2e8f0',
                  stroke: '#94a3b8',
                  strokeWidth: 2,
                  draggable: false,
                  listening: false,
                }"
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

// Group editing state
const editingGroupId = ref<string | null>(null);
const editingChildId = ref<string | null>(null);

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
  // Keep relative transform for groups
  keepRatio: false,
  centeredScaling: false,
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
watch(() => editorStore.layers, async (newLayers, oldLayers) => {
  // Find new image layers that need to be loaded
  const oldIds = new Set(oldLayers?.filter(l => l.type === "image").map(l => l.id) || []);
  let imagesLoaded = false;
  
  for (const layer of newLayers) {
    if (layer.type === "image" && layer.src && (!imageNodes.value[layer.id] || !oldIds.has(layer.id))) {
      try {
        const img = new Image();
        img.src = layer.src;
        
        // Wait for image to load
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        
        // Set default dimensions if not set
        if (!layer.width || !layer.height) {
          editorStore.updateLayer(layer.id, { 
            width: img.naturalWidth || img.width, 
            height: img.naturalHeight || img.height 
          });
        }
        
        imageNodes.value[layer.id] = markRaw(img);
        imagesLoaded = true;
      } catch (error) {
        console.error(`Failed to load image for layer ${layer.id}:`, error);
      }
    }
  }
  
  // Force redraw if images were loaded
  if (imagesLoaded && stageRef.value) {
    await nextTick();
    const stage = stageRef.value.getStage() as Konva.Stage;
    stage.batchDraw();
  }
  
  // Cleanup removed images
  const currentIds = new Set(newLayers.filter(l => l.type === "image").map(l => l.id));
  for (const id in imageNodes.value) {
    if (!currentIds.has(id)) {
      delete imageNodes.value[id];
    }
  }
}, { deep: true, flush: 'post' });

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
  } else if (layer.type === 'ellipse') {
    baseConfig.radiusX = layer.radiusX;
    baseConfig.radiusY = layer.radiusY;
    baseConfig.fill = layer.fill;
    baseConfig.stroke = layer.stroke;
    baseConfig.strokeWidth = layer.strokeWidth;
  } else if (layer.type === 'line') {
    baseConfig.points = layer.points;
    baseConfig.stroke = layer.stroke;
    baseConfig.strokeWidth = layer.strokeWidth;
    baseConfig.dash = layer.dash;
    if (layer.closed) {
      baseConfig.closed = layer.closed;
    }
  } else if (layer.type === 'star') {
    baseConfig.numPoints = layer.numPoints;
    baseConfig.innerRadius = layer.innerRadius;
    baseConfig.outerRadius = layer.outerRadius;
    baseConfig.fill = layer.fill;
    baseConfig.stroke = layer.stroke;
    baseConfig.strokeWidth = layer.strokeWidth;
  } else if (layer.type === 'arrow') {
    baseConfig.points = layer.points;
    baseConfig.pointerLength = layer.pointerLength;
    baseConfig.pointerWidth = layer.pointerWidth;
    baseConfig.pointerAtBeginning = layer.pointerAtBeginning;
    baseConfig.pointerAtEnding = layer.pointerAtEnding;
    baseConfig.stroke = layer.stroke;
    baseConfig.strokeWidth = layer.strokeWidth;
    baseConfig.fill = layer.stroke; // Arrow fill matches stroke
  } else if (layer.type === 'polygon') {
    baseConfig.sides = layer.sides;
    baseConfig.radius = layer.radius;
    baseConfig.fill = layer.fill;
    baseConfig.stroke = layer.stroke;
    baseConfig.strokeWidth = layer.strokeWidth;
  } else if (layer.type === 'path') {
    baseConfig.data = layer.data;
    baseConfig.fill = layer.fill;
    baseConfig.stroke = layer.stroke;
    baseConfig.strokeWidth = layer.strokeWidth;
  }

  return baseConfig;
}

function getGroupConfig(layer: EditorLayer) {
  const isEditing = editingGroupId.value === layer.id;
  
  return {
    id: layer.id,
    x: layer.x,
    y: layer.y,
    rotation: layer.rotation,
    scaleX: layer.scaleX,
    scaleY: layer.scaleY,
    opacity: layer.opacity,
    draggable: layer.draggable && !layer.locked && !isEditing,
    listening: true,
  };
}

function getGroupHitRectConfig(layer: EditorLayer) {
  // Calculate bounding box of all children to create hit area
  let minX = 0, minY = 0, maxX = 0, maxY = 0;
  let hasChildren = false;
  
  if (layer.children && layer.children.length > 0) {
    hasChildren = true;
    minX = Infinity; 
    minY = Infinity; 
    maxX = -Infinity; 
    maxY = -Infinity;
    
    layer.children.forEach(child => {
      let childWidth = 100, childHeight = 100, childX = 0, childY = 0;
      
      if (child.type === 'rect') {
        childWidth = child.width || 100;
        childHeight = child.height || 100;
        childX = child.x || 0;
        childY = child.y || 0;
      } else if (child.type === 'circle') {
        childWidth = (child.radius || 50) * 2;
        childHeight = (child.radius || 50) * 2;
      } else if (child.type === 'polygon' || child.type === 'star') {
        const r = child.radius || child.outerRadius || 60;
        childWidth = r * 2;
        childHeight = r * 2;
      } else if (child.type === 'path' && child.scaleX) {
        // Estimate size from scale (assuming 24x24 viewBox)
        childWidth = 24 * child.scaleX;
        childHeight = 24 * child.scaleY;
        childX = (child.offsetX || 0) + childWidth / 2;
        childY = (child.offsetY || 0) + childHeight / 2;
      }
      
      minX = Math.min(minX, childX - childWidth / 2);
      minY = Math.min(minY, childY - childHeight / 2);
      maxX = Math.max(maxX, childX + childWidth / 2);
      maxY = Math.max(maxY, childY + childHeight / 2);
    });
  }
  
  // Add padding
  const padding = 20;
  let width, height;
  
  if (hasChildren) {
    width = maxX - minX + padding * 2;
    height = maxY - minY + padding * 2;
  } else {
    // Default size if no children
    width = 200;
    height = 200;
    minX = -100;
    minY = -100;
  }
  
  return {
    x: minX - padding,
    y: minY - padding,
    width: width,
    height: height,
    fill: 'transparent',
    stroke: editingGroupId.value === layer.id ? '#3b82f6' : 'transparent',
    strokeWidth: 1,
    listening: true,
    perfectDrawEnabled: false,
    shadowEnabled: false,
  };
}

function getGroupChildConfig(child: any, parent: EditorLayer) {
  const isEditing = editingGroupId.value === parent.id;
  
  const baseConfig: any = {
    id: child.id,
    fill: child.fill,
    stroke: child.stroke,
    strokeWidth: child.strokeWidth,
    draggable: isEditing,
    listening: isEditing,
  };

  if (child.type === 'rect') {
    baseConfig.x = child.x || 0;
    baseConfig.y = child.y || 0;
    baseConfig.width = child.width;
    baseConfig.height = child.height;
  } else if (child.type === 'circle') {
    baseConfig.radius = child.radius;
  } else if (child.type === 'ellipse') {
    baseConfig.radiusX = child.radiusX;
    baseConfig.radiusY = child.radiusY;
  } else if (child.type === 'polygon') {
    baseConfig.sides = child.sides;
    baseConfig.radius = child.radius;
  } else if (child.type === 'star') {
    baseConfig.numPoints = child.numPoints;
    baseConfig.innerRadius = child.innerRadius;
    baseConfig.outerRadius = child.outerRadius;
  } else if (child.type === 'path') {
    baseConfig.data = child.data;
    baseConfig.scaleX = child.scaleX || 1;
    baseConfig.scaleY = child.scaleY || 1;
    baseConfig.x = child.offsetX || 0;
    baseConfig.y = child.offsetY || 0;
  } else if (child.type === 'text') {
    baseConfig.text = child.text;
    baseConfig.fontSize = child.fontSize;
    baseConfig.fontFamily = child.fontFamily;
  }

  return baseConfig;
}

function handleGroupMouseDown(e: any, layer: EditorLayer) {
  // Only select if we're not already editing this group
  if (editingGroupId.value !== layer.id) {
    e.cancelBubble = true;
    editorStore.selectLayer(layer.id);
    
    const node = e.target as Konva.Node;
    
    // Check if we clicked on the hit rect (empty space) or the group itself
    if (node.getClassName() === 'Rect' && node.fill() === 'transparent') {
      // Clicked on empty space within group - select the group
      currentSelectedNode = node.getParent() as Konva.Node;
    } else {
      currentSelectedNode = node;
    }
    
    updateTransformer();
    
    // Setup drag handlers for the group
    if (currentSelectedNode) {
      currentSelectedNode.off('dragend');
      currentSelectedNode.off('transformend');
      
      currentSelectedNode.on('dragend', () => {
        const groupLayer = editorStore.layers.find(l => l.id === layer.id);
        if (groupLayer && groupLayer.type === 'group') {
          groupLayer.x = currentSelectedNode!.x();
          groupLayer.y = currentSelectedNode!.y();
        }
      });
      
      currentSelectedNode.on('transformend', () => {
        const groupLayer = editorStore.layers.find(l => l.id === layer.id);
        if (groupLayer && groupLayer.type === 'group') {
          groupLayer.x = currentSelectedNode!.x();
          groupLayer.y = currentSelectedNode!.y();
          groupLayer.rotation = currentSelectedNode!.rotation();
          groupLayer.scaleX = currentSelectedNode!.scaleX();
          groupLayer.scaleY = currentSelectedNode!.scaleY();
        }
      });
    }
  }
}

function handleGroupDblClick(e: any, layer: EditorLayer) {
  e.cancelBubble = true;
  
  if (editingGroupId.value === layer.id) {
    // Exit edit mode
    editingGroupId.value = null;
    editingChildId.value = null;
    editorStore.toggleGroupEdit(layer.id);
  } else {
    // Enter edit mode
    editingGroupId.value = layer.id;
    editorStore.toggleGroupEdit(layer.id);
  }
  
  // Re-render to update listening states
  nextTick(() => {
    const stage = stageRef.value?.getStage() as Konva.Stage;
    if (stage) {
      stage.batchDraw();
    }
  });
}

function handleGroupChildMouseDown(e: any, layer: EditorLayer, child: any) {
  if (editingGroupId.value === layer.id) {
    // In edit mode - select the child
    e.cancelBubble = true;
    editingChildId.value = child.id;
    editorStore.selectGroupChild(layer.id, child.id);
    
    // Select the node for transformer
    const node = e.target as Konva.Node;
    currentSelectedNode = node;
    updateTransformer();
  } else {
    // Not in edit mode - treat as group click
    handleGroupMouseDown(e, layer);
  }
}

function getImageLayerConfig(layer: EditorLayer) {
  const img = imageNodes.value[layer.id];
  const width = layer.width || img?.naturalWidth || img?.width || 100;
  const height = layer.height || img?.naturalHeight || img?.height || 100;
  
  return {
    id: layer.id,
    x: layer.x,
    y: layer.y,
    image: img,
    width: width,
    height: height,
    offsetX: width / 2,
    offsetY: height / 2,
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
    // If we're editing a group, exit edit mode
    if (editingGroupId.value) {
      editingGroupId.value = null;
      editingChildId.value = null;
    }
    editorStore.selectLayer(null);
    currentSelectedNode = null;
    updateTransformer();
    return;
  }
  
  // Get the clicked node and find its layer ID
  const clickedNode = e.target as Konva.Node;
  let clickedId = clickedNode.id();
  
  // Check if we clicked on a group or element inside a group
  let parentGroup = editorStore.layers.find(l => 
    l.type === 'group' && l.children?.some(c => c.id === clickedId)
  );
  
  // Also check if the clicked element IS a group
  const clickedLayer = editorStore.layers.find(l => l.id === clickedId);
  if (clickedLayer && clickedLayer.type === 'group') {
    parentGroup = clickedLayer;
  }
  
  // Check if clicked node is inside a group (check parent)
  let parent = clickedNode.getParent();
  while (parent && !parentGroup) {
    const parentId = parent.id();
    const groupLayer = editorStore.layers.find(l => l.id === parentId && l.type === 'group');
    if (groupLayer) {
      parentGroup = groupLayer;
      clickedId = parentId;
      break;
    }
    parent = parent.getParent();
  }
  
  if (parentGroup) {
    if (editingGroupId.value === parentGroup.id) {
      // We're in group edit mode - let the child handler manage this
      return;
    } else {
      // Not in edit mode - select the group
      // This will be handled by the group's mousedown handler
      return;
    }
  }
  
  // Clicked on a regular layer (not a group) - select it
  if (clickedLayer) {
    editorStore.selectLayer(clickedLayer.id);
    
    // If clicking on a non-group while editing a group, exit edit mode
    if (editingGroupId.value) {
      editingGroupId.value = null;
      editingChildId.value = null;
    }
    
    // Setup drag and transform handlers for this node
    currentSelectedNode = clickedNode;
    updateTransformer();
    
    // Remove previous handlers to avoid duplicates
    clickedNode.off('dragend');
    clickedNode.off('transformend');
    
    // Handle drag end
    clickedNode.on('dragend', () => {
      const layer = editorStore.layers.find(l => l.id === clickedNode.id());
      if (layer) {
        layer.x = clickedNode.x();
        layer.y = clickedNode.y();
      }
    });
    
    // Handle transform end
    clickedNode.on('transformend', () => {
      const layer = editorStore.layers.find(l => l.id === clickedNode.id());
      if (!layer) return;
      
      // Update position and rotation
      layer.x = clickedNode.x();
      layer.y = clickedNode.y();
      layer.rotation = clickedNode.rotation();
      
      // For non-group layers, apply size changes
      if (layer.type !== 'group') {
        // Update size for rects and images
        if (layer.type === "rect" || layer.type === "image") {
          layer.width = (layer.width || 100) * clickedNode.scaleX();
          layer.height = (layer.height || 100) * clickedNode.scaleY();
        }
        
        // Update radius for circles
        if (layer.type === "circle") {
          layer.radius = (layer.radius || 50) * clickedNode.scaleX();
        }
        
        // Update radii for ellipses
        if (layer.type === "ellipse") {
          layer.radiusX = (layer.radiusX || 60) * clickedNode.scaleX();
          layer.radiusY = (layer.radiusY || 40) * clickedNode.scaleY();
        }
        
        // Update radii for stars
        if (layer.type === "star") {
          layer.innerRadius = (layer.innerRadius || 30) * clickedNode.scaleX();
          layer.outerRadius = (layer.outerRadius || 60) * clickedNode.scaleX();
        }
        
        // Update radius for polygons
        if (layer.type === "polygon") {
          layer.radius = (layer.radius || 50) * clickedNode.scaleX();
        }
        
        // Handle path transformation - update scale
        if (layer.type === "path") {
          layer.scaleX = (layer.scaleX || 1) * clickedNode.scaleX();
          layer.scaleY = (layer.scaleY || 1) * clickedNode.scaleY();
        }
        
        // Handle text transformation - update fontSize and dimensions
        if (layer.type === "text") {
          layer.fontSize = (layer.fontSize || 24) * clickedNode.scaleX();
          if (layer.width) {
            layer.width = layer.width * clickedNode.scaleX();
          }
          if (layer.height) {
            layer.height = layer.height * clickedNode.scaleY();
          }
        }
        
        // Reset node scale
        clickedNode.scaleX(1);
        clickedNode.scaleY(1);
      } else {
        // For groups, keep the scale
        layer.scaleX = clickedNode.scaleX();
        layer.scaleY = clickedNode.scaleY();
      }
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
