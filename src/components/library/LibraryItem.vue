<template>
  <TooltipProvider>
  <div class="group relative bg-muted/30 rounded-2xl overflow-hidden border hover:border-primary/50 transition-all shadow-sm hover:shadow-xl hover:shadow-primary/5" style="content-visibility: auto; contain-intrinsic-size: 0 250px;">
    <div ref="itemRef" class="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
      <template v-if="isVisible && thumbUrl">
        <img v-if="item.type === 'image' || item.type === 'canva'" :src="thumbUrl" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" decoding="async" />
        <video v-else-if="item.type === 'video'" :src="thumbUrl" class="w-full h-full object-cover" muted loop preload="none" @mouseenter="$event.target.play()" @mouseleave="$event.target.pause()" />
        <div v-else-if="item.type === 'audio'" class="w-full h-full flex items-center justify-center bg-primary/10">
            <Mic class="w-8 h-8 text-primary" />
        </div>
      </template>
      <div v-else class="animate-pulse w-full h-full bg-muted/50" />
      
      <!-- Source Type Icon - Bottom Right -->
      <Tooltip>
        <TooltipTrigger as-child>
          <div class="absolute bottom-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white shadow-lg">
            <component :is="sourceIcon.component" class="w-4 h-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{{ sourceIcon.label }}</p>
        </TooltipContent>
      </Tooltip>
      
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
    </div>
    
    <div class="p-3 space-y-1">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">{{ item.model }}</span>
        <span class="text-[10px] text-muted-foreground">{{ formatDate(item.timestamp) }}</span>
      </div>
      <p class="text-xs line-clamp-1 italic text-foreground/80">{{ item.params?.prompt || item.params?.text || $t('library.canvaProject') }}</p>
    </div>
  </div>
  </TooltipProvider>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Download, Trash2, Mic, Maximize2, Image, ImagePlus, Images, ImageUp, Video, AudioLines } from 'lucide-vue-next';
import { useHistoryStore } from '../../stores/history';
import type { HistoryItem, HistoryItemSource } from '../../types';
import { useIntersectionObserver } from '@vueuse/core';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from '../ui/tooltip';

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

// Source type icon mapping
const sourceIcon = computed(() => {
  const source = props.item.source;
  const mode = props.item.mode;
  const type = props.item.type;

  // If source is explicitly set, use it
  if (source) {
    switch (source) {
      case 'generate':
        return { component: Image, label: 'Imagen generada' };
      case 'edit':
        return { component: ImagePlus, label: 'Imagen editada' };
      case 'canva':
        return { component: Images, label: 'Proyecto Canva' };
      case 'enhance':
        return { component: ImageUp, label: 'Imagen mejorada' };
      case 'inpaint':
        return { component: ImageUp, label: 'Inpaint / Enhance' };
      default:
        break;
    }
  }

  // Fallback: infer from mode (retrocompatibility)
  if (mode) {
    switch (mode) {
      case 'text2image':
        return { component: Image, label: 'Imagen generada' };
      case 'image-edit':
        return { component: ImagePlus, label: 'Imagen editada' };
      case 'text2video':
      case 'image2video':
        return { component: Video, label: 'Video generado' };
      case 'text2speech':
        return { component: AudioLines, label: 'Audio generado' };
      case 'inpaint':
        return { component: ImageUp, label: 'Inpaint / Enhance' };
      case 'canva':
        return { component: Images, label: 'Proyecto Canva' };
      default:
        break;
    }
  }

  // Fallback: infer from type
  switch (type) {
    case 'video':
      return { component: Video, label: 'Video' };
    case 'audio':
      return { component: AudioLines, label: 'Audio' };
    case 'canva':
      return { component: Images, label: 'Proyecto Canva' };
    default:
      return { component: Image, label: 'Imagen' };
  }
});

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
  if (props.item.type === 'canva') return 'json';
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
  const blob = await historyStore.getThumbnail(props.item.id);
  if (blob) {
    thumbUrl.value = URL.createObjectURL(blob);
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
  if (thumbUrl.value) URL.revokeObjectURL(thumbUrl.value);
  if (fullBlobUrl.value) URL.revokeObjectURL(fullBlobUrl.value);
});
</script>
