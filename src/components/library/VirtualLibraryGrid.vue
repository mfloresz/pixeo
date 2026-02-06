<template>
  <div ref="containerRef" class="relative w-full">
    <div
      :style="{
        height: `${totalHeight}px`,
        position: 'relative',
      }"
    >
      <div
        :style="{
          transform: `translateY(${offsetY}px)`,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
        }"
      >
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <LibraryItem
            v-for="item in visibleItems"
            :key="item.id"
            :item="item"
            @zoom="$emit('zoom', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import LibraryItem from './LibraryItem.vue';
import type { HistoryItem } from '../../types';

const props = defineProps<{
  items: HistoryItem[];
}>();

const emit = defineEmits<{
  zoom: [item: HistoryItem];
}>();

const containerRef = ref<HTMLElement | null>(null);
const ITEM_HEIGHT = 320; // Altura aproximada de cada item incluyendo gap
const OVERSCAN = 3; // Número de items adicionales a renderizar arriba y abajo

const scrollTop = ref(0);
const containerHeight = ref(0);

const totalHeight = computed(() => {
  const itemsPerRow = getItemsPerRow();
  const rows = Math.ceil(props.items.length / itemsPerRow);
  return rows * ITEM_HEIGHT;
});

const offsetY = computed(() => {
  const itemsPerRow = getItemsPerRow();
  const startRow = Math.floor(scrollTop.value / ITEM_HEIGHT);
  return startRow * ITEM_HEIGHT;
});

const getItemsPerRow = () => {
  if (!containerRef.value) return 2;
  const width = containerRef.value.clientWidth;
  if (width >= 1280) return 5; // xl
  if (width >= 1024) return 4; // lg
  if (width >= 768) return 3; // md
  return 2; // sm
};

const visibleItems = computed(() => {
  const itemsPerRow = getItemsPerRow();
  const startRow = Math.max(0, Math.floor(scrollTop.value / ITEM_HEIGHT) - OVERSCAN);
  const endRow = Math.min(
    Math.ceil((scrollTop.value + containerHeight.value) / ITEM_HEIGHT) + OVERSCAN,
    Math.ceil(props.items.length / itemsPerRow)
  );

  const startIndex = startRow * itemsPerRow;
  const endIndex = Math.min(endRow * itemsPerRow, props.items.length);

  return props.items.slice(startIndex, endIndex);
});

const handleScroll = () => {
  if (containerRef.value) {
    scrollTop.value = containerRef.value.scrollTop;
  }
};

const updateContainerHeight = () => {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight;
  }
};

onMounted(() => {
  if (containerRef.value) {
    containerRef.value.addEventListener('scroll', handleScroll);
    updateContainerHeight();
    window.addEventListener('resize', updateContainerHeight);
  }
});

onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener('scroll', handleScroll);
  }
  window.removeEventListener('resize', updateContainerHeight);
});

watch(() => props.items.length, () => {
  updateContainerHeight();
});
</script>
