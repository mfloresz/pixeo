<template>
    <div
        class="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20"
    >
        <!-- Navbar -->
        <header
            class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60"
        >
            <div
                class="container flex h-16 items-center justify-between px-4 md:px-8"
            >
                <div class="flex items-center gap-2">
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
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/80',
                        ]"
                    >
                        <component :is="tab.icon" class="w-4 h-4" />
                        {{ $t(`common.${tab.id}`) }}
                    </button>
                </nav>

                <div class="flex items-center gap-4">
                    <!-- Quota Display -->
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <div
                                    v-if="apiKey && quota > 0"
                                    class="hidden md:flex flex-col items-end text-[10px] text-muted-foreground mr-2 cursor-help"
                                >
                                    <span class="font-mono">{{
                                        $t("common.usageQuota", { used: usedDisplay, quota })
                                    }}</span>
                                    <div
                                        class="w-24 h-1 bg-muted rounded-full overflow-hidden mt-1"
                                    >
                                        <div
                                            class="bg-primary h-full transition-all duration-500"
                                            :style="{
                                                width: `${Math.min((used / quota) * 100, 100)}%`,
                                            }"
                                        />
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p class="text-sm">
                                    {{
                                        $t("common.quotaResetsIn", {
                                            time: timeUntilReset,
                                        })
                                    }}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </header>

        <main
            class="container mx-auto px-4 py-8 md:px-8 min-h-[calc(100vh-m)] pb-32"
        >
            <Transition name="fade" mode="out-in">
                <div
                    v-if="activeTab === 'generate'"
                    key="generate"
                    class="h-full flex flex-col gap-8"
                >
                    <!-- Generation History -->
                    <div
                        class="flex-1 flex flex-col rounded-3xl relative overflow-hidden"
                    >
                        <GenerationHistory
                            :session-items="sessionItems"
                            @zoom="openZoom"
                            @download="downloadItem"
                        />
                    </div>

                    <!-- Floating Input Area -->
                    <div
                        class="max-w-3xl mx-auto w-full fixed bottom-0 left-0 right-0 px-4 md:px-8 pb-4 transition-all duration-500 ease-in-out z-40"
                    >
                        <PromptInput ref="promptInputRef" />
                    </div>
                </div>

                <div v-else-if="activeTab === 'library'" key="library">
                    <div class="flex items-center justify-between mb-8">
                        <h1 class="text-3xl font-bold tracking-tight"></h1>
                        <div class="flex items-center gap-4">
                            <span
                                class="text-xs font-mono text-muted-foreground"
                                >{{
                                    $t("common.itemCount", {
                                        count: items.length,
                                    })
                                }}</span
                            >
                            <button
                                v-if="items.length > 0"
                                @click="clearLibrary"
                                class="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-sm transition-all"
                            >
                                <Trash2 class="w-4 h-4" />
                                {{ $t("actions.deleteAll") }}
                            </button>
                        </div>
                    </div>
                    <div
                        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                    >
                        <LibraryItem
                            v-for="item in items"
                            :key="item.id"
                            :item="item"
                            @zoom="openZoom"
                        />
                        <div
                            v-if="items.length === 0"
                            class="col-span-full py-20 text-center text-muted-foreground"
                        >
                            <div
                                class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <Library class="w-8 h-8 opacity-20" />
                            </div>
                            {{ $t("library.empty") }}
                        </div>
                    </div>
                </div>

                <div v-else-if="activeTab === 'settings'" key="settings">
                    <SettingsView />
                </div>
            </Transition>

            <ZoomModal
                :show="showZoom"
                :item="selectedZoomItem"
                :blobUrl="selectedZoomBlobUrl"
                @close="closeZoom"
                @download="
                    downloadItem(selectedZoomBlobUrl, selectedZoomItem?.id)
                "
                @edit="handleEdit"
            />
        </main>
    </div>

    <!-- Sonner Toaster -->
    <Toaster class="z-9999" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { toast } from "vue-sonner";
import { i18n } from "./i18n";
const { t } = i18n.global;
import { storeToRefs } from "pinia";
import { nextTick } from "vue";
import { Image, Settings, Library, Trash2 } from "lucide-vue-next";
import Toaster from "./components/ui/Toaster.vue";
import { useConfigStore } from "./stores/config";
import { useHistoryStore } from "./stores/history";
import { useModelsStore } from "./stores/models";
import type { HistoryItem } from "./types";
import PromptInput from "./components/generate/PromptInput.vue";
import SettingsView from "./components/settings/SettingsView.vue";
import LibraryItem from "./components/library/LibraryItem.vue";
import ZoomModal from "./components/zoom/ZoomModal.vue";
import GenerationHistory from "./components/generate/GenerationHistory.vue";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./components/ui/tooltip";

const configStore = useConfigStore();
const historyStore = useHistoryStore();
const modelsStore = useModelsStore();
const { apiKey, quota } = storeToRefs(configStore);
const { used } = storeToRefs(configStore);

const usedDisplay = computed(() => {
    return Math.trunc(used.value * 10) / 10;
});
const { items, sessionItems } = storeToRefs(historyStore);

function getTimeUntilReset(): string {
    const now = new Date();
    const utcNow = new Date(now.toISOString());
    const tomorrowUTC = new Date(utcNow);
    tomorrowUTC.setUTCHours(0, 0, 0, 0);
    tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);
    const diffMs = tomorrowUTC.getTime() - utcNow.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins}m`;
}

const timeUntilReset = ref(getTimeUntilReset());

let timeUpdateInterval: number;

onMounted(() => {
    configStore.theme = configStore.theme;
    configStore.locale = configStore.locale;
    historyStore.initDB();
    configStore.refreshQuota();
    timeUpdateInterval = setInterval(() => {
        timeUntilReset.value = getTimeUntilReset();
    }, 60000);
});

onUnmounted(() => {
    if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
    }
});

async function clearLibrary() {
    if (items.value.length === 0) return;
    if (confirm(String(t("actions.deleteAllConfirm")))) {
        await historyStore.clearAll();
        toast.success(t("library.deletedAll") || "All items deleted");
    }
}

const activeTab = ref("generate");
const showZoom = ref(false);
const selectedZoomItem = ref<HistoryItem | null>(null);
const selectedZoomBlobUrl = ref<string | null>(null);
const promptInputRef = ref<InstanceType<typeof PromptInput> | null>(null);

async function openZoom(item: HistoryItem) {
    selectedZoomItem.value = item;
    showZoom.value = true;

    // Create own blobUrl to persist across tab switches
    if (selectedZoomBlobUrl.value)
        URL.revokeObjectURL(selectedZoomBlobUrl.value);
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

const tabs = [
    { id: "generate", icon: Image },
    { id: "library", icon: Library },
    { id: "settings", icon: Settings },
];

function downloadItem(blobUrl: string | null, id?: string) {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `pixeo-${id || Date.now()}`;
    a.click();
}

function toggleTheme() {
    const themes = ["dark", "light", "system"];
    const currentIndex = themes.indexOf(configStore.theme);
    configStore.theme = themes[(currentIndex + 1) % themes.length];
}

async function handleEdit(item: HistoryItem, blobUrl: string | null) {
    // Set mode to image‑edit and select the correct model
    modelsStore.mode = "image-edit";
    await nextTick();
    modelsStore.selectedModelId = "qwen-image-edit-2511";
    // We don't need to await nextTick here again for the store update strictly, but good for safety

    // Get the image blob
    let blob: Blob | null = null;
    if (blobUrl) {
        try {
            const response = await fetch(blobUrl);
            blob = await response.blob();
        } catch (e) {
            console.error("Failed to fetch blobUrl", e);
        }
    }

    if (!blob) {
        blob = await historyStore.getBlob(item.id);
    }

    // Set pending edit in store
    modelsStore.pendingEditItem = item;
    modelsStore.pendingEditBlob = blob;

    // Switch to generate tab if not already there
    if (activeTab.value !== "generate") {
        activeTab.value = "generate";
    }

    // Finally close the zoom modal (revokes temporary blob URL)
    closeZoom();
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
    transition:
        opacity 0.3s ease,
        transform 0.3s ease;
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
