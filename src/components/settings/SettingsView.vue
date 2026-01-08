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

      <div class="space-y-4 pt-4 border-t">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold">{{ $t('settings.logs') }}</h2>
          <button @click="logs = []" class="text-xs text-muted-foreground hover:text-destructive transition-colors">Limpiar logs</button>
        </div>
        
        <div class="bg-muted/30 rounded-2xl border min-h-[300px] p-4 font-mono text-xs space-y-2 max-h-[500px] overflow-y-auto">
          <div v-if="logs.length === 0" class="h-full flex items-center justify-center text-muted-foreground italic">
            Esperando actividad...
          </div>
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
import { useConfigStore } from '../../stores/config';

const configStore = useConfigStore();
const { apiKey, locale, logs } = storeToRefs(configStore);

function formatDate(date: Date) {
  return new Date(date).toLocaleTimeString();
}
</script>
