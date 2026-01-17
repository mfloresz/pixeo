<template>
    <div class="flex justify-center">
        <div
            class="p-1 rounded-3xl border shadow-2xl backdrop-blur-xl bg-card/80 min-w-275"
        >
            <TooltipProvider>
                <div class="p-4 pt-4 pb-4 space-y-4">
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
                        <div
                            v-if="promptLimit !== Infinity"
                            class="flex justify-between items-center mb-2"
                        >
                            <span class="text-xs text-muted-foreground">
                                {{ $t("generate.promptLimit") }}:
                                {{ characterCount }} / {{ promptLimit }}
                            </span>
                            <span
                                v-if="characterCount > promptLimit"
                                class="text-xs text-destructive font-medium"
                            >
                                {{ $t("generate.promptExceeded") }}
                            </span>
                        </div>
                        <textarea
                            v-model="prompt"
                            :placeholder="$t('generate.placeholder')"
                            class="w-full bg-muted/30 border-none rounded-2xl p-4 pr-24 text-sm resize-none focus:ring-1 focus:ring-primary min-h-[100px] transition-all group-hover:bg-muted/50"
                        ></textarea>
                        <div class="absolute bottom-3 right-3 flex gap-1">
                            <Tooltip>
                                <TooltipTrigger as-child>
                                    <button
                                        @click="clearPrompt"
                                        :disabled="!prompt"
                                        class="p-1.5 rounded-lg bg-background/80 hover:bg-background transition-colors disabled:opacity-50"
                                    >
                                        <Eraser class="w-5 h-5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{{ $t("generate.clearPrompt") }}</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger as-child>
                                    <button
                                        @click="translatePrompt"
                                        :disabled="!prompt || isTranslating"
                                        class="p-1.5 rounded-lg bg-background/80 hover:bg-background transition-colors disabled:opacity-50"
                                    >
                                        <Loader2
                                            v-if="isTranslating"
                                            class="w-5 h-5 animate-spin"
                                        />
                                        <Languages v-else class="w-3.5 h-3.5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{{ $t("generate.translatePrompt") }}</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    <!-- Controls Row -->
                    <div class="flex flex-wrap items-center gap-2">
                        <!-- Mode Selector -->
                        <select
                            v-model="mode"
                            class="bg-muted border-none rounded-xl px-3 py-2 text-xs font-medium focus:ring-0 cursor-pointer outline-none min-w-[100px]"
                        >
                            <option
                                v-for="m in MODES"
                                :key="m.id"
                                :value="m.id"
                            >
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
                            class="bg-muted border-none rounded-xl px-3 py-2 text-xs font-medium focus:ring-0 cursor-pointer outline-none min-w-[130px]"
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
                            class="bg-muted border-none rounded-xl px-3 py-2 text-xs font-medium focus:ring-0 cursor-pointer outline-none min-w-[110px]"
                        >
                            <option
                                v-for="res in availableResolutions"
                                :key="res.id"
                                :value="res.id"
                            >
                                {{ res.label }}
                            </option>
                        </select>

                        <Tooltip>
                            <TooltipTrigger as-child>
                                <Popover>
                                    <PopoverTrigger as-child>
                                        <button
                                            class="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-all text-xs font-medium text-muted-foreground"
                                        >
                                            <Settings2 class="w-4 h-4" />
                                            <span>{{
                                                $t("generate.advanced")
                                            }}</span>
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        class="w-96 max-h-125 overflow-y-auto"
                                    >
                                        <div class="grid grid-cols-1 gap-4">
                                            <div
                                                v-for="(
                                                    cfg, key
                                                ) in filteredParams"
                                                :key="key"
                                                class="space-y-1.5"
                                            >
                                                <div
                                                    v-if="
                                                        !String(key)
                                                            .toLowerCase()
                                                            .includes(
                                                                'negative',
                                                            )
                                                    "
                                                    class="flex justify-between items-center px-1"
                                                >
                                                    <label
                                                        class="text-[10px] uppercase font-bold text-muted-foreground tracking-wider"
                                                        >{{
                                                            $t(
                                                                `common.${key}`,
                                                            ) || key
                                                        }}</label
                                                    >
                                                    <input
                                                        v-if="
                                                            cfg.min !==
                                                                undefined &&
                                                            cfg.max !==
                                                                undefined
                                                        "
                                                        type="number"
                                                        :min="cfg.min"
                                                        :max="cfg.max"
                                                        :step="cfg.step || 1"
                                                        v-model.number="
                                                            params[key]
                                                        "
                                                        class="w-28 text-right bg-transparent border rounded px-1.5 py-0.5 text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-primary"
                                                    />
                                                    <span
                                                        v-else
                                                        class="text-xs font-mono font-bold"
                                                        >{{ params[key] }}</span
                                                    >
                                                </div>
                                                <input
                                                    v-if="
                                                        cfg.min !== undefined &&
                                                        cfg.max !== undefined
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

                                                <textarea
                                                    v-else-if="
                                                        String(key)
                                                            .toLowerCase()
                                                            .includes(
                                                                'negative',
                                                            )
                                                    "
                                                    v-model="params[key]"
                                                    :placeholder="
                                                        $t(
                                                            'common.negativePrompt',
                                                        )
                                                    "
                                                    class="w-full bg-background border rounded-lg px-3 py-2 text-sm outline-none resize-y min-h-[120px]"
                                                ></textarea>

                                                <input
                                                    v-else
                                                    v-model="params[key]"
                                                    :placeholder="String(key)"
                                                    class="w-full bg-background border rounded-lg px-2 py-1 text-xs outline-none"
                                                />
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>
                                    {{
                                        $t("generate.tooltips.advancedSettings")
                                    }}
                                </p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip v-if="supportsOptimizePrompt">
                            <TooltipTrigger as-child>
                                <div
                                    class="flex items-center gap-2 px-2 py-2 rounded-xl bg-muted/50"
                                >
                                    <Switch v-model="shouldOptimize" />
                                    <span
                                        class="text-xs font-medium text-muted-foreground"
                                        >{{ $t("generate.optimize") }}</span
                                    >
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{{ $t("generate.tooltips.optimize") }}</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger as-child>
                                <button
                                    @click="historyStore.clearSession"
                                    class="p-2 rounded-xl bg-muted hover:bg-destructive/10 hover:text-destructive transition-colors"
                                >
                                    <BrushCleaning class="w-4 h-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>
                                    {{
                                        $t("generate.tooltips.clearGenerations")
                                    }}
                                </p>
                            </TooltipContent>
                        </Tooltip>

                        <div class="flex-1"></div>

                        <Tooltip>
                            <TooltipTrigger as-child>
                                <button
                                    @click="generate"
                                    :disabled="
                                        !isValid || isGenerating || !apiKey
                                    "
                                    class="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                                >
                                    <Sparkles
                                        v-if="!isGenerating"
                                        class="w-4 h-4"
                                    />
                                    <Loader2
                                        v-else
                                        class="w-4 h-4 animate-spin"
                                    />
                                    {{
                                        isGenerating
                                            ? $t("common.loading")
                                            : $t("common.generate")
                                    }}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{{ $t("generate.tooltips.generate") }}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </TooltipProvider>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from "vue";
import { storeToRefs } from "pinia";
import {
    Sparkles,
    Loader2,
    Settings2,
    Plus,
    X,
    BrushCleaning,
    Eraser,
    Languages,
} from "lucide-vue-next";
import { useModelsStore } from "../../stores/models";
import { useConfigStore } from "../../stores/config";
import { useHistoryStore } from "../../stores/history";
import { MODES } from "../../config/models";
import { ChutesService } from "../../services/chutes";
import { optimizePrompt as optimizePromptService } from "../../services/promptOptimizer";
import { toast } from "vue-sonner";
import { sanitizeBase64 } from "../../lib/utils";
import { i18n } from "../../i18n";
import { Switch } from "../ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "../ui/tooltip";

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
    pendingEditItem,
    pendingEditBlob,
} = storeToRefs(modelsStore);
const { apiKey } = storeToRefs(configStore);

const prompt = ref("");
const shouldOptimize = ref(false);
const isGenerating = ref(false);
const isTranslating = ref(false);
const sourceImages = ref<{ url: string; b64: string }[]>([]);

const promptLimit = computed(() => {
    return selectedModel.value?.promptLimit || Infinity;
});

const characterCount = computed(() => {
    return prompt.value.length;
});

const isValid = computed(() => {
    if (mode.value === "text2speech") return prompt.value.length > 0;
    if (mode.value === "image-edit")
        return prompt.value.length > 0 && sourceImages.value.length > 0;
    return prompt.value.length > 0 && prompt.value.length <= promptLimit.value;
});

// Watch for pending edits from other components (like ZoomModal)
watch(
    pendingEditItem,
    async (newItem: any) => {
        if (newItem) {
            await setForEdit(newItem, pendingEditBlob.value);
            // Clear pending state
            modelsStore.pendingEditItem = null;
            modelsStore.pendingEditBlob = null;
        }
    },
    { immediate: true },
);

// Watch for prompt length and truncate if it exceeds the limit
watch(
    [prompt, promptLimit],
    ([newPrompt, newLimit]) => {
        if (newLimit === Infinity) return; // No limit, skip
        if (newPrompt.length > newLimit) {
            prompt.value = newPrompt.substring(0, newLimit);
            toast.warning(
                i18n.global.t("generate.promptTruncated", { limit: newLimit }),
            );
        }
    },
    { immediate: true },
);

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

    // Obtener dimensiones de la imagen
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise<void>((resolve) => {
        img.onload = () => resolve();
    });
    const width = img.width;
    const height = img.height;
    URL.revokeObjectURL(img.src);

    const reader = new FileReader();
    reader.onload = (ev) => {
        const b64 = ev.target?.result as string;
        sourceImages.value.push({
            url: URL.createObjectURL(file),
            b64: b64.split(",")[1],
        });

        // Actualizar width/height con las dimensiones de la imagen
        if (params.value.width !== undefined) params.value.width = width;
        if (params.value.height !== undefined) params.value.height = height;
        selectedResolution.value = "custom";
    };
    reader.readAsDataURL(file);
}

function removeSourceImage(idx: number) {
    URL.revokeObjectURL(sourceImages.value[idx].url);
    sourceImages.value.splice(idx, 1);
}

function clearPrompt() {
    prompt.value = "";
}

async function translatePrompt() {
    if (!prompt.value || !apiKey.value) return;

    isTranslating.value = true;

    try {
        const response = await fetch(
            "https://llm.chutes.ai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey.value}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "openai/gpt-oss-120b-TEE",
                    messages: [
                        {
                            role: "system",
                            content:
                                "Detect the language of the user's text and translate it to English. Return ONLY the translation, no explanations, no additional text, no comments, just the translated text.",
                        },
                        {
                            role: "user",
                            content: prompt.value,
                        },
                    ],
                    stream: false,
                    max_tokens: 128000,
                    temperature: 0.3,
                }),
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Translation failed: ${response.status} - ${errorText}`,
            );
        }

        const data = await response.json();
        const translatedText =
            data.choices[0]?.message?.content || prompt.value;

        prompt.value = translatedText.trim();
        toast.success(i18n.global.t("logs.translationSuccess"));
    } catch (err: any) {
        console.error(err);
        toast.error(`Error: ${err.message}`);
    } finally {
        isTranslating.value = false;
    }
}

async function generate() {
    if (!isValid.value || isGenerating.value || !apiKey.value) return;

    isGenerating.value = true;

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
                    message: i18n.global.t("logs.promptOptimized", {
                        model: model.name,
                    }),
                });
            } catch (err: any) {
                toast.warning(
                    i18n.global.t("logs.optimizationFailed", {
                        error: err.message,
                    }),
                );
                configStore.addLog({
                    type: mode.value,
                    message: i18n.global.t("logs.optimizationFailed", {
                        error: err.message,
                    }),
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
            if (key === "image_b64s" && Array.isArray(value)) {
                return `[${value.length} image${value.length !== 1 ? "s" : ""}]`;
            }
            if (
                typeof value === "string" &&
                (key.includes("b64") ||
                    key === "image" ||
                    key === "img_b64")
            ) {
                return value.length > 50
                    ? `${value.substring(0, 50)}... [truncated]`
                    : value;
            }
            return value;
        };

        configStore.addLog({
            type: mode.value,
            message: i18n.global.t("logs.sendingRequest", {
                model: model.name,
                endpoint,
            }),
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

        toast.success(i18n.global.t("generate.success"));
        configStore.addLog({
            type: mode.value,
            message: i18n.global.t("logs.generationSuccess", {
                model: model.name,
            }),
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
    }
}

async function setForEdit(item: any, blobOrB64: Blob | string | null = null) {
    // 1. CLEAR prompt (as requested: "excepto el prompt, ese no se debe pasar")
    prompt.value = "";

    // 2. SET source image
    if (blobOrB64) {
        if (blobOrB64 instanceof Blob) {
            const reader = new FileReader();
            const b64Promise = new Promise<string>((resolve) => {
                reader.onload = () =>
                    resolve((reader.result as string).split(",")[1]);
            });
            reader.readAsDataURL(blobOrB64);
            const b64 = await b64Promise;

            sourceImages.value = [
                {
                    url: URL.createObjectURL(blobOrB64),
                    b64: b64,
                },
            ];
        } else {
            // It's a base64 string
            const b64 = blobOrB64.includes(",")
                ? blobOrB64.split(",")[1]
                : blobOrB64;
            const blob = new Blob([
                Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)),
            ]);
            sourceImages.value = [
                {
                    url: URL.createObjectURL(blob),
                    b64: b64,
                },
            ];
        }
    } else if (item.params.image_b64s) {
        sourceImages.value = item.params.image_b64s.map((b64: string) => ({
            url: URL.createObjectURL(
                new Blob([Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))]),
            ),
            b64,
        }));
    } else if (item.params.image) {
        sourceImages.value = [
            {
                url: URL.createObjectURL(
                    new Blob([
                        Uint8Array.from(atob(item.params.image), (c) =>
                            c.charCodeAt(0),
                        ),
                    ]),
                ),
                b64: item.params.image,
            },
        ];
    }

    // 3. COPY parameters (as requested: "pasar los parametros")
    // Modified: Only pass width, height, and seed. Use defaults for the others (guidance, steps, etc).
    if (item.params) {
        // Copy seed if it exists on both sides
        if (item.params.seed !== undefined && params.value.seed !== undefined) {
            params.value.seed = item.params.seed;
        }

        // Copy dimensions
        if (params.value.width !== undefined && item.params.width)
            params.value.width = item.params.width;
        if (params.value.height !== undefined && item.params.height)
            params.value.height = item.params.height;
    }

    // 4. GET dimensions from image if not set in params
    if (
        sourceImages.value[0] &&
        (params.value.width === undefined || params.value.height === undefined)
    ) {
        const img = new Image();
        img.src = sourceImages.value[0].url;
        await new Promise<void>((resolve) => {
            img.onload = () => {
                if (params.value.width !== undefined && !params.value.width)
                    params.value.width = img.width;
                if (params.value.height !== undefined && !params.value.height)
                    params.value.height = img.height;
                resolve();
            };
        });
    }

    selectedResolution.value = "custom";
}

defineExpose({
    setForEdit,
});

onUnmounted(() => {
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
