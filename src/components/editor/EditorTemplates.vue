<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="$emit('close')"
  >
    <div class="bg-background rounded-xl w-[600px] max-h-[80vh] flex flex-col shadow-xl">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="text-lg font-semibold">Choose Template</h3>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <!-- Categories -->
      <div class="flex gap-2 p-4 border-b overflow-x-auto">
        <button
          v-for="category in categories"
          :key="category"
          @click="selectedCategory = category"
          :class="[
            'px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors',
            selectedCategory === category ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
          ]"
        >
          {{ category }}
        </button>
      </div>
      
      <!-- Templates Grid -->
      <div class="flex-1 overflow-y-auto p-4">
        <div class="grid grid-cols-3 gap-4">
          <button
            v-for="template in filteredTemplates"
            :key="template.id"
            @click="selectTemplate(template)"
            class="group relative aspect-[3/4] bg-muted rounded-xl overflow-hidden hover:ring-2 hover:ring-primary transition-all text-left"
          >
            <!-- Template Preview -->
            <div 
              class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50"
              :style="getPreviewStyle(template)"
            >
              <component
                :is="getTemplateIcon(template.icon)"
                class="w-12 h-12 text-muted-foreground/50"
              />
            </div>
            
            <!-- Template Info -->
            <div class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <p class="text-white font-medium text-sm">{{ template.name }}</p>
              <p class="text-white/70 text-xs">{{ template.width }} × {{ template.height }}px</p>
            </div>
          </button>
        </div>
      </div>
      
      <!-- Custom Size -->
      <div class="p-4 border-t">
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium">Custom Size:</span>
          <div class="flex items-center gap-2">
            <input
              v-model.number="customWidth"
              type="number"
              placeholder="Width"
              class="w-24 px-3 py-2 bg-muted rounded-lg text-sm"
            />
            <span class="text-muted-foreground">×</span>
            <input
              v-model.number="customHeight"
              type="number"
              placeholder="Height"
              class="w-24 px-3 py-2 bg-muted rounded-lg text-sm"
            />
            <button
              @click="createCustom"
              class="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  X,
  Square,
  Smartphone,
  Facebook,
  Twitter,
  Youtube,
  FileText,
  CreditCard,
  Presentation,
  Settings,
  Image as ImageIcon,
} from "lucide-vue-next";
import { useEditorStore } from "../../stores/editor";
import type { EditorTemplate } from "../../types";

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  close: [];
  select: [template: EditorTemplate];
}>();

const editorStore = useEditorStore();
const selectedCategory = ref("All");
const customWidth = ref(800);
const customHeight = ref(600);

const categories = computed(() => {
  const cats = ["All", ...new Set(editorStore.availableTemplates.map(t => t.category))];
  return cats;
});

const filteredTemplates = computed(() => {
  if (selectedCategory.value === "All") {
    return editorStore.availableTemplates;
  }
  return editorStore.availableTemplates.filter(t => t.category === selectedCategory.value);
});

function getPreviewStyle(template: EditorTemplate) {
  const aspectRatio = template.width / template.height;
  if (aspectRatio > 1) {
    return { paddingTop: `${(1 / aspectRatio) * 100}%` };
  }
  return {};
}

function getTemplateIcon(iconName?: string) {
  switch (iconName) {
    case "smartphone": return Smartphone;
    case "facebook": return Facebook;
    case "twitter": return Twitter;
    case "youtube": return Youtube;
    case "file-text": return FileText;
    case "credit-card": return CreditCard;
    case "presentation": return Presentation;
    case "settings": return Settings;
    default: return ImageIcon;
  }
}

function selectTemplate(template: EditorTemplate) {
  emit("select", template);
}

function createCustom() {
  const template: EditorTemplate = {
    id: "custom",
    name: "Custom Size",
    width: customWidth.value,
    height: customHeight.value,
    category: "Custom",
  };
  emit("select", template);
}
</script>
