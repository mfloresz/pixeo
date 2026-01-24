<template>
    <div class="h-full flex flex-col overflow-hidden">
        <div class="flex flex-1 min-h-0 overflow-hidden">
            <InpaintHistory class="h-full w-20 flex-shrink-0 border-r bg-card" />

            <div class="flex-1 flex flex-col min-w-0 pb-4 overflow-hidden">
                <div
                    ref="canvasContainer"
                    class="flex-1 flex justify-center items-center h-full w-full overflow-hidden p-4"
                >
                    <div v-if="!imageFile" class="w-full max-w-xl">
                        <InpaintFileUpload @select="handleFileSelect" />
                    </div>

                    <InpaintCanvas
                        v-else
                        ref="canvasRef"
                        class="w-full h-full"
                        @stroke-end="handleStrokeEnd"
                    />
                </div>

                <InpaintToolbar />
            </div>
        </div>

        <InpaintModelDownloadModal
            :model-value="showDownloadModal"
            @update:model-value="showDownloadModal = $event"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useInpaintStore } from '../../stores/inpaint';
import { modelExists } from '../../services/inpaintProcessor';
import InpaintFileUpload from './InpaintFileUpload.vue';
import InpaintCanvas from './InpaintCanvas.vue';
import InpaintToolbar from './InpaintToolbar.vue';
import InpaintHistory from './InpaintHistory.vue';
import InpaintModelDownloadModal from './InpaintModelDownloadModal.vue';

const DEBUG = true;

const inpaintStore = useInpaintStore();
const { imageFile, modelDownloaded, isModelLoading } = storeToRefs(inpaintStore);

const canvasRef = ref<InstanceType<typeof InpaintCanvas> | null>(null);
const showDownloadModal = ref(false);
let resizeTimeout: NodeJS.Timeout | null = null;
let imageLoadTimeout: NodeJS.Timeout | null = null;

async function handleFileSelect(file: File) {
    if (DEBUG) {
        console.log('[InpaintView] handleFileSelect - Starting file selection');
    }
    
    inpaintStore.setImageFile(file);

    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise<void>((resolve) => {
        img.onload = () => {
            if (DEBUG) {
                console.log('[InpaintView] Image loaded:', {
                    width: img.width,
                    height: img.height
                });
            }
            resolve();
        };
    });

    inpaintStore.setOriginalImage(img);

    if (!modelDownloaded.value && !isModelLoading.value) {
        const exists = await modelExists('inpaint');
        if (exists) {
            inpaintStore.setModelDownloaded(true);
        } else {
            showDownloadModal.value = true;
        }
    }

    // Forzar redimensionamiento del canvas después de que la imagen se carga
    await nextTick();
    if (canvasRef.value) {
        if (DEBUG) {
            console.log('[InpaintView] Forcing canvas resize after image load');
        }
        // Timeout de seguridad para asegurar que el canvas se ajusta
        if (imageLoadTimeout) {
            clearTimeout(imageLoadTimeout);
        }
        imageLoadTimeout = setTimeout(() => {
            if (canvasRef.value && canvasRef.value.$el) {
                // Forzar redimensionamiento del canvas
                const event = new Event('resize');
                canvasRef.value.$el.dispatchEvent(event);
            }
        }, 100);
    }
}

async function handleStrokeEnd() {
    if (!imageFile.value) return;

    inpaintStore.setProcessing(true);
    inpaintStore.setProgress(10);

    try {
        const result = await canvasRef.value?.runInpaint((p) => {
            inpaintStore.setProgress(p);
        });

        if (result) {
            const img = new Image();
            img.src = result;
            await new Promise<void>((resolve) => {
                img.onload = () => resolve();
            });
            img.dataset.id = Date.now().toString();
            inpaintStore.addRender(img);
        }
    } catch (err: any) {
        console.error('Inpaint error:', err);
        inpaintStore.setError(err.message || 'Failed to process image');
    } finally {
        inpaintStore.setProcessing(false);
    }
}

function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        inpaintStore.undo();
    }
}

// Watch para detectar cambios en imageFile y asegurar que el canvas se ajusta
watch(imageFile, async (newFile) => {
    if (DEBUG && newFile) {
        console.log('[InpaintView] imageFile changed - forcing canvas resize');
    }
    
    await nextTick();
    
    // Timeout de seguridad para asegurar que el canvas se ajusta
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(() => {
        if (canvasRef.value && canvasRef.value.$el) {
            if (DEBUG) {
                console.log('[InpaintView] Security timeout - forcing canvas resize');
            }
            const event = new Event('resize');
            canvasRef.value.$el.dispatchEvent(event);
        }
    }, 100);
});

onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    
    // Limpiar timeouts
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }
    if (imageLoadTimeout) {
        clearTimeout(imageLoadTimeout);
    }
});
</script>
