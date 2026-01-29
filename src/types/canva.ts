// Tipos para el editor Canva
import type { CanvasInstance, FabricObjectInstance, ImageInstance, TextInstance } from '../lib/fabric';

export type ActiveTool =
    | 'select'
    | 'shapes'
    | 'text'
    | 'images'
    | 'draw'
    | 'ai'
    | 'filters'
    | 'templates'
    | 'settings';

export interface Template {
    id: string;
    name: string;
    description: string;
    category: TemplateCategory;
    width: number;
    height: number;
    thumbnail: string;
    objects: TemplateObject[];
}

export type TemplateCategory =
    | 'social'
    | 'presentation'
    | 'print'
    | 'custom';

export interface TemplateObject {
    type: 'rect' | 'circle' | 'triangle' | 'text' | 'image';
    left: number;
    top: number;
    width?: number;
    height?: number;
    radius?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    rx?: number;
    ry?: number;
    scaleX?: number;
    scaleY?: number;
}

export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'soft-rectangle' | 'inverse-triangle' | 'diamond';

export interface EditorState {
    canvas: CanvasInstance | null;
    activeTool: ActiveTool;
    selectedObject: FabricObjectInstance | null;
    strokeColor: string;
    fillColor: string;
    strokeWidth: number;
    fontFamily: string;
    fontSize: number;
}

export interface HistoryState {
    history: string[];
    currentIndex: number;
    canUndo: boolean;
    canRedo: boolean;
}

export interface CanvasSize {
    width: number;
    height: number;
}

export interface CanvaProject {
    id: string;
    name: string;
    json: string;
    thumbnail: string;
    width: number;
    height: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface FilterOptions {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
    noise?: number;
    pixelate?: number;
}

// Tipos de filtros de imagen disponibles
export type ImageFilter =
    | 'none'
    | 'grayscale'
    | 'sepia'
    | 'invert'
    | 'brightness'
    | 'contrast'
    | 'saturation'
    | 'vibrance'
    | 'blur'
    | 'noise'
    | 'pixelate'
    | 'polaroid'
    | 'kodachrome'
    | 'brownie'
    | 'vintage'
    | 'technicolor'
    | 'sharpen'
    | 'emboss';

export const AVAILABLE_FILTERS: { value: ImageFilter; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'grayscale', label: 'Grayscale' },
    { value: 'sepia', label: 'Sepia' },
    { value: 'invert', label: 'Invert' },
    { value: 'brightness', label: 'Brightness' },
    { value: 'contrast', label: 'Contrast' },
    { value: 'saturation', label: 'Saturation' },
    { value: 'vibrance', label: 'Vibrance' },
    { value: 'blur', label: 'Blur' },
    { value: 'noise', label: 'Noise' },
    { value: 'pixelate', label: 'Pixelate' },
    { value: 'polaroid', label: 'Polaroid' },
    { value: 'kodachrome', label: 'Kodachrome' },
    { value: 'brownie', label: 'Brownie' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'technicolor', label: 'Technicolor' },
    { value: 'sharpen', label: 'Sharpen' },
    { value: 'emboss', label: 'Emboss' }
];

export interface GenerateImageOptions {
    width?: number;
    height?: number;
    negativePrompt?: string;
    numInferenceSteps?: number;
    guidanceScale?: number;
}

// Tipos de fabric.js extendidos - usando los tipos de instancia
export type FabricObject = FabricObjectInstance;
export type FabricCanvas = CanvasInstance;
export type FabricImageType = ImageInstance;
export type FabricTextType = TextInstance;
