<template>
    <div class="w-80 bg-card border-r flex flex-col h-full">
        <!-- Header -->
        <div class="p-4 border-b">
            <h2 class="text-lg font-semibold">Templates</h2>
            <p class="text-sm text-muted-foreground">Choose a template to start</p>
        </div>

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
                        :style="{
                            background: getTemplateGradient(template)
                        }"
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Plus } from 'lucide-vue-next';
import { PREDEFINED_TEMPLATES, TEMPLATE_CATEGORIES } from '../../config/canvaTemplates';
import type { Template, TemplateCategory } from '../../types/canva';

const emit = defineEmits<{
    (e: 'selectTemplate', template: Template): void;
    (e: 'createCustom', width: number, height: number): void;
}>();

const selectedCategory = ref<string>('all');
const customWidth = ref<number>(1080);
const customHeight = ref<number>(1080);

const filteredTemplates = computed(() => {
    if (selectedCategory.value === 'all') {
        return PREDEFINED_TEMPLATES;
    }
    return PREDEFINED_TEMPLATES.filter(
        (t) => t.category === selectedCategory.value
    );
});

function selectTemplate(template: Template) {
    emit('selectTemplate', template);
}

function createCustomCanvas() {
    if (customWidth.value >= 100 && customHeight.value >= 100) {
        emit('createCustom', customWidth.value, customHeight.value);
    }
}

function getTemplateGradient(template: Template): string {
    // Generate a gradient based on template id
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
</script>
