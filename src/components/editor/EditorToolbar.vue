<template>
  <div class="flex flex-col items-center py-4 gap-2">
    <!-- Select Tool -->
    <button
      @click="setTool('select')"
      :class="[
        'p-3 rounded-xl transition-all',
        activeTool === 'select' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      ]"
      title="Select"
    >
      <MousePointer2 class="w-5 h-5" />
    </button>
    
    <div class="w-8 h-px bg-border my-1" />
    
    <!-- Text Tool -->
    <button
      @click="addText"
      :class="[
        'p-3 rounded-xl transition-all',
        activeTool === 'text' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      ]"
      title="Add Text"
    >
      <Type class="w-5 h-5" />
    </button>
    
    <!-- Image Tool -->
    <button
      @click="triggerImageUpload"
      class="p-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
      title="Add Image"
    >
      <ImageIcon class="w-5 h-5" />
    </button>
    <input
      ref="imageInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleImageUpload"
    />
    
    <div class="w-8 h-px bg-border my-1" />
    
    <!-- Rectangle Tool -->
    <button
      @click="addRectangle"
      :class="[
        'p-3 rounded-xl transition-all',
        activeTool === 'rect' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      ]"
      title="Add Rectangle"
    >
      <Square class="w-5 h-5" />
    </button>
    
    <!-- Circle Tool -->
    <button
      @click="addCircle"
      :class="[
        'p-3 rounded-xl transition-all',
        activeTool === 'circle' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      ]"
      title="Add Circle"
    >
      <Circle class="w-5 h-5" />
    </button>
    
    <!-- Line Tool -->
    <button
      @click="addLine"
      :class="[
        'p-3 rounded-xl transition-all',
        activeTool === 'line' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      ]"
      title="Add Line"
    >
      <Minus class="w-5 h-5" />
    </button>
    
    <div class="w-8 h-px bg-border my-1" />
    
    <!-- Background Color -->
    <Popover>
      <PopoverTrigger as-child>
        <button
          class="p-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          title="Background Color"
        >
          <Palette class="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent class="w-64">
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium mb-2 block">Background Color</label>
            <div class="grid grid-cols-6 gap-2">
              <button
                v-for="color in presetColors"
                :key="color"
                @click="setBackgroundColor(color)"
                :class="[
                  'w-8 h-8 rounded-lg border-2 transition-all',
                  editorStore.backgroundColor === color ? 'border-primary scale-110' : 'border-transparent'
                ]"
                :style="{ backgroundColor: color }"
              />
            </div>
          </div>
          <div>
            <label class="text-sm font-medium mb-2 block">Custom Color</label>
            <input
              v-model="editorStore.backgroundColor"
              type="color"
              class="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label class="text-sm font-medium mb-2 block">Background Image</label>
            <div class="flex gap-2">
              <button
                @click="triggerBgImageUpload"
                class="flex-1 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors"
              >
                Upload
              </button>
              <button
                v-if="editorStore.backgroundImage"
                @click="clearBackgroundImage"
                class="px-3 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg text-sm transition-colors"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
    <input
      ref="bgImageInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleBgImageUpload"
    />
    
    <div class="flex-1" />
    
    <!-- Clear Canvas -->
    <AlertDialog>
      <AlertDialogTrigger as-child>
        <button
          class="p-3 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
          title="Clear Canvas"
        >
          <Trash2 class="w-5 h-5" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear Canvas?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove all layers from the canvas. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="editorStore.clearCanvas" class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Clear
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { MousePointer2, Type, Image as ImageIcon, Square, Circle, Minus, Palette, Trash2, X } from "lucide-vue-next";
import { useEditorStore } from "../../stores/editor";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const editorStore = useEditorStore();
const activeTool = ref("select");
const imageInput = ref<HTMLInputElement | null>(null);
const bgImageInput = ref<HTMLInputElement | null>(null);

const presetColors = [
  "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", "#cbd5e1", "#94a3b8",
  "#1e293b", "#0f172a", "#000000", "#ef4444", "#f97316", "#f59e0b",
  "#84cc16", "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
];

function setTool(tool: string) {
  activeTool.value = tool;
}

function addText() {
  activeTool.value = "text";
  editorStore.addLayer("text", {
    text: "Double click to edit",
    fontSize: 24,
    fontFamily: "Arial",
    fill: "#000000",
    x: editorStore.canvasWidth / 2 - 100,
    y: editorStore.canvasHeight / 2 - 20,
    width: 200,
    height: 50,
  });
}

function addRectangle() {
  activeTool.value = "rect";
  editorStore.addLayer("rect", {
    width: 100,
    height: 100,
    fill: "#3b82f6",
    x: editorStore.canvasWidth / 2 - 50,
    y: editorStore.canvasHeight / 2 - 50,
  });
}

function addCircle() {
  activeTool.value = "circle";
  editorStore.addLayer("circle", {
    radius: 50,
    fill: "#3b82f6",
    x: editorStore.canvasWidth / 2,
    y: editorStore.canvasHeight / 2,
  });
}

function addLine() {
  activeTool.value = "line";
  editorStore.addLayer("line", {
    points: [0, 0, 100, 0],
    stroke: "#000000",
    strokeWidth: 2,
    x: editorStore.canvasWidth / 2 - 50,
    y: editorStore.canvasHeight / 2,
  });
}

function triggerImageUpload() {
  imageInput.value?.click();
}

function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const src = e.target?.result as string;
    editorStore.addLayer("image", {
      src,
      x: editorStore.canvasWidth / 2,
      y: editorStore.canvasHeight / 2,
    });
  };
  reader.readAsDataURL(file);
  
  input.value = "";
}

function setBackgroundColor(color: string) {
  editorStore.setBackgroundColor(color);
}

function triggerBgImageUpload() {
  bgImageInput.value?.click();
}

function handleBgImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const src = e.target?.result as string;
    editorStore.setBackgroundImage(src);
  };
  reader.readAsDataURL(file);
  
  input.value = "";
}

function clearBackgroundImage() {
  editorStore.setBackgroundImage(undefined);
}
</script>
