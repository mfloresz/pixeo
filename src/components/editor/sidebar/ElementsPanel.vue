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

        <!-- Star -->
        <button
          @click="addStar()"
          class="p-4 border rounded-xl hover:border-primary hover:bg-muted/50 transition-all flex flex-col items-center gap-2"
        >
          <svg class="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12,2 15,9 22,9 16,14 18,22 12,17 6,22 8,14 2,9 9,9"/>
          </svg>
          <span class="text-xs text-muted-foreground">Star</span>
        </button>

        <!-- Triangle -->
        <button
          @click="addShape('triangle')"
          class="p-4 border rounded-xl hover:border-primary hover:bg-muted/50 transition-all flex flex-col items-center gap-2"
        >
          <svg class="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12,4 20,20 4,20"/>
          </svg>
          <span class="text-xs text-muted-foreground">Triangle</span>
        </button>
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

function addStar() {
  const centerX = editorStore.canvasWidth / 2;
  const centerY = editorStore.canvasHeight / 2;

  // Konva.Star uses numPoints, innerRadius, outerRadius
  editorStore.addLayer("star", {
    numPoints: 5,
    innerRadius: 30,
    outerRadius: 60,
    fill: "#f59e0b",
    stroke: "#000000",
    strokeWidth: 2,
    x: centerX,
    y: centerY,
  });

  toast.success("Star added");
}

function addShape(type: "rect" | "circle" | "ellipse" | "square" | "triangle") {
  const centerX = editorStore.canvasWidth / 2;
  const centerY = editorStore.canvasHeight / 2;

  switch (type) {
    case "rect":
      editorStore.addLayer("rect", {
        width: 120,
        height: 80,
        fill: "#3b82f6",
        x: centerX,
        y: centerY,
      });
      break;

    case "circle":
      editorStore.addLayer("circle", {
        radius: 50,
        fill: "#3b82f6",
        x: centerX,
        y: centerY,
      });
      break;

    case "ellipse":
      // Konva.Ellipse uses radiusX and radiusY
      editorStore.addLayer("ellipse", {
        radiusX: 60,
        radiusY: 40,
        fill: "#3b82f6",
        x: centerX,
        y: centerY,
      });
      break;

    case "square":
      editorStore.addLayer("rect", {
        width: 100,
        height: 100,
        fill: "#3b82f6",
        x: centerX,
        y: centerY,
      });
      break;

    case "triangle":
      // Konva.RegularPolygon uses sides and radius (triangle = 3 sides)
      editorStore.addLayer("polygon", {
        sides: 3,
        radius: 60,
        fill: "#3b82f6",
        stroke: "#000000",
        strokeWidth: 2,
        x: centerX,
        y: centerY,
      });
      break;
  }

  toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added`);
}
</script>
