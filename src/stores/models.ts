// src/stores/models.ts
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { IMG_MODELS, VIDEO_MODELS, EDIT_MODELS, TTS_MODELS, type ModelMode } from '../config/models';


export const RESOLUTION_PRESETS = [
    { id: '1', label: '1024x1024 - 1:1', width: 1024, height: 1024 },
    { id: '2', label: '832x1216 - 2:3', width: 832, height: 1216 },
    { id: '3', label: '1216x832 - 3:2', width: 1216, height: 832 },
    { id: '4', label: '768x1344 - 9:16', width: 768, height: 1344 },
    { id: '5', label: '1344x768 - 16:9', width: 1344, height: 768 },
    { id: 'custom', label: 'Custom', width: 0, height: 0 },
];

export const useModelsStore = defineStore('models', () => {
    const mode = ref<ModelMode>('text2image');
    const selectedModelId = ref('');
    const params = ref<Record<string, any>>({});
    const selectedResolution = ref('1024x1024');

    // Pending edit state
    const pendingEditItem = ref<any>(null);
    const pendingEditBlob = ref<Blob | string | null>(null);

    const availableModels = computed(() => {
        switch (mode.value) {
            case 'text2image': return IMG_MODELS;
            case 'text2video': return VIDEO_MODELS;
            case 'image-edit': return EDIT_MODELS;
            case 'text2speech': return TTS_MODELS;
            default: return {};
        }
    });

    const selectedModel = computed(() => (availableModels.value as any)[selectedModelId.value]);

    const availableResolutions = computed(() => {
        if (selectedModel.value?.resolutions) {
            return selectedModel.value.resolutions;
        }
        return RESOLUTION_PRESETS;
    });

    // Reset model and params when mode changes
    watch(mode, () => {
        const models = availableModels.value;
        const firstModelId = Object.keys(models)[0];
        selectedModelId.value = firstModelId;
        resetParams();
    }, { immediate: true });

    // Reset params and resolution when model changes
    watch(selectedModelId, () => {
        // If the new model has specific resolutions, select the first one or default
        if (selectedModel.value?.resolutions) {
            const defaultRes = availableResolutions.value[0];
            selectedResolution.value = defaultRes.id;
        } else {
            // Check if current resolution exists in presets, otherwise fallback
            if (!RESOLUTION_PRESETS.find(p => p.id === selectedResolution.value)) {
                selectedResolution.value = '1024x1024';
            }
        }
        resetParams();
    });

    function resetParams() {
        if (!selectedModel.value) return;
        const newParams: Record<string, any> = {};
        const modelParams = selectedModel.value.params || {};

        Object.keys(modelParams).forEach(key => {
            if (modelParams[key].default !== undefined) {
                newParams[key] = modelParams[key].default;
            } else if (modelParams[key].options) {
                newParams[key] = modelParams[key].options[0];
            }
        });

        // Ensure resolution is set from preset if available
        const currentRes = availableResolutions.value.find((p: any) => p.id === selectedResolution.value);
        if (currentRes && currentRes.id !== 'custom') {
            if ('width' in modelParams) newParams.width = currentRes.width;
            if ('height' in modelParams) newParams.height = currentRes.height;
            if ('resolution' in modelParams) newParams.resolution = currentRes.value || currentRes.id;
            if ('size' in modelParams) newParams.size = currentRes.value || currentRes.id;
        }

        params.value = newParams;
    }

    // Watch for manual param changes to update resolution selector
    watch(() => [params.value.width, params.value.height, params.value.resolution, params.value.size], ([w, h, res, size]) => {
        const match = availableResolutions.value.find((p: any) => {
            if (p.id === 'custom') return false;
            if (w !== undefined && h !== undefined) return p.width === w && p.height === h;
            if (res !== undefined) return (p.value || p.id) === res;
            if (size !== undefined) return (p.value || p.id) === size;
            return false;
        });

        if (match) {
            selectedResolution.value = match.id;
        } else {
            // Only set to custom if width/height are the ones being used
            if (w !== undefined && h !== undefined) {
                selectedResolution.value = 'custom';
            }
        }
    }, { deep: true });

    // Watch for resolution preset selection
    watch(selectedResolution, (newId) => {
        if (newId === 'custom') return;
        const preset = availableResolutions.value.find((p: any) => p.id === newId);
        if (preset) {
            if (params.value.width !== undefined) params.value.width = preset.width;
            if (params.value.height !== undefined) params.value.height = preset.height;
            if (params.value.resolution !== undefined) params.value.resolution = preset.value || preset.id;
            if (params.value.size !== undefined) params.value.size = preset.value || preset.id;
        }
    });

    return {
        mode,
        selectedModelId,
        selectedModel,
        availableModels,
        availableResolutions,
        params,
        selectedResolution,
        pendingEditItem,
        pendingEditBlob
    };
});
