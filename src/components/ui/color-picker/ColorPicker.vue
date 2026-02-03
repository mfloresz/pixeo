<template>
  <div class="flex flex-col gap-3 w-64 p-4 bg-background border rounded-lg shadow-lg">
    <!-- Color Selection Area -->
    <div
      ref="selectionRef"
      class="relative h-32 w-full cursor-crosshair rounded-md"
      :style="{ background: selectionGradient }"
      @mousedown="startDragging"
      @mousemove="handleDrag"
      @mouseup="stopDragging"
      @mouseleave="stopDragging"
    >
      <div
        class="absolute h-4 w-4 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        :style="{
          left: `${saturation}%`,
          top: `${100 - lightness}%`,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
        }"
      />
    </div>

    <!-- Hue Slider -->
    <div class="relative h-4 w-full">
      <input
        v-model.number="hue"
        type="range"
        min="0"
        max="360"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div
        class="absolute inset-0 rounded-full h-3 my-0.5"
        :style="{
          background: 'linear-gradient(90deg, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)',
        }"
      />
      <div
        class="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-primary/50 bg-background shadow pointer-events-none"
        :style="{ left: `calc(${(hue / 360) * 100}% - 8px)` }"
      />
    </div>

    <!-- Alpha Slider -->
    <div class="relative h-4 w-full">
      <input
        v-model.number="alpha"
        type="range"
        min="0"
        max="100"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div
        class="absolute inset-0 rounded-full h-3 my-0.5 overflow-hidden"
        :style="{
          backgroundImage: `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==')`,
        }"
      >
        <div
          class="absolute inset-0 rounded-full"
          :style="{
            background: `linear-gradient(to right, transparent, ${solidColor})`,
          }"
        />
      </div>
      <div
        class="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-primary/50 bg-background shadow pointer-events-none"
        :style="{ left: `calc(${alpha}% - 8px)` }"
      />
    </div>

    <!-- Format Selection & Output -->
    <div class="flex items-center gap-2">
      <select
        v-model="mode"
        class="h-8 w-20 shrink-0 text-xs bg-muted rounded px-2"
      >
        <option value="hex">HEX</option>
        <option value="rgb">RGB</option>
        <option value="hsl">HSL</option>
      </select>

      <div class="flex-1 flex items-center">
        <input
          v-if="mode === 'hex'"
          v-model="hexValue"
          type="text"
          class="h-8 w-full bg-muted px-2 text-xs rounded"
          readonly
        />
        <div v-else-if="mode === 'rgb'" class="flex gap-1">
          <input
            v-for="(val, i) in rgbValues"
            :key="i"
            :value="val"
            type="text"
            class="h-8 w-12 bg-muted px-1 text-xs rounded text-center"
            readonly
          />
        </div>
        <div v-else-if="mode === 'hsl'" class="flex gap-1">
          <input
            v-for="(val, i) in hslValues"
            :key="i"
            :value="val"
            type="text"
            class="h-8 w-12 bg-muted px-1 text-xs rounded text-center"
            readonly
          />
        </div>
      </div>

      <!-- Eye Dropper -->
      <button
        v-if="supportsEyeDropper"
        @click="openEyeDropper"
        class="h-8 w-8 shrink-0 flex items-center justify-center rounded border hover:bg-muted transition-colors"
        title="Pick color from screen"
      >
        <PipetteIcon class="w-4 h-4" />
      </button>
    </div>

    <!-- Color Preview -->
    <div class="flex items-center gap-2">
      <div
        class="w-8 h-8 rounded border shadow-sm"
        :style="{ backgroundColor: colorValue }"
      />
      <span class="text-xs text-muted-foreground font-mono">{{ colorValue }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { PipetteIcon } from "lucide-vue-next";

const props = defineProps<{
  modelValue?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
}>();

// Parse initial color
function parseColor(color: string) {
  const div = document.createElement("div");
  div.style.color = color;
  document.body.appendChild(div);
  const computedColor = getComputedStyle(div).color;
  document.body.removeChild(div);
  
  const match = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return { h: 0, s: 100, l: 50, a: 100 };
  
  const r = parseInt(match[1]) / 255;
  const g = parseInt(match[2]) / 255;
  const b = parseInt(match[3]) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  
  let h = 0;
  let s = 0;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: 100,
  };
}

const initialColor = parseColor(props.modelValue || "#000000");

const hue = ref(initialColor.h);
const saturation = ref(initialColor.s);
const lightness = ref(initialColor.l);
const alpha = ref(initialColor.a);
const mode = ref("hex");
const isDragging = ref(false);

const selectionRef = ref<HTMLDivElement | null>(null);

const supportsEyeDropper = ref(false);

// Check for EyeDropper API support
if (typeof window !== "undefined") {
  supportsEyeDropper.value = "EyeDropper" in window;
}

const selectionGradient = computed(() => {
  return `linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0)),
          linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0)),
          hsl(${hue.value}, 100%, 50%)`;
});

const solidColor = computed(() => {
  return `hsl(${hue.value}, ${saturation.value}%, ${lightness.value}%)`;
});

const colorValue = computed(() => {
  if (alpha.value < 100) {
    const rgb = hslToRgb(hue.value, saturation.value, lightness.value);
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha.value / 100})`;
  }
  return hslToHex(hue.value, saturation.value, lightness.value);
});

const hexValue = computed(() => {
  return hslToHex(hue.value, saturation.value, lightness.value);
});

const rgbValues = computed(() => {
  const rgb = hslToRgb(hue.value, saturation.value, lightness.value);
  return rgb.map(v => Math.round(v));
});

const hslValues = computed(() => {
  return [Math.round(hue.value), Math.round(saturation.value), Math.round(lightness.value)];
});

function hslToRgb(h: number, s: number, l: number): number[] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
}

function hslToHex(h: number, s: number, l: number): string {
  const rgb = hslToRgb(h, s, l);
  return "#" + rgb.map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

function startDragging(e: MouseEvent) {
  isDragging.value = true;
  updateFromPosition(e);
}

function handleDrag(e: MouseEvent) {
  if (!isDragging.value || !selectionRef.value) return;
  updateFromPosition(e);
}

function stopDragging() {
  isDragging.value = false;
}

function updateFromPosition(e: MouseEvent) {
  if (!selectionRef.value) return;
  
  const rect = selectionRef.value.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
  
  saturation.value = x * 100;
  lightness.value = (1 - y) * 100;
}

async function openEyeDropper() {
  try {
    // @ts-ignore - EyeDropper API is experimental
    const eyeDropper = new window.EyeDropper();
    const result = await eyeDropper.open();
    
    if (result && result.sRGBHex) {
      const parsed = parseColor(result.sRGBHex);
      hue.value = parsed.h;
      saturation.value = parsed.s;
      lightness.value = parsed.l;
      alpha.value = 100;
    }
  } catch (error) {
    console.error("EyeDropper failed:", error);
  }
}

// Emit changes
watch([hue, saturation, lightness, alpha], () => {
  const value = colorValue.value;
  emit("update:modelValue", value);
  emit("change", value);
});

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (!newValue) return;
  const parsed = parseColor(newValue);
  hue.value = parsed.h;
  saturation.value = parsed.s;
  lightness.value = parsed.l;
  alpha.value = parsed.a;
});
</script>
