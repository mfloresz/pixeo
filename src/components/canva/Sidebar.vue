<template>
    <div
        class="bg-card border-r flex flex-col h-full transition-all duration-300"
        :class="{ 'w-0 opacity-0 overflow-hidden': !sidebarVisible, 'w-95 opacity-100': sidebarVisible }"
    >
        <!-- Header with toggle button -->
        <div class="flex items-center justify-between p-3 border-b shrink-0">
            <h3 class="font-semibold text-sm truncate">{{ panelTitle }}</h3>
            <Button
                variant="ghost"
                size="icon"
                class="h-7 w-7 shrink-0"
                @click="toggleSidebar"
            >
                <PanelLeftClose class="w-4 h-4" />
            </Button>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto">
            <!-- Settings Tool - Canvas Settings -->
            <div v-if="activeTool === 'settings'" class="p-4 space-y-6">
                <h4 class="text-sm font-medium text-muted-foreground">Canvas Settings</h4>

                <!-- Background Color -->
                <div class="space-y-2">
                    <label class="text-xs font-medium text-muted-foreground">Background Color</label>
                    <div class="flex items-center gap-2">
                        <ColorPicker
                            :model-value="backgroundColor"
                            @update:model-value="updateBackgroundColor"
                            :show-hex-value="false"
                        />
                    </div>
                </div>

                <Separator />

                <!-- Canvas Resize -->
                <div class="space-y-3">
                    <label class="text-xs font-medium text-muted-foreground">Canvas Size</label>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="text-xs text-muted-foreground">Width</label>
                            <input
                                type="number"
                                v-model.number="canvasWidth"
                                class="w-full px-2 py-1 text-sm border rounded bg-background"
                                min="100"
                            />
                        </div>
                        <div>
                            <label class="text-xs text-muted-foreground">Height</label>
                            <input
                                type="number"
                                v-model.number="canvasHeight"
                                class="w-full px-2 py-1 text-sm border rounded bg-background"
                                min="100"
                            />
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="scale-content"
                            v-model="scaleContentOnResize"
                            class="rounded"
                        />
                        <label for="scale-content" class="text-xs text-muted-foreground">Scale content on resize</label>
                    </div>
                    <Button variant="outline" size="sm" class="w-full" @click="applyResize">
                        Apply Resize
                    </Button>
                </div>

                <Separator />

                <!-- Quick Resize Presets -->
                <div class="space-y-2">
                    <label class="text-xs font-medium text-muted-foreground">Quick Resize</label>
                    <div class="grid grid-cols-2 gap-2">
                        <Button variant="ghost" size="sm" @click="resizeTo(1080, 1080)">
                            Instagram Post
                        </Button>
                        <Button variant="ghost" size="sm" @click="resizeTo(1080, 1920)">
                            Instagram Story
                        </Button>
                        <Button variant="ghost" size="sm" @click="resizeTo(1920, 1080)">
                            HD Video
                        </Button>
                        <Button variant="ghost" size="sm" @click="resizeTo(1200, 630)">
                            Facebook
                        </Button>
                    </div>
                </div>

            </div>

            <!-- Text Tool - Text Types only -->
            <div v-else-if="activeTool === 'text'" class="p-4 space-y-6">
                <!-- Text Types Section -->
                <div class="space-y-3">
                    <h4 class="text-sm font-semibold text-muted-foreground">Add Text</h4>
                    <div class="space-y-2">
                        <button
                            v-for="textType in textTypes"
                            :key="textType.type"
                            class="w-full text-left p-4 rounded-lg border hover:border-primary hover:bg-accent/50 transition-all group"
                            @click="addTextByType(textType)"
                        >
                            <div
                                class="font-semibold text-foreground group-hover:text-primary transition-colors"
                                :style="{ fontSize: textType.previewSize + 'px', fontFamily: textType.fontFamily }"
                            >
                                {{ textType.preview }}
                            </div>
                            <div class="text-xs text-muted-foreground mt-1">{{ textType.label }}</div>
                        </button>
                    </div>
                </div>

                <div class="text-xs text-muted-foreground text-center p-3 bg-muted rounded">
                    Format text using the toolbar after adding
                </div>
            </div>

            <!-- Templates Tool - Inline content without header -->
            <div v-else-if="activeTool === 'templates'" class="flex flex-col h-full">
                <!-- Category Filter -->
                <div class="p-3 border-b">
                    <div class="flex flex-wrap gap-2">
                        <button
                            v-for="category in TEMPLATE_CATEGORIES"
                            :key="category.value"
                            @click="selectedCategory = category.value"
                            class="px-3 py-1.5 text-xs rounded-full border transition-colors"
                            :class="{
                                'bg-primary text-primary-foreground border-primary': selectedCategory === category.value,
                                'bg-background hover:bg-accent border-border': selectedCategory !== category.value
                            }"
                        >
                            <span class="mr-1">{{ category.icon }}</span>
                            {{ category.label }}
                        </button>
                    </div>
                </div>

                <!-- Templates Grid -->
                <ScrollArea class="flex-1 p-4">
                    <div class="space-y-4">
                        <div
                            v-for="template in filteredTemplates"
                            :key="template.id"
                            class="group cursor-pointer border rounded-lg overflow-hidden hover:border-primary transition-all"
                            @click="selectTemplate(template)"
                        >
                            <!-- Template Preview -->
                            <div
                                class="aspect-video bg-muted flex items-center justify-center text-4xl relative"
                                :style="{ background: getTemplateGradient(template) }"
                            >
                                <span class="text-5xl">{{ template.thumbnail }}</span>
                                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>

                            <!-- Template Info -->
                            <div class="p-3">
                                <h3 class="font-medium text-sm">{{ template.name }}</h3>
                                <p class="text-xs text-muted-foreground mt-1">{{ template.description }}</p>
                                <div class="flex items-center gap-2 mt-2">
                                    <span class="text-xs text-muted-foreground">
                                        {{ template.width }} × {{ template.height }} px
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <!-- Custom Size -->
                <div class="p-4 border-t">
                    <h3 class="text-sm font-medium mb-3">Custom Size</h3>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <Label class="text-xs text-muted-foreground">Width (px)</Label>
                            <input
                                v-model.number="customWidth"
                                type="number"
                                class="w-full px-3 py-2 text-sm border rounded-md bg-background"
                                placeholder="1080"
                                min="100"
                                max="5000"
                            />
                        </div>
                        <div>
                            <Label class="text-xs text-muted-foreground">Height (px)</Label>
                            <input
                                v-model.number="customHeight"
                                type="number"
                                class="w-full px-3 py-2 text-sm border rounded-md bg-background"
                                placeholder="1080"
                                min="100"
                                max="5000"
                            />
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        class="w-full mt-3"
                        size="sm"
                        @click="createCustomCanvas"
                    >
                        <Plus class="w-4 h-4 mr-2" />
                        Create Custom Canvas
                    </Button>
                </div>
            </div>

            <!-- AI Tool - Inline content without header -->
            <div v-else-if="activeTool === 'ai'" class="p-4 space-y-6">
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

            </div>

            <!-- Filters Tool -->
            <div v-else-if="activeTool === 'filters'" class="p-4">
                <FilterTool />
            </div>

            <!-- Select Tool - Object Properties or Message -->
            <div v-else-if="activeTool === 'select'" class="p-4">
                <div v-if="selectedObject" class="space-y-4">
                    <h4 class="text-sm font-semibold text-muted-foreground">Object Properties</h4>

                    <!-- Fill Color -->
                    <div class="space-y-2">
                        <label class="text-xs font-medium text-muted-foreground">Fill Color</label>
                        <ColorPicker
                            :model-value="fillColor"
                            @update:model-value="updateFillColor"
                            :show-hex-value="false"
                        />
                    </div>

                    <!-- Stroke Color -->
                    <div class="space-y-2">
                        <label class="text-xs font-medium text-muted-foreground">Stroke Color</label>
                        <ColorPicker
                            :model-value="strokeColor"
                            @update:model-value="updateStrokeColor"
                            :show-hex-value="false"
                        />
                    </div>

                    <!-- Stroke Width -->
                    <div class="space-y-2">
                        <label class="text-xs font-medium text-muted-foreground">Stroke Width</label>
                        <input
                            type="range"
                            min="0"
                            max="20"
                            :value="strokeWidth"
                            @input="updateStrokeWidth"
                            class="w-full"
                        />
                        <span class="text-xs text-muted-foreground">{{ strokeWidth }}px</span>
                    </div>

                    <!-- Opacity -->
                    <div class="space-y-2">
                        <label class="text-xs font-medium text-muted-foreground">Opacity</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            :value="opacity * 100"
                            @input="updateOpacity"
                            class="w-full"
                        />
                        <span class="text-xs text-muted-foreground">{{ Math.round(opacity * 100) }}%</span>
                    </div>

                    <Separator />

                    <!-- Delete Button -->
                    <Button variant="destructive" size="sm" class="w-full" @click="deleteObject">
                        <Trash2 class="w-4 h-4 mr-2" />
                        Delete Object
                    </Button>
                </div>
                <div v-else class="text-center text-muted-foreground text-sm py-8">
                    <p>Select an object to edit its properties</p>
                </div>
            </div>

            <!-- Default message for other tools -->
            <div v-else class="p-4 text-center text-muted-foreground text-sm">
                <p v-if="activeTool === 'images'">Click the image icon in the MainBar to upload an image</p>
                <p v-else-if="activeTool === 'draw'">Draw on the canvas with your mouse</p>
                <p v-else-if="activeTool === 'shapes'">Select a shape from the MainBar</p>
                <p v-else>Select a tool to get started</p>
            </div>
        </div>
    </div>

    <!-- Toggle button when sidebar is hidden (shown in the middle) -->
    <div
        v-if="!sidebarVisible"
        class="absolute left-16 top-1/2 -translate-y-1/2 z-10"
    >
        <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 bg-card border shadow-sm hover:bg-accent"
            @click="toggleSidebar"
        >
            <PanelLeftOpen class="w-4 h-4" />
        </Button>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { ColorPicker } from '../ui/color-picker';
import { PanelLeftClose, PanelLeftOpen, Plus, Trash2, Wand2, Sparkles, Upload } from 'lucide-vue-next';
import { useCanvaStore } from '../../stores/canva';
import { useEditor } from '../../composables/canva/useEditor';
import { useConfigStore } from '../../stores/config';
import { ReplicateService } from '../../services/replicate';
import FilterTool from './FilterTool.vue';
import { PREDEFINED_TEMPLATES, TEMPLATE_CATEGORIES } from '../../config/canvaTemplates';
import type { ActiveTool, Template } from '../../types/canva';
import type { fabric } from '../../lib/fabric';

interface Props {
    activeTool: ActiveTool;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'toolChange', tool: ActiveTool): void;
    (e: 'addText', options: { text: string; fontSize: number; fontFamily: string }): void;
    (e: 'selectTemplate', template: Template): void;
    (e: 'createCustom', width: number, height: number): void;
}>();

const canvaStore = useCanvaStore();
const configStore = useConfigStore();
const { selectedObject, canvas, sidebarVisible } = storeToRefs(canvaStore);
const { replicateApiToken } = storeToRefs(configStore);
const { setSidebarVisible, setActiveTool } = canvaStore;
const editor = useEditor();

// Canvas resize state
const canvasWidth = ref(800);
const canvasHeight = ref(600);
const scaleContentOnResize = ref(false);

// Font selection state
const selectedFont = ref('Arial');

// Template state
const selectedCategory = ref<string>('all');
const customWidth = ref<number>(1080);
const customHeight = ref<number>(1080);

// AI Tool state
const removeBgInput = ref<HTMLInputElement | null>(null);
const isRemovingBg = ref(false);
const removeBgResult = ref<string | null>(null);
const removeBgError = ref<string | null>(null);
const generatePrompt = ref('');
const generateWidth = ref(512);
const generateHeight = ref(512);
const isGenerating = ref(false);
const generateResult = ref<string | null>(null);
const generateError = ref<string | null>(null);

// Watch canvas changes to update dimensions
watch(() => canvas.value, (newCanvas) => {
    if (newCanvas) {
        canvasWidth.value = newCanvas.width || 800;
        canvasHeight.value = newCanvas.height || 600;
    }
}, { immediate: true });

// Panel title based on active tool
const panelTitle = computed(() => {
    const titles: Record<string, string> = {
        select: 'Properties',
        shapes: 'Shapes',
        text: 'Text',
        images: 'Images',
        draw: 'Draw',
        ai: 'AI Tools',
        filters: 'Filters',
        templates: 'Templates',
        settings: 'Canvas Settings'
    };
    return titles[props.activeTool] || 'Panel';
});

const backgroundColor = computed(() => {
    return editor.getBackgroundColor();
});

const textTypes = [
    {
        type: 'heading',
        label: 'Add a heading',
        preview: 'Heading',
        previewSize: 28,
        fontFamily: 'Arial',
        fontSize: 48,
        text: 'Heading'
    },
    {
        type: 'subheading',
        label: 'Add a subheading',
        preview: 'Subheading',
        previewSize: 22,
        fontFamily: 'Arial',
        fontSize: 32,
        text: 'Subheading'
    },
    {
        type: 'paragraph',
        label: 'Add a paragraph',
        preview: 'Paragraph text',
        previewSize: 16,
        fontFamily: 'Arial',
        fontSize: 18,
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    }
];

const fontFamilies = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
    'Impact',
    'Comic Sans MS',
    'Palatino',
    'Garamond',
    'Bookman',
    'Tahoma',
    'Trebuchet MS',
    'Arial Black',
    'Lucida Sans'
];

const fillColor = computed(() => {
    return (selectedObject.value as any)?.fill?.toString() || '#000000';
});

const strokeColor = computed(() => {
    return (selectedObject.value as any)?.stroke?.toString() || '#000000';
});

const strokeWidth = computed(() => {
    return (selectedObject.value as any)?.strokeWidth || 0;
});

const opacity = computed(() => {
    return (selectedObject.value as any)?.opacity || 1;
});

const filteredTemplates = computed(() => {
    if (selectedCategory.value === 'all') {
        return PREDEFINED_TEMPLATES;
    }
    return PREDEFINED_TEMPLATES.filter(
        (t) => t.category === selectedCategory.value
    );
});

const canGenerate = computed(() => {
    return generatePrompt.value.trim().length > 0 && replicateApiToken.value;
});

function toggleSidebar() {
    setSidebarVisible(!sidebarVisible.value);
}

function updateBackgroundColor(color: string) {
    editor.setBackgroundColor(color);
}

function applyResize() {
    if (canvasWidth.value >= 100 && canvasHeight.value >= 100) {
        editor.resizeCanvas(canvasWidth.value, canvasHeight.value, {
            scaleContent: scaleContentOnResize.value
        });
    }
}

function resizeTo(width: number, height: number) {
    canvasWidth.value = width;
    canvasHeight.value = height;
    editor.resizeCanvas(width, height, {
        scaleContent: scaleContentOnResize.value
    });
}

function addTextByType(textType: typeof textTypes[0]) {
    emit('addText', {
        text: textType.text,
        fontSize: textType.fontSize,
        fontFamily: selectedFont.value
    });
    setActiveTool('select');
}

function selectFont(font: string) {
    selectedFont.value = font;
}

function selectTemplate(template: Template) {
    emit('selectTemplate', template);
    setActiveTool('select');
}

function createCustomCanvas() {
    if (customWidth.value >= 100 && customHeight.value >= 100) {
        emit('createCustom', customWidth.value, customHeight.value);
        setActiveTool('select');
    }
}

function getTemplateGradient(template: Template): string {
    const gradients: Record<string, string> = {
        'instagram-post': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'instagram-story': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'facebook-post': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'twitter-post': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        'linkedin-post': 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
        'youtube-thumbnail': 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
        'presentation-16-9': 'linear-gradient(135deg, #434343 0%, #000000 100%)',
        'presentation-4-3': 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)',
        'a4-portrait': 'linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)',
        'a4-landscape': 'linear-gradient(135deg, #d7d2cc 0%, #304352 100%)',
        'business-card': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        'flyer': 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
        'instagram-carousel': 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)',
        'quote-post': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'announcement-banner': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    };
    return gradients[template.id] || 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)';
}

function updateFillColor(color: string) {
    editor.changeFillColor(color);
}

function updateStrokeColor(color: string) {
    editor.changeStrokeColor(color);
}

function updateStrokeWidth(event: Event) {
    const width = parseInt((event.target as HTMLInputElement).value);
    editor.changeStrokeWidth(width);
}

function updateOpacity(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value) / 100;
    if (selectedObject.value) {
        selectedObject.value.set('opacity', value);
        canvaStore.canvas?.renderAll();
        canvaStore.saveState();
    }
}

function deleteObject() {
    editor.deleteObject();
}

// AI Tool Functions
function triggerRemoveBgUpload() {
    removeBgInput.value?.click();
}

async function handleRemoveBgFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!replicateApiToken.value) {
        generateError.value = 'Please configure your Replicate API token first';
        return;
    }

    isRemovingBg.value = true;
    removeBgError.value = null;
    removeBgResult.value = null;

    try {
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