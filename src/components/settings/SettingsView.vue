<template>
    <div class="max-w-2xl mx-auto space-y-8">
        <div class="flex items-center justify-between">
            <h1 class="text-3xl font-bold">{{ $t("settings.title") }}</h1>
            <div class="flex bg-muted p-1 rounded-lg">
                <button
                    v-for="l in ['es', 'en']"
                    :key="l"
                    @click="locale = l"
                    :class="[
                        'px-3 py-1 text-xs font-bold uppercase rounded-md transition-all',
                        locale === l
                            ? 'bg-background shadow-sm'
                            : 'text-muted-foreground',
                    ]"
                >
                    {{ l }}
                </button>
            </div>
        </div>

        <div class="space-y-6">
            <div class="space-y-2">
                <label class="text-sm font-semibold ml-1">{{
                    $t("common.apiKey")
                }}</label>
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
                <label class="text-sm font-semibold ml-1">{{
                    $t("settings.theme")
                }}</label>
                <div class="flex bg-muted p-1 rounded-lg">
                    <button
                        v-for="t in ['dark', 'light', 'system']"
                        :key="t"
                        @click="theme = t"
                        :class="[
                            'px-3 py-1 text-xs font-bold uppercase rounded-md transition-all flex items-center gap-1',
                            theme === t
                                ? 'bg-background shadow-sm'
                                : 'text-muted-foreground',
                        ]"
                    >
                        <Sun v-if="t === 'dark'" class="w-3 h-3" />
                        <Moon v-else-if="t === 'light'" class="w-3 h-3" />
                        <Monitor v-else class="w-3 h-3" />
                        {{ t === "system" ? "auto" : t }}
                    </button>
                </div>
            </div>

            <div class="space-y-2">
                <label class="text-sm font-semibold ml-1">{{
                    $t("settings.storage")
                }}</label>
                <div class="flex gap-2 flex-wrap">
                    <button
                        @click="regenerateThumbnails"
                        class="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-sm font-bold transition-all"
                    >
                        {{ $t("settings.regenerateThumbnails") }}
                    </button>
                    <button
                        @click="clearOrphanedThumbnails"
                        class="px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl text-sm font-bold transition-all"
                    >
                        {{ $t("settings.clearThumbnails") }}
                    </button>
                    <button
                        @click="migrateTimestamps"
                        class="px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl text-sm font-bold transition-all"
                    >
                        {{ $t("settings.fixMediaOrder") }}
                    </button>
                </div>
                <p
                    v-if="migrateResult"
                    class="text-xs text-muted-foreground ml-1"
                >
                    {{ migrateResult }}
                </p>
            </div>

            <div class="space-y-2">
                <label class="text-sm font-semibold ml-1"
                    >Importar / Exportar</label
                >
                <div class="flex gap-2">
                    <button
                        @click="exportProject"
                        class="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                    >
                        <Download class="w-4 h-4" /> {{ $t("settings.export") }}
                    </button>
                    <label
                        class="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <Upload class="w-4 h-4" /> {{ $t("settings.import") }}
                        <input
                            type="file"
                            accept=".json"
                            class="hidden"
                            @change="importProject"
                        />
                    </label>
                </div>
                <p
                    v-if="importResult"
                    class="text-xs text-muted-foreground ml-1"
                >
                    {{
                        $t("settings.importSuccess", {
                            imported: importResult.imported,
                            skipped: importResult.skipped,
                        })
                    }}
                </p>
            </div>

            <div class="space-y-4 pt-4 border-t">
                <div class="flex items-center justify-between">
                    <h2 class="text-xl font-bold">{{ $t("settings.logs") }}</h2>
                    <button
                        @click="logs = []"
                        class="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                        {{ $t("settings.clearLogs") }}
                    </button>
                </div>

                <div
                    class="bg-muted/30 rounded-2xl border min-h-[300px] p-4 font-mono text-xs space-y-2 max-h-[500px] overflow-y-auto"
                >
                    <div
                        v-if="logs.length === 0"
                        class="h-full flex items-center justify-center text-muted-foreground italic"
                    >
                        {{ $t("settings.waitingActivity") }}
                    </div>
                    <div
                        v-for="(log, i) in logs"
                        :key="i"
                        class="border-b border-white/5 pb-2"
                    >
                        <div class="flex items-start">
                            <span class="text-primary shrink-0">{{
                                formatDate(log.timestamp)
                            }}</span>
                            <span
                                class="ml-2"
                                :class="
                                    log.error
                                        ? 'text-destructive'
                                        : 'text-foreground'
                                "
                                >[{{ log.type }}] {{ log.message }}</span
                            >
                        </div>
                        <pre
                            v-if="log.details"
                            class="mt-1 glass-panel p-2 rounded-lg text-[10px] text-muted-foreground bg-muted/20 overflow-x-auto"
                            >{{ JSON.stringify(log.details, null, 2) }}</pre
                        >
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { Sun, Moon, Monitor, Download, Upload } from "lucide-vue-next";
import { useConfigStore } from "../../stores/config";
import { useHistoryStore } from "../../stores/history";

const { t } = useI18n();
const configStore = useConfigStore();
const historyStore = useHistoryStore();
const { apiKey, locale, theme, logs } = storeToRefs(configStore);
const importResult = ref<{ imported: number; skipped: number } | null>(null);
const migrateResult = ref<string | null>(null);

function formatDate(date: Date) {
    return new Date(date).toLocaleTimeString();
}

async function regenerateThumbnails() {
    if (confirm(t("settings.regenerateConfirm"))) {
        await historyStore.regenerateThumbnails();
        alert(t("settings.regenerateDone"));
    }
}

async function clearOrphanedThumbnails() {
    if (confirm(t("settings.clearCacheConfirm"))) {
        await historyStore.clearOrphanedThumbnails();
        alert(t("settings.clearCacheDone"));
    }
}

async function migrateTimestamps() {
    const migrated = await historyStore.migrateTimestamps();
    if (migrated > 0) {
        migrateResult.value = t("settings.migrateSuccess", { count: migrated });
    } else {
        migrateResult.value = t("settings.migrateNoItems");
    }
    setTimeout(() => (migrateResult.value = null), 5000);
}

async function exportProject() {
    await historyStore.exportProject();
}

async function importProject(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    try {
        const result = await historyStore.importProject(input.files[0]);
        importResult.value = result;
        setTimeout(() => (importResult.value = null), 5000);
    } catch (error) {
        alert(t("settings.importError", { error: (error as Error).message }));
    }
    input.value = "";
}
</script>
