<template>
    <div class="h-14 bg-card border-b flex items-center justify-between px-4">
        <!-- Hidden file input for JSON -->
        <input
            ref="jsonFileInput"
            type="file"
            accept=".json"
            class="hidden"
            @change="handleJSONFileChange"
        />

        <!-- Left side - History, Delete, Layer Controls -->
        <div class="flex items-center gap-2">
            <Tooltip>
                <TooltipTrigger as-child>
                    <Button
                        variant="ghost"
                        size="icon"
                        :disabled="!canUndo"
                        @click="$emit('undo')"
                    >
                        <Undo2 class="w-4 h-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Undo (Ctrl+Z)</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger as-child>
                    <Button
                        variant="ghost"
                        size="icon"
                        :disabled="!canRedo"
                        @click="$emit('redo')"
                    >
                        <Redo2 class="w-4 h-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Redo (Ctrl+Shift+Z)</p>
                </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" class="h-6 mx-2" />

            <!-- Delete button (only when object selected) -->
            <Tooltip v-if="canDelete">
                <TooltipTrigger as-child>
                    <Button
                        variant="ghost"
                        size="icon"
                        @click="deleteSelected"
                    >
                        <Trash2 class="w-4 h-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Delete (Del)</p>
                </TooltipContent>
            </Tooltip>

            <!-- Layer controls (only when object selected) -->
            <template v-if="canDelete">
                <Tooltip>
                    <TooltipTrigger as-child>
                        <Button
                            variant="ghost"
                            size="icon"
                            @click="bringToFront"
                        >
                            <ArrowUp class="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Bring to Front</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger as-child>
                        <Button
                            variant="ghost"
                            size="icon"
                            @click="sendToBack"
                        >
                            <ArrowDown class="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Send to Back</p>
                    </TooltipContent>
                </Tooltip>
            </template>
        </div>

        <!-- Center - Contextual Tools (Text Tools when text is selected) -->
        <div class="flex items-center gap-2 flex-1 justify-center">
            <!-- Text Tools (only when text object is selected) -->
            <template v-if="isTextObject && selectedObject">
                <!-- Font Family Selector -->
                <Popover>
                    <PopoverTrigger as-child>
                        <Button variant="ghost" size="sm" class="gap-1 min-w-[120px]">
                            <span :style="{ fontFamily: currentFontFamily }" class="truncate">
                                {{ currentFontFamily }}
                            </span>
                            <ChevronDown class="w-3 h-3" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" class="w-64 p-2 max-h-80 overflow-y-auto">
                        <div class="space-y-1">
                            <button
                                v-for="font in fontFamilies"
                                :key="font"
                                class="w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors"
                                :class="{ 'bg-accent': currentFontFamily === font }"
                                :style="{ fontFamily: font }"
                                @click="changeFontFamily(font)"
                            >
                                {{ font }}
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>

                <Separator orientation="vertical" class="h-6" />

                <!-- Font Size -->
                <div class="flex items-center gap-1">
                    <Button variant="ghost" size="icon" class="h-8 w-8" @click="decreaseFontSize">
                        <Minus class="w-3 h-3" />
                    </Button>
                    <span class="text-sm font-medium w-10 text-center">{{ currentFontSize }}</span>
                    <Button variant="ghost" size="icon" class="h-8 w-8" @click="increaseFontSize">
                        <Plus class="w-3 h-3" />
                    </Button>
                </div>

                <Separator orientation="vertical" class="h-6" />

                <!-- Text Styles -->
                <div class="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        class="h-8 w-8"
                        :class="{ 'bg-accent': isBold }"
                        @click="toggleBold"
                    >
                        <Bold class="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        class="h-8 w-8"
                        :class="{ 'bg-accent': isItalic }"
                        @click="toggleItalic"
                    >
                        <Italic class="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        class="h-8 w-8"
                        :class="{ 'bg-accent': isUnderline }"
                        @click="toggleUnderline"
                    >
                        <Underline class="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        class="h-8 w-8"
                        :class="{ 'bg-accent': isStrikethrough }"
                        @click="toggleStrikethrough"
                    >
                        <Strikethrough class="w-4 h-4" />
                    </Button>
                </div>

                <Separator orientation="vertical" class="h-6" />

                <!-- Text Alignment -->
                <div class="flex items-center gap-1">
                    <Button
                        v-for="align in alignments"
                        :key="align.value"
                        variant="ghost"
                        size="icon"
                        class="h-8 w-8"
                        :class="{ 'bg-accent': currentAlign === align.value }"
                        @click="changeTextAlign(align.value)"
                    >
                        <component :is="align.icon" class="w-4 h-4" />
                    </Button>
                </div>

                <Separator orientation="vertical" class="h-6" />

                <!-- Fill Color -->
                <Tooltip>
                    <TooltipTrigger as-child>
                        <div class="flex items-center gap-1">
                            <ColorPicker
                                :model-value="fillColor"
                                @update:model-value="updateFillColor"
                                :show-hex-value="false"
                                trigger-class="w-6 h-6"
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Text Color</p>
                    </TooltipContent>
                </Tooltip>

                <!-- Text Effects Popover (Outline, Shadow, Opacity) -->
                <Popover>
                    <PopoverTrigger as-child>
                        <Button variant="ghost" size="icon" class="h-8 w-8">
                            <Sparkles class="w-4 h-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" class="w-64 p-4 space-y-4">
                        <!-- Opacity -->
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <Label class="text-xs text-muted-foreground">Opacity</Label>
                                <span class="text-xs">{{ Math.round(currentOpacity * 100) }}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                :value="currentOpacity"
                                @input="(e) => changeOpacity(parseFloat((e.target as HTMLInputElement).value))"
                                class="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <Separator />

                        <!-- Text Outline -->
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="toolbar-enable-outline"
                                    :checked="hasOutline"
                                    @change="toggleOutline"
                                    class="rounded"
                                />
                                <Label for="toolbar-enable-outline" class="text-xs">Outline</Label>
                            </div>
                            <template v-if="hasOutline">
                                <div class="flex items-center gap-2">
                                    <ColorPicker
                                        v-model="outlineColor"
                                        trigger-class="w-6 h-6"
                                        :show-hex-value="false"
                                        @change="updateOutline"
                                    />
                                    <span class="text-xs text-muted-foreground">Color</span>
                                </div>
                                <div class="space-y-1">
                                    <div class="flex justify-between">
                                        <Label class="text-xs text-muted-foreground">Width</Label>
                                        <span class="text-xs">{{ outlineWidth }}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        step="1"
                                        v-model.number="outlineWidth"
                                        @input="updateOutline"
                                        class="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </template>
                        </div>

                        <Separator />

                        <!-- Text Shadow -->
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="toolbar-enable-shadow"
                                    :checked="hasShadow"
                                    @change="toggleShadow"
                                    class="rounded"
                                />
                                <Label for="toolbar-enable-shadow" class="text-xs">Shadow</Label>
                            </div>
                            <template v-if="hasShadow">
                                <div class="grid grid-cols-3 gap-2">
                                    <div>
                                        <Label class="text-xs text-muted-foreground">X</Label>
                                        <input
                                            type="number"
                                            v-model.number="shadowX"
                                            class="w-full px-2 py-1 text-xs border rounded bg-background"
                                            @change="updateShadow"
                                        />
                                    </div>
                                    <div>
                                        <Label class="text-xs text-muted-foreground">Y</Label>
                                        <input
                                            type="number"
                                            v-model.number="shadowY"
                                            class="w-full px-2 py-1 text-xs border rounded bg-background"
                                            @change="updateShadow"
                                        />
                                    </div>
                                    <div>
                                        <Label class="text-xs text-muted-foreground">Blur</Label>
                                        <input
                                            type="number"
                                            v-model.number="shadowBlur"
                                            class="w-full px-2 py-1 text-xs border rounded bg-background"
                                            @change="updateShadow"
                                        />
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <ColorPicker
                                        v-model="shadowColor"
                                        trigger-class="w-6 h-6"
                                        :show-hex-value="false"
                                        @change="updateShadow"
                                    />
                                    <span class="text-xs text-muted-foreground">Color</span>
                                </div>
                            </template>
                        </div>
                    </PopoverContent>
                </Popover>
            </template>

            <!-- Shape Tools (only when shape object is selected) -->
            <template v-if="isShapeObject && selectedObject">
                <!-- Fill Color -->
                <Tooltip>
                    <TooltipTrigger as-child>
                        <div class="flex items-center gap-1">
                            <ColorPicker
                                :model-value="fillColor"
                                @update:model-value="updateFillColor"
                                :show-hex-value="false"
                                trigger-class="w-6 h-6"
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Fill Color</p>
                    </TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" class="h-6" />

                <!-- Stroke Color -->
                <Tooltip>
                    <TooltipTrigger as-child>
                        <div class="flex items-center gap-1">
                            <ColorPicker
                                :model-value="strokeColor"
                                @update:model-value="updateStrokeColor"
                                :show-hex-value="false"
                                trigger-class="w-6 h-6"
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Border Color</p>
                    </TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" class="h-6" />

                <!-- Stroke Width -->
                <div class="flex items-center gap-1">
                    <Button variant="ghost" size="icon" class="h-8 w-8" @click="decreaseStrokeWidth">
                        <Minus class="w-3 h-3" />
                    </Button>
                    <span class="text-sm font-medium w-10 text-center">{{ strokeWidth }}px</span>
                    <Button variant="ghost" size="icon" class="h-8 w-8" @click="increaseStrokeWidth">
                        <Plus class="w-3 h-3" />
                    </Button>
                </div>

                <Separator orientation="vertical" class="h-6" />

                <!-- Opacity -->
                <Tooltip>
                    <TooltipTrigger as-child>
                        <Popover>
                            <PopoverTrigger as-child>
                                <Button variant="ghost" size="icon" class="h-8 w-8">
                                    <span class="text-xs font-medium">{{ Math.round(currentOpacity * 100) }}%</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="center" class="w-48 p-3">
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <Label class="text-xs text-muted-foreground">Opacity</Label>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        :value="currentOpacity"
                                        @input="(e) => changeOpacity(parseFloat((e.target as HTMLInputElement).value))"
                                        class="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </PopoverContent>
                        </Popover>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Opacity</p>
                    </TooltipContent>
                </Tooltip>
            </template>
        </div>

        <!-- Right side - Zoom, Export & Import -->
        <div class="flex items-center gap-2">
            <!-- Zoom Controls -->
            <div class="flex items-center gap-1">
                <Tooltip>
                    <TooltipTrigger as-child>
                        <Button
                            variant="ghost"
                            size="icon"
                            class="h-8 w-8"
                            @click="zoomOut"
                        >
                            <ZoomOut class="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Zoom Out</p>
                    </TooltipContent>
                </Tooltip>

                <span class="text-sm font-medium w-14 text-center">{{ Math.round(currentZoom * 100) }}%</span>

                <Tooltip>
                    <TooltipTrigger as-child>
                        <Button
                            variant="ghost"
                            size="icon"
                            class="h-8 w-8"
                            @click="zoomIn"
                        >
                            <ZoomIn class="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Zoom In</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger as-child>
                        <Button
                            variant="ghost"
                            size="icon"
                            class="h-8 w-8"
                            @click="resetZoom"
                        >
                            <Maximize class="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Reset Zoom</p>
                    </TooltipContent>
                </Tooltip>
            </div>

            <Separator orientation="vertical" class="h-6 mx-2" />

            <Tooltip>
                <TooltipTrigger as-child>
                    <Button
                        variant="ghost"
                        size="icon"
                        @click="triggerJSONUpload"
                    >
                        <Upload class="w-4 h-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Load JSON</p>
                </TooltipContent>
            </Tooltip>

            <!-- Library Button -->
            <Tooltip>
                <TooltipTrigger as-child>
                    <Button
                        variant="ghost"
                        size="icon"
                        @click="saveToLibrary"
                    >
                        <Library class="w-4 h-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Save to Library</p>
                </TooltipContent>
            </Tooltip>

            <Popover>
                <PopoverTrigger as-child>
                    <Button
                        variant="ghost"
                        size="icon"
                    >
                        <Download class="w-4 h-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" class="w-auto p-2">
                    <div class="flex flex-col gap-2">
                        <Button variant="ghost" size="sm" @click="exportImage('png')">
                            <FileImage class="w-4 h-4 mr-2" />
                            Export PNG
                        </Button>
                        <Button variant="ghost" size="sm" @click="exportImage('jpeg')">
                            <FileImage class="w-4 h-4 mr-2" />
                            Export JPEG
                        </Button>
                        <Button variant="ghost" size="sm" @click="exportSVG">
                            <FileCode class="w-4 h-4 mr-2" />
                            Export SVG
                        </Button>
                        <Button variant="ghost" size="sm" @click="exportJSON">
                            <FileJson class="w-4 h-4 mr-2" />
                            Export JSON
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Label } from '../ui/label';
import { ColorPicker } from '../ui/color-picker';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from '../ui/tooltip';
import {
    Undo2,
    Redo2,
    Download,
    Upload,
    Trash2,
    ArrowUp,
    ArrowDown,
    FileImage,
    FileJson,
    FileCode,
    Library,
    ZoomIn,
    ZoomOut,
    Maximize,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    ChevronDown,
    Plus,
    Minus,
    Sparkles
} from 'lucide-vue-next';
import { useCanvaStore } from '../../stores/canva';
import { useEditor } from '../../composables/canva/useEditor';
import { fabric } from '../../lib/fabric';

interface Props {
    activeTool: string;
    canUndo: boolean;
    canRedo: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
    (e: 'toolChange', tool: string): void;
    (e: 'undo'): void;
    (e: 'redo'): void;
}>();

const canvaStore = useCanvaStore();
const { selectedObject, canvas } = storeToRefs(canvaStore);
const editor = useEditor();
const jsonFileInput = ref<HTMLInputElement | null>(null);
const currentZoom = ref(1);
let zoomInterval: number | null = null;

// Text editing state
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

const alignments = [
    { value: 'left', icon: AlignLeft },
    { value: 'center', icon: AlignCenter },
    { value: 'right', icon: AlignRight },
    { value: 'justify', icon: AlignJustify }
];

// Shadow state
const shadowX = ref(2);
const shadowY = ref(2);
const shadowBlur = ref(4);
const shadowColor = ref('#000000');

// Outline state
const outlineColor = ref('#000000');
const outlineWidth = ref(2);

const canDelete = computed(() => !!canvaStore.selectedObject);

const isTextObject = computed(() => {
    return selectedObject.value instanceof fabric.IText;
});

const isShapeObject = computed(() => {
    if (!selectedObject.value) return false;
    return selectedObject.value instanceof fabric.Rect ||
           selectedObject.value instanceof fabric.Circle ||
           selectedObject.value instanceof fabric.Triangle ||
           selectedObject.value instanceof fabric.Polygon;
});

const currentFontFamily = computed(() => {
    if (!isTextObject.value || !selectedObject.value) return 'Arial';
    return (selectedObject.value as fabric.IText).fontFamily || 'Arial';
});

const currentFontSize = computed(() => {
    if (!isTextObject.value || !selectedObject.value) return 32;
    return (selectedObject.value as fabric.IText).fontSize || 32;
});

const currentAlign = computed(() => {
    if (!isTextObject.value || !selectedObject.value) return 'left';
    return (selectedObject.value as fabric.IText).textAlign || 'left';
});

const currentOpacity = computed(() => {
    if (!selectedObject.value) return 1;
    return selectedObject.value.opacity ?? 1;
});

const fillColor = computed(() => {
    if (!selectedObject.value) return '#000000';
    return (selectedObject.value as any)?.fill?.toString() || '#000000';
});

const strokeColor = computed(() => {
    if (!selectedObject.value) return '#000000';
    return (selectedObject.value as any)?.stroke?.toString() || '#000000';
});

const strokeWidth = computed(() => {
    if (!selectedObject.value) return 0;
    return (selectedObject.value as any)?.strokeWidth || 0;
});

const isBold = computed(() => {
    if (!isTextObject.value || !selectedObject.value) return false;
    const weight = (selectedObject.value as fabric.IText).fontWeight;
    return weight === 'bold' || weight === '700';
});

const isItalic = computed(() => {
    if (!isTextObject.value || !selectedObject.value) return false;
    return (selectedObject.value as fabric.IText).fontStyle === 'italic';
});

const isUnderline = computed(() => {
    if (!isTextObject.value || !selectedObject.value) return false;
    return (selectedObject.value as fabric.IText).underline || false;
});

const isStrikethrough = computed(() => {
    if (!isTextObject.value || !selectedObject.value) return false;
    return (selectedObject.value as fabric.IText).linethrough || false;
});

const hasShadow = computed(() => {
    if (!isTextObject.value || !selectedObject.value) return false;
    return !!(selectedObject.value as fabric.IText).shadow;
});

const hasOutline = computed(() => {
    if (!isTextObject.value || !selectedObject.value) return false;
    const obj = selectedObject.value as fabric.IText;
    return !!obj.stroke && obj.strokeWidth > 0;
});

// Watch for selection changes to update shadow/outline state
watch(() => selectedObject.value, (obj) => {
    if (obj instanceof fabric.IText) {
        const shadow = obj.shadow;
        if (shadow && typeof shadow === 'object') {
            shadowX.value = shadow.offsetX || 2;
            shadowY.value = shadow.offsetY || 2;
            shadowBlur.value = shadow.blur || 4;
            shadowColor.value = shadow.color || '#000000';
        }
        if (obj.stroke) {
            outlineColor.value = obj.stroke as string;
            outlineWidth.value = obj.strokeWidth || 2;
        }
    }
}, { immediate: true });

// Update zoom level periodically
onMounted(() => {
    zoomInterval = window.setInterval(() => {
        currentZoom.value = editor.getZoom();
    }, 100);
});

onUnmounted(() => {
    if (zoomInterval) {
        clearInterval(zoomInterval);
    }
});

function zoomIn() {
    editor.zoomIn();
}

function zoomOut() {
    editor.zoomOut();
}

function resetZoom() {
    editor.resetZoom();
}

function triggerJSONUpload() {
    jsonFileInput.value?.click();
}

function handleJSONFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const json = e.target?.result as string;
            if (json) {
                editor.loadFromJSON(json);
            }
        };
        reader.readAsText(file);
    }
    // Reset input
    input.value = '';
}

function deleteSelected() {
    editor.deleteObject();
}

function bringToFront() {
    editor.bringToFront();
}

function sendToBack() {
    editor.sendToBack();
}

function exportImage(format: 'png' | 'jpeg') {
    const dataUrl = format === 'png'
        ? editor.exportToPNG({ multiplier: 1 })
        : editor.exportToJPEG({ multiplier: 1, quality: 0.9 });

    const link = document.createElement('a');
    link.download = `canva-export-${Date.now()}.${format}`;
    link.href = dataUrl;
    link.click();
}

function exportJSON() {
    const json = editor.exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = `canva-project-${Date.now()}.json`;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
}

function exportSVG() {
    const svg = editor.exportToSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = `canva-design-${Date.now()}.svg`;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
}

async function saveToLibrary() {
    const success = await editor.saveToLibrary();
    if (success) {
        alert('Design saved to library!');
    } else {
        alert('Failed to save design to library.');
    }
}

// Text editing functions
function changeFontFamily(font: string) {
    editor.changeFontFamily(font);
}

function increaseFontSize() {
    const newSize = Math.min(currentFontSize.value + 2, 200);
    editor.changeFontSize(newSize);
}

function decreaseFontSize() {
    const newSize = Math.max(currentFontSize.value - 2, 8);
    editor.changeFontSize(newSize);
}

function changeTextAlign(align: string) {
    if (!canvas.value || !selectedObject.value) return;
    if (selectedObject.value instanceof fabric.IText) {
        selectedObject.value.set('textAlign', align);
        canvas.value.renderAll();
        canvaStore.saveState();
    }
}

function toggleBold() {
    if (!canvas.value || !selectedObject.value) return;
    if (selectedObject.value instanceof fabric.IText) {
        const text = selectedObject.value as fabric.IText;
        text.set('fontWeight', text.fontWeight === 'bold' ? 'normal' : 'bold');
        canvas.value.renderAll();
        canvaStore.saveState();
    }
}

function toggleItalic() {
    if (!canvas.value || !selectedObject.value) return;
    if (selectedObject.value instanceof fabric.IText) {
        const text = selectedObject.value as fabric.IText;
        text.set('fontStyle', text.fontStyle === 'italic' ? 'normal' : 'italic');
        canvas.value.renderAll();
        canvaStore.saveState();
    }
}

function toggleUnderline() {
    if (!canvas.value || !selectedObject.value) return;
    if (selectedObject.value instanceof fabric.IText) {
        const text = selectedObject.value as fabric.IText;
        text.set('underline', !text.underline);
        canvas.value.renderAll();
        canvaStore.saveState();
    }
}

function toggleStrikethrough() {
    if (!canvas.value || !selectedObject.value) return;
    if (selectedObject.value instanceof fabric.IText) {
        const text = selectedObject.value as fabric.IText;
        text.set('linethrough', !text.linethrough);
        canvas.value.renderAll();
        canvaStore.saveState();
    }
}

function updateFillColor(color: string) {
    editor.changeFillColor(color);
}

function updateStrokeColor(color: string) {
    editor.changeStrokeColor(color);
}

function increaseStrokeWidth() {
    const newWidth = Math.min(strokeWidth.value + 1, 20);
    editor.changeStrokeWidth(newWidth);
}

function decreaseStrokeWidth() {
    const newWidth = Math.max(strokeWidth.value - 1, 0);
    editor.changeStrokeWidth(newWidth);
}

function changeOpacity(opacity: number) {
    if (!canvas.value || !selectedObject.value) return;
    selectedObject.value.set('opacity', opacity);
    canvas.value.renderAll();
    canvaStore.saveState();
}

function toggleShadow() {
    if (hasShadow.value) {
        editor.changeTextShadow(undefined);
    } else {
        updateShadow();
    }
}

function updateShadow() {
    const shadow = new fabric.Shadow({
        offsetX: shadowX.value,
        offsetY: shadowY.value,
        blur: shadowBlur.value,
        color: shadowColor.value
    });
    editor.changeTextShadow(shadow);
}

function toggleOutline() {
    if (hasOutline.value) {
        editor.changeTextOutline(undefined);
    } else {
        updateOutline();
    }
}

function updateOutline() {
    editor.changeTextOutline(outlineColor.value, outlineWidth.value);
}
</script>