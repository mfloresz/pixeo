import { ref, onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';
import { Canvas } from '../../lib/fabric';
import type { CanvasInstance, FabricObjectInstance } from '../../lib/fabric';

export interface UseCanvasOptions {
    width?: number;
    height?: number;
    backgroundColor?: string;
    onReady?: (canvas: CanvasInstance) => void;
    onObjectSelected?: (object: FabricObjectInstance | null) => void;
    onObjectModified?: (object: FabricObjectInstance) => void;
}

export function useCanvas(
    canvasRef: Ref<HTMLCanvasElement | null>,
    options: UseCanvasOptions = {}
) {
    const canvas = ref<CanvasInstance | null>(null);
    const isReady = ref(false);

    onMounted(() => {
        if (!canvasRef.value) return;

        // Inicializar Fabric.js v6 Canvas
        const fabricCanvas = new Canvas(canvasRef.value!, {
            width: options.width || 800,
            height: options.height || 600,
            backgroundColor: options.backgroundColor || '#ffffff',
            preserveObjectStacking: true,
            selection: true,
            uniformScaling: false, // Allow non-uniform scaling (stretch horizontally/vertically)
            stopContextMenu: true,
            fireRightClick: false,
            fireMiddleClick: false
        });

        // Configure default object properties for all fabric objects (Canva-style controls)
        // En Fabric.js v6, se usa getDefaults() en lugar de prototype.set()
        const defaultControls = {
            // Enable controls
            hasControls: true,
            hasBorders: true,
            selectable: true,
            evented: true,

            // Visual styling of controls (Canva-style)
            cornerStyle: 'circle' as const,
            cornerColor: '#ffffff',
            cornerStrokeColor: '#3b82f6',
            cornerSize: 10,
            transparentCorners: false,
            borderColor: '#3b82f6',
            borderScaleFactor: 2,

            // Enable rotation control
            hasRotatingPoint: true,
            rotatingPointOffset: 30,

            // Allow scaling in both directions
            lockUniScaling: false,
            lockScalingX: false,
            lockScalingY: false,

            // Enable rotation
            lockRotation: false,

            // Center scaling (scale from center when holding Alt)
            centeredScaling: false,

            // Center rotation
            centeredRotation: true
        };

        // En v6, aplicamos propiedades a través de defaults o por objeto
        // Como no podemos modificar el prototype fácilmente, aplicamos a cada objeto

        // Ensure the controls are visible by setting per-object properties
        // when objects are added to canvas
        fabricCanvas.on('object:added', (e: any) => {
            if (e.target) {
                e.target.set(defaultControls);
                // Ensure controls are visible for this specific object
                if (e.target.controls) {
                    const controlNames = ['tl', 'tr', 'bl', 'br', 'ml', 'mr', 'mt', 'mb', 'mtr'];
                    controlNames.forEach(name => {
                        if (e.target.controls[name]) {
                            e.target.controls[name].visible = true;
                        }
                    });
                }
            }
            // Also trigger the history save
            if (e.target && options.onObjectModified) {
                setTimeout(() => {
                    options.onObjectModified!(e.target!);
                }, 0);
            }
        });

        canvas.value = fabricCanvas;
        isReady.value = true;

        // Debug: Log fabric version and controls status
        console.log('[Fabric.js v6] Canvas initialized');

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

    function setupEventListeners(fabricCanvas: CanvasInstance) {
        // Selection events
        fabricCanvas.on('selection:created', (e: any) => {
            const selected = e.selected?.[0] || null;
            // Debug: Log selected object controls status
            if (selected) {
                console.log('[Fabric.js v6] Object selected:', selected.type);
                console.log('[Fabric.js v6] hasControls:', selected.hasControls);
                console.log('[Fabric.js v6] hasBorders:', selected.hasBorders);
                console.log('[Fabric.js v6] selectable:', selected.selectable);
            }
            if (options.onObjectSelected) {
                options.onObjectSelected(selected);
            }
        });

        fabricCanvas.on('selection:updated', (e: any) => {
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
        fabricCanvas.on('object:modified', (e: any) => {
            if (e.target && options.onObjectModified) {
                options.onObjectModified(e.target);
            }
        });

        // Path created (for drawing mode)
        fabricCanvas.on('path:created', (e: any) => {
            if (e.path && options.onObjectModified) {
                options.onObjectModified(e.path);
            }
        });

        // Double click to edit text
        fabricCanvas.on('mouse:dblclick', (e: any) => {
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
