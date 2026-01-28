<template>
    <TooltipProvider>
        <div class="h-full flex flex-col overflow-hidden bg-background">
            <!-- ToolBar superior -->
            <ToolBar
                :active-tool="activeTool"
                @tool-change="handleToolChange"
                @undo="undo"
                @redo="redo"
                :can-undo="canUndo"
                :can-redo="canRedo"
            />

            <div class="flex flex-1 min-h-0 overflow-hidden relative">
                <!-- MainBar - barra de herramientas izquierda (solo iconos) -->
                <MainBar
                    :active-tool="activeTool"
                    @tool-change="handleToolChange"
                    @add-shape="addShape"
                    @add-image="handleAddImage"
                    @toggle-drawing="toggleDrawing"
                />

                <!-- Sidebar - panel contextual expandible -->
                <Sidebar
                    :active-tool="activeTool"
                    @tool-change="handleToolChange"
                    @add-text="handleAddText"
                    @select-template="handleSelectTemplate"
                    @create-custom="handleCreateCustom"
                />

                <!-- CanvasArea central -->
                <div class="flex-1 flex flex-col min-w-0 bg-muted/30">
                    <div class="flex-1 flex items-center justify-center p-8 overflow-auto">
                        <CanvasArea
                            ref="canvasAreaRef"
                            :width="800"
                            :height="600"
                            @canvas-ready="onCanvasReady"
                            @object-selected="onObjectSelected"
                            @object-modified="saveState"
                        />
                    </div>
                </div>
            </div>
        </div>
    </TooltipProvider>
</template>

<script setup lang="ts">
import { ref, onUnmounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { TooltipProvider } from 'reka-ui';
import { useCanvaStore } from '../../stores/canva';
import { useEditor } from '../../composables/canva/useEditor';
import { useHotkeys } from '../../composables/canva/useHotkeys';
import { useClipboard } from '../../composables/canva/useClipboard';
import CanvasArea from './CanvasArea.vue';
import MainBar from './MainBar.vue';
import ToolBar from './ToolBar.vue';
import Sidebar from './Sidebar.vue';
import type { ActiveTool, ShapeType, Template } from '../../types/canva';
import type { fabric } from '../../lib/fabric';

const canvaStore = useCanvaStore();
const { activeTool, canUndo, canRedo, selectedObject, canvas, pendingProjectJson, pendingProjectDimensions, sidebarVisible } = storeToRefs(canvaStore);
const { setActiveTool, undo, redo, saveState, setCanvas, setSelectedObject, initHistory, clearPendingProject, setSidebarVisible } = canvaStore;

const editor = useEditor();
const canvasAreaRef = ref<InstanceType<typeof CanvasArea> | null>(null);

// Clipboard
const { copy, paste, canCopy, canPaste } = useClipboard({
    canvas: computed(() => canvas.value)
});

// Hotkeys
useHotkeys({
    canvas: computed(() => canvas.value),
    undo,
    redo,
    save: () => {
        // Save functionality - could trigger export or save to localStorage
        console.log('Save triggered');
    },
    copy,
    paste
});

// Manejar cambio de herramienta
function handleToolChange(tool: ActiveTool) {
    // Si el sidebar está oculto y se selecciona una herramienta que usa el sidebar, mostrarlo
    const toolsThatUseSidebar = ['text', 'templates', 'ai', 'filters', 'settings', 'select'];
    if (!sidebarVisible.value && toolsThatUseSidebar.includes(tool)) {
        setSidebarVisible(true);
    }

    setActiveTool(tool);

    // Desactivar modo drawing si no es la herramienta draw
    if (tool !== 'draw') {
        editor.enableDrawingMode(false);
    }
}

// Canvas ready
async function onCanvasReady(fabricCanvas: fabric.Canvas) {
    setCanvas(fabricCanvas);

    // Check if there's a pending project to load
    if (pendingProjectJson.value) {
        // Set canvas dimensions if available
        if (pendingProjectDimensions.value) {
            editor.setCanvasSize(
                pendingProjectDimensions.value.width,
                pendingProjectDimensions.value.height
            );
        }

        // Load the project JSON
        await editor.loadFromJSON(pendingProjectJson.value);

        // Clear the pending project
        clearPendingProject();
    } else {
        // Initialize history for new canvas
        initHistory();
    }
}

// Object selected
function onObjectSelected(object: fabric.Object | null) {
    setSelectedObject(object);
}

// Agregar forma
function addShape(type: ShapeType) {
    editor.addShape(type);
    setActiveTool('select');
}

// Agregar texto
function handleAddText(options: { text: string; fontSize: number; fontFamily: string }) {
    editor.addText(options.text, {
        fontSize: options.fontSize,
        fontFamily: options.fontFamily
    });
    setActiveTool('select');
}

// Manejar agregar imagen
async function handleAddImage(file: File) {
    await editor.addImageFromFile(file);
    setActiveTool('select');
}

// Toggle drawing mode
function toggleDrawing(enabled: boolean) {
    editor.enableDrawingMode(enabled, {
        width: 2,
        color: canvaStore.strokeColor
    });
}

// Handle template selection
async function handleSelectTemplate(template: Template) {
    await editor.loadTemplate(template);
    setActiveTool('select');
}

// Handle custom canvas creation
function handleCreateCustom(width: number, height: number) {
    editor.setCanvasSize(width, height);
    setActiveTool('select');
}

onUnmounted(() => {
    setCanvas(null);
});
</script>
