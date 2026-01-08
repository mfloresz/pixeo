// src/stores/config.ts
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { i18n } from '../i18n';
import { ChutesService } from '../services/chutes';

export const useConfigStore = defineStore('config', () => {
    const apiKey = ref(localStorage.getItem('pixeo_api_key') || '');
    const locale = ref(localStorage.getItem('pixeo_locale') || 'es');
    const theme = ref(localStorage.getItem('pixeo_theme') || 'dark');
    const quota = ref(0);
    const used = ref(0);
    const logs = ref<any[]>([]);

    const refreshQuota = async () => {
        if (!apiKey.value) {
            quota.value = 0;
            used.value = 0;
            return;
        }
        try {
            const service = new ChutesService(apiKey.value);
            const data = await service.fetchQuota();
            if (data && data.quota !== undefined) {
                quota.value = data.quota;
                used.value = data.used || 0;
            }
        } catch (err) {
            console.error('Failed to refresh quota:', err);
        }
    };

    watch(apiKey, (val) => {
        localStorage.setItem('pixeo_api_key', val);
        refreshQuota();
    });

    watch(locale, (val) => {
        localStorage.setItem('pixeo_locale', val);
        (i18n.global as any).locale.value = val;
    });
    watch(theme, (val) => {
        localStorage.setItem('pixeo_theme', val);
        document.documentElement.classList.toggle('dark', val === 'dark');
    });

    const addLog = (log: any) => {
        logs.value.unshift({ timestamp: new Date(), ...log });
        if (logs.value.length > 100) logs.value.pop();
    };

    return { apiKey, locale, theme, quota, used, logs, refreshQuota, addLog };
});
