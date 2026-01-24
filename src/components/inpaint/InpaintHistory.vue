<template>
    <div
        v-if="hasRenders"
        class="w-20 flex-shrink-0 flex flex-col items-center gap-2 p-2 overflow-y-auto border-r bg-card h-full"
    >
        <div
            v-for="(render, index) in renders"
            :key="render.dataset.id"
            class="relative flex-shrink-0 cursor-pointer group"
            @click="goToState(index)"
            @mouseenter="hoverIndex = index"
            @mouseleave="hoverIndex = -1"
        >
            <img
                :src="render.src"
                class="w-16 h-16 rounded object-cover border-2 transition-all"
                :class="hoverIndex === index ? 'border-primary opacity-70' : 'border-transparent'"
            />
            <div
                v-if="hoverIndex === index"
                class="absolute inset-0 bg-black/60 flex items-center justify-center rounded"
            >
                <span class="text-white text-xs font-medium text-center px-1">{{ $t('inpaint.backTo') }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useInpaintStore } from '../../stores/inpaint';

const inpaintStore = useInpaintStore();
const { renders, hasRenders } = storeToRefs(inpaintStore);

const hoverIndex = ref(-1);

function goToState(index: number) {
    inpaintStore.goToState(index);
}
</script>
