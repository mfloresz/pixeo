import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Line } from '../services/inpaintProcessor';
import { superResolution as superResolutionProc, modelExists } from '../services/inpaintProcessor';
import { downloadImage } from '../lib/utils';

export const useInpaintStore = defineStore('inpaint', () => {
    const imageFile = ref<File | null>(null);
    const originalImage = ref<HTMLImageElement | null>(null);
    const currentImage = ref<HTMLImageElement | null>(null);
    const renders = ref<HTMLImageElement[]>([]);
    const lines = ref<Line[]>([{ pts: [] }]);
    const brushSize = ref(40);
    const showBrush = ref(false);
    const showOriginal = ref(false);
    const separatorPosition = ref(0);
    const isProcessing = ref(false);
    const progress = ref(0);
    const modelDownloaded = ref(false);
    const modelDownloadProgress = ref(0);
    const isModelLoading = ref(false);
    const error = ref<string | null>(null);

    const hasRenders = computed(() => renders.value.length > 0);
    const canUndo = computed(() => renders.value.length > 0);

    function setImageFile(file: File) {
        clear();
        imageFile.value = file;
    }

    function setOriginalImage(img: HTMLImageElement) {
        originalImage.value = img;
        currentImage.value = img;
    }

    function addRender(render: HTMLImageElement) {
        renders.value.push(render);
        lines.value.push({ pts: [] });
        currentImage.value = render;
    }

    function undo() {
        if (renders.value.length > 0) {
            renders.value.pop();
            lines.value.pop();
            lines.value.push({ pts: [] });
            currentImage.value = renders.value.length > 0
                ? renders.value[renders.value.length - 1]
                : originalImage.value;
        }
    }

    function goToState(index: number) {
        renders.value.splice(index + 1);
        lines.value.splice(index + 1);
        while (lines.value.length <= index + 1) {
            lines.value.push({ pts: [] });
        }
        currentImage.value = renders.value.length > 0
            ? renders.value[renders.value.length - 1]
            : originalImage.value;
    }

    function clear() {
        imageFile.value = null;
        originalImage.value = null;
        currentImage.value = null;
        renders.value = [];
        lines.value = [{ pts: [] }];
        brushSize.value = 40;
        showBrush.value = false;
        showOriginal.value = false;
        separatorPosition.value = 0;
        isProcessing.value = false;
        progress.value = 0;
        error.value = null;
    }

    function downloadCurrent() {
        const img = currentImage.value;
        if (img) {
            downloadImage(img.src, `pixeo-inpaint-${Date.now()}`);
        }
    }

    function setProcessing(value: boolean) {
        isProcessing.value = value;
        if (!value) {
            progress.value = 0;
        }
    }

    function setProgress(value: number) {
        progress.value = value;
    }

    function setModelDownloaded(value: boolean) {
        modelDownloaded.value = value;
    }

    function setModelDownloadProgress(value: number) {
        modelDownloadProgress.value = value;
    }

    function setModelLoading(value: boolean) {
        isModelLoading.value = value;
    }

    function setError(err: string | null) {
        error.value = err;
    }

    async function superResolution() {
        const image = currentImage.value;
        if (!image) return;

        setProcessing(true);
        setError(null);

        try {
            if (!(await modelExists('superResolution'))) {
                setModelDownloaded(false);
                // The downloadModel call is inside superResolutionProc if missing,
                // but we can also handle the modal here if we want more control.
                // However, our superResolutionProc already calls ensureModel.
            }

            const resultUrl = await superResolutionProc(image, (p) => {
                setProgress(p);
            });

            const newRender = new Image();
            newRender.src = resultUrl;
            await new Promise((resolve) => {
                newRender.onload = resolve;
            });

            addRender(newRender);
        } catch (err: any) {
            console.error('Super Resolution failed:', err);
            setError(err.message || 'Error scaling image');
        } finally {
            setProcessing(false);
        }
    }

    return {
        imageFile,
        originalImage,
        currentImage,
        renders,
        lines,
        brushSize,
        showBrush,
        showOriginal,
        separatorPosition,
        isProcessing,
        progress,
        modelDownloaded,
        modelDownloadProgress,
        isModelLoading,
        error,
        hasRenders,
        canUndo,
        setImageFile,
        setOriginalImage,
        addRender,
        undo,
        goToState,
        clear,
        downloadCurrent,
        setProcessing,
        setProgress,
        setModelDownloaded,
        setModelDownloadProgress,
        setModelLoading,
        setError,
        superResolution,
    };
});
