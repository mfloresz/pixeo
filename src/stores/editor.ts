import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { EditorLayer, EditorLayerType, EditorTemplate, EditorProject } from "../types";
import { useHistoryStore } from "./history";

// Predefined templates
const templates: EditorTemplate[] = [
  { id: "instagram-post", name: "Instagram Post", width: 1080, height: 1080, category: "Social", icon: "square" },
  { id: "instagram-story", name: "Instagram Story", width: 1080, height: 1920, category: "Social", icon: "smartphone" },
  { id: "facebook-post", name: "Facebook Post", width: 1200, height: 630, category: "Social", icon: "facebook" },
  { id: "twitter-post", name: "Twitter/X Post", width: 1200, height: 675, category: "Social", icon: "twitter" },
  { id: "youtube-thumbnail", name: "YouTube Thumbnail", width: 1280, height: 720, category: "Video", icon: "youtube" },
  { id: "a4", name: "A4 Paper", width: 794, height: 1123, category: "Print", icon: "file-text" },
  { id: "business-card", name: "Business Card", width: 336, height: 192, category: "Print", icon: "credit-card" },
  { id: "presentation", name: "Presentation", width: 1280, height: 720, category: "Business", icon: "presentation" },
  { id: "custom", name: "Custom Size", width: 800, height: 600, category: "Other", icon: "settings" },
];

export const useEditorStore = defineStore("editor", () => {
  // Canvas state
  const canvasWidth = ref(800);
  const canvasHeight = ref(600);
  const backgroundColor = ref("#ffffff");
  const backgroundImage = ref<string | undefined>(undefined);
  
  // Zoom state
  const zoom = ref(1);
  const minZoom = 0.1;
  const maxZoom = 3;
  
  function setZoom(value: number) {
    zoom.value = Math.max(minZoom, Math.min(maxZoom, value));
  }
  
  function zoomIn() {
    setZoom(zoom.value + 0.1);
  }
  
  function zoomOut() {
    setZoom(zoom.value - 0.1);
  }
  
  function resetZoom() {
    zoom.value = 1;
  }
  
  // Layers
  const layers = ref<EditorLayer[]>([]);
  const selectedLayerId = ref<string | null>(null);
  const layerCounter = ref(1);
  
  // History for undo/redo
  const history = ref<EditorLayer[][]>([]);
  const historyIndex = ref(-1);
  const maxHistorySteps = 50;
  
  // Project
  const currentProject = ref<EditorProject | null>(null);
  const projectName = ref("Untitled Project");
  
  // Templates
  const availableTemplates = ref<EditorTemplate[]>(templates);
  
  // Computed
  const selectedLayer = computed(() => {
    return layers.value.find(l => l.id === selectedLayerId.value) || null;
  });
  
  const visibleLayers = computed(() => {
    return layers.value.filter(l => l.visible);
  });
  
  const canUndo = computed(() => historyIndex.value > 0);
  const canRedo = computed(() => historyIndex.value < history.value.length - 1);
  
  // Actions
  function saveToHistory() {
    // Remove any future history if we're not at the end
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1);
    }
    
    // Add current state to history
    history.value.push(JSON.parse(JSON.stringify(layers.value)));
    
    // Limit history size
    if (history.value.length > maxHistorySteps) {
      history.value.shift();
    } else {
      historyIndex.value++;
    }
  }
  
  function undo() {
    if (canUndo.value) {
      historyIndex.value--;
      layers.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]));
    }
  }
  
  function redo() {
    if (canRedo.value) {
      historyIndex.value++;
      layers.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]));
    }
  }
  
  function setCanvasSize(width: number, height: number) {
    canvasWidth.value = width;
    canvasHeight.value = height;
  }
  
  function setBackgroundColor(color: string) {
    backgroundColor.value = color;
  }
  
  function setBackgroundImage(src: string | undefined) {
    backgroundImage.value = src;
  }
  
  function addLayer(type: EditorLayerType, config?: Partial<EditorLayer>) {
    const id = `layer-${Date.now()}-${layerCounter.value++}`;
    const name = config?.name || `${type.charAt(0).toUpperCase() + type.slice(1)} ${layerCounter.value - 1}`;
    
    const baseLayer: EditorLayer = {
      id,
      type,
      name,
      visible: true,
      locked: false,
      x: canvasWidth.value / 2,
      y: canvasHeight.value / 2,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      draggable: true,
      fill: type === "text" ? "#000000" : "#3b82f6",
      ...config,
    };
    
    // Add type-specific defaults
    if (type === "text") {
      baseLayer.text = config?.text || "Double click to edit";
      baseLayer.fontSize = config?.fontSize || 24;
      baseLayer.fontFamily = config?.fontFamily || "Arial";
    } else if (type === "rect") {
      baseLayer.width = config?.width || 100;
      baseLayer.height = config?.height || 100;
    } else if (type === "circle") {
      baseLayer.radius = config?.radius || 50;
    } else if (type === "line") {
      baseLayer.points = config?.points || [0, 0, 100, 0];
      baseLayer.stroke = config?.stroke || "#000000";
      baseLayer.strokeWidth = config?.strokeWidth || 2;
    }
    
    saveToHistory();
    layers.value.push(baseLayer);
    selectedLayerId.value = id;
    
    return id;
  }
  
  function updateLayer(id: string, updates: Partial<EditorLayer>, saveHistory: boolean = false) {
    const layer = layers.value.find(l => l.id === id);
    if (layer) {
      Object.assign(layer, updates);
      if (saveHistory) {
        saveToHistory();
      }
    }
  }
  
  function deleteLayer(id: string) {
    saveToHistory();
    const index = layers.value.findIndex(l => l.id === id);
    if (index > -1) {
      layers.value.splice(index, 1);
      if (selectedLayerId.value === id) {
        selectedLayerId.value = null;
      }
    }
  }
  
  function selectLayer(id: string | null) {
    selectedLayerId.value = id;
  }
  
  function moveLayer(id: string, direction: "up" | "down" | "top" | "bottom") {
    saveToHistory();
    const index = layers.value.findIndex(l => l.id === id);
    if (index === -1) return;
    
    const layer = layers.value[index];
    layers.value.splice(index, 1);
    
    switch (direction) {
      case "up":
        layers.value.splice(Math.min(index + 1, layers.value.length), 0, layer);
        break;
      case "down":
        layers.value.splice(Math.max(index - 1, 0), 0, layer);
        break;
      case "top":
        layers.value.push(layer);
        break;
      case "bottom":
        layers.value.unshift(layer);
        break;
    }
  }
  
  function toggleLayerVisibility(id: string) {
    const layer = layers.value.find(l => l.id === id);
    if (layer) {
      layer.visible = !layer.visible;
    }
  }
  
  function toggleLayerLock(id: string) {
    const layer = layers.value.find(l => l.id === id);
    if (layer) {
      layer.locked = !layer.locked;
      layer.draggable = !layer.locked;
    }
  }
  
  function duplicateLayer(id: string) {
    const layer = layers.value.find(l => l.id === id);
    if (!layer) return;
    
    saveToHistory();
    const newId = `layer-${Date.now()}-${layerCounter.value++}`;
    const newLayer: EditorLayer = {
      ...JSON.parse(JSON.stringify(layer)),
      id: newId,
      name: `${layer.name} Copy`,
      x: layer.x + 20,
      y: layer.y + 20,
    };
    
    layers.value.push(newLayer);
    selectedLayerId.value = newId;
  }
  
  function clearCanvas() {
    saveToHistory();
    layers.value = [];
    selectedLayerId.value = null;
  }
  
  function loadTemplate(template: EditorTemplate) {
    saveToHistory();
    canvasWidth.value = template.width;
    canvasHeight.value = template.height;
    layers.value = [];
    selectedLayerId.value = null;
    backgroundColor.value = "#ffffff";
    backgroundImage.value = undefined;
  }
  
  function exportProject(): EditorProject {
    return {
      id: currentProject.value?.id || `project-${Date.now()}`,
      name: projectName.value,
      width: canvasWidth.value,
      height: canvasHeight.value,
      backgroundColor: backgroundColor.value,
      backgroundImage: backgroundImage.value,
      layers: JSON.parse(JSON.stringify(layers.value)),
      createdAt: currentProject.value?.createdAt || new Date(),
      updatedAt: new Date(),
    };
  }
  
  function loadProject(project: EditorProject) {
    canvasWidth.value = project.width;
    canvasHeight.value = project.height;
    backgroundColor.value = project.backgroundColor;
    backgroundImage.value = project.backgroundImage;
    layers.value = JSON.parse(JSON.stringify(project.layers));
    projectName.value = project.name;
    currentProject.value = project;
    selectedLayerId.value = null;
    
    // Reset history
    history.value = [JSON.parse(JSON.stringify(layers.value))];
    historyIndex.value = 0;
  }
  
  async function saveToLibrary() {
    const historyStore = useHistoryStore();
    const project = exportProject();
    
    // Convert project to JSON blob
    const projectJson = JSON.stringify(project);
    const blob = new Blob([projectJson], { type: "application/json" });
    
    // Save to history store with type "editor-project"
    await historyStore.addEditorProject(project.name, blob, {
      width: project.width,
      height: project.height,
      layerCount: project.layers.length,
    });
    
    return project.id;
  }
  
  function initNewProject() {
    canvasWidth.value = 800;
    canvasHeight.value = 600;
    backgroundColor.value = "#ffffff";
    backgroundImage.value = undefined;
    layers.value = [];
    selectedLayerId.value = null;
    projectName.value = "Untitled Project";
    currentProject.value = null;
    history.value = [];
    historyIndex.value = -1;
    layerCounter.value = 1;
  }
  
  // Initialize with empty state
  initNewProject();
  
  return {
    // State
    canvasWidth,
    canvasHeight,
    backgroundColor,
    backgroundImage,
    layers,
    selectedLayerId,
    projectName,
    currentProject,
    availableTemplates,
    zoom,
    minZoom,
    maxZoom,
    
    // Computed
    selectedLayer,
    visibleLayers,
    canUndo,
    canRedo,
    
    // Actions
    saveToHistory,
    undo,
    redo,
    setCanvasSize,
    setBackgroundColor,
    setBackgroundImage,
    addLayer,
    updateLayer,
    deleteLayer,
    selectLayer,
    moveLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    duplicateLayer,
    clearCanvas,
    loadTemplate,
    exportProject,
    loadProject,
    saveToLibrary,
    initNewProject,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
  };
});
