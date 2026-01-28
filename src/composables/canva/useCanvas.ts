import { ref, onMounted, onUnmounted } from 'vue';
import { fabric } from '../../lib/fabric';
import type { Ref } from 'vue';

export interface UseCanvasOptions {
    width?: number;
    height?: number;
    backgroundColor?: string;
    onReady?: (canvas: fabric.Canvas) => void;
    onObjectSelected?: (object: fabric.Object | null) => void;
    onObjectModified?: (object: fabric.Object) => void;
}

export function useCanvas(
    canvasRef: Ref<HTMLCanvasElement | null>,
    options: UseCanvasOptions = {}
) {
    const canvas = ref<fabric.Canvas | null>(null);
    const isReady = ref(false);

    onMounted(() => {
        if (!canvasRef.value) return;

        // Inicializar Fabric.js canvas
        const fabricCanvas = new fabric.Canvas(canvasRef.value!, {
            width: options.width || 800,
            height: options.height || 600,
            backgroundColor: options.backgroundColor || '#ffffff',
            preserveObjectStacking: true,
            selection: true,
            uniformScaling: true,
            stopContextMenu: true,
            fireRightClick: false,
            fireMiddleClick: false
        });

        canvas.value = fabricCanvas;
        isReady.value = true;

        // Configurar eventos
        setupEventListeners(fabricCanvas);

        // Callback de listo
        if (options.onReady) {
            options.onReady(fabricCanvas);
        }
    });

    onUnmounted(() => {
        if (canvas.value) {
            canvas.value.dispose();
            canvas.value = null;
            isReady.value = false;
        }
    });

    function setupEventListeners(fabricCanvas: fabric.Canvas) {
        // Selection events
        fabricCanvas.on('selection:created', (e) => {
            const selected = e.selected?.[0] || null;
            if (options.onObjectSelected) {
                options.onObjectSelected(selected);
            }
        });

        fabricCanvas.on('selection:updated', (e) => {
            const selected = e.selected?.[0] || null;
            if (options.onObjectSelected) {
                options.onObjectSelected(selected);
            }
        });

        fabricCanvas.on('selection:cleared', () => {
            if (options.onObjectSelected) {
                options.onObjectSelected(null);
            }
        });

        // Modification events - para historial
        fabricCanvas.on('object:modified', (e) => {
            if (e.target && options.onObjectModified) {
                options.onObjectModified(e.target);
            }
        });

        fabricCanvas.on('object:added', (e) => {
            if (e.target && options.onObjectModified) {
                // Pequeño delay para asegurar que el objeto está completamente agregado
                setTimeout(() => {
                    options.onObjectModified!(e.target!);
                }, 0);
            }
        });

        // Path created (for drawing mode)
        fabricCanvas.on('path:created', (e: any) => {
            if (e.path && options.onObjectModified) {
                options.onObjectModified(e.path);
            }
        });

        // Double click to edit text
        fabricCanvas.on('mouse:dblclick', (e) => {
            const target = e.target;
            if (target && (target as any).enterEditing) {
                // Enter text editing mode (IText objects support this)
                (target as any).enterEditing();
                fabricCanvas.setActiveObject(target);
                fabricCanvas.renderAll();
            }
        });
    }

    // Métodos útiles
    function setDimensions(width: number, height: number) {
        if (canvas.value) {
            canvas.value.setWidth(width);
            canvas.value.setHeight(height);
            canvas.value.renderAll();
        }
    }

    function setBackgroundColor(color: string) {
        if (canvas.value) {
            canvas.value.setBackgroundColor(color, () => {
                canvas.value?.renderAll();
            });
        }
    }

    function clear() {
        if (canvas.value) {
            canvas.value.clear();
            canvas.value.renderAll();
        }
    }

    function toJSON(): string {
        return canvas.value ? JSON.stringify(canvas.value.toJSON()) : '';
    }

    function loadFromJSON(json: string): Promise<void> {
        return new Promise((resolve) => {
            if (canvas.value) {
                canvas.value.loadFromJSON(json, () => {
                    canvas.value?.renderAll();
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    function toDataURL(options?: {
        format?: 'png' | 'jpeg' | 'svg';
        quality?: number;
        multiplier?: number;
        left?: number;
        top?: number;
        width?: number;
        height?: number;
    }): string {
        if (!canvas.value) return '';

        return canvas.value.toDataURL({
            format: options?.format || 'png',
            quality: options?.quality || 1,
            multiplier: options?.multiplier || 1,
            left: options?.left,
            top: options?.top,
            width: options?.width,
            height: options?.height
        });
    }

    return {
        canvas,
        isReady,
        setDimensions,
        setBackgroundColor,
        clear,
        toJSON,
        loadFromJSON,
        toDataURL
    };
}
