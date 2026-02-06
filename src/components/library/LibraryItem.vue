<template>
  <TooltipProvider>
  <div class="group relative bg-muted/30 rounded-xl overflow-hidden border hover:border-primary/50 transition-all shadow-sm hover:shadow-xl hover:shadow-primary/5" style="content-visibility: auto; contain-intrinsic-size: 0 200px;">
    <div ref="itemRef" class="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
      <template v-if="isVisible && thumbUrl">
        <img v-if="item.type === 'image'" :src="thumbUrl" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" decoding="async" />
        <video v-else-if="item.type === 'video'" :src="thumbUrl" class="w-full h-full object-cover" muted loop preload="none" @mouseenter="$event.target.play()" @mouseleave="$event.target.pause()" />
        <div v-else-if="item.type === 'audio'" class="w-full h-full flex items-center justify-center bg-primary/10">
            <Mic class="w-8 h-8 text-primary" />
        </div>
      </template>
      <div v-else class="animate-pulse w-full h-full bg-muted/50" />
      
      <!-- Overlay Actions -->
      <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
        <Tooltip>
          <TooltipTrigger as-child>
            <button @click="handleZoom" class="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors">
              <Maximize2 class="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{{ $t('actions.zoom') }}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger as-child>
            <button @click="download" class="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors">
              <Download class="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{{ $t('actions.download') }}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger as-child>
            <button @click="remove" class="p-2 bg-destructive/80 hover:bg-destructive rounded-full text-white transition-colors">
              <Trash2 class="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{{ $t('actions.delete') }}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <!-- Mode Icon Badge -->
      <Tooltip>
        <TooltipTrigger as-child>
          <div class="absolute bottom-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-md flex items-center justify-center cursor-help">
            <component :is="ModeIconComponent" class="w-6 h-6 text-white" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{{ modeTooltipLabel }}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  </div>
  </TooltipProvider>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Download, Trash2, Mic, Maximize2 } from 'lucide-vue-next';
import { useHistoryStore } from '../../stores/history';
import type { HistoryItem } from '../../types';
import { useIntersectionObserver } from '@vueuse/core';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from '../ui/tooltip';
import { getModeIcon, getModeDefaultLabel } from '../../lib/modeIcons';

const props = defineProps<{ item: HistoryItem }>();
const emit = defineEmits<{
  (e: 'zoom', item: HistoryItem, blobUrl?: string): void
}>();
const historyStore = useHistoryStore();
const thumbUrl = ref<string | null>(null);
const fullBlobUrl = ref<string | null>(null);
const itemRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);
const thumbLoaded = ref(false);
const fullBlobLoaded = ref(false);

const ModeIconComponent = computed(() => getModeIcon(props.item.mode));
const modeTooltipLabel = computed(() => getModeDefaultLabel(props.item.mode));

function formatDate(date: any) {
  return new Date(date).toLocaleDateString();
}

async function download() {
  if (!fullBlobLoaded.value) {
    await loadFullBlob();
  }
  if (!fullBlobUrl.value) return;
  const a = document.createElement('a');
  a.href = fullBlobUrl.value;
  a.download = `pixeo-${props.item.id}.${getFileExtension()}`;
  a.click();
}

function getFileExtension() {
  if (props.item.type === 'video') return 'mp4';
  if (props.item.type === 'audio') return 'wav';
  return 'png';
}

async function remove() {
  await historyStore.removeItem(props.item.id);
}

async function handleZoom() {
  if (!fullBlobLoaded.value) {
    await loadFullBlob();
  }
  emit('zoom', props.item, fullBlobUrl.value);
}

onMounted(() => {
  const { stop } = useIntersectionObserver(
    itemRef,
    ([{ isIntersecting }], observerElement) => {
      if (isIntersecting && !thumbLoaded.value) {
        isVisible.value = true;
        loadThumbnail();
        stop();
      }
    },
    {
      threshold: 0.1,
      rootMargin: '50px',
    }
  );
});

async function loadThumbnail() {
  if (thumbLoaded.value) return;
  const url = await historyStore.getThumbnailUrl(props.item.id);
  if (url) {
    thumbUrl.value = url;
    thumbLoaded.value = true;
  }
}

async function loadFullBlob() {
  if (fullBlobLoaded.value) return;
  const blob = await historyStore.getBlob(props.item.id);
  if (blob) {
    fullBlobUrl.value = URL.createObjectURL(blob);
    fullBlobLoaded.value = true;
  }
}

onUnmounted(() => {
  if (fullBlobUrl.value) URL.revokeObjectURL(fullBlobUrl.value);
});
</script>
