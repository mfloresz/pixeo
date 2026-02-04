<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between p-3 border-b">
      <span class="text-sm font-medium">Layers</span>
      <span class="text-xs text-muted-foreground">{{ editorStore.layers.length }}</span>
    </div>
    
    <!-- Layers List -->
    <div class="flex-1 overflow-y-auto p-2 space-y-1">
      <div
        v-for="(layer, index) in reversedLayers"
        :key="layer.id"
        @click="editorStore.selectLayer(layer.id)"
        :class="[
          'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all',
          editorStore.selectedLayerId === layer.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/50 border border-transparent'
        ]"
      >
        <!-- Visibility Toggle -->
        <button
          @click.stop="editorStore.toggleLayerVisibility(layer.id)"
          class="p-1 rounded hover:bg-muted transition-colors"
          :class="layer.visible ? 'text-foreground' : 'text-muted-foreground'"
        >
          <Eye v-if="layer.visible" class="w-4 h-4" />
          <EyeOff v-else class="w-4 h-4" />
        </button>
        
        <!-- Lock Toggle -->
        <button
          @click.stop="editorStore.toggleLayerLock(layer.id)"
          class="p-1 rounded hover:bg-muted transition-colors"
          :class="layer.locked ? 'text-primary' : 'text-muted-foreground'"
        >
          <Lock v-if="layer.locked" class="w-4 h-4" />
          <Unlock v-else class="w-4 h-4" />
        </button>
        
        <!-- Layer Icon -->
        <component
          :is="getLayerIcon(layer.type)"
          class="w-4 h-4 text-muted-foreground"
        />
        
        <!-- Layer Name -->
        <span class="flex-1 text-sm truncate">{{ layer.name }}</span>
        
        <!-- Layer Actions -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button
              @click.stop
              class="p-1 rounded hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
              :class="{ 'opacity-100': editorStore.selectedLayerId === layer.id }"
            >
              <MoreVertical class="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="editorStore.duplicateLayer(layer.id)">
              <Copy class="w-4 h-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              @click="editorStore.moveLayer(layer.id, 'up')"
              :disabled="index === 0"
            >
              <ArrowUp class="w-4 h-4 mr-2" />
              Move Up
            </DropdownMenuItem>
            <DropdownMenuItem 
              @click="editorStore.moveLayer(layer.id, 'down')"
              :disabled="index === reversedLayers.length - 1"
            >
              <ArrowDown class="w-4 h-4 mr-2" />
              Move Down
            </DropdownMenuItem>
            <DropdownMenuItem @click="editorStore.moveLayer(layer.id, 'top')">
              <ArrowUpToLine class="w-4 h-4 mr-2" />
              Move to Top
            </DropdownMenuItem>
            <DropdownMenuItem @click="editorStore.moveLayer(layer.id, 'bottom')">
              <ArrowDownToLine class="w-4 h-4 mr-2" />
              Move to Bottom
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              @click="editorStore.deleteLayer(layer.id)"
              class="text-destructive focus:text-destructive"
            >
              <Trash2 class="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <!-- Empty State -->
      <div
        v-if="editorStore.layers.length === 0"
        class="text-center py-8 text-muted-foreground"
      >
        <Layers class="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p class="text-sm">No layers yet</p>
        <p class="text-xs mt-1">Add elements from the toolbar</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Minus,
  ArrowRight,
  Star,
  Triangle,
  MoreVertical,
  Copy,
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
  Trash2,
  Layers,
} from "lucide-vue-next";
import { useEditorStore } from "../../stores/editor";
import type { EditorLayerType } from "../../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const editorStore = useEditorStore();

const reversedLayers = computed(() => {
  return [...editorStore.layers].reverse();
});

function getLayerIcon(type: EditorLayerType) {
  switch (type) {
    case "text": return Type;
    case "image": return ImageIcon;
    case "rect": return Square;
    case "circle": return Circle;
    case "ellipse": return Circle;
    case "line": return Minus;
    case "arrow": return ArrowRight;
    case "star": return Star;
    case "polygon": return Triangle;
    default: return Square;
  }
}
</script>
