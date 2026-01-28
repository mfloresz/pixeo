<template>
    <div class="p-4 space-y-4">
        <h3 class="font-semibold text-sm">Image Filters</h3>

        <!-- Filter Buttons Grid -->
        <div class="grid grid-cols-2 gap-2">
            <Button
                v-for="filter in AVAILABLE_FILTERS"
                :key="filter.value"
                variant="outline"
                size="sm"
                :class="{ 'bg-accent': currentFilter === filter.value }"
                @click="applyFilter(filter.value)"
            >
                {{ filter.label }}
            </Button>
        </div>

        <Separator />

        <!-- Filter Value Slider (for adjustable filters) -->
        <div v-if="isAdjustableFilter" class="space-y-2">
            <Label class="text-xs">{{ filterLabel }} Intensity</Label>
            <input
                type="range"
                :min="sliderMin"
                :max="sliderMax"
                :step="sliderStep"
                :value="filterValue"
                @input="updateFilterValue"
                class="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
            />
            <div class="flex justify-between text-xs text-muted-foreground">
                <span>{{ sliderMin }}</span>
                <span>{{ filterValue.toFixed(1) }}</span>
                <span>{{ sliderMax }}</span>
            </div>
        </div>

        <Separator v-if="isAdjustableFilter" />

        <!-- Clear Filters Button -->
        <Button
            variant="ghost"
            size="sm"
            class="w-full"
            @click="clearFilters"
        >
            <X class="w-4 h-4 mr-2" />
            Clear Filters
        </Button>

        <!-- Info Message -->
        <p v-if="!hasImageSelected" class="text-xs text-muted-foreground text-center">
            Select an image to apply filters
        </p>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useCanvaStore } from '../../stores/canva';
import { useEditor } from '../../composables/canva/useEditor';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { X } from 'lucide-vue-next';
import { AVAILABLE_FILTERS, type ImageFilter } from '../../types/canva';

const canvaStore = useCanvaStore();
const { selectedObject } = storeToRefs(canvaStore);
const editor = useEditor();

const currentFilter = ref<ImageFilter>('none');
const filterValue = ref(0);

const hasImageSelected = computed(() => {
    return selectedObject.value?.type === 'image';
});

const isAdjustableFilter = computed(() => {
    return ['brightness', 'contrast', 'saturation', 'blur', 'noise', 'pixelate'].includes(currentFilter.value);
});

const filterLabel = computed(() => {
    const filter = AVAILABLE_FILTERS.find(f => f.value === currentFilter.value);
    return filter?.label || '';
});

const sliderMin = computed(() => {
    switch (currentFilter.value) {
        case 'brightness':
        case 'contrast':
            return -1;
        case 'saturation':
        case 'vibrance':
            return -1;
        case 'blur':
            return 0;
        case 'noise':
            return 0;
        case 'pixelate':
            return 1;
        default:
            return 0;
    }
});

const sliderMax = computed(() => {
    switch (currentFilter.value) {
        case 'brightness':
        case 'contrast':
            return 1;
        case 'saturation':
        case 'vibrance':
            return 1;
        case 'blur':
            return 1;
        case 'noise':
            return 1000;
        case 'pixelate':
            return 20;
        default:
            return 100;
    }
});

const sliderStep = computed(() => {
    switch (currentFilter.value) {
        case 'brightness':
        case 'contrast':
        case 'saturation':
        case 'vibrance':
        case 'blur':
            return 0.1;
        case 'noise':
            return 10;
        case 'pixelate':
            return 1;
        default:
            return 1;
    }
});

const defaultValue = computed(() => {
    switch (currentFilter.value) {
        case 'brightness':
        case 'contrast':
            return 0.1;
        case 'saturation':
        case 'vibrance':
            return 0.5;
        case 'blur':
            return 0.5;
        case 'noise':
            return 100;
        case 'pixelate':
            return 8;
        default:
            return 0;
    }
});

function applyFilter(filterType: ImageFilter) {
    if (!hasImageSelected.value) return;

    currentFilter.value = filterType;
    filterValue.value = defaultValue.value;

    if (filterType === 'none') {
        editor.clearImageFilters();
    } else {
        editor.applyImageFilter(filterType, { value: filterValue.value });
    }
}

function updateFilterValue(event: Event) {
    if (!hasImageSelected.value || !isAdjustableFilter.value) return;

    const value = parseFloat((event.target as HTMLInputElement).value);
    filterValue.value = value;
    editor.applyImageFilter(currentFilter.value, { value });
}

function clearFilters() {
    currentFilter.value = 'none';
    filterValue.value = 0;
    editor.clearImageFilters();
}
</script>

<style scoped>
input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    background: hsl(var(--secondary));
    height: 6px;
    border-radius: 3px;
    outline: none;
}

input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: hsl(var(--primary));
    border-radius: 50%;
    cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: hsl(var(--primary));
    border-radius: 50%;
    cursor: pointer;
    border: none;
}
</style>
