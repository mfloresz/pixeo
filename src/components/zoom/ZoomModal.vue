<template>
  <Transition name="fade">
    <div
      v-if="show && item"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-background/80 backdrop-blur-xl"
    >
      <div
        class="relative w-full max-w-7xl max-h-screen bg-card border rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        style="max-height:90vh; max-width:90vw;"
      >
        <button
          @click="close"
          class="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 hover:bg-background transition-colors shadow-lg"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- Left: Media -->
        <div class="flex-[3] bg-black/5 flex items-center justify-center p-4 overflow-hidden border-r">
          <img
            v-if="item.type === 'image'"
            :src="blobUrl || undefined"
            class="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
          />
          <video
            v-else-if="item.type === 'video'"
            :src="blobUrl || undefined"
            class="max-w-full max-h-full object-contain"
            controls
            autoplay
            loop
          />
          <div v-else-if="item.type === 'audio'" class="flex flex-col items-center gap-4">
            <Mic class="w-20 h-20 text-primary animate-pulse" />
            <audio :src="blobUrl || undefined" controls />
          </div>
        </div>

        <!-- Right: Info -->
        <div class="flex-1 p-6 md:p-8 overflow-y-auto bg-card/50 border-l border-white/5">
          <div class="space-y-6">
            <div>
              <h3 class="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Modelo</h3>
              <p class="text-lg font-bold">{{ item.model }}</p>
            </div>
            <div>
              <h3 class="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Prompt</h3>
              <p class="text-sm leading-relaxed bg-muted/30 p-4 rounded-xl border border-white/5 shadow-inner">{{ item.params.prompt }}</p>
            </div>
            <div v-if="item.params.negative_prompt" class="opacity-60">
              <h3 class="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Negative Prompt</h3>
              <p class="text-xs leading-relaxed">{{ item.params.negative_prompt }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div v-for="(val, key) in filteredParams" :key="key">
                <h3 class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{{ key }}</h3>
                <p class="text-xs font-mono font-bold">{{ val }}</p>
              </div>
            </div>
            <div class="pt-6 border-t border-white/5">
              <button @click="download" class="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20">
                <Download class="w-5 h-5" />
                Descargar Contenido
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { X, Download, Mic } from 'lucide-vue-next';
import type { HistoryItem } from '@/stores/history';

const props = defineProps({
  show: { type: Boolean, required: true },
  item: { type: Object as PropType<HistoryItem | null>, default: null },
  blobUrl: { type: String as PropType<string | null>, default: null },
});

const emit = defineEmits(['close', 'download']);

function close() {
  emit('close');
}
function download() {
  emit('download');
}

// Filter params similar to App.vue logic
const filteredParams = computed(() => {
  if (!props.item?.params) return {};
  const { prompt, negative_prompt, ...rest } = props.item.params;
  return Object.fromEntries(
    Object.entries(rest).filter(([key]) => !key.includes('b64') && key !== 'image' && key !== 'img_b64' && key !== 'image_b64s')
  );
});
</script>

<style scoped>
/* Reuse fade transition from App.vue */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
