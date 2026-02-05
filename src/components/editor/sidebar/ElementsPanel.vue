<template>
  <div class="space-y-6">
    <!-- Lines Section -->
    <div>
      <h3 class="text-sm font-medium mb-3">Lines</h3>
      <div class="grid grid-cols-2 gap-3">
        <!-- Simple Line -->
        <button
          @click="addLine('simple')"
          class="p-4 border rounded-xl hover:border-primary hover:bg-muted/50 transition-all flex flex-col items-center gap-2"
        >
          <div class="w-16 h-0.5 bg-current" />
          <span class="text-xs text-muted-foreground">Simple</span>
        </button>

        <!-- Dashed Line -->
        <button
          @click="addLine('dashed')"
          class="p-4 border rounded-xl hover:border-primary hover:bg-muted/50 transition-all flex flex-col items-center gap-2"
        >
          <div class="w-16 h-0.5 border-t-2 border-dashed border-current" />
          <span class="text-xs text-muted-foreground">Dashed</span>
        </button>

        <!-- Arrow Line -->
        <button
          @click="addArrow()"
          class="p-4 border rounded-xl hover:border-primary hover:bg-muted/50 transition-all flex flex-col items-center gap-2"
        >
          <div class="flex items-center">
            <div class="w-12 h-0.5 bg-current" />
            <svg class="w-3 h-3 -ml-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </div>
          <span class="text-xs text-muted-foreground">Arrow</span>
        </button>

        <!-- Dot Line -->
        <button
          @click="addLine('dot')"
          class="p-4 border rounded-xl hover:border-primary hover:bg-muted/50 transition-all flex flex-col items-center gap-2"
        >
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-full bg-current" />
            <div class="w-10 h-0.5 border-t-2 border-dotted border-current" />
            <div class="w-2 h-2 rounded-full bg-current" />
          </div>
          <span class="text-xs text-muted-foreground">Dot</span>
        </button>
      </div>
    </div>

    <div class="h-px bg-border" />

    <!-- Shapes Section -->
    <div>
      <h3 class="text-sm font-medium mb-3">Shapes</h3>
      <div class="grid grid-cols-2 gap-3">
        <!-- Rectangle -->
        <button
          @click="addShape('rect')"
          class="p-4 border rounded-xl hover:border-primary hover:bg-muted/50 transition-all flex flex-col items-center gap-2"
        >
          <div class="w-12 h-10 bg-muted border-2 border-current rounded-sm" />
          <span class="text-xs text-muted-foreground">Rectangle</span>
        </button>

        <!-- Circle -->
        <button
          @click="addShape('circle')"
          class="p-4 border rounded-xl hover:border-primary hover:bg-muted/50 transition-all flex flex-col items-center gap-2"
        >
          <div class="w-12 h-12 bg-muted border-2 border-current rounded-full" />
          <span class="text-xs text-muted-foreground">Circle</span>
        </button>

        <!-- Ellipse -->
        <button
          @click="addShape('ellipse')"
          class="p-4 border rounded-xl hover:border-primary hover:bg-muted/50 transition-all flex flex-col items-center gap-2"
        >
          <div class="w-14 h-8 bg-muted border-2 border-current rounded-[50%]" />
          <span class="text-xs text-muted-foreground">Ellipse</span>
        </button>

        <!-- Square -->
        <button
          @click="addShape('square')"
          class="p-4 border rounded-xl hover:border-primary hover:bg-muted/50 transition-all flex flex-col items-center gap-2"
        >
          <div class="w-10 h-10 bg-muted border-2 border-current rounded-sm" />
          <span class="text-xs text-muted-foreground">Square</span>
        </button>

        <!-- Star 5p -->
        <button
          @click="addStar(5)"
          class="p-4 border rounded-xl hover:border-primary hover:bg-muted/50 transition-all flex flex-col items-center gap-2"
        >
          <svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polygon points="12,2 15,9 22,9 16,14 18,22 12,17 6,22 8,14 2,9 9,9" fill="#d1d5db" stroke="currentColor"/>
          </svg>
          <span class="text-xs text-muted-foreground">Star 5p</span>
        </button>

        <!-- Star 6p -->
        <button
          @click="addStar(6)"
          class="p-4 border rounded-xl hover:border-primary hover:bg-muted/50 transition-all flex flex-col items-center gap-2"
        >
          <svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polygon points="12,2 14,8 20,8 15,12 17,18 12,14 7,18 9,12 4,8 10,8" fill="#d1d5db" stroke="currentColor"/>
          </svg>
          <span class="text-xs text-muted-foreground">Star 6p</span>
        </button>

        <!-- Triangle -->
        <button
          @click="addShape('triangle')"
          class="p-4 border rounded-xl hover:border-primary hover:bg-muted/50 transition-all flex flex-col items-center gap-2"
        >
          <svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polygon points="12,4 20,20 4,20" fill="#d1d5db" stroke="currentColor"/>
          </svg>
          <span class="text-xs text-muted-foreground">Triangle</span>
        </button>

        <!-- Pentagon -->
        <button
          @click="addShape('pentagon')"
          class="p-4 border rounded-xl hover:border-primary hover:bg-muted/50 transition-all flex flex-col items-center gap-2"
        >
          <svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polygon points="12,2 22,9 18,20 6,20 2,9" fill="#d1d5db" stroke="currentColor"/>
          </svg>
          <span class="text-xs text-muted-foreground">Pentagon</span>
        </button>

        <!-- Hexagon -->
        <button
          @click="addShape('hexagon')"
          class="p-4 border rounded-xl hover:border-primary hover:bg-muted/50 transition-all flex flex-col items-center gap-2"
        >
          <svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill="#d1d5db" stroke="currentColor"/>
          </svg>
          <span class="text-xs text-muted-foreground">Hexagon</span>
        </button>

        <!-- Heart -->
        <button
          @click="addHeart()"
          class="p-4 border rounded-xl hover:border-primary hover:bg-muted/50 transition-all flex flex-col items-center gap-2"
        >
          <svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#d1d5db" stroke="currentColor"/>
          </svg>
          <span class="text-xs text-muted-foreground">Heart</span>
        </button>

        <!-- Double Arrow -->
        <button
          @click="addDoubleArrow()"
          class="p-4 border rounded-xl hover:border-primary hover:bg-muted/50 transition-all flex flex-col items-center gap-2"
        >
          <svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4" fill="#d1d5db" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="text-xs text-muted-foreground">Double Arrow</span>
        </button>
      </div>
    </div>

    <div class="h-px bg-border" />

    <!-- SVG Import Section -->
    <div>
      <h3 class="text-sm font-medium mb-3">Import SVG</h3>
      <div class="p-4 border-2 border-dashed border-muted rounded-xl bg-muted/30 text-center">
        <input
          ref="svgInput"
          type="file"
          accept=".svg"
          multiple
          class="hidden"
          @change="handleSvgUpload"
        />
        <button
          @click="$refs.svgInput.click()"
          class="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span class="flex items-center justify-center gap-2">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Select SVG Files
          </span>
        </button>
        <p class="text-xs text-muted-foreground mt-2">
          Import as editable group
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from "../../../stores/editor";
import { toast } from "vue-sonner";

const editorStore = useEditorStore();

function addLine(type: "simple" | "dashed" | "dot") {
  const centerX = editorStore.canvasWidth / 2;
  const centerY = editorStore.canvasHeight / 2;

  const configs = {
    simple: {
      points: [0, 0, 100, 0],
      stroke: "#000000",
      strokeWidth: 2,
    },
    dashed: {
      points: [0, 0, 100, 0],
      stroke: "#000000",
      strokeWidth: 2,
      dash: [10, 5],
    },
    dot: {
      points: [0, 0, 100, 0],
      stroke: "#000000",
      strokeWidth: 2,
      dash: [2, 5],
    },
  };

  editorStore.addLayer("line", {
    ...configs[type],
    x: centerX - 50,
    y: centerY,
  });

  toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} line added`);
}

function addArrow() {
  const centerX = editorStore.canvasWidth / 2;
  const centerY = editorStore.canvasHeight / 2;

  // Konva.Arrow uses points, pointerLength, pointerWidth
  editorStore.addLayer("arrow", {
    points: [0, 0, 100, 0],
    stroke: "#000000",
    strokeWidth: 2,
    pointerLength: 15,
    pointerWidth: 12,
    pointerAtEnding: true,
    x: centerX - 50,
    y: centerY,
  });

  toast.success("Arrow added");
}

function addStar(points: number = 5) {
  const centerX = editorStore.canvasWidth / 2;
  const centerY = editorStore.canvasHeight / 2;

  // Konva.Star uses numPoints, innerRadius, outerRadius
  editorStore.addLayer("star", {
    numPoints: points,
    innerRadius: points === 6 ? 25 : 30,
    outerRadius: 60,
    fill: "#3b82f6",
    stroke: "#1e40af",
    strokeWidth: 2,
    x: centerX,
    y: centerY,
  });

  toast.success(`Star ${points}p added`);
}

function addShape(type: "rect" | "circle" | "ellipse" | "square" | "triangle" | "pentagon" | "hexagon") {
  const centerX = editorStore.canvasWidth / 2;
  const centerY = editorStore.canvasHeight / 2;

  const defaultFill = "#3b82f6";
  const defaultStroke = "#1e40af";

  switch (type) {
    case "rect":
      editorStore.addLayer("rect", {
        width: 120,
        height: 80,
        fill: defaultFill,
        stroke: defaultStroke,
        strokeWidth: 2,
        x: centerX,
        y: centerY,
      });
      break;

    case "circle":
      editorStore.addLayer("circle", {
        radius: 50,
        fill: defaultFill,
        stroke: defaultStroke,
        strokeWidth: 2,
        x: centerX,
        y: centerY,
      });
      break;

    case "ellipse":
      // Konva.Ellipse uses radiusX and radiusY
      editorStore.addLayer("ellipse", {
        radiusX: 60,
        radiusY: 40,
        fill: defaultFill,
        stroke: defaultStroke,
        strokeWidth: 2,
        x: centerX,
        y: centerY,
      });
      break;

    case "square":
      editorStore.addLayer("rect", {
        width: 100,
        height: 100,
        fill: defaultFill,
        stroke: defaultStroke,
        strokeWidth: 2,
        x: centerX,
        y: centerY,
      });
      break;

    case "triangle":
      // Konva.RegularPolygon uses sides and radius (triangle = 3 sides)
      editorStore.addLayer("polygon", {
        sides: 3,
        radius: 60,
        fill: defaultFill,
        stroke: defaultStroke,
        strokeWidth: 2,
        x: centerX,
        y: centerY,
      });
      break;

    case "pentagon":
      // Konva.RegularPolygon uses sides and radius (pentagon = 5 sides)
      editorStore.addLayer("polygon", {
        sides: 5,
        radius: 60,
        fill: defaultFill,
        stroke: defaultStroke,
        strokeWidth: 2,
        x: centerX,
        y: centerY,
      });
      break;

    case "hexagon":
      // Konva.RegularPolygon uses sides and radius (hexagon = 6 sides)
      editorStore.addLayer("polygon", {
        sides: 6,
        radius: 60,
        fill: defaultFill,
        stroke: defaultStroke,
        strokeWidth: 2,
        x: centerX,
        y: centerY,
      });
      break;
  }

  toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added`);
}

function addHeart() {
  const centerX = editorStore.canvasWidth / 2;
  const centerY = editorStore.canvasHeight / 2;

  // Konva.Path for heart shape
  editorStore.addLayer("path", {
    data: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
    fill: "#3b82f6",
    stroke: "#1e40af",
    strokeWidth: 2,
    scaleX: 3,
    scaleY: 3,
    x: centerX - 36,
    y: centerY - 32,
  });

  toast.success("Heart added");
}

function addDoubleArrow() {
  const centerX = editorStore.canvasWidth / 2;
  const centerY = editorStore.canvasHeight / 2;

  // Konva.Path for double-headed arrow
  editorStore.addLayer("path", {
    data: "M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4",
    fill: "#3b82f6",
    stroke: "#1e40af",
    strokeWidth: 3,
    scaleX: 2,
    scaleY: 2,
    x: centerX - 24,
    y: centerY - 24,
  });

  toast.success("Double arrow added");
}

async function handleSvgUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  
  if (!files || files.length === 0) return;
  
  for (const file of files) {
    if (!file.name.endsWith('.svg')) continue;
    
    try {
      const text = await file.text();
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(text, 'image/svg+xml');
      
      // Check for parse errors
      const parseError = svgDoc.querySelector('parsererror');
      if (parseError) {
        console.warn(`Parse error in ${file.name}`);
        continue;
      }
      
      const svg = svgDoc.querySelector('svg');
      if (!svg) continue;

      const children: any[] = [];
      let width = 100;
      let height = 100;
      
      // Try to get dimensions from viewBox
      const viewBox = svg.getAttribute('viewBox');
      if (viewBox) {
        const parts = viewBox.split(/\s+|,/).map(parseFloat);
        if (parts.length === 4) {
          width = parts[2];
          height = parts[3];
        }
      }
      
      // Fallback to width/height attributes
      if (svg.getAttribute('width')) width = parseFloat(svg.getAttribute('width')!);
      if (svg.getAttribute('height')) height = parseFloat(svg.getAttribute('height')!);

      // Extract paths
      const paths = svgElement.querySelectorAll('path');
      paths.forEach((path, idx) => {
        const d = path.getAttribute('d');
        if (d) {
          children.push({
            type: 'path',
            name: `Path ${idx + 1}`,
            data: d,
            fill: path.getAttribute('fill') || '#3b82f6',
            stroke: path.getAttribute('stroke') || '#1e40af',
            strokeWidth: parseFloat(path.getAttribute('stroke-width') || '2'),
            scaleX: 1, // Reset scale since we use actual dimensions
            scaleY: 1,
            width: width, // Pass full SVG dimensions to help with hit testing
            height: height,
          });
        }
      });
      
      // Extract polygons
      const polygons = svgElement.querySelectorAll('polygon');
      polygons.forEach((poly, idx) => {
        const points = poly.getAttribute('points');
        if (points) {
          children.push({
            type: 'path',
            name: `Polygon ${idx + 1}`,
            data: `M${points.trim().replace(/\s+/g, ' L')} z`,
            fill: poly.getAttribute('fill') || '#3b82f6',
            stroke: poly.getAttribute('stroke') || '#1e40af',
            strokeWidth: parseFloat(poly.getAttribute('stroke-width') || '2'),
            scaleX: 1,
            scaleY: 1,
            width: width,
            height: height,
          });
        }
      });
      
      if (children.length > 0) {
        const name = file.name.replace('.svg', '').replace(/[-_]/g, ' ');
        editorStore.addGroup(name, children);
        toast.success(`Imported "${name}" with ${children.length} elements`);
      } else {
        toast.error(`No elements found in ${file.name}`);
      }
      
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
      toast.error(`Failed to import ${file.name}`);
    }
  }
  
  // Reset input
  input.value = '';
}
</script>
