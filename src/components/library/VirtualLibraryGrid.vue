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
import { useIntersectionObserver, useResizeObserver } from '@vueuse/core';
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
const itemsPerRow = ref(2);

// Actualizar itemsPerRow solo cuando cambia el tamaño de la ventana
useResizeObserver(containerRef, () => {
  if (containerRef.value) {
    const width = containerRef.value.clientWidth;
    if (width >= 1280) {
      itemsPerRow.value = 5; // xl
    } else if (width >= 1024) {
      itemsPerRow.value = 4; // lg
    } else if (width >= 768) {
      itemsPerRow.value = 3; // md
    } else {
      itemsPerRow.value = 2; // sm
    }
  }
});

const totalHeight = computed(() => {
  const rows = Math.ceil(props.items.length / itemsPerRow.value);
  return rows * ITEM_HEIGHT;
});

const offsetY = computed(() => {
  const startRow = Math.floor(scrollTop.value / ITEM_HEIGHT);
  return startRow * ITEM_HEIGHT;
});

const visibleItems = computed(() => {
  const startRow = Math.max(0, Math.floor(scrollTop.value / ITEM_HEIGHT) - OVERSCAN);
  const endRow = Math.min(
    Math.ceil((scrollTop.value + containerHeight.value) / ITEM_HEIGHT) + OVERSCAN,
    Math.ceil(props.items.length / itemsPerRow.value)
  );

  const startIndex = startRow * itemsPerRow.value;
  const endIndex = Math.min(endRow * itemsPerRow.value, props.items.length);

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
