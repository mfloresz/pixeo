<template>
    <div
        class="p-1 rounded-3xl bg-card border shadow-2xl backdrop-blur-xl bg-card/80"
    >
        <div class="p-4 space-y-4">
            <!-- Mode & Model Selection Row -->
            <!-- Mode, Model & Resolution Selection Row -->
            <div class="flex flex-wrap items-center gap-2">
                <!-- Mode Selector -->
                <select
                    v-model="mode"
                    class="bg-muted border-none rounded-xl px-4 py-2 text-xs font-medium focus:ring-0 cursor-pointer outline-none min-w-[120px]"
                >
                    <option v-for="m in MODES" :key="m.id" :value="m.id">
                        {{
                            $t(
                                `common.${m.id === "text2speech" ? "audio" : m.id === "image-edit" ? "edit" : m.id === "text2video" ? "video" : "image"}`,
                            )
                        }}
                    </option>
                </select>

                <!-- Model Selector -->
                <select
                    v-model="selectedModelId"
                    class="bg-muted border-none rounded-xl px-4 py-2 text-xs font-medium focus:ring-0 cursor-pointer outline-none min-w-[150px]"
                >
                    <option
                        v-for="(m, id) in availableModels"
                        :key="id"
                        :value="id"
                    >
                        {{ m.name }}
                    </option>
                </select>

                <!-- Resolution Selector -->
                <select
                    v-if="
                        mode === 'text2image' ||
                        mode === 'image-edit' ||
                        mode === 'text2video'
                    "
                    v-model="selectedResolution"
                    class="bg-muted border-none rounded-xl px-4 py-2 text-xs font-medium focus:ring-0 cursor-pointer outline-none min-w-[130px]"
                >
                    <option
                        v-for="res in availableResolutions"
                        :key="res.id"
                        :value="res.id"
                    >
                        {{ res.label }}
                    </option>
                </select>

                <Popover>
                    <template #trigger>
                        <button
                            data-popover-trigger
                            class="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-all text-xs font-medium text-muted-foreground"
                        >
                            <Settings2 class="w-4 h-4" />
                            <span>Avanzado</span>
                        </button>
                    </template>
                    <div
                        class="grid grid-cols-1 gap-4"
                    >
                        <div
                            v-for="(cfg, key) in filteredParams"
                            :key="key"
                            class="space-y-1.5"
                        >
                            <div class="flex justify-between items-center px-1">
                                <label
                                    class="text-[10px] uppercase font-bold text-muted-foreground tracking-wider"
                                    >{{ $t(`common.${key}`) || key }}</label
                                >
                                <span class="text-xs font-mono font-bold">{{
                                    params[key]
                                }}</span>
                            </div>
                            <input
                                v-if="
                                    cfg.min !== undefined && cfg.max !== undefined
                                "
                                type="range"
                                :min="cfg.min"
                                :max="cfg.max"
                                :step="cfg.step || 1"
                                :value="params[key]"
                                @input="
                                    params[key] = (
                                        $event.target as HTMLInputElement
                                    ).valueAsNumber
                                "
                                class="w-full accent-primary h-1 bg-muted rounded-full cursor-pointer"
                            />

                            <select
                                v-else-if="cfg.options"
                                v-model="params[key]"
                                class="w-full bg-background border rounded-lg px-2 py-1 text-xs outline-none"
                            >
                                <option
                                    v-for="opt in cfg.options"
                                    :key="opt"
                                    :value="opt"
                                >
                                    {{ opt }}
                                </option>
                            </select>

                            <input
                                v-else
                                v-model="params[key]"
                                :placeholder="String(key)"
                                class="w-full bg-background border rounded-lg px-2 py-1 text-xs outline-none"
                            />
                        </div>
                    </div>
                </Popover>

                <div class="flex-1"></div>

                <div
                    v-if="supportsOptimizePrompt"
                    class="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50"
                >
                    <Switch v-model="shouldOptimize" />
                    <span class="text-xs font-medium text-muted-foreground"
                        >Optimizar</span
                    >
                </div>

                <button
                    @click="historyStore.clearSession"
                    class="p-2 rounded-xl bg-muted hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title="Limpiar Generaciones"
                >
                    <BrushCleaning class="w-4 h-4" />
                </button>
            </div>

            <!-- Source Image Upload (for Edit Mode) -->
            <div
                v-if="mode === 'image-edit' || mode === 'image2video'"
                class="flex gap-2"
            >
                <div
                    v-for="(img, idx) in sourceImages"
                    :key="idx"
                    class="relative w-16 h-16 group"
                >
                    <img
                        :src="img.url"
                        class="w-full h-full object-cover rounded-xl border"
                    />
                    <button
                        @click="removeSourceImage(idx)"
                        class="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X class="w-3 h-3" />
                    </button>
                </div>
                <label
                    v-if="
                        sourceImages.length <
                        (selectedModel?.imageInput?.maxItems || 1)
                    "
                    class="w-16 h-16 flex flex-col items-center justify-center bg-muted rounded-xl border border-dashed hover:bg-muted/80 cursor-pointer transition-colors"
                >
                    <Plus class="w-4 h-4 text-muted-foreground" />
                    <input
                        type="file"
                        @change="handleFileUpload"
                        class="hidden"
                        accept="image/*"
                    />
                </label>
            </div>

            <!-- Prompt Textarea -->
            <div class="relative group">
                <textarea
                    v-model="prompt"
                    :placeholder="$t('generate.placeholder')"
                    class="w-full bg-muted/30 border-none rounded-2xl p-4 text-sm resize-none focus:ring-1 focus:ring-primary min-h-[100px] transition-all group-hover:bg-muted/50"
                ></textarea>

                <div class="absolute bottom-4 right-4 flex items-center gap-2">
                    <span
                        v-if="isGenerating"
                        class="text-[10px] font-mono text-muted-foreground animate-pulse"
                        >{{ timer.toFixed(2) }}s</span
                    >
                    <button
                        @click="generate"
                        :disabled="!isValid || isGenerating || !apiKey"
                        class="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                    >
                        <Sparkles v-if="!isGenerating" class="w-4 h-4" />
                        <Loader2 v-else class="w-4 h-4 animate-spin" />
                        {{
                            isGenerating
                                ? $t("common.loading")
                                : $t("common.generate")
                        }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import {
    Sparkles,
    Loader2,
    Settings2,
    Plus,
    X,
    BrushCleaning,
} from "lucide-vue-next";
import { useModelsStore } from "../../stores/models";
import { useConfigStore } from "../../stores/config";
import { useHistoryStore } from "../../stores/history";
import { MODES } from "../../config/models";
import { ChutesService } from "../../services/chutes";
import { optimizePrompt as optimizePromptService } from "../../services/promptOptimizer";
import { toast } from "vue-sonner";
import { sanitizeBase64 } from "../../lib/utils";
import Switch from "../ui/Switch.vue";
import Popover from "../ui/Popover.vue";

const modelsStore = useModelsStore();
const configStore = useConfigStore();
const historyStore = useHistoryStore();

const {
    mode,
    selectedModelId,
    availableModels,
    params,
    selectedModel,
    selectedResolution,
    availableResolutions,
} = storeToRefs(modelsStore);
const { apiKey } = storeToRefs(configStore);

const prompt = ref("");
const shouldOptimize = ref(false);
const isGenerating = ref(false);
const sourceImages = ref<{ url: string; b64: string }[]>([]);
const timer = ref(0);
let timerInterval: any = null;

const isValid = computed(() => {
    if (mode.value === "text2speech") return prompt.value.length > 0;
    if (mode.value === "image-edit")
        return prompt.value.length > 0 && sourceImages.value.length > 0;
    return prompt.value.length > 0;
});

const filteredParams = computed(() => {
    if (!selectedModel.value?.params) return {};
    const p = { ...selectedModel.value.params };
    delete p.text;
    return p;
});

const supportsOptimizePrompt = computed(() => {
    return selectedModel.value?.accept_optimize_prompt === true;
});

async function handleFileUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
        const b64 = ev.target?.result as string;
        sourceImages.value.push({
            url: URL.createObjectURL(file),
            b64: b64.split(",")[1],
        });
    };
    reader.readAsDataURL(file);
}

function removeSourceImage(idx: number) {
    URL.revokeObjectURL(sourceImages.value[idx].url);
    sourceImages.value.splice(idx, 1);
}

async function generate() {
    if (!isValid.value || isGenerating.value || !apiKey.value) return;

    isGenerating.value = true;
    timer.value = 0;
    timerInterval = setInterval(() => (timer.value += 0.05), 50);

    try {
        const service = new ChutesService(apiKey.value);
        const model = selectedModel.value;

        let finalPrompt = prompt.value;

        if (shouldOptimize.value && supportsOptimizePrompt.value) {
            try {
                finalPrompt = await optimizePromptService(
                    apiKey.value,
                    selectedModelId.value,
                    prompt.value,
                );
                configStore.addLog({
                    type: mode.value,
                    message: `[${model.name}] Prompt optimizado`,
                });
            } catch (err: any) {
                toast.warning(
                    `Optimización fallida, usando prompt original: ${err.message}`,
                );
                configStore.addLog({
                    type: mode.value,
                    message: `Optimización fallida: ${err.message}`,
                    warning: true,
                });
            }
        }

        // Build payload
        const payload: any = { ...params.value };
        payload.prompt = finalPrompt;

        // Include model name if specified in config (required for shared endpoints)
        if (model.modelName) {
            payload.model = model.modelName;
        }

        // Handle image inputs
        if (model.imageInput) {
            if (model.imageInput.type === "single" && sourceImages.value[0]) {
                payload[model.imageInput.field] = sanitizeBase64(
                    sourceImages.value[0].b64,
                );
            } else if (sourceImages.value.length > 0) {
                payload[model.imageInput.field] = sourceImages.value.map(
                    (img) => sanitizeBase64(img.b64),
                );
            }
        }

        const endpoint =
            mode.value === "text2video"
                ? model.endpoints.text2video
                : model.endpoint;

        // Detailed logging as requested
        const redactor = (key: string, value: any) => {
            if (
                typeof value === "string" &&
                (key.includes("b64") ||
                    key === "image" ||
                    key === "img_b64" ||
                    key === "image_b64s")
            ) {
                return value.length > 50
                    ? `${value.substring(0, 50)}... [truncated]`
                    : value;
            }
            return value;
        };

        configStore.addLog({
            type: mode.value,
            message: `[${model.name}] Enviando petición a: ${endpoint}`,
            details: JSON.parse(JSON.stringify(payload, redactor)),
        });

        const blob = await service.generate(endpoint, payload);

        // Determine type
        let type: "image" | "video" | "audio" = "image";
        if (mode.value.includes("video")) type = "video";
        if (mode.value === "text2speech") type = "audio";

        const id = crypto.randomUUID();
        await historyStore.addItem(
            {
                id,
                type,
                mode: mode.value,
                model: model.name,
                params: { ...payload },
                blobKey: id,
            },
            blob,
        );

        toast.success("Generación completada!");
        configStore.addLog({
            type: mode.value,
            message: `Generación exitosa: ${model.name}`,
        });
        configStore.refreshQuota();
    } catch (err: any) {
        console.error(err);
        toast.error(`Error: ${err.message}`);
        configStore.addLog({
            type: mode.value,
            message: `Error: ${err.message}`,
            error: true,
        });
    } finally {
        isGenerating.value = false;
        clearInterval(timerInterval);
    }
}

onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval);
    sourceImages.value.forEach((img) => URL.revokeObjectURL(img.url));
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
