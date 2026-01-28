<template>
    <Popover v-model:open="isOpen">
        <PopoverTrigger as-child>
            <button
                type="button"
                :class="cn(
                    'w-8 h-8 rounded border border-border cursor-pointer transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    triggerClass
                )"
                :style="{ backgroundColor: currentColor }"
                :aria-label="`Select color, current color is ${currentColor}`"
            />
        </PopoverTrigger>
        <PopoverContent :align="align" :side="side" :side-offset="sideOffset" class="w-64 p-3">
            <div class="flex flex-col gap-3">
                <!-- Color Selection Area -->
                <div
                    ref="selectionRef"
                    class="relative h-32 w-full cursor-crosshair rounded overflow-hidden"
                    :style="{ background: selectionGradient }"
                    @pointerdown="handlePointerDown"
                >
                    <div
                        class="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
                        :style="{
                            left: `${saturation}%`,
                            top: `${100 - brightness}%`,
                            boxShadow: '0 0 0 1px rgba(0,0,0,0.5)'
                        }"
                    />
                </div>

                <!-- Hue Slider -->
                <div class="relative flex h-4 w-full touch-none items-center">
                    <input
                        type="range"
                        min="0"
                        max="360"
                        step="1"
                        :value="hue"
                        @input="updateHue($event)"
                        class="w-full h-3 rounded-full appearance-none cursor-pointer hue-slider"
                    />
                </div>

                <!-- Alpha Slider -->
                <div class="relative flex h-4 w-full touch-none items-center">
                    <div
                        class="absolute inset-0 rounded-full opacity-50"
                        :style="{
                            backgroundImage: `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==')`
                        }"
                    />
                    <div
                        class="absolute inset-0 rounded-full"
                        :style="{ background: alphaGradient }"
                    />
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        :value="alpha"
                        @input="updateAlpha($event)"
                        class="relative w-full h-3 rounded-full appearance-none cursor-pointer alpha-slider"
                    />
                </div>

                <!-- Format Selection and Value -->
                <div v-if="showHexValue" class="flex items-center gap-2">
                    <!-- Eye Dropper Button -->
                    <Button
                        v-if="supportsEyeDropper"
                        type="button"
                        variant="outline"
                        size="icon"
                        class="h-8 w-8 shrink-0"
                        @click="openEyeDropper"
                    >
                        <PipetteIcon class="w-4 h-4" />
                    </Button>

                    <!-- Format Select -->
                    <select
                        :value="format"
                        @change="updateFormat($event)"
                        class="h-8 w-16 shrink-0 rounded border border-input bg-background px-2 text-xs"
                    >
                        <option v-for="f in formats" :key="f" :value="f">
                            {{ f.toUpperCase() }}
                        </option>
                    </select>

                    <!-- Color Value Input -->
                    <div class="flex-1 flex items-center">
                        <input
                            type="text"
                            readonly
                            :value="displayValue"
                            class="h-8 w-full rounded border border-input bg-secondary px-2 text-xs"
                        />
                    </div>
                </div>

                <!-- Preset Colors -->
                <div v-if="showPresets" class="grid grid-cols-8 gap-1 pt-2 border-t">
                    <button
                        v-for="preset in presetColors"
                        :key="preset"
                        type="button"
                        class="w-5 h-5 rounded border border-border/50 cursor-pointer transition-transform hover:scale-110"
                        :style="{ backgroundColor: preset }"
                        @click="selectPreset(preset)"
                    />
                </div>
            </div>
        </PopoverContent>
    </Popover>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { Button } from '../button';
import { PipetteIcon } from 'lucide-vue-next';
import { cn } from '../../../lib/utils';

interface Props {
    modelValue?: string;
    defaultValue?: string;
    triggerClass?: string;
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
    showPresets?: boolean;
    showHexValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: undefined,
    defaultValue: '#000000',
    triggerClass: '',
    align: 'center',
    side: 'bottom',
    sideOffset: 4,
    showPresets: true,
    showHexValue: true
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'change', value: string): void;
}>();

// Color state
const isOpen = ref(false);
const hue = ref(0);
const saturation = ref(100);
const brightness = ref(50);
const alpha = ref(100);
const format = ref<'hex' | 'rgb' | 'hsl' | 'css'>('hex');
const selectionRef = ref<HTMLDivElement | null>(null);

const formats = ['hex', 'rgb', 'hsl', 'css'] as const;

const presetColors = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b',
    '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#78716c', '#57534e', '#44403c',
    '#71717a', '#52525b', '#3f3f46', '#27272a'
];

// Check if EyeDropper API is supported
const supportsEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

// Initialize from value
function initFromColor(colorStr: string) {
    const rgb = parseColor(colorStr);
    const hsb = rgbToHsb(rgb.r, rgb.g, rgb.b);
    hue.value = hsb.h;
    saturation.value = hsb.s;
    brightness.value = hsb.b;
    alpha.value = Math.round((rgb.a ?? 1) * 100);
}

// Initialize on mount
initFromColor(props.modelValue || props.defaultValue);

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
    if (newValue && newValue !== currentColor.value) {
        initFromColor(newValue);
    }
});

// Computed gradients
const selectionGradient = computed(() => {
    const pureHue = hsbToRgb(hue.value, 100, 100);
    const hex = rgbToHex(pureHue.r, pureHue.g, pureHue.b);
    return `linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0)),
            linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0)),
            ${hex}`;
});

const alphaGradient = computed(() => {
    const rgb = hsbToRgb(hue.value, saturation.value, brightness.value);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    return `linear-gradient(to right, ${hex}00, ${hex})`;
});

// Computed current color
const currentColor = computed(() => {
    const rgb = hsbToRgb(hue.value, saturation.value, brightness.value);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
});

const currentColorWithAlpha = computed(() => {
    const rgb = hsbToRgb(hue.value, saturation.value, brightness.value);
    const a = alpha.value / 100;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
});

const displayValue = computed(() => {
    const rgb = hsbToRgb(hue.value, saturation.value, brightness.value);
    const a = alpha.value / 100;

    switch (format.value) {
        case 'hex':
            return alpha.value < 100
                ? `${currentColor.value}${Math.round(a * 255).toString(16).padStart(2, '0')}`
                : currentColor.value;
        case 'rgb':
            return alpha.value < 100
                ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`
                : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        case 'hsl':
            return `hsl(${Math.round(hue.value)}, ${Math.round(saturation.value)}%, ${Math.round(brightness.value)}%)`;
        case 'css':
            return alpha.value < 100
                ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`
                : currentColor.value;
        default:
            return currentColor.value;
    }
});

// Update functions
function updateHue(event: Event) {
    hue.value = parseInt((event.target as HTMLInputElement).value);
    emitColorChange();
}

function updateAlpha(event: Event) {
    alpha.value = parseInt((event.target as HTMLInputElement).value);
    emitColorChange();
}

function updateFormat(event: Event) {
    format.value = (event.target as HTMLSelectElement).value as 'hex' | 'rgb' | 'hsl' | 'css';
}

function emitColorChange() {
    const color = currentColorWithAlpha.value;
    emit('update:modelValue', color);
    emit('change', color);
}

function selectPreset(preset: string) {
    initFromColor(preset);
    emitColorChange();
}

// Pointer handling for color selection area
function handlePointerDown(event: PointerEvent) {
    if (!selectionRef.value) return;

    const rect = selectionRef.value.getBoundingClientRect();
    updateFromPosition(event.clientX, event.clientY, rect);

    const handlePointerMove = (e: PointerEvent) => {
        updateFromPosition(e.clientX, e.clientY, rect);
    };

    const handlePointerUp = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
}

function updateFromPosition(clientX: number, clientY: number, rect: DOMRect) {
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    saturation.value = Math.round(x * 100);
    brightness.value = Math.round((1 - y) * 100);

    emitColorChange();
}

// EyeDropper
async function openEyeDropper() {
    if (!supportsEyeDropper) return;

    try {
        // @ts-expect-error - EyeDropper API is experimental
        const eyeDropper = new EyeDropper();
        const result = await eyeDropper.open();
        initFromColor(result.sRGBHex);
        emitColorChange();
    } catch (error) {
        console.error('EyeDropper failed:', error);
    }
}

// Color utility functions
function parseColor(color: string): { r: number; g: number; b: number; a?: number } {
    // Hex color
    if (color.startsWith('#')) {
        const hex = color.slice(1);
        if (hex.length === 3) {
            return {
                r: parseInt(hex[0] + hex[0], 16),
                g: parseInt(hex[1] + hex[1], 16),
                b: parseInt(hex[2] + hex[2], 16)
            };
        } else if (hex.length === 6) {
            return {
                r: parseInt(hex.slice(0, 2), 16),
                g: parseInt(hex.slice(2, 4), 16),
                b: parseInt(hex.slice(4, 6), 16)
            };
        } else if (hex.length === 8) {
            return {
                r: parseInt(hex.slice(0, 2), 16),
                g: parseInt(hex.slice(2, 4), 16),
                b: parseInt(hex.slice(4, 6), 16),
                a: parseInt(hex.slice(6, 8), 16) / 255
            };
        }
    }

    // RGB/RGBA color
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbMatch) {
        return {
            r: parseInt(rgbMatch[1]),
            g: parseInt(rgbMatch[2]),
            b: parseInt(rgbMatch[3]),
            a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1
        };
    }

    // HSL color
    const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (hslMatch) {
        const h = parseInt(hslMatch[1]);
        const s = parseInt(hslMatch[2]);
        const l = parseInt(hslMatch[3]);
        const rgb = hslToRgb(h, s, l);
        return rgb;
    }

    // Default to black
    return { r: 0, g: 0, b: 0, a: 1 };
}

function rgbToHsb(r: number, g: number, b: number): { h: number; s: number; b: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    let s = 0;
    let v = max;

    if (diff !== 0) {
        s = diff / max;

        switch (max) {
            case r:
                h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / diff + 2) / 6;
                break;
            case b:
                h = ((r - g) / diff + 4) / 6;
                break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        b: Math.round(v * 100)
    };
}

function hsbToRgb(h: number, s: number, b: number): { r: number; g: number; b: number } {
    s /= 100;
    b /= 100;

    const c = b * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = b - c;

    let r = 0, g = 0, b_ = 0;

    if (h >= 0 && h < 60) {
        r = c; g = x; b_ = 0;
    } else if (h >= 60 && h < 120) {
        r = x; g = c; b_ = 0;
    } else if (h >= 120 && h < 180) {
        r = 0; g = c; b_ = x;
    } else if (h >= 180 && h < 240) {
        r = 0; g = x; b_ = c;
    } else if (h >= 240 && h < 300) {
        r = x; g = 0; b_ = c;
    } else {
        r = c; g = 0; b_ = x;
    }

    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b_ + m) * 255)
    };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b_ = 0;

    if (h >= 0 && h < 60) {
        r = c; g = x; b_ = 0;
    } else if (h >= 60 && h < 120) {
        r = x; g = c; b_ = 0;
    } else if (h >= 120 && h < 180) {
        r = 0; g = c; b_ = x;
    } else if (h >= 180 && h < 240) {
        r = 0; g = x; b_ = c;
    } else if (h >= 240 && h < 300) {
        r = x; g = 0; b_ = c;
    } else {
        r = c; g = 0; b_ = x;
    }

    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b_ + m) * 255)
    };
}

function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
</script>

<style scoped>
.hue-slider {
    background: linear-gradient(90deg, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000);
}

.hue-slider::-webkit-slider-thumb,
.alpha-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    border: 2px solid hsl(var(--primary));
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.hue-slider::-moz-range-thumb,
.alpha-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    border: 2px solid hsl(var(--primary));
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.hue-slider::-webkit-slider-runnable-track,
.alpha-slider::-webkit-slider-runnable-track {
    height: 12px;
    border-radius: 6px;
    background: transparent;
}

.hue-slider::-moz-range-track,
.alpha-slider::-moz-range-track {
    height: 12px;
    border-radius: 6px;
    background: transparent;
}
</style>
