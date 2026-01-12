<template>
  <div class="max-w-2xl mx-auto space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">{{ $t('settings.title') }}</h1>
      <div class="flex bg-muted p-1 rounded-lg">
        <button 
          v-for="l in ['es', 'en']" 
          :key="l"
          @click="locale = l"
          :class="[
            'px-3 py-1 text-xs font-bold uppercase rounded-md transition-all',
            locale === l ? 'bg-background shadow-sm' : 'text-muted-foreground'
          ]"
        >
          {{ l }}
        </button>
      </div>
    </div>

    <div class="space-y-6">
      <div class="space-y-2">
        <label class="text-sm font-semibold ml-1">{{ $t('common.apiKey') }}</label>
        <div class="flex gap-2">
          <input 
            v-model="apiKey"
            type="password"
            :placeholder="$t('settings.apiKeyPlaceholder')"
            class="flex-1 bg-muted/50 border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-semibold ml-1">{{ $t('settings.theme') }}</label>
        <div class="flex bg-muted p-1 rounded-lg">
          <button 
            v-for="t in ['dark', 'light', 'system']" 
            :key="t"
            @click="theme = t"
            :class="[
              'px-3 py-1 text-xs font-bold uppercase rounded-md transition-all flex items-center gap-1',
              theme === t ? 'bg-background shadow-sm' : 'text-muted-foreground'
            ]"
          >
            <Sun v-if="t === 'dark'" class="w-3 h-3" />
            <Moon v-else-if="t === 'light'" class="w-3 h-3" />
            <Monitor v-else class="w-3 h-3" />
            {{ t === 'system' ? 'auto' : t }}
          </button>
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-semibold ml-1">{{ $t('settings.storage') }}</label>
        <div class="flex gap-2">
          <button @click="regenerateThumbnails" class="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-sm font-bold transition-all">
            {{ $t('settings.regenerateThumbnails') }}
          </button>
          <button @click="clearOrphanedThumbnails" class="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl text-sm font-bold transition-all">
            {{ $t('settings.clearThumbnails') }}
          </button>
        </div>
      </div>

      <div class="space-y-4 pt-4 border-t">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold">{{ $t('settings.logs') }}</h2>
          <button @click="logs = []" class="text-xs text-muted-foreground hover:text-destructive transition-colors">{{ $t('settings.clearLogs') }}</button>
        </div>
        
        <div class="bg-muted/30 rounded-2xl border min-h-[300px] p-4 font-mono text-xs space-y-2 max-h-[500px] overflow-y-auto">
          <div v-if="logs.length === 0" class="h-full flex items-center justify-center text-muted-foreground italic">{{ $t('settings.waitingActivity') }}</div>
          <div v-for="(log, i) in logs" :key="i" class="border-b border-white/5 pb-2">
            <div class="flex items-start">
              <span class="text-primary shrink-0">{{ formatDate(log.timestamp) }}</span>
              <span class="ml-2" :class="log.error ? 'text-destructive' : 'text-foreground'">[{{ log.type }}] {{ log.message }}</span>
            </div>
            <pre v-if="log.details" class="mt-1 glass-panel p-2 rounded-lg text-[10px] text-muted-foreground bg-muted/20 overflow-x-auto">{{ JSON.stringify(log.details, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Sun, Moon, Monitor } from 'lucide-vue-next';
import { useConfigStore } from '../../stores/config';
import { useHistoryStore } from '../../stores/history';

const configStore = useConfigStore();
const historyStore = useHistoryStore();
const { apiKey, locale, theme, logs } = storeToRefs(configStore);

function formatDate(date: Date) {
  return new Date(date).toLocaleTimeString();
}

async function regenerateThumbnails() {
  if (confirm('¿Quieres regenerar miniaturas para todos los elementos existentes? Esto puede tomar tiempo.')) {
    await historyStore.regenerateThumbnails();
    alert('Miniaturas regeneradas.');
  }
}

async function clearOrphanedThumbnails() {
  if (confirm('¿Estás seguro de que quieres limpiar la cache de miniaturas huérfanas? Esta acción no se puede deshacer.')) {
    await historyStore.clearOrphanedThumbnails();
    alert('Cache de miniaturas limpiada.');
  }
}
</script>
