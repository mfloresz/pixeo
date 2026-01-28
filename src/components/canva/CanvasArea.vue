<template>
    <div
        ref="containerRef"
        class="relative bg-white shadow-lg rounded-sm overflow-hidden"
        :style="containerStyle"
    >
        <canvas ref="canvasRef"></canvas>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCanvas } from '../../composables/canva/useCanvas';
import type { fabric } from '../../lib/fabric';

interface Props {
    width?: number;
    height?: number;
    backgroundColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
    width: 800,
    height: 600,
    backgroundColor: '#ffffff'
});

const emit = defineEmits<{
    (e: 'canvasReady', canvas: fabric.Canvas): void;
    (e: 'objectSelected', object: fabric.Object | null): void;
    (e: 'objectModified', object: fabric.Object): void;
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

const containerStyle = computed(() => ({
    width: `${props.width}px`,
    height: `${props.height}px`
}));

// Usar el composable useCanvas
const { canvas, isReady, setDimensions, setBackgroundColor } = useCanvas(canvasRef, {
    width: props.width,
    height: props.height,
    backgroundColor: props.backgroundColor,
    onReady: (fabricCanvas) => {
        emit('canvasReady', fabricCanvas);
    },
    onObjectSelected: (object) => {
        emit('objectSelected', object);
    },
    onObjectModified: (object) => {
        emit('objectModified', object);
    }
});

// Watch para cambios de props
watch(() => props.width, (newWidth) => {
    setDimensions(newWidth, props.height);
});

watch(() => props.height, (newHeight) => {
    setDimensions(props.width, newHeight);
});

watch(() => props.backgroundColor, (newColor) => {
    setBackgroundColor(newColor);
});

// Métodos expuestos
function getCanvas(): fabric.Canvas | null {
    return canvas.value;
}

function addObject(object: fabric.Object) {
    if (canvas.value) {
        canvas.value.add(object);
        canvas.value.setActiveObject(object);
        canvas.value.renderAll();
    }
}

function removeObject(object: fabric.Object) {
    if (canvas.value) {
        canvas.value.remove(object);
        canvas.value.discardActiveObject();
        canvas.value.renderAll();
    }
}

function clear() {
    if (canvas.value) {
        canvas.value.clear();
        canvas.value.backgroundColor = props.backgroundColor;
        canvas.value.renderAll();
    }
}

function toJSON(): string {
    return canvas.value ? JSON.stringify(canvas.value.toJSON()) : '';
}

function loadFromJSON(json: string) {
    if (canvas.value) {
        canvas.value.loadFromJSON(json, () => {
            canvas.value?.renderAll();
        });
    }
}

function toDataURL(options?: { format?: 'png' | 'jpeg'; quality?: number; multiplier?: number }): string {
    if (!canvas.value) return '';

    return canvas.value.toDataURL({
        format: options?.format || 'png',
        quality: options?.quality || 1,
        multiplier: options?.multiplier || 1
    });
}

// Exponer métodos al componente padre
defineExpose({
    canvas,
    isReady,
    getCanvas,
    addObject,
    removeObject,
    clear,
    toJSON,
    loadFromJSON,
    toDataURL,
    setDimensions,
    setBackgroundColor
});
</script>

<style scoped>
canvas {
    display: block;
}
</style>