import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ActiveTool, CanvaProject } from '../types/canva';
import type { CanvasInstance, FabricObjectInstance } from '../lib/fabric';

export const useCanvaStore = defineStore('canva', () => {
    // Estado del editor
    const canvas = ref<CanvasInstance | null>(null);
    const activeTool = ref<ActiveTool>('select');
    const selectedObject = ref<FabricObjectInstance | null>(null);
    const sidebarVisible = ref(true);

    // Propiedades de estilo
    const strokeColor = ref('#000000');
    const fillColor = ref('#ffffff');
    const strokeWidth = ref(2);
    const fontFamily = ref('Arial');
    const fontSize = ref(32);

    // Historial
    const history = ref<string[]>([]);
    const currentHistoryIndex = ref(-1);

    // Proyecto actual
    const currentProject = ref<CanvaProject | null>(null);
    const isDirty = ref(false);

    // Proyecto pendiente (para carga desde biblioteca)
    const pendingProjectJson = ref<string | null>(null);
    const pendingProjectDimensions = ref<{ width: number; height: number } | null>(null);

    // Computed
    const canUndo = computed(() => currentHistoryIndex.value > 0);
    const canRedo = computed(() => currentHistoryIndex.value < history.value.length - 1);

    // Actions
    function setCanvas(newCanvas: CanvasInstance | null) {
        canvas.value = newCanvas;
    }

    function setActiveTool(tool: ActiveTool) {
        activeTool.value = tool;
    }

    function setSidebarVisible(visible: boolean) {
        sidebarVisible.value = visible;
    }

    function setSelectedObject(object: FabricObjectInstance | null) {
        selectedObject.value = object;
    }

    function setStrokeColor(color: string) {
        strokeColor.value = color;
    }

    function setFillColor(color: string) {
        fillColor.value = color;
    }

    function setStrokeWidth(width: number) {
        strokeWidth.value = width;
    }

    function setFontFamily(font: string) {
        fontFamily.value = font;
    }

    function setFontSize(size: number) {
        fontSize.value = size;
    }

    // Historial
    function saveState() {
        if (!canvas.value) return;

        const json = JSON.stringify(canvas.value.toJSON());

        // Eliminar estados futuros si estamos en medio del historial
        if (currentHistoryIndex.value < history.value.length - 1) {
            history.value = history.value.slice(0, currentHistoryIndex.value + 1);
        }

        history.value.push(json);
        currentHistoryIndex.value++;

        // Limitar historial a 50 estados
        if (history.value.length > 50) {
            history.value.shift();
            currentHistoryIndex.value--;
        }

        isDirty.value = true;
    }

    function undo() {
        if (!canUndo.value || !canvas.value) return;

        currentHistoryIndex.value--;
        const state = history.value[currentHistoryIndex.value];
        canvas.value.loadFromJSON(state, () => {
            canvas.value?.renderAll();
        });
    }

    function redo() {
        if (!canRedo.value || !canvas.value) return;

        currentHistoryIndex.value++;
        const state = history.value[currentHistoryIndex.value];
        canvas.value.loadFromJSON(state, () => {
            canvas.value?.renderAll();
        });
    }

    function initHistory() {
        if (!canvas.value) return;
        const json = JSON.stringify(canvas.value.toJSON());
        history.value = [json];
        currentHistoryIndex.value = 0;
    }

    function clearHistory() {
        history.value = [];
        currentHistoryIndex.value = -1;
    }

    // Proyecto
    function setCurrentProject(project: CanvaProject | null) {
        currentProject.value = project;
        isDirty.value = false;
    }

    function markAsDirty() {
        isDirty.value = true;
    }

    function markAsClean() {
        isDirty.value = false;
    }

    // Proyecto pendiente (carga desde biblioteca)
    function setPendingProject(json: string, dimensions?: { width: number; height: number }) {
        pendingProjectJson.value = json;
        pendingProjectDimensions.value = dimensions || null;
    }

    function clearPendingProject() {
        pendingProjectJson.value = null;
        pendingProjectDimensions.value = null;
    }

    return {
        // State
        canvas,
        activeTool,
        selectedObject,
        sidebarVisible,
        strokeColor,
        fillColor,
        strokeWidth,
        fontFamily,
        fontSize,
        history,
        currentHistoryIndex,
        currentProject,
        isDirty,
        pendingProjectJson,
        pendingProjectDimensions,
        // Computed
        canUndo,
        canRedo,
        // Actions
        setCanvas,
        setActiveTool,
        setSidebarVisible,
        setSelectedObject,
        setStrokeColor,
        setFillColor,
        setStrokeWidth,
        setFontFamily,
        setFontSize,
        saveState,
        undo,
        redo,
        initHistory,
        clearHistory,
        setCurrentProject,
        markAsDirty,
        markAsClean,
        setPendingProject,
        clearPendingProject
    };
});
