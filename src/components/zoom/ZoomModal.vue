<template>
    <Transition name="fade">
        <div
            v-if="show && item"
            class="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8 bg-background/80 backdrop-blur-xl"
        >
            <div
                class="relative w-full max-w-7xl max-h-screen bg-card border rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
                style="max-height: 90vh; max-width: 90vw"
            >
                <button
                    @click="close"
                    class="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 hover:bg-background transition-colors shadow-lg"
                >
                    <X class="w-5 h-5" />
                </button>

                <!-- Left: Media -->
                <div
                    class="flex-3 bg-black/5 flex items-center justify-center p-4 overflow-hidden border-r"
                >
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
                    <div
                        v-else-if="item.type === 'audio'"
                        class="flex flex-col items-center gap-4"
                    >
                        <Mic class="w-20 h-20 text-primary animate-pulse" />
                        <audio :src="blobUrl || undefined" controls />
                    </div>
                </div>

                <!-- Right: Info -->
                <div
                    class="flex-1 p-6 md:p-4 overflow-y-auto bg-card/50 border-l border-white/5"
                >
                    <div class="space-y-6">
                        <div>
                            <h3
                                class="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2"
                            >
                                {{ $t("common.model") }}
                            </h3>
                            <p class="text-lg font-bold">{{ item.model }}</p>
                        </div>
                        <div class="relative">
                            <div class="flex items-center justify-between mb-2">
                                <h3
                                    class="text-xs font-bold text-muted-foreground uppercase tracking-widest"
                                >
                                    {{ $t("common.prompt") }}
                                </h3>
                                <button
                                    @click="copyPrompt"
                                    class="p-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                    :title="$t('actions.copy')"
                                >
                                    <Check
                                        v-if="copied"
                                        class="w-4 h-4 text-green-500"
                                    />
                                    <Copy v-else class="w-4 h-4" />
                                </button>
                            </div>
                            <div
                                class="max-h-40 overflow-y-auto bg-muted/30 p-4 rounded-xl border border-white/5 shadow-inner"
                            >
                                <p
                                    class="text-sm leading-relaxed whitespace-pre-wrap"
                                >
                                    {{ item.params.prompt }}
                                </p>
                            </div>
                        </div>
                        <div
                            v-if="item.params.negative_prompt"
                            class="opacity-60"
                        >
                            <h3
                                class="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2"
                            >
                                {{ $t("common.negativePrompt") }}
                            </h3>
                            <p class="text-xs leading-relaxed">
                                {{ item.params.negative_prompt }}
                            </p>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div
                                v-for="(val, key) in filteredParams"
                                :key="key"
                            >
                                <h3
                                    class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1"
                                >
                                    {{ key }}
                                </h3>
                                <p class="text-xs font-mono font-bold">
                                    {{ val }}
                                </p>
                            </div>
                        </div>
                        <div class="pt-4 border-t border-white/5 space-y-2">
                            <div class="grid grid-cols-2 gap-2">
                                <button
                                    @click="edit"
                                    class="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-3 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg text-sm"
                                >
                                    <Edit3 class="w-4 h-4" />
                                    {{ editLabel }}
                                </button>
                                <button
                                    @click="enhance"
                                    class="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-3 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg text-sm"
                                >
                                    <Wand2 class="w-4 h-4" />
                                    {{ enhanceLabel }}
                                </button>
                            </div>
                            <button
                                @click="download"
                                class="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
                            >
                                <Download class="w-4 h-4" />
                                {{ downloadLabel }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from "vue";
import { useI18n } from "vue-i18n";
import { X, Download, Mic, Copy, Check, Edit3, Wand2 } from "lucide-vue-next";
import type { HistoryItem } from "@/types";

const { t } = useI18n();

const editLabel = computed(() => t("common.edit"));
const enhanceLabel = computed(() => t("common.enhance"));
const downloadLabel = computed(() => t("actions.download"));

const props = defineProps({
    show: { type: Boolean, required: true },
    item: { type: Object as PropType<HistoryItem | null>, default: null },
    blobUrl: { type: String as PropType<string | null>, default: null },
});

const emit = defineEmits({
    close: null,
    download: null,
    // edit emits the HistoryItem and its optional blob URL
    edit: (item: any, blobUrl: string | null) => true,
    enhance: (item: any, blobUrl: string | null) => true,
});

const copied = ref(false);

function close() {
    emit("close");
}
function download() {
    emit("download");
}

function edit() {
    emit("edit", props.item, props.blobUrl);
}

function enhance() {
    emit("enhance", props.item, props.blobUrl);
}

async function copyPrompt() {
    if (!props.item?.params?.prompt) return;
    await navigator.clipboard.writeText(props.item.params.prompt);
    copied.value = true;
    setTimeout(() => {
        copied.value = false;
    }, 2000);
}

// Filter params similar to App.vue logic
const filteredParams = computed(() => {
    if (!props.item?.params) return {};
    const { prompt, negative_prompt, ...rest } = props.item.params;
    return Object.fromEntries(
        Object.entries(rest).filter(
            ([key]) =>
                !key.includes("b64") &&
                key !== "image" &&
                key !== "img_b64" &&
                key !== "image_b64s",
        ),
    );
});
</script>

<style scoped>
/* Reuse fade transition from App.vue */
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
</style>
