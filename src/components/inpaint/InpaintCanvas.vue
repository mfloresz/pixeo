<template>
    <div ref="containerRef" class="relative w-full h-full flex items-center justify-center p-4">
        <canvas
            ref="canvasRef"
            class="rounded-lg object-contain"
            :style="canvasStyle"
            :class="{ 'cursor-none': showBrush && !showOriginal }"
            @mouseenter="onMouseEnter"
            @mouseleave="onMouseLeave"
            @mousemove="onMouseMove"
            @mousedown="startDrawing"
            @mouseup="stopDrawing"
            @touchstart.prevent="startTouchDrawing"
            @touchmove.prevent="touchDraw"
            @touchend="stopDrawing"
        />

        <div
            v-if="showBrush && !showOriginal && !isProcessing"
            ref="brushRef"
            class="fixed rounded-full bg-red-500/50 pointer-events-none border-2 border-red-500 z-50 -translate-x-1/2 -translate-y-1/2"
            :style="brushStyle"
        />

        <div
            v-if="showOriginal && originalImage"
            class="absolute top-0 right-0 overflow-hidden bg-background"
            :style="originalOverlayStyle"
        >
            <div
                class="absolute top-0 right-0 z-10 flex items-center h-full cursor-ew-resize"
                :style="separatorStyle"
            >
                <div class="bg-primary p-1 rounded-md">
                    <MoveHorizontal class="w-4 h-4" />
                </div>
            </div>
            <img
                ref="originalImgRef"
                :src="originalImage.src"
                class="absolute right-0 top-0"
                :style="originalImageStyle"
            />
        </div>

        <div
            v-if="isProcessing"
            class="absolute inset-0 bg-background/80 flex items-center justify-center z-20"
        >
            <div class="text-center space-y-4">
                <p class="text-lg font-medium">{{ $t('inpaint.processing') }}</p>
                <div class="w-48 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        class="h-full bg-primary transition-all duration-300"
                        :style="{ width: `${progress}%` }"
                    />
                </div>
                <p class="text-sm text-muted-foreground">{{ Math.round(progress) }}%</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useInpaintStore } from '../../stores/inpaint';
import { drawLines as drawLinesUtil, inpaint } from '../../services/inpaintProcessor';
import { MoveHorizontal } from 'lucide-vue-next';

const DEBUG = true;

const emit = defineEmits<{
    'stroke-end': [];
}>();

const inpaintStore = useInpaintStore();
const {
    originalImage,
    currentImage,
    lines,
    brushSize,
    showOriginal,
    separatorPosition,
    isProcessing,
    progress
} = storeToRefs(inpaintStore);

const containerRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const brushRef = ref<HTMLDivElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const maskCanvas = document.createElement('canvas');

let isDrawing = false;
const showBrush = ref(false);

const brushStyle = computed(() => ({
    width: `${brushSize.value}px`,
    height: `${brushSize.value}px`,
}));

const canvasStyle = computed(() => {
    if (!currentImage.value) {
        return {};
    }

    const img = currentImage.value;
    const imgAspect = img.width / img.height;

    if (!containerRef.value) {
        return {
            width: `${img.width}px`,
            height: `${img.height}px`,
        };
    }

    const containerWidth = containerRef.value.clientWidth;
    const containerHeight = containerRef.value.clientHeight;
    const containerAspect = containerWidth / containerHeight;

    let drawWidth: number;
    let drawHeight: number;

    if (containerAspect > imgAspect) {
        drawHeight = containerHeight;
        drawWidth = img.width * (containerHeight / img.height);
    } else {
        drawWidth = containerWidth;
        drawHeight = img.height * (containerWidth / img.width);
    }

    return {
        width: `${drawWidth}px`,
        height: `${drawHeight}px`,
    };
});

const separatorStyle = computed(() => ({
    left: `${separatorPosition.value}px`,
    height: `${canvasRef.value?.height || 0}px`,
}));

const originalOverlayStyle = computed(() => ({
    width: showOriginal.value ? `${canvasRef.value?.width || 0}px` : '0px',
    height: `${canvasRef.value?.height || 0}px`,
    transition: 'width 0.3s ease',
}));

const originalImageStyle = computed(() => ({
    width: `${canvasRef.value?.width || 0}px`,
    height: `${canvasRef.value?.height || 0}px`,
    clipPath: `inset(0 0 0 ${separatorPosition.value}px)`,
}));

function updateCanvasSize() {
    if (!containerRef.value || !canvasRef.value || !currentImage.value) {
        if (DEBUG) {
            console.log('[updateCanvasSize] Skipping - missing dependencies:', {
                container: !!containerRef.value,
                canvas: !!canvasRef.value,
                image: !!currentImage.value
            });
        }
        return;
    }

    const container = containerRef.value;
    const img = currentImage.value;
    const canvas = canvasRef.value;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const imgAspect = img.width / img.height;
    const containerAspect = containerWidth / containerHeight;

    let drawWidth: number;
    let drawHeight: number;

    if (containerAspect > imgAspect) {
        drawHeight = containerHeight;
        drawWidth = img.width * (containerHeight / img.height);
    } else {
        drawWidth = containerWidth;
        drawHeight = img.height * (containerWidth / img.width);
    }

    // High-DPI support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = drawWidth * dpr;
    canvas.height = drawHeight * dpr;
    canvas.style.width = `${drawWidth}px`;
    canvas.style.height = `${drawHeight}px`;

    maskCanvas.width = drawWidth * dpr;
    maskCanvas.height = drawHeight * dpr;

    if (ctx.value) {
        ctx.value.scale(dpr, dpr);
    }

    if (DEBUG) {
        console.log('[updateCanvasSize] Canvas resized:', {
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            containerWidth: containerWidth,
            containerHeight: containerHeight,
            imageAspect: imgAspect,
            containerAspect,
            dpr
        });
    }

    redraw();
}

function redraw() {
    if (!ctx.value || !canvasRef.value || !currentImage.value) return;

    const ctx2d = ctx.value;
    const canvas = canvasRef.value;
    const img = currentImage.value;

    const dpr = window.devicePixelRatio || 1;
    const drawWidth = canvas.width / dpr;
    const drawHeight = canvas.height / dpr;

    ctx2d.clearRect(0, 0, drawWidth, drawHeight);

    if (img.src) {
        ctx2d.drawImage(img, 0, 0, drawWidth, drawHeight);
    }

    const currentLine = lines.value[lines.value.length - 1];
    drawLinesUtil(ctx2d, [currentLine]);
}

function refreshMask() {
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx || !canvasRef.value) return;

    const dpr = window.devicePixelRatio || 1;
    const drawWidth = canvasRef.value.width / dpr;
    const drawHeight = canvasRef.value.height / dpr;

    maskCanvas.width = canvasRef.value.width;
    maskCanvas.height = canvasRef.value.height;

    maskCtx.scale(dpr, dpr);

    maskCtx.fillStyle = 'black';
    maskCtx.fillRect(0, 0, drawWidth, drawHeight);

    maskCtx.strokeStyle = 'white';
    maskCtx.lineCap = 'round';
    maskCtx.lineJoin = 'round';

    const currentLine = lines.value[lines.value.length - 1];
    if (currentLine && currentLine.pts.length > 0 && currentLine.size) {
        maskCtx.lineWidth = currentLine.size;
        maskCtx.beginPath();
        maskCtx.moveTo(currentLine.pts[0].x, currentLine.pts[0].y);
        for (const pt of currentLine.pts) {
            maskCtx.lineTo(pt.x, pt.y);
        }
        maskCtx.stroke();
    }
}

function onMouseEnter() {
    showBrush.value = !showOriginal.value;
}

function onMouseLeave() {
    showBrush.value = false;
}

function onMouseMove(e: MouseEvent) {
    if (!showBrush.value || !brushRef.value) return;

    // Use fixed positioning for the brush to follow the cursor exactly
    brushRef.value.style.left = `${e.clientX}px`;
    brushRef.value.style.top = `${e.clientY}px`;

    if (isDrawing) {
        draw(e);
    }
}

function getCanvasCoords(e: MouseEvent): { x: number; y: number } {
    const canvas = canvasRef.value;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
    };
}

function getTouchCoords(e: TouchEvent): { x: number; y: number } {
    const canvas = canvasRef.value;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
    };
}

function startDrawing(e: MouseEvent) {
    if (isProcessing.value || !currentImage.value || showOriginal.value) return;

    isDrawing = true;
    const coords = getCanvasCoords(e);

    const currentLine = lines.value[lines.value.length - 1];
    currentLine.size = brushSize.value;
    currentLine.pts = [coords];

    redraw();
}

function draw(e: MouseEvent) {
    if (!isDrawing || showOriginal.value) return;

    const coords = getCanvasCoords(e);
    const currentLine = lines.value[lines.value.length - 1];
    currentLine.pts.push(coords);
    redraw();
}

async function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;

    const currentLine = lines.value[lines.value.length - 1];
    if (currentLine.pts.length === 0) return;

    emit('stroke-end');
}

function startTouchDrawing(e: TouchEvent) {
    if (isProcessing.value || !currentImage.value || showOriginal.value) return;

    isDrawing = true;
    const coords = getTouchCoords(e);

    const currentLine = lines.value[lines.value.length - 1];
    currentLine.size = brushSize.value;
    currentLine.pts = [coords];

    redraw();
}

function touchDraw(e: TouchEvent) {
    if (!isDrawing || showOriginal.value) return;

    const coords = getTouchCoords(e);
    const currentLine = lines.value[lines.value.length - 1];
    currentLine.pts.push(coords);
    redraw();
}

async function runInpaint(onProgress?: (p: number) => void): Promise<string | null> {
    const sourceImage = currentImage.value || inpaintStore.imageFile;
    if (!sourceImage) return null;

    refreshMask();

    try {
        const result = await inpaint(sourceImage, maskCanvas, (p) => {
            if (onProgress) onProgress(p);
        });
        return result;
    } catch (err) {
        console.error('Inpaint failed:', err);
        throw err;
    }
}

// Watch for changes in currentImage after initial load
watch(currentImage, (newImage) => {
    if (DEBUG && newImage) {
        console.log('[InpaintCanvas] currentImage changed:', {
            width: newImage.width,
            height: newImage.height,
            alreadyLoaded: !!ctx.value
        });
    }
    
    // Wait for DOM to be ready before resizing
    nextTick(() => {
        updateCanvasSize();
    });
}, { immediate: false });

// Watch for line changes
watch(() => lines.value.length, () => {
    nextTick(redraw);
});

// Watch for showOriginal changes
watch(showOriginal, (val) => {
    if (DEBUG) {
        console.log('[InpaintCanvas] showOriginal changed:', val);
    }
    if (!val) {
        separatorPosition.value = 0;
    }
    showBrush.value = !val;
});

// Timeout de seguridad para asegurar que el canvas se redimensiona
let resizeTimeout: NodeJS.Timeout | null = null;
let imageLoadTimeout: NodeJS.Timeout | null = null;

onMounted(() => {
    if (canvasRef.value) {
        ctx.value = canvasRef.value.getContext('2d');
        
        // Intentar actualizar el tamaño del canvas inmediatamente
        updateCanvasSize();
        
        // Agregar listener de resize con debounce
        window.addEventListener('resize', () => {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            resizeTimeout = setTimeout(updateCanvasSize, 100);
        });
        
        // Timeout de seguridad: asegurar que el canvas se ajuste después de 500ms
        imageLoadTimeout = setTimeout(() => {
            if (DEBUG) {
                console.log('[InpaintCanvas] Security timeout firing - forcing resize');
            }
            if (!currentImage.value) {
                console.warn('[InpaintCanvas] No image loaded yet');
                return;
            }
            updateCanvasSize();
        }, 500);
    }
});

onUnmounted(() => {
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }
    if (imageLoadTimeout) {
        clearTimeout(imageLoadTimeout);
    }
    window.removeEventListener('resize', () => {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
    });
});

defineExpose({
    runInpaint,
    redraw,
});
</script>
