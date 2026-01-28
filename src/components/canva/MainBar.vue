<template>
    <div class="w-16 bg-card border-r flex flex-col items-center py-4 gap-2 shrink-0">
        <!-- Select Tool -->
        <Tooltip>
            <TooltipTrigger as-child>
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-accent': activeTool === 'select' }"
                    @click="selectTool('select')"
                >
                    <MousePointer2 class="w-5 h-5" />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
                <p>Select (V)</p>
            </TooltipContent>
        </Tooltip>

        <!-- Shapes Tool -->
        <Popover>
            <PopoverTrigger as-child>
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-accent': activeTool === 'shapes' }"
                >
                    <Shapes class="w-5 h-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent side="right" class="w-auto p-2">
                <div class="flex flex-col gap-2">
                    <Button variant="ghost" size="sm" @click="addShape('rectangle')">
                        <Square class="w-4 h-4 mr-2" />
                        Rectangle
                    </Button>
                    <Button variant="ghost" size="sm" @click="addShape('soft-rectangle')">
                        <Square class="w-4 h-4 mr-2" />
                        Soft Rectangle
                    </Button>
                    <Button variant="ghost" size="sm" @click="addShape('circle')">
                        <Circle class="w-4 h-4 mr-2" />
                        Circle
                    </Button>
                    <Button variant="ghost" size="sm" @click="addShape('triangle')">
                        <Triangle class="w-4 h-4 mr-2" />
                        Triangle
                    </Button>
                    <Button variant="ghost" size="sm" @click="addShape('inverse-triangle')">
                        <Triangle class="w-4 h-4 mr-2 rotate-180" />
                        Inverse Triangle
                    </Button>
                    <Button variant="ghost" size="sm" @click="addShape('diamond')">
                        <Square class="w-4 h-4 mr-2 rotate-45" />
                        Diamond
                    </Button>
                </div>
            </PopoverContent>
        </Popover>

        <!-- Text Tool -->
        <Tooltip>
            <TooltipTrigger as-child>
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-accent': activeTool === 'text' }"
                    @click="selectTool('text')"
                >
                    <Type class="w-5 h-5" />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
                <p>Text (T)</p>
            </TooltipContent>
        </Tooltip>

        <!-- Images Tool -->
        <Tooltip>
            <TooltipTrigger as-child>
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-accent': activeTool === 'images' }"
                    @click="triggerImageUpload"
                >
                    <ImageIcon class="w-5 h-5" />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
                <p>Add Image</p>
            </TooltipContent>
        </Tooltip>

        <!-- Hidden file input for images -->
        <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileChange"
        />

        <Separator class="my-2 w-8" />

        <!-- Templates Tool -->
        <Tooltip>
            <TooltipTrigger as-child>
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-accent': activeTool === 'templates' }"
                    @click="selectTool('templates')"
                >
                    <LayoutTemplate class="w-5 h-5" />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
                <p>Templates</p>
            </TooltipContent>
        </Tooltip>

        <!-- Draw Tool -->
        <Tooltip>
            <TooltipTrigger as-child>
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-accent': activeTool === 'draw' }"
                    @click="toggleDrawing"
                >
                    <Pencil class="w-5 h-5" />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
                <p>Draw</p>
            </TooltipContent>
        </Tooltip>

        <!-- AI Tool -->
        <Tooltip>
            <TooltipTrigger as-child>
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-accent': activeTool === 'ai' }"
                    @click="selectTool('ai')"
                >
                    <Sparkles class="w-5 h-5" />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
                <p>AI Tools</p>
            </TooltipContent>
        </Tooltip>

        <!-- Filters Tool -->
        <Tooltip>
            <TooltipTrigger as-child>
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-accent': activeTool === 'filters' }"
                    @click="selectTool('filters')"
                >
                    <Palette class="w-5 h-5" />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
                <p>Filters</p>
            </TooltipContent>
        </Tooltip>

        <Separator class="my-2 w-8" />

        <!-- Settings Tool - Opens Sidebar with Canvas Settings -->
        <Tooltip>
            <TooltipTrigger as-child>
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-accent': activeTool === 'settings' }"
                    @click="selectTool('settings')"
                >
                    <Settings class="w-5 h-5" />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
                <p>Canvas Settings</p>
            </TooltipContent>
        </Tooltip>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from '../ui/tooltip';
import {
    MousePointer2,
    Shapes,
    Type,
    Image as ImageIcon,
    Pencil,
    Sparkles,
    Palette,
    LayoutTemplate,
    Square,
    Circle,
    Triangle,
    Settings
} from 'lucide-vue-next';
import type { ActiveTool, ShapeType } from '../../types/canva';

interface Props {
    activeTool: ActiveTool;
}

defineProps<Props>();

const emit = defineEmits<{
    (e: 'toolChange', tool: ActiveTool): void;
    (e: 'addShape', type: ShapeType): void;
    (e: 'addImage', file: File): void;
    (e: 'toggleDrawing', enabled: boolean): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);

function selectTool(tool: ActiveTool) {
    emit('toolChange', tool);
}

function addShape(type: ShapeType) {
    emit('addShape', type);
    emit('toolChange', 'select');
}

function triggerImageUpload() {
    fileInput.value?.click();
}

function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
        emit('addImage', file);
        emit('toolChange', 'select');
    }
    // Reset input
    input.value = '';
}

function toggleDrawing() {
    const isDrawing = fileInput.value?.dataset.drawing === 'true';
    fileInput.value?.setAttribute('data-drawing', (!isDrawing).toString());
    emit('toggleDrawing', !isDrawing);
}
</script>