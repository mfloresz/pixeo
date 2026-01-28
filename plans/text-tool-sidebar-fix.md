# Plan: Fix Sidebar Duplication for Text Tool

## Problem
When the Text tool is active (`activeTool === 'text'`), the Sidebar currently shows:
1. **Text Types** (Heading, Subheading, Paragraph) - CORRECT
2. **Font Selection** - DUPLICATED (already in toolbar)

The sidebar should only show the text types for adding new text, not font selection.

## Solution

Remove the "Font Selection" section from the sidebar when `activeTool === 'text'`.

## Implementation Steps

### Step 1: Modify Sidebar.vue - Remove Font Selection section

In `src/components/canva/Sidebar.vue`, lines 99-141, remove the font selection section.

**Current code (lines 99-141):**
```vue
<!-- Text Tool - Text Types & Font Selection -->
<div v-else-if="activeTool === 'text'" class="p-4 space-y-6">
    <!-- Text Types Section -->
    <div class="space-y-3">
        <h4 class="text-sm font-semibold text-muted-foreground">Add Text</h4>
        <div class="space-y-2">
            <button
                v-for="textType in textTypes"
                :key="textType.type"
                class="w-full text-left p-4 rounded-lg border hover:border-primary hover:bg-accent/50 transition-all group"
                @click="addTextByType(textType)"
            >
                <div
                    class="font-semibold text-foreground group-hover:text-primary transition-colors"
                    :style="{ fontSize: textType.previewSize + 'px', fontFamily: textType.fontFamily }"
                >
                    {{ textType.preview }}
                </div>
                <div class="text-xs text-muted-foreground mt-1">{{ textType.label }}</div>
            </button>
        </div>
    </div>

    <Separator />

    <!-- Font Selection Section -->
    <div class="space-y-3">
        <h4 class="text-sm font-semibold text-muted-foreground">Fonts</h4>
        <div class="space-y-1">
            <button
                v-for="font in fontFamilies"
                :key="font"
                class="w-full text-left px-3 py-3 rounded border hover:border-primary hover:bg-accent/50 transition-all"
                :class="{ 'border-primary bg-accent/30': selectedFont === font }"
                @click="selectFont(font)"
            >
                <span :style="{ fontFamily: font }" class="text-base">
                    {{ font }}
                </span>
            </button>
        </div>
    </div>
</div>
```

**New code:**
```vue
<!-- Text Tool - Text Types only -->
<div v-else-if="activeTool === 'text'" class="p-4 space-y-6">
    <!-- Text Types Section -->
    <div class="space-y-3">
        <h4 class="text-sm font-semibold text-muted-foreground">Add Text</h4>
        <div class="space-y-2">
            <button
                v-for="textType in textTypes"
                :key="textType.type"
                class="w-full text-left p-4 rounded-lg border hover:border-primary hover:bg-accent/50 transition-all group"
                @click="addTextByType(textType)"
            >
                <div
                    class="font-semibold text-foreground group-hover:text-primary transition-colors"
                    :style="{ fontSize: textType.previewSize + 'px', fontFamily: textType.fontFamily }"
                >
                    {{ textType.preview }}
                </div>
                <div class="text-xs text-muted-foreground mt-1">{{ textType.label }}</div>
            </button>
        </div>
    </div>
</div>
```

### Step 2: (Optional) Add helpful message
Add a message indicating that text formatting is available in the toolbar:

```vue
<!-- Text Tool - Text Types only -->
<div v-else-if="activeTool === 'text'" class="p-4 space-y-6">
    <!-- Text Types Section -->
    <div class="space-y-3">
        <h4 class="text-sm font-semibold text-muted-foreground">Add Text</h4>
        <div class="space-y-2">
            <!-- ... buttons ... -->
        </div>
    </div>
    
    <div class="text-xs text-muted-foreground text-center p-3 bg-muted rounded">
        Format text using the toolbar after adding
    </div>
</div>
```

### Step 3: Remove unused code
The following can be removed from Sidebar.vue if not used elsewhere:
- `selectedFont` ref (line 499)
- `selectFont` function (lines 656-658)
- `fontFamilies` array can stay if needed for textTypes

## Files to Modify

1. **src/components/canva/Sidebar.vue**
   - Remove lines 122-140 (Font Selection section)
   - Optionally remove related unused code

## Testing Checklist

- [ ] Click "T" (text tool) → Sidebar shows only "Add Text" with types (Heading, Subheading, Paragraph)
- [ ] Sidebar does NOT show font selection list
- [ ] Add a heading → Text is added
- [ ] Select the text → Toolbar shows all formatting options (font, size, styles, etc.)
- [ ] Sidebar can be toggled independently
