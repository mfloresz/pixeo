<template>
    <Teleport to="body">
        <div
            v-if="show"
            class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
            <div class="bg-card rounded-xl p-6 max-w-md w-full mx-4 space-y-4">
                <h3 class="text-lg font-semibold">{{ $t('inpaint.downloadModel') }}</h3>
                <p class="text-muted-foreground text-sm">
                    {{ $t('inpaint.modelDownloadMessage') }}
                </p>
                <div class="space-y-2">
                    <div class="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            class="h-full bg-primary transition-all duration-300"
                            :style="{ width: `${modelDownloadProgress}%` }"
                        />
                    </div>
                    <p class="text-xs text-muted-foreground text-center">
                        {{ Math.round(modelDownloadProgress) }}%
                    </p>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useInpaintStore } from '../../stores/inpaint';
import { downloadModel } from '../../services/inpaintProcessor';

const props = defineProps<{
    modelValue: boolean;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: boolean];
}>();

const inpaintStore = useInpaintStore();
const { modelDownloadProgress } = storeToRefs(inpaintStore);

const show = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
});

let downloadStarted = false;

async function startDownload() {
    if (downloadStarted) return;
    downloadStarted = true;

    inpaintStore.setModelLoading(true);
    try {
        await downloadModel('inpaint', (progress) => {
            inpaintStore.setModelDownloadProgress(progress);
        });
        inpaintStore.setModelDownloaded(true);
        show.value = false;
        downloadStarted = false;
    } catch (err: any) {
        console.error('Failed to download model:', err);
        inpaintStore.setError(err.message || 'Failed to download model');
        show.value = false;
        downloadStarted = false;
    } finally {
        inpaintStore.setModelLoading(false);
    }
}

watch(() => props.modelValue, (isOpen) => {
    if (isOpen && !downloadStarted) {
        startDownload();
    }
}, { immediate: true });

onUnmounted(() => {
    downloadStarted = false;
});
</script>
