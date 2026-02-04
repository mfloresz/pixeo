<template>
  <div class="flex items-center gap-4">
    <!-- Group Child Indicator -->
    <div v-if="isEditingGroupChild" class="flex items-center gap-2 px-2 py-1 bg-primary/10 rounded-lg">
      <span class="text-xs text-primary">Editing: {{ currentTarget.name }}</span>
      <button 
        @click="exitGroupEdit"
        class="text-xs text-primary hover:underline"
      >
        Exit
      </button>
    </div>

    <div v-if="isEditingGroupChild" class="w-px h-6 bg-border" />

    <!-- Fill Color -->
    <Popover>
      <PopoverTrigger as-child>
        <button class="flex items-center gap-2 px-3 py-1.5 hover:bg-muted rounded-lg transition-colors">
          <div
            class="w-5 h-5 rounded border shadow-sm"
            :style="{ backgroundColor: currentTarget.fill || '#3b82f6' }"
          />
          <span class="text-sm">Fill</span>
        </button>
      </PopoverTrigger>
      <PopoverContent class="p-0 w-auto">
        <ColorPicker
          :model-value="currentTarget.fill || '#3b82f6'"
          @update:model-value="(val) => updateProperty('fill', val)"
        />
      </PopoverContent>
    </Popover>

    <div class="w-px h-6 bg-border" />

    <!-- Stroke Color -->
    <Popover>
      <PopoverTrigger as-child>
        <button class="flex items-center gap-2 px-3 py-1.5 hover:bg-muted rounded-lg transition-colors">
          <div
            class="w-5 h-5 rounded border shadow-sm"
            :style="{ backgroundColor: currentTarget.stroke || 'transparent' }"
          />
          <span class="text-sm">Stroke</span>
        </button>
      </PopoverTrigger>
      <PopoverContent class="p-0 w-auto">
        <ColorPicker
          :model-value="currentTarget.stroke || '#000000'"
          @update:model-value="(val) => updateProperty('stroke', val)"
        />
      </PopoverContent>
    </Popover>

    <div class="w-px h-6 bg-border" />

    <!-- Stroke Width -->
    <div class="flex items-center gap-2">
      <span class="text-xs text-muted-foreground">Stroke</span>
      <input
        v-model.number="currentTarget.strokeWidth"
        type="number"
        min="0"
        class="w-14 px-2 py-1 bg-muted rounded text-xs"
        @change="updateProperty('strokeWidth', currentTarget.strokeWidth)"
      />
    </div>

    <div class="w-px h-6 bg-border" />

    <!-- Dimensions (for rect) -->
    <template v-if="currentTarget.type === 'rect'">
      <div class="flex items-center gap-2">
        <span class="text-xs text-muted-foreground">W</span>
        <input
          v-model.number="currentTarget.width"
          type="number"
          class="w-14 px-2 py-1 bg-muted rounded text-xs"
          @change="updateProperty('width', currentTarget.width)"
        />
        <span class="text-xs text-muted-foreground">H</span>
        <input
          v-model.number="currentTarget.height"
          type="number"
          class="w-14 px-2 py-1 bg-muted rounded text-xs"
          @change="updateProperty('height', currentTarget.height)"
        />
      </div>
    </template>

    <!-- Radius (for circle) -->
    <template v-if="currentTarget.type === 'circle'">
      <div class="flex items-center gap-2">
        <span class="text-xs text-muted-foreground">Radius</span>
        <input
          v-model.number="currentTarget.radius"
          type="number"
          class="w-16 px-2 py-1 bg-muted rounded text-xs"
          @change="updateProperty('radius', currentTarget.radius)"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useEditorStore } from "../../../stores/editor";
import type { EditorLayer, GroupChild } from "../../../types";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const editorStore = useEditorStore();

const props = defineProps<{
  layer: EditorLayer;
}>();

const emit = defineEmits<{
  update: [key: keyof EditorLayer, value: any];
}>();

// Check if we're editing a group child
const isEditingGroupChild = computed(() => {
  return props.layer.type === 'group' && 
         props.layer.editingChildId && 
         props.layer.children;
});

// Get the current target (either the layer itself or the selected child)
const currentTarget = computed(() => {
  if (isEditingGroupChild.value && props.layer.children) {
    const child = props.layer.children.find(c => c.id === props.layer.editingChildId);
    if (child) {
      return child as GroupChild & { type: string; name: string };
    }
  }
  return props.layer;
});

function updateProperty(key: string, value: any) {
  if (isEditingGroupChild.value) {
    // Update the group child
    editorStore.updateGroupChild(
      props.layer.id,
      props.layer.editingChildId!,
      { [key]: value },
      true
    );
  } else {
    // Update the layer directly
    emit("update", key as keyof EditorLayer, value);
  }
}

function exitGroupEdit() {
  editorStore.selectGroupChild(props.layer.id, null);
}
</script>
