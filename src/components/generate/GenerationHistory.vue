<template>
    <div
        v-if="sessionItems.length > 0"
        class="space-y-4 max-h-[70vh] overflow-y-auto"
    >
        <div
            v-for="item in sessionItems"
            :key="item.id"
            class="flex gap-4 mt-1.5 mb-1.5 p-4 bg-sidebar rounded-2xl border"
        >
            <!-- Prompt Section -->
            <div class="flex-1 min-w-0">
                <div
                    class="text-xs text-muted-foreground mb-1 uppercase tracking-wider"
                >
                    {{ item.model }}
                </div>
                <p class="text-sm break-words">{{ item.params.prompt }}</p>
            </div>

            <!-- Image/Video/Audio Section -->
            <div class="relative max-w-xs w-full shrink-0">
                <div
                    v-if="item.type === 'image' && blobUrls[item.id]"
                    class="relative"
                >
                    <img
                        :src="blobUrls[item.id]"
                        class="place-self-center w-auto max-h-48 object-contain rounded-xl shadow-xl"
                        @click="$emit('zoom', item)"
                    />
                    <div
                        class="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <button
                            @click="$emit('zoom', item)"
                            class="bg-black/50 text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
                        >
                            <Maximize2 class="w-4 h-4" />
                        </button>
                        <button
                            @click="
                                $emit('download', blobUrls[item.id], item.id)
                            "
                            class="bg-black/50 text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
                        >
                            <Download class="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div
                    v-else-if="item.type === 'video' && blobUrls[item.id]"
                    class="relative"
                >
                    <video
                        :src="blobUrls[item.id]"
                        class="w-full max-h-48 object-contain rounded-xl shadow-lg"
                        controls
                        autoplay
                        loop
                    />
                    <div class="absolute bottom-2 right-2 flex gap-2">
                        <button
                            @click="
                                $emit('download', blobUrls[item.id], item.id)
                            "
                            class="bg-black/50 text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
                        >
                            <Download class="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div
                    v-else-if="item.type === 'audio' && blobUrls[item.id]"
                    class="flex flex-col items-center gap-2 p-4 bg-muted/20 rounded-xl"
                >
                    <Mic class="w-8 h-8 text-primary" />
                    <audio :src="blobUrls[item.id]" controls />
                    <button
                        @click="$emit('download', blobUrls[item.id], item.id)"
                        class="bg-primary text-primary-foreground p-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Download class="w-4 h-4" />
                    </button>
                </div>
                <div
                    v-else
                    class="w-full h-48 bg-muted/20 rounded-xl flex items-center justify-center"
                >
                    <Loader2
                        class="w-8 h-8 animate-spin text-muted-foreground"
                    />
                </div>
            </div>
        </div>
    </div>

    <!-- Placeholder when no generations -->
    <div v-else class="text-center text-muted-foreground p-12">
        <div
            class="w-20 h-20 bg-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-6"
        >
            <Sparkles class="w-10 h-10 opacity-20" />
        </div>
        <h2 class="text-2xl font-bold text-foreground mb-2">
            {{ $t("generate.heroTitle") }}
        </h2>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Maximize2, Download, Loader2, Mic, Sparkles } from "lucide-vue-next";
import { useHistoryStore } from "../../stores/history";
import type { HistoryItem } from "../../stores/history";

const props = defineProps<{
    sessionItems: HistoryItem[];
}>();

const emit = defineEmits<{
    zoom: [item: HistoryItem];
    download: [blobUrl: string | null, id: string | undefined];
}>();

const historyStore = useHistoryStore();
const blobUrls = ref<Record<string, string>>({});

async function loadBlobUrls() {
    const newUrls: Record<string, string> = {};

    for (const item of props.sessionItems) {
        if (!blobUrls.value[item.id]) {
            const blob = await historyStore.getBlob(item.id);
            if (blob) {
                newUrls[item.id] = URL.createObjectURL(blob);
            }
        } else {
            newUrls[item.id] = blobUrls.value[item.id];
        }
    }

    // Revoke old URLs not in new list
    for (const id in blobUrls.value) {
        if (!newUrls[id]) {
            URL.revokeObjectURL(blobUrls.value[id]);
        }
    }

    blobUrls.value = newUrls;
}

watch(
    () => props.sessionItems,
    () => {
        loadBlobUrls();
    },
    { immediate: true, deep: true },
);

// Cleanup on unmount
import { onUnmounted } from "vue";
onUnmounted(() => {
    for (const url of Object.values(blobUrls.value)) {
        URL.revokeObjectURL(url);
    }
});
</script>
