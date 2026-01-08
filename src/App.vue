<template>
  <div class="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
    <!-- Navbar -->
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div class="container flex h-16 items-center justify-between px-4 md:px-8">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">P</div>
          <span class="text-xl font-bold tracking-tight">Pixeo</span>
        </div>
        
        <nav class="flex items-center gap-1 bg-muted/50 p-1 rounded-xl">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-2 text-sm font-medium transition-all rounded-lg flex items-center gap-2',
              activeTab === tab.id 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ $t(`common.${tab.id}`) }}
          </button>
        </nav>

        <div class="flex items-center gap-4">
          <!-- Quota Display -->
          <div v-if="apiKey && quota > 0" class="hidden md:flex flex-col items-end text-[10px] text-muted-foreground mr-2">
            <span class="font-mono">{{ used }} / {{ quota }} usage</span>
            <div class="w-24 h-1 bg-muted rounded-full overflow-hidden mt-1">
              <div 
                class="bg-primary h-full transition-all duration-500" 
                :style="{ width: `${Math.min((used / quota) * 100, 100)}%` }" 
              />
            </div>
          </div>
          <button @click="toggleTheme" class="p-2 rounded-full hover:bg-muted transition-colors">
            <Sun v-if="theme === 'dark'" class="w-5 h-5" />
            <Moon v-else class="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8 md:px-8 min-h-[calc(100vh-4rem)]">
      <Transition name="fade" mode="out-in">
        <div v-if="activeTab === 'generate'" key="generate" class="h-full flex flex-col gap-8">
          <!-- Generation View -->
          <div class="flex-1 flex flex-col items-center justify-center min-h-[400px] rounded-3xl bg-muted/10 border relative overflow-hidden group">
            <div v-if="latestBlobUrl" class="w-full h-full flex flex-col items-center justify-center p-4">
               <div class="relative max-w-4xl w-full h-full flex items-center justify-center bg-black/5 rounded-2xl overflow-hidden shadow-2xl">
                 <img v-if="latestItem?.type === 'image'" :src="latestBlobUrl" class="max-w-full max-h-full object-contain cursor-zoom-in" @click="openZoom(latestItem)" />
                 <video v-else-if="latestItem?.type === 'video'" :src="latestBlobUrl" class="max-w-full max-h-full object-contain" controls autoplay loop />
                 <div v-else-if="latestItem?.type === 'audio'" class="flex flex-col items-center gap-4">
                    <Mic class="w-20 h-20 text-primary animate-pulse" />
                    <audio :src="latestBlobUrl" controls />
                 </div>
                 
                 <div class="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/50 backdrop-blur-md p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <div class="text-xs text-white truncate max-w-[60%]">
                      <span class="font-bold mr-2 uppercase tracking-tighter">{{ latestItem?.model }}</span>
                      <span class="opacity-70">{{ latestItem?.params.prompt }}</span>
                    </div>
                    <div class="flex gap-2">
                      <button @click="openZoom(latestItem!)" class="bg-white/20 text-white p-2 rounded-lg hover:bg-white/30 transition-colors">
                        <Maximize2 class="w-4 h-4" />
                      </button>
                      <button @click="downloadItem(latestBlobUrl, latestItem?.id)" class="bg-white text-black p-2 rounded-lg hover:bg-white/90 transition-colors">
                        <Download class="w-4 h-4" />
                      </button>
                    </div>
                 </div>
               </div>
            </div>
            <div v-else class="text-center text-muted-foreground p-12">
               <div class="w-20 h-20 bg-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                 <Sparkles class="w-10 h-10 opacity-20" />
               </div>
               <h2 class="text-2xl font-bold text-foreground mb-2">Pixeo Creative Studio</h2>
               <p class="text-sm max-w-xs mx-auto opacity-60">Tu estudio creativo potenciado por IA. Elige un modelo, escribe tu idea y deja que la magia ocurra.</p>
            </div>
          </div>

          <!-- Floating Input Area -->
          <div class="max-w-3xl mx-auto w-full sticky bottom-8 transition-all duration-500 ease-in-out">
            <PromptInput />
          </div>
        </div>

        <div v-else-if="activeTab === 'library'" key="library">
          <div class="flex items-center justify-between mb-8">
            <h1 class="text-3xl font-bold tracking-tight">{{ $t('common.library') }}</h1>
            <span class="text-xs font-mono text-muted-foreground">{{ items.length }} items</span>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <LibraryItem v-for="item in items" :key="item.id" :item="item" @zoom="openZoom" />
            <div v-if="items.length === 0" class="col-span-full py-20 text-center text-muted-foreground">
              <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Library class="w-8 h-8 opacity-20" />
              </div>
              {{ $t('library.empty') }}
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'settings'" key="settings">
           <SettingsView />
        </div>
      </Transition>

      <ZoomModal :show="showZoom" :item="selectedZoomItem" :blobUrl="selectedZoomBlobUrl" @close="closeZoom" @download="downloadItem(selectedZoomBlobUrl, selectedZoomItem?.id)" />
    </main>

    <!-- Sonner Toaster -->
    <Toaster />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { Image, Settings, Library, Sun, Moon, Sparkles, Download, Mic, Maximize2 } from 'lucide-vue-next';
import Toaster from './components/ui/Toaster.vue';
import { useConfigStore } from './stores/config';
import { useHistoryStore } from './stores/history';
import type { HistoryItem } from './stores/history';
import PromptInput from './components/generate/PromptInput.vue';
import SettingsView from './components/settings/SettingsView.vue';
import LibraryItem from './components/library/LibraryItem.vue';
import ZoomModal from './components/zoom/ZoomModal.vue';

const configStore = useConfigStore();
const historyStore = useHistoryStore();
const { apiKey, theme, quota, used } = storeToRefs(configStore);
const { items, sessionItems } = storeToRefs(historyStore);

const activeTab = ref('generate');
const showZoom = ref(false);
const selectedZoomItem = ref<HistoryItem | null>(null);
const selectedZoomBlobUrl = ref<string | null>(null);
const latestBlobUrl = ref<string | null>(null);
const latestItem = computed(() => sessionItems.value[0]);



async function openZoom(item: HistoryItem) {
  selectedZoomItem.value = item;
  showZoom.value = true;
  
  // Create own blobUrl to persist across tab switches
  if (selectedZoomBlobUrl.value) URL.revokeObjectURL(selectedZoomBlobUrl.value);
  const blob = await historyStore.getBlob(item.id);
  if (blob) {
    selectedZoomBlobUrl.value = URL.createObjectURL(blob);
  }
}

function closeZoom() {
  showZoom.value = false;
  // Cleanup is handled by watcher or naturally, but let's be explicit
  if (selectedZoomBlobUrl.value) {
    URL.revokeObjectURL(selectedZoomBlobUrl.value);
    selectedZoomBlobUrl.value = null;
  }
  selectedZoomItem.value = null;
}

watch(latestItem, async (newItem) => {
  if (newItem) {
    if (latestBlobUrl.value) URL.revokeObjectURL(latestBlobUrl.value);
    const blob = await historyStore.getBlob(newItem.id);
    if (blob) latestBlobUrl.value = URL.createObjectURL(blob);
  }
}, { immediate: true });

const tabs = [
  { id: 'generate', icon: Image },
  { id: 'library', icon: Library },
  { id: 'settings', icon: Settings },
];

function downloadItem(blobUrl: string | null, id?: string) {
  if (!blobUrl) return;
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = `pixeo-${id || Date.now()}`;
  a.click();
}

function toggleTheme() {
  configStore.theme = configStore.theme === 'dark' ? 'light' : 'dark';
}

onMounted(() => {
  configStore.theme = configStore.theme; // Trigger watcher
  historyStore.initDB();
  configStore.refreshQuota();
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.container {
  max-width: 1400px;
}
</style>
