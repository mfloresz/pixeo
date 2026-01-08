<template>
  <div class="group relative bg-muted/30 rounded-2xl overflow-hidden border hover:border-primary/50 transition-all shadow-sm hover:shadow-xl hover:shadow-primary/5">
    <div class="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
      <template v-if="blobUrl">
        <img v-if="item.type === 'image'" :src="blobUrl" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <video v-else-if="item.type === 'video'" :src="blobUrl" class="w-full h-full object-cover" muted loop @mouseenter="$event.target.play()" @mouseleave="$event.target.pause()" />
        <div v-else-if="item.type === 'audio'" class="w-full h-full flex items-center justify-center bg-primary/10">
           <Mic class="w-8 h-8 text-primary" />
        </div>
      </template>
      <div v-else class="animate-pulse w-full h-full bg-muted/50" />
      
      <!-- Overlay Actions -->
      <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
        <button @click="$emit('zoom', item)" class="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors" title="Zoom">
          <Maximize2 class="w-4 h-4" />
        </button>
        <button @click="download" class="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors" title="Download">
          <Download class="w-4 h-4" />
        </button>
        <button @click="remove" class="p-2 bg-destructive/80 hover:bg-destructive rounded-full text-white transition-colors" title="Delete">
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>
    
    <div class="p-3 space-y-1">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">{{ item.model }}</span>
        <span class="text-[10px] text-muted-foreground">{{ formatDate(item.timestamp) }}</span>
      </div>
      <p class="text-xs line-clamp-1 italic text-foreground/80">{{ item.params.prompt }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Download, Trash2, Mic, Maximize2 } from 'lucide-vue-next';
import { useHistoryStore, HistoryItem } from '../../stores/history';

const props = defineProps<{ item: HistoryItem }>();
defineEmits<{
  (e: 'zoom', item: HistoryItem): void
}>();
const historyStore = useHistoryStore();
const blobUrl = ref<string | null>(null);

function formatDate(date: any) {
  return new Date(date).toLocaleDateString();
}

async function download() {
  if (!blobUrl.value) return;
  const a = document.createElement('a');
  a.href = blobUrl.value;
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

onMounted(async () => {
  const blob = await historyStore.getBlob(props.item.id);
  if (blob) {
    blobUrl.value = URL.createObjectURL(blob);
  }
});

onUnmounted(() => {
  if (blobUrl.value) URL.revokeObjectURL(blobUrl.value);
});
</script>
