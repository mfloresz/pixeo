<template>
    <div class="w-80 bg-card border-l flex flex-col h-full">
        <div class="p-4 border-b">
            <h3 class="font-semibold text-sm">AI Tools</h3>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-6">
            <!-- Remove Background -->
            <div class="space-y-3">
                <h4 class="text-sm font-medium flex items-center gap-2">
                    <Wand2 class="w-4 h-4" />
                    Remove Background
                </h4>
                <p class="text-xs text-muted-foreground">
                    Remove the background from an image using AI.
                </p>

                <div class="space-y-2">
                    <input
                        ref="removeBgInput"
                        type="file"
                        accept="image/*"
                        class="hidden"
                        @change="handleRemoveBgFile"
                    />
                    <Button
                        variant="outline"
                        class="w-full"
                        :disabled="isRemovingBg"
                        @click="triggerRemoveBgUpload"
                    >
                        <Upload class="w-4 h-4 mr-2" />
                        {{ isRemovingBg ? 'Processing...' : 'Upload Image' }}
                    </Button>
                </div>

                <!-- Preview del resultado -->
                <div v-if="removeBgResult" class="relative">
                    <img
                        :src="removeBgResult"
                        alt="Result"
                        class="w-full h-32 object-contain border rounded bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWgydjJIMUMxeiIgZmlsbD0iI2VlZSIvPjwvc3ZnPg==')]"
                    />
                    <Button
                        size="sm"
                        class="absolute bottom-2 right-2"
                        @click="addRemoveBgResult"
                    >
                        <Plus class="w-3 h-3 mr-1" />
                        Add to Canvas
                    </Button>
                </div>
            </div>

            <Separator />

            <!-- Generate Image -->
            <div class="space-y-3">
                <h4 class="text-sm font-medium flex items-center gap-2">
                    <Sparkles class="w-4 h-4" />
                    Generate Image
                </h4>
                <p class="text-xs text-muted-foreground">
                    Generate an image from text using Stable Diffusion.
                </p>

                <div class="space-y-2">
                    <textarea
                        v-model="generatePrompt"
                        placeholder="Describe the image you want to generate..."
                        rows="3"
                        class="w-full px-3 py-2 text-sm border rounded bg-background resize-none"
                    />

                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="text-xs text-muted-foreground">Width</label>
                            <select v-model="generateWidth" class="w-full px-2 py-1 text-sm border rounded bg-background">
                                <option :value="512">512px</option>
                                <option :value="768">768px</option>
                                <option :value="1024">1024px</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-xs text-muted-foreground">Height</label>
                            <select v-model="generateHeight" class="w-full px-2 py-1 text-sm border rounded bg-background">
                                <option :value="512">512px</option>
                                <option :value="768">768px</option>
                                <option :value="1024">1024px</option>
                            </select>
                        </div>
                    </div>

                    <Button
                        class="w-full"
                        :disabled="!canGenerate || isGenerating"
                        @click="generateImage"
                    >
                        <Sparkles class="w-4 h-4 mr-2" />
                        {{ isGenerating ? 'Generating...' : 'Generate' }}
                    </Button>
                </div>

                <!-- Error message -->
                <div v-if="generateError" class="text-xs text-destructive">
                    {{ generateError }}
                </div>

                <!-- Preview del resultado -->
                <div v-if="generateResult" class="relative">
                    <img
                        :src="generateResult"
                        alt="Generated"
                        class="w-full h-32 object-contain border rounded"
                    />
                    <Button
                        size="sm"
                        class="absolute bottom-2 right-2"
                        @click="addGenerateResult"
                    >
                        <Plus class="w-3 h-3 mr-1" />
                        Add to Canvas
                    </Button>
                </div>
            </div>

            <Separator />

            <!-- API Token Configuration -->
            <div class="space-y-3">
                <h4 class="text-sm font-medium">API Configuration</h4>
                <p class="text-xs text-muted-foreground">
                    Configure your Replicate API token to use AI features.
                </p>
                <div class="flex gap-2">
                    <input
                        v-model="apiTokenInput"
                        type="password"
                        placeholder="Replicate API Token"
                        class="flex-1 px-3 py-2 text-sm border rounded bg-background"
                    />
                    <Button size="sm" @click="saveApiToken">
                        Save
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useConfigStore } from '../../stores/config';
import { useEditor } from '../../composables/canva/useEditor';
import { ReplicateService } from '../../services/replicate';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Wand2, Sparkles, Upload, Plus } from 'lucide-vue-next';

const configStore = useConfigStore();
const { replicateApiToken } = storeToRefs(configStore);
const editor = useEditor();

// Remove Background
const removeBgInput = ref<HTMLInputElement | null>(null);
const isRemovingBg = ref(false);
const removeBgResult = ref<string | null>(null);
const removeBgError = ref<string | null>(null);

// Generate Image
const generatePrompt = ref('');
const generateWidth = ref(512);
const generateHeight = ref(512);
const isGenerating = ref(false);
const generateResult = ref<string | null>(null);
const generateError = ref<string | null>(null);

// API Token
const apiTokenInput = ref(replicateApiToken.value);

const canGenerate = computed(() => {
    return generatePrompt.value.trim().length > 0 && replicateApiToken.value;
});

function saveApiToken() {
    configStore.replicateApiToken = apiTokenInput.value;
}

// Remove Background Functions
function triggerRemoveBgUpload() {
    removeBgInput.value?.click();
}

async function handleRemoveBgFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!replicateApiToken.value) {
        removeBgError.value = 'Please configure your Replicate API token first';
        return;
    }

    isRemovingBg.value = true;
    removeBgError.value = null;
    removeBgResult.value = null;

    try {
        // Convertir file a URL
        const imageUrl = URL.createObjectURL(file);

        const replicate = new ReplicateService(replicateApiToken.value);
        const result = await replicate.removeBackground(imageUrl);

        removeBgResult.value = result;
        URL.revokeObjectURL(imageUrl);
    } catch (err: any) {
        removeBgError.value = err.message || 'Failed to remove background';
    } finally {
        isRemovingBg.value = false;
        input.value = '';
    }
}

async function addRemoveBgResult() {
    if (removeBgResult.value) {
        await editor.addImageFromURL(removeBgResult.value);
        removeBgResult.value = null;
    }
}

// Generate Image Functions
async function generateImage() {
    if (!canGenerate.value) return;

    isGenerating.value = true;
    generateError.value = null;
    generateResult.value = null;

    try {
        const replicate = new ReplicateService(replicateApiToken.value);
        const result = await replicate.generateImage(generatePrompt.value, {
            width: generateWidth.value,
            height: generateHeight.value
        });

        generateResult.value = result;
    } catch (err: any) {
        generateError.value = err.message || 'Failed to generate image';
    } finally {
        isGenerating.value = false;
    }
}

async function addGenerateResult() {
    if (generateResult.value) {
        await editor.addImageFromURL(generateResult.value);
        generateResult.value = null;
    }
}
</script>
