# Guía de Implementación: Pestaña Inpaint para Pixeo

## Resumen Ejecutivo

Este documento guía la implementación de una nueva pestaña "Inpaint" en Pixeo que replica la funcionalidad del proyecto `inpaint-project`. La implementación procesará imágenes localmente en el navegador usando ONNX Runtime Web y opencv-ts.

## Arquitectura del Sistema

### Flujo de Datos

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Usuario       │────▶│   Canvas UI     │────▶│   Lines Store   │
│   carga imagen  │     │   (dibujo)      │     │   (trazos)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Resultado     │◀────│   PostProcess   │◀────│   ONNX Runtime  │
│   (DataURL)     │     │   (CHW→HWC)     │     │   (inferencia)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                               ▲
        │                                               │
        ▼                                               │
┌─────────────────┐                            ┌─────────────────┐
│   History Store │                            │   PreProcess    │
│   (guardado)    │                            │   (img→tensor)  │
└─────────────────┘                            └─────────────────┘
```

## Dependencias Requeridas

### Paquetes NPM
```json
{
  "opencv-ts": "^2.x.x",
  "onnxruntime-web": "^1.20.x"
}
```

### Modelos
- **Migan Pipeline V2**: `https://huggingface.co/andraniksargsyan/migan/resolve/main/migan_pipeline_v2.onnx`
- Ubicación del caché: localforage (IndexedDB)

## Estructura de Archivos a Crear

```
src/
├── adapters/
│   ├── inpaint.ts          # Lógica de inpaint adaptada a TS
│   ├── cache.ts            # Gestión de modelos (reutilizar del inpaint-project)
│   └── util.ts             # Utilidades de detección de capacidades
├── components/
│   └── inpaint/
│       ├── InpaintView.vue     # Vista principal
│       ├── InpaintCanvas.vue   # Canvas interactivo
│       ├── InpaintToolbar.vue  # Toolbar con brush size, undo, etc
│       ├── InpaintHistory.vue  # Historial de ediciones
│       └── index.ts
├── stores/
│   └── inpaint.ts          # Store de Pinia para estado del inpaint
├── services/
│   └── inpaintProcessor.ts # Servicio de procesamiento
└── i18n/
    └── messages.json       # Añadir claves para inpaint
```

## Componentes Detallados

### 1. Store: `inpaint.ts`

```typescript
// Estado reactivo del inpaint
interface InpaintState {
  // Imagen actual
  originalImage: HTMLImageElement | null;
  currentImage: HTMLImageElement | null;
  imageFile: File | null;

  // Estado del canvas
  canvasContext: CanvasRenderingContext2D | null;
  maskCanvas: HTMLCanvasElement;

  // Dibujado
  lines: Line[];
  currentLine: Line | null;
  brushSize: number;
  isDrawing: boolean;

  // Historial
  renders: HTMLImageElement[];
  historyIndex: number;

  // UI
  showOriginal: boolean;
  showBrush: boolean;
  separatorPosition: number;
  isProcessing: boolean;
  progress: number;

  // Modelo
  modelLoaded: boolean;
  modelDownloadProgress: number;
}

interface Line {
  pts: { x: number; y: number }[];
  size?: number;
}
```

### 2. Componente: `InpaintCanvas.vue`

#### Responsabilidades
- Renderizar imagen en canvas con aspect ratio correcto
- Capturar eventos de mouse/touch para dibujar
- Mostrar cursor del brush
- Gestionar comparación original/resultado con slider divisor

#### Eventos a Manejar
| Evento | Acción |
|--------|--------|
| `mousedown` | Iniciar nueva línea, guardar posición |
| `mousemove` | Añadir puntos a línea actual, redibujar |
| `mouseup` | Finalizar línea, ejecutar inpaint |
| `mouseleave` | Ocultar brush, detener dibujo |
| `touchstart` | Mismo que mousedown |
| `touchmove` | Mismo que mousemove (con coords correctas) |
| `touchend` | Mismo que mouseup |

#### Algoritmo de Redibujado
```typescript
function draw() {
  // 1. Limpiar canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 2. Calcular dimensiones escaladas
  const imgAspect = currentImage.width / currentImage.height;
  const canvasAspect = containerWidth / containerHeight;

  let drawWidth, drawHeight;
  if (canvasAspect > imgAspect) {
    drawHeight = containerHeight;
    drawWidth = currentImage.width * (containerHeight / currentImage.height);
  } else {
    drawWidth = containerWidth;
    drawHeight = currentImage.height * (containerWidth / currentImage.width);
  }

  // 3. Ajustar tamaño del canvas
  canvas.width = drawWidth;
  canvas.height = drawHeight;

  // 4. Dibujar imagen
  ctx.drawImage(currentImage, 0, 0, drawWidth, drawHeight);

  // 5. Dibujar trazos actuales
  drawLines(ctx, lines);
}
```

### 3. Servicio: `inpaintProcessor.ts`

#### Pipeline de Procesamiento

```typescript
class InpaintProcessor {
  async process(image: File, maskBase64: string): Promise<string> {
    // 1. Cargar modelo (una sola vez)
    await this.ensureModel();

    // 2. Cargar y preprocesar imagen
    const imgTensor = await this.preprocessImage(image);

    // 3. Cargar y preprocesar máscara
    const maskTensor = await this.preprocessMask(maskBase64, image);

    // 4. Ejecutar inferencia
    const output = await this.runInference(imgTensor, maskTensor);

    // 5. Post-procesar resultado
    const resultDataURL = await this.postProcess(output);

    return resultDataURL;
  }

  private async preprocessImage(image: File): Promise<ort.Tensor> {
    const img = await loadImage(URL.createObjectURL(image));

    // Usar opencv-ts para convertir RGBA→RGB
    const src = cv.imread(img);
    const rgb = new cv.Mat();
    cv.cvtColor(src, rgb, cv.COLOR_RGBA2RGB);

    // Convertir a formato CHW (Channel, Height, Width)
    const chwData = this.rgb2chw(rgb);

    src.delete();
    rgb.delete();

    return new ort.Tensor('uint8', chwData, [1, 3, img.height, img.width]);
  }

  private rgb2chw(mat: cv.Mat): Uint8Array {
    const channels = new cv.MatVector();
    cv.split(mat, channels);

    const C = 3;
    const H = mat.rows;
    const W = mat.cols;
    const chw = new Uint8Array(C * H * W);

    for (let c = 0; c < C; c++) {
      const data = channels.get(c).data;
      for (let h = 0; h < H; h++) {
        for (let w = 0; w < W; w++) {
          chw[c * H * W + h * W + w] = data[h * W + w];
        }
      }
    }

    channels.delete();
    return chw;
  }

  private async preprocessMask(maskBase64: string, refImage: File): Promise<ort.Tensor> {
    const maskImg = await loadImage(maskBase64);
    const refImg = await loadImage(URL.createObjectURL(refImage));

    // Redimensionar máscara al tamaño de la imagen
    const resizedMask = await this.resizeImage(maskImg, refImg.width, refImg.height);

    // Convertir a escala de grises
    const src = cv.imread(resizedMask);
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // Binarizar (invertir: lo pintado = 255, lo no pintado = 0)
    const binary = new cv.Mat();
    cv.threshold(gray, binary, 127, 255, cv.THRESH_BINARY_INV);

    // Extraer datos
    const data = binary.data;

    src.delete();
    gray.delete();
    resizedMask.delete();

    return new ort.Tensor('uint8', new Uint8Array(data), [1, 1, refImg.height, refImg.width]);
  }

  private postProcess(output: ort.Tensor, width: number, height: number): string {
    const chwData = output.data as Uint8Array;
    const size = width * height;
    const hwc: number[] = [];

    // CHW → HWC con canal alpha
    for (let h = 0; h < height; h++) {
      for (let w = 0; w < width; w++) {
        for (let c = 0; c < 3; c++) {
          const chwIdx = c * size + h * width + w;
          hwc.push(Math.min(255, Math.max(0, chwData[chwIdx])));
        }
        hwc.push(255); // Alpha = 255
      }
    }

    const imageData = new ImageData(new Uint8ClampedArray(hwc), width, height);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d')!.putImageData(imageData, 0, 0);

    return canvas.toDataURL();
  }
}
```

### 4. Componente: `InpaintToolbar.vue`

#### Controles Requeridos

| Control | Función | Rango |
|---------|---------|-------|
| Brush Size | Tamaño del pincel | 10-200px |
| Undo | Deshacer última edición | - |
| Original/Result | Comparar original con resultado | Toggle |
| Download | Guardar imagen resultante | - |
| Super Resolution | Upscale de la imagen 4x | - |

### 5. Componente: `InpaintHistory.vue`

#### Funcionalidad
- Mostrar miniaturas de cada renderizado
- Permitir click para volver a un estado anterior
- Hover muestra preview del estado
- Scroll horizontal para navegar historial

```vue
<template>
  <div class="flex gap-2 overflow-x-auto p-2">
    <div
      v-for="(render, index) in renders"
      :key="render.dataset.id"
      class="relative flex-shrink-0 cursor-pointer"
      @click="goToState(index)"
      @mouseenter="previewState(index)"
      @mouseleave="clearPreview"
    >
      <img :src="render.src" class="h-20 rounded" />
      <div
        v-if="hoverIndex === index"
        class="absolute inset-0 bg-black/50 flex items-center justify-center"
      >
        <span class="text-white text-xs">Volver aquí</span>
      </div>
    </div>
  </div>
</template>
```

## Integración con App.vue

### Añadir Pestaña

```typescript
const tabs = [
  { id: "generate", icon: Image },
  { id: "library", icon: Library },
  { id: "inpaint", icon: Wand2 },  // Nueva pestaña
  { id: "settings", icon: Settings },
];
```

### Añadir Vista Condicional

```vue
<div v-else-if="activeTab === 'inpaint'" key="inpaint">
  <InpaintView />
</div>
```

## Gestión de Memoria

### Limpieza de Recursos
```typescript
onUnmounted(() => {
  // Revocar URLs de objetos
  renders.forEach(r => URL.revokeObjectURL(r.src));
  URL.revokeObjectURL(original?.src);

  // Liberar tensores de ONNX
  session?.release();

  // Limpiar canvas
  canvas.width = 0;
  canvas.height = 0;
});
```

## Rendimiento

### Optimizaciones
1. **Lazy loading del modelo**: Cargar solo cuando el usuario entra a la pestaña inpaint
2. **Cache de modelo**: Almacenar en IndexedDB para evitar descargas repetidas
3. **Debounce del redibujado**: No redibujar en cada pixel, sino en requestAnimationFrame
4. **Resize de máscara**: Redimensionar en canvas, no en CSS

### Métricas Esperadas
- Tiempo de carga de modelo: ~5-10 segundos (una vez cacheado)
- Tiempo de inferencia: ~2-5 segundos (dependiendo del dispositivo)
- Memoria VRAM: ~200-500MB

## Consideraciones de Accesibilidad

1. **Controles de teclado**: Permitir ajustar brush con teclado
2. **Feedback visual**: Indicadores de progreso claros
3. **ARIA labels**: Todos los controles deben ser accesibles

## Testing Checklist

- [ ] Carga de imagen desde archivo
- [ ] Carga de imagen desde drag & drop
- [ ] Dibujo con mouse
- [ ] Dibujo con touch (móvil)
- [ ] Cambio de tamaño de brush
- [ ] Undo (Ctrl+Z / Cmd+Z)
- [ ] Comparación original/resultado
- [ ] Descarga de imagen
- [ ] Persistencia de historial
- [ ] Manejo de imágenes grandes (>10MB)
- [ ] Error handling en carga de modelo
- [ ] Progresivo de descarga de modelo
- [ ] Integración con store de Pixeo

## Referencias

- opencv-ts: https://docs.opencv.org/
- ONNX Runtime Web: https://onnxruntime.ai/docs/api/js/
- Migan Model: https://huggingface.co/andraniksargsyan/migan
