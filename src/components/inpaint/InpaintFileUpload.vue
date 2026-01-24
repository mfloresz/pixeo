<template>
    <label
        class="block w-full h-64 group relative cursor-pointer rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors"
    >
        <div
            class="w-full h-full flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
        >
            <Upload class="w-12 h-12 mb-4 opacity-50" />
            <p class="text-lg font-medium">{{ $t('inpaint.dropImage') }}</p>
            <p class="text-sm text-muted-foreground mt-1">{{ $t('inpaint.supportedFormats') }}</p>
        </div>
        <input
            type="file"
            class="hidden"
            accept="image/png, image/jpeg, image/webp"
            @change="handleFileInput"
        />
    </label>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Upload } from 'lucide-vue-next';

const emit = defineEmits<{
    select: [file: File];
}>();

const isDragging = ref(false);

async function handleDrop(e: DragEvent) {
    isDragging.value = false;
    const items = e.dataTransfer?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
            const file = item.getAsFile();
            if (file && file.type.startsWith('image/')) {
                validateAndEmit(file);
                break;
            }
        }
    }
}

function handleFileInput(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
        validateAndEmit(file);
    }
}

function validateAndEmit(file: File) {
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
    }
    emit('select', file);
}
</script>
