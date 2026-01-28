coemplate>
    <div class="space-y-4">
        <h4 class="text-sm font-medium">Text Styles</h4>

        <!-- Text Alignment -->
        <div class="space-y-2">
            <Label class="text-xs text-muted-foreground">Alignment</Label>
            <div class="flex gap-1">
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
        </div>

        <!-- Font Styles -->
        <div class="space-y-2">
            <Label class="text-xs text-muted-foreground">Styles</Label>
            <div class="flex gap-1">
                <Button
                    v-for="style in fontStyles"
                    :key="style.value"
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8"
                    :class="{ 'bg-accent': style.active }"
                    @click="toggleStyle(style.value)"
                >
                    <component :is="style.icon" class="w-4 h-4" />
                </Button>
            </div>
        </div>

        <Separator />

        <!-- Line Height (for multi-line text) -->
        <div class="space-y-2" v-if="isMultiLine">
            <div class="flex justify-between">
                <Label class="text-xs text-muted-foreground">Line Height</Label>
                <span class="text-xs">{{ currentLineHeight }}</span>
            </div>
            <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                :value="currentLineHeight"
                @input="(e) => changeLineHeight(parseFloat((e.target as HTMLInputElement).value))"
                class="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer"
            />
        </div>

        <!-- Letter Spacing -->
        <div class="space-y-2">
            <div class="flex justify-between">
                <Label class="text-xs text-muted-foreground">Letter Spacing</Label>
                <span class="text-xs">{{ currentLetterSpacing }}</span>
            </div>
            <input
                type="range"
                min="-5"
                max="20"
                step="1"
                :value="currentLetterSpacing"
                @input="(e) => changeLetterSpacing(parseInt((e.target as HTMLInputElement).value))"
                class="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useCanvaStore } from '../../stores/canva';
import { useEditor } from '../../composables/canva/useEditor';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import {
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Bold,
    Italic,
    Underline,
    Strikethrough
} from 'lucide-vue-next';
import { fabric } from '../../lib/fabric';

const store = useCanvaStore();
const { selectedObject, canvas } = storeToRefs(store);
const editor = useEditor();

const isTextObject = computed(() => {
    return selectedObject.value instanceof fabric.IText;
});

const isMultiLine = computed(() => {
    if (!isTextObject.value || !selectedObject.value) return false;
    const text = (selectedObject.value as fabric.IText).text;
    return text?.includes('\n') || false;
});

const currentAlign = computed(() => {
    if (!isTextObject.value || !selectedObject.value) return 'left';
    return (selectedObject.value as fabric.IText).textAlign || 'left';
});

const currentLineHeight = computed(() => {
    if (!isTextObject.value || !selectedObject.value) return 1.16;
    return (selectedObject.value as fabric.IText).lineHeight || 1.16;
});

const fontStyles = computed(() => [
    { value: 'fontWeight', icon: Bold, active: isBold.value },
    { value: 'fontStyle', icon: Italic, active: isItalic.value },
    { value: 'underline', icon: Underline, active: isUnderline.value },
    { value: 'linethrough', icon: Strikethrough, active: isStrikethrough.value }
]);

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

const currentLetterSpacing = computed(() => {
    if (!isTextObject.value || !selectedObject.value) return 0;
    // @ts-ignore - charSpacing is available in Fabric.js
    const spacing = (selectedObject.value as fabric.IText).charSpacing || 0;
    return Math.round(spacing / 10); // Convert from 1/1000 to readable value
});

const alignments = [
    { value: 'left', icon: AlignLeft },
    { value: 'center', icon: AlignCenter },
    { value: 'right', icon: AlignRight },
    { value: 'justify', icon: AlignJustify }
];

function changeTextAlign(align: string) {
    if (!canvas.value || !selectedObject.value) return;
    if (selectedObject.value instanceof fabric.IText) {
        selectedObject.value.set('textAlign', align);
        canvas.value.renderAll();
        store.saveState();
    }
}

function toggleStyle(style: string) {
    if (!canvas.value || !selectedObject.value) return;
    if (!(selectedObject.value instanceof fabric.IText)) return;

    const text = selectedObject.value as fabric.IText;

    switch (style) {
        case 'fontWeight':
            text.set('fontWeight', text.fontWeight === 'bold' ? 'normal' : 'bold');
            break;
        case 'fontStyle':
            text.set('fontStyle', text.fontStyle === 'italic' ? 'normal' : 'italic');
            break;
        case 'underline':
            text.set('underline', !text.underline);
            break;
        case 'linethrough':
            text.set('linethrough', !text.linethrough);
            break;
    }

    canvas.value.renderAll();
    store.saveState();
}

function changeLineHeight(lineHeight: number) {
    if (!canvas.value || !selectedObject.value) return;
    if (selectedObject.value instanceof fabric.IText) {
        selectedObject.value.set('lineHeight', lineHeight);
        canvas.value.renderAll();
        store.saveState();
    }
}

function changeLetterSpacing(spacing: number) {
    editor.changeLetterSpacing(spacing);
}
</script>
