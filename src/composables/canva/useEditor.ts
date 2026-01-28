import { ref, computed } from 'vue';
import { fabric } from '../../lib/fabric';
import { useCanvaStore } from '../../stores/canva';
import type { ShapeType, ImageFilter, CanvaProject, Template } from '../../types/canva';

// JSON_KEYS completas para preservar todas las propiedades de los objetos
// Basado en el proyecto original canva-clone
const JSON_KEYS = [
    'name',
    'gradientAngle',
    'selectable',
    'hasControls',
    'linkData',
    'editable',
    'extensionType',
    'extension',
    'evented',
    'hasBorders',
    'id'
];

export function useEditor() {
    const store = useCanvaStore();
    const canvas = computed(() => store.canvas);

    // Estado de carga
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // ==================== SHAPES ====================

    function addRectangle(options?: Partial<fabric.IRectOptions>) {
        if (!canvas.value) return;

        const rect = new fabric.Rect({
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            fill: store.fillColor,
            stroke: store.strokeColor,
            strokeWidth: store.strokeWidth,
            ...options
        });

        canvas.value.add(rect);
        canvas.value.setActiveObject(rect);
        canvas.value.renderAll();
        store.saveState();

        return rect;
    }

    function addCircle(options?: Partial<fabric.ICircleOptions>) {
        if (!canvas.value) return;

        const circle = new fabric.Circle({
            left: 100,
            top: 100,
            radius: 50,
            fill: store.fillColor,
            stroke: store.strokeColor,
            strokeWidth: store.strokeWidth,
            ...options
        });

        canvas.value.add(circle);
        canvas.value.setActiveObject(circle);
        canvas.value.renderAll();
        store.saveState();

        return circle;
    }

    function addTriangle(options?: Partial<fabric.ITriangleOptions>) {
        if (!canvas.value) return;

        const triangle = new fabric.Triangle({
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            fill: store.fillColor,
            stroke: store.strokeColor,
            strokeWidth: store.strokeWidth,
            ...options
        });

        canvas.value.add(triangle);
        canvas.value.setActiveObject(triangle);
        canvas.value.renderAll();
        store.saveState();

        return triangle;
    }

    function addSoftRectangle(options?: Partial<fabric.IRectOptions>) {
        if (!canvas.value) return;

        const rect = new fabric.Rect({
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            rx: 20,
            ry: 20,
            fill: store.fillColor,
            stroke: store.strokeColor,
            strokeWidth: store.strokeWidth,
            ...options
        });

        canvas.value.add(rect);
        canvas.value.setActiveObject(rect);
        canvas.value.renderAll();
        store.saveState();

        return rect;
    }

    function addInverseTriangle(options?: Partial<fabric.IPolylineOptions>) {
        if (!canvas.value) return;

        const width = 100;
        const height = 100;

        const triangle = new fabric.Polygon([
            { x: 0, y: 0 },
            { x: width, y: 0 },
            { x: width / 2, y: height }
        ], {
            left: 100,
            top: 100,
            fill: store.fillColor,
            stroke: store.strokeColor,
            strokeWidth: store.strokeWidth,
            ...options
        });

        canvas.value.add(triangle);
        canvas.value.setActiveObject(triangle);
        canvas.value.renderAll();
        store.saveState();

        return triangle;
    }

    function addDiamond(options?: Partial<fabric.IPolylineOptions>) {
        if (!canvas.value) return;

        const width = 100;
        const height = 100;

        const diamond = new fabric.Polygon([
            { x: width / 2, y: 0 },
            { x: width, y: height / 2 },
            { x: width / 2, y: height },
            { x: 0, y: height / 2 }
        ], {
            left: 100,
            top: 100,
            fill: store.fillColor,
            stroke: store.strokeColor,
            strokeWidth: store.strokeWidth,
            ...options
        });

        canvas.value.add(diamond);
        canvas.value.setActiveObject(diamond);
        canvas.value.renderAll();
        store.saveState();

        return diamond;
    }

    function addShape(type: ShapeType) {
        switch (type) {
            case 'rectangle':
                return addRectangle();
            case 'circle':
                return addCircle();
            case 'triangle':
                return addTriangle();
            case 'soft-rectangle':
                return addSoftRectangle();
            case 'inverse-triangle':
                return addInverseTriangle();
            case 'diamond':
                return addDiamond();
        }
    }

    // ==================== TEXT ====================

    function addText(text: string = 'Double click to edit', options?: Partial<fabric.ITextOptions>) {
        if (!canvas.value) return;

        const textObj = new fabric.IText(text, {
            left: 100,
            top: 100,
            fontFamily: options?.fontFamily || store.fontFamily,
            fontSize: options?.fontSize || store.fontSize,
            fill: store.fillColor,
            ...options
        });

        canvas.value.add(textObj);
        canvas.value.setActiveObject(textObj);
        canvas.value.renderAll();
        store.saveState();

        return textObj;
    }

    function updateText(object: fabric.Object, newText: string) {
        if (object instanceof fabric.IText) {
            object.set({ text: newText });
            canvas.value?.renderAll();
            store.saveState();
        }
    }

    // ==================== IMAGES ====================

    async function addImageFromURL(url: string, options?: Partial<fabric.IImageOptions>): Promise<fabric.Image | null> {
        if (!canvas.value) return null;

        isLoading.value = true;
        error.value = null;

        try {
            return new Promise((resolve) => {
                fabric.Image.fromURL(url, (img) => {
                    // Escalar imagen si es muy grande
                    const maxWidth = 400;
                    const maxHeight = 400;

                    if (img.width && img.height) {
                        const scale = Math.min(
                            maxWidth / img.width,
                            maxHeight / img.height,
                            1
                        );
                        img.scale(scale);
                    }

                    img.set({
                        left: 100,
                        top: 100,
                        ...options
                    });

                    canvas.value!.add(img);
                    canvas.value!.setActiveObject(img);
                    canvas.value!.renderAll();
                    store.saveState();

                    isLoading.value = false;
                    resolve(img);
                }, { crossOrigin: 'anonymous' });
            });
        } catch (err) {
            error.value = 'Failed to load image';
            console.error('Error loading image:', err);
            isLoading.value = false;
            return null;
        }
    }

    async function addImageFromFile(file: File, options?: Partial<fabric.IImageOptions>): Promise<fabric.Image | null> {
        return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const url = e.target?.result as string;
                const img = await addImageFromURL(url, options);
                resolve(img);
            };

            reader.onerror = () => {
                error.value = 'Failed to read file';
                resolve(null);
            };

            reader.readAsDataURL(file);
        });
    }

    // ==================== PROPERTIES ====================

    function changeFillColor(color: string) {
        store.setFillColor(color);

        const activeObject = canvas.value?.getActiveObject();
        if (activeObject) {
            activeObject.set('fill', color);
            canvas.value?.renderAll();
            store.saveState();
        }
    }

    function changeStrokeColor(color: string) {
        store.setStrokeColor(color);

        const activeObject = canvas.value?.getActiveObject();
        if (activeObject) {
            activeObject.set('stroke', color);
            canvas.value?.renderAll();
            store.saveState();
        }
    }

    function changeStrokeWidth(width: number) {
        store.setStrokeWidth(width);

        const activeObject = canvas.value?.getActiveObject();
        if (activeObject) {
            activeObject.set('strokeWidth', width);
            canvas.value?.renderAll();
            store.saveState();
        }
    }

    function changeStrokeDashArray(dashArray: number[]) {
        const activeObject = canvas.value?.getActiveObject();
        if (activeObject) {
            activeObject.set('strokeDashArray', dashArray);
            canvas.value?.renderAll();
            store.saveState();
        }
    }

    function changeFontFamily(font: string) {
        store.setFontFamily(font);

        const activeObject = canvas.value?.getActiveObject();
        if (activeObject instanceof fabric.IText) {
            activeObject.set('fontFamily', font);
            canvas.value?.renderAll();
            store.saveState();
        }
    }

    function changeFontSize(size: number) {
        store.setFontSize(size);

        const activeObject = canvas.value?.getActiveObject();
        if (activeObject instanceof fabric.IText) {
            activeObject.set('fontSize', size);
            canvas.value?.renderAll();
            store.saveState();
        }
    }

    // ==================== ADVANCED TEXT STYLES ====================

    function changeLetterSpacing(spacing: number) {
        const activeObject = canvas.value?.getActiveObject();
        if (activeObject instanceof fabric.IText) {
            // @ts-ignore - charSpacing is available in Fabric.js but not in types
            activeObject.set('charSpacing', spacing * 1000); // Fabric uses 1/1000 of font size
            canvas.value?.renderAll();
            store.saveState();
        }
    }

    function changeTextShadow(shadow: fabric.Shadow | undefined) {
        const activeObject = canvas.value?.getActiveObject();
        if (activeObject instanceof fabric.IText) {
            activeObject.set('shadow', shadow);
            canvas.value?.renderAll();
            store.saveState();
        }
    }

    function changeTextOutline(color: string | undefined, width: number = 1) {
        const activeObject = canvas.value?.getActiveObject();
        if (activeObject instanceof fabric.IText) {
            if (color) {
                activeObject.set('stroke', color);
                activeObject.set('strokeWidth', width);
            } else {
                activeObject.set('stroke', undefined);
                activeObject.set('strokeWidth', 0);
            }
            canvas.value?.renderAll();
            store.saveState();
        }
    }

    // ==================== LAYER OPERATIONS ====================

    function bringToFront(object?: fabric.Object) {
        const target = object || canvas.value?.getActiveObject();
        if (target && canvas.value) {
            canvas.value.bringToFront(target);
            canvas.value.renderAll();
            store.saveState();
        }
    }

    function sendToBack(object?: fabric.Object) {
        const target = object || canvas.value?.getActiveObject();
        if (target && canvas.value) {
            canvas.value.sendToBack(target);
            canvas.value.renderAll();
            store.saveState();
        }
    }

    function deleteObject(object?: fabric.Object) {
        const target = object || canvas.value?.getActiveObject();
        if (target && canvas.value) {
            canvas.value.remove(target);
            canvas.value.discardActiveObject();
            canvas.value.renderAll();
            store.saveState();
        }
    }

    // ==================== DRAWING MODE ====================

    function enableDrawingMode(enabled: boolean, brushOptions?: {
        width?: number;
        color?: string;
    }) {
        if (!canvas.value) return;

        canvas.value.isDrawingMode = enabled;

        if (enabled && brushOptions) {
            const brush = canvas.value.freeDrawingBrush;
            if (brush) {
                if (brushOptions.width) brush.width = brushOptions.width;
                if (brushOptions.color) brush.color = brushOptions.color;
            }
        }
    }

    // ==================== IMAGE FILTERS ====================

    function createFilter(filterType: ImageFilter): fabric.IBaseFilter | null {
        const filters = fabric.Image.filters as any;

        switch (filterType) {
            case 'grayscale':
                return new filters.Grayscale();
            case 'sepia':
                return new filters.Sepia();
            case 'invert':
                return new filters.Invert();
            case 'brightness':
                return new filters.Brightness({ brightness: 0.1 });
            case 'contrast':
                return new filters.Contrast({ contrast: 0.1 });
            case 'saturation':
                return new filters.Saturation({ saturation: 0.5 });
            case 'vibrance':
                return filters.Vibrance && new filters.Vibrance({ vibrance: 0.5 });
            case 'blur':
                return new filters.Blur({ blur: 0.5 });
            case 'noise':
                return new filters.Noise({ noise: 100 });
            case 'pixelate':
                return new filters.Pixelate({ blocksize: 8 });
            case 'polaroid':
                return filters.Polaroid && new filters.Polaroid();
            case 'kodachrome':
                return filters.Kodachrome && new filters.Kodachrome();
            case 'brownie':
                return filters.Brownie && new filters.Brownie();
            case 'vintage':
                return filters.Vintage && new filters.Vintage();
            case 'technicolor':
                return filters.Technicolor && new filters.Technicolor();
            case 'sharpen':
                return filters.Sharpen && new filters.Sharpen();
            case 'emboss':
                return filters.Emboss && new filters.Emboss();
            case 'none':
            default:
                return null;
        }
    }

    function applyImageFilter(filterType: ImageFilter, options?: { value?: number }) {
        if (!canvas.value) return;

        const activeObjects = canvas.value.getActiveObjects();

        activeObjects.forEach((object) => {
            if (object instanceof fabric.Image) {
                const image = object as fabric.Image;

                // Reset filters
                image.filters = [];

                // Create and apply new filter
                const filter = createFilter(filterType);

                if (filter) {
                    // Update filter options if provided
                    if (options?.value !== undefined) {
                        const filterAny = filter as any;
                        if (filterAny.brightness !== undefined) {
                            filterAny.brightness = options.value;
                        } else if (filterAny.contrast !== undefined) {
                            filterAny.contrast = options.value;
                        } else if (filterAny.saturation !== undefined) {
                            filterAny.saturation = options.value;
                        } else if (filterAny.blur !== undefined) {
                            filterAny.blur = options.value;
                        } else if (filterAny.noise !== undefined) {
                            filterAny.noise = options.value;
                        } else if (filterAny.blocksize !== undefined) {
                            filterAny.blocksize = options.value;
                        }
                    }

                    image.filters.push(filter);
                }

                image.applyFilters();
            }
        });

        canvas.value.renderAll();
        store.saveState();
    }

    function clearImageFilters() {
        if (!canvas.value) return;

        const activeObjects = canvas.value.getActiveObjects();

        activeObjects.forEach((object) => {
            if (object instanceof fabric.Image) {
                const image = object as fabric.Image;
                image.filters = [];
                image.applyFilters();
            }
        });

        canvas.value.renderAll();
        store.saveState();
    }

    // ==================== EXPORT ====================

    function exportToPNG(options?: { multiplier?: number }): string {
        if (!canvas.value) return '';
        return canvas.value.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: options?.multiplier || 1
        });
    }

    function exportToJPEG(options?: { multiplier?: number; quality?: number }): string {
        if (!canvas.value) return '';
        return canvas.value.toDataURL({
            format: 'jpeg',
            quality: options?.quality || 0.9,
            multiplier: options?.multiplier || 1
        });
    }

    function exportToSVG(): string {
        if (!canvas.value) return '';
        return canvas.value.toSVG();
    }

    function exportToJSON(): string {
        if (!canvas.value) return '';
        return JSON.stringify(canvas.value.toJSON(JSON_KEYS));
    }

    // Export to Blob for library integration
    async function exportToBlob(format: 'png' | 'jpeg' = 'png'): Promise<Blob | null> {
        if (!canvas.value) return null;

        const dataUrl = format === 'png'
            ? exportToPNG()
            : exportToJPEG();

        const response = await fetch(dataUrl);
        return response.blob();
    }

    // Export multiple sizes (useful for responsive images)
    function exportMultipleSizes(sizes: { name: string; multiplier: number }[]): { name: string; dataUrl: string }[] {
        if (!canvas.value) return [];

        return sizes.map(({ name, multiplier }) => ({
            name,
            dataUrl: canvas.value!.toDataURL({
                format: 'png',
                multiplier,
                quality: 1
            })
        }));
    }

    async function loadFromJSON(json: string): Promise<void> {
        if (!canvas.value) return;

        return new Promise((resolve) => {
            canvas.value!.loadFromJSON(json, () => {
                // Ensure all objects are selectable and have controls
                const objects = canvas.value!.getObjects();
                objects.forEach((obj) => {
                    obj.set({
                        selectable: true,
                        evented: true,
                        hasControls: true,
                        hasBorders: true
                    });
                });

                canvas.value?.renderAll();
                store.initHistory();
                resolve();
            });
        });
    }

    // ==================== TEMPLATES ====================

    async function loadTemplate(template: Template): Promise<void> {
        if (!canvas.value) return;

        // Clear current canvas
        canvas.value.clear();

        // Set canvas dimensions
        canvas.value.setWidth(template.width);
        canvas.value.setHeight(template.height);

        // Create objects from template
        for (const obj of template.objects) {
            let fabricObj: fabric.Object | null = null;

            switch (obj.type) {
                case 'rect':
                    fabricObj = new fabric.Rect({
                        left: obj.left,
                        top: obj.top,
                        width: obj.width || 100,
                        height: obj.height || 100,
                        fill: obj.fill || '#000000',
                        stroke: obj.stroke || 'transparent',
                        strokeWidth: obj.strokeWidth || 0,
                        rx: obj.rx || 0,
                        ry: obj.ry || 0,
                        scaleX: obj.scaleX || 1,
                        scaleY: obj.scaleY || 1
                    });
                    break;
                case 'circle':
                    fabricObj = new fabric.Circle({
                        left: obj.left,
                        top: obj.top,
                        radius: obj.radius || 50,
                        fill: obj.fill || '#000000',
                        stroke: obj.stroke || 'transparent',
                        strokeWidth: obj.strokeWidth || 0
                    });
                    break;
                case 'triangle':
                    fabricObj = new fabric.Triangle({
                        left: obj.left,
                        top: obj.top,
                        width: obj.width || 100,
                        height: obj.height || 100,
                        fill: obj.fill || '#000000',
                        stroke: obj.stroke || 'transparent',
                        strokeWidth: obj.strokeWidth || 0
                    });
                    break;
                case 'text':
                    fabricObj = new fabric.Text(obj.text || '', {
                        left: obj.left,
                        top: obj.top,
                        fontSize: obj.fontSize || 40,
                        fontFamily: obj.fontFamily || 'Arial',
                        fill: obj.fill || '#000000'
                    });
                    break;
            }

            if (fabricObj) {
                canvas.value.add(fabricObj);
            }
        }

        canvas.value.renderAll();
        store.initHistory();
    }

    function setCanvasSize(width: number, height: number): void {
        if (!canvas.value) return;
        canvas.value.setWidth(width);
        canvas.value.setHeight(height);
        canvas.value.renderAll();
    }

    // ==================== CANVAS RESIZE WITH CONTENT SCALING ====================

    function resizeCanvas(newWidth: number, newHeight: number, options?: {
        scaleContent?: boolean;
        anchor?: 'center' | 'top-left';
    }): void {
        if (!canvas.value) return;

        const oldWidth = canvas.value.width || 800;
        const oldHeight = canvas.value.height || 600;

        // Calculate scale ratios
        const scaleX = newWidth / oldWidth;
        const scaleY = newHeight / oldHeight;

        // Scale all objects if requested
        if (options?.scaleContent) {
            const objects = canvas.value.getObjects();
            objects.forEach((obj) => {
                const newLeft = obj.left! * scaleX;
                const newTop = obj.top! * scaleY;

                obj.set({
                    left: newLeft,
                    top: newTop,
                    scaleX: (obj.scaleX || 1) * scaleX,
                    scaleY: (obj.scaleY || 1) * scaleY
                });
            });
        }

        // Set new dimensions
        canvas.value.setWidth(newWidth);
        canvas.value.setHeight(newHeight);
        canvas.value.renderAll();
        store.saveState();
    }

    // ==================== BACKGROUND COLOR ====================

    function setBackgroundColor(color: string): void {
        if (!canvas.value) return;
        canvas.value.setBackgroundColor(color, () => {
            canvas.value?.renderAll();
            store.saveState();
        });
    }

    function getBackgroundColor(): string {
        if (!canvas.value) return '#ffffff';
        return (canvas.value.backgroundColor as string) || '#ffffff';
    }

    // ==================== ZOOM CONTROLS ====================

    const MIN_ZOOM = 0.1;
    const MAX_ZOOM = 5;
    const ZOOM_STEP = 0.1;

    function getZoom(): number {
        return canvas.value?.getZoom() || 1;
    }

    function setZoom(zoom: number): void {
        if (!canvas.value) return;
        const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
        canvas.value.setZoom(clampedZoom);
        canvas.value.renderAll();
    }

    function zoomIn(step: number = ZOOM_STEP): void {
        const currentZoom = getZoom();
        setZoom(currentZoom + step);
    }

    function zoomOut(step: number = ZOOM_STEP): void {
        const currentZoom = getZoom();
        setZoom(currentZoom - step);
    }

    function resetZoom(): void {
        setZoom(1);
        if (canvas.value) {
            canvas.value.viewportTransform = [1, 0, 0, 1, 0, 0];
            canvas.value.renderAll();
        }
    }

    function zoomToFit(): void {
        if (!canvas.value) return;
        const objects = canvas.value.getObjects();
        if (objects.length === 0) {
            resetZoom();
            return;
        }

        // Get bounding box of all objects
        const boundingRect = canvas.value.getObjects()[0].getBoundingRect();
        let minX = boundingRect.left;
        let minY = boundingRect.top;
        let maxX = boundingRect.left + boundingRect.width;
        let maxY = boundingRect.top + boundingRect.height;

        objects.forEach((obj) => {
            const rect = obj.getBoundingRect();
            minX = Math.min(minX, rect.left);
            minY = Math.min(minY, rect.top);
            maxX = Math.max(maxX, rect.left + rect.width);
            maxY = Math.max(maxY, rect.top + rect.height);
        });

        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        const canvasWidth = canvas.value.width || 800;
        const canvasHeight = canvas.value.height || 600;

        const scaleX = canvasWidth / contentWidth;
        const scaleY = canvasHeight / contentHeight;
        const scale = Math.min(scaleX, scaleY) * 0.9; // 90% to add some padding

        setZoom(scale);

        // Center the content
        const offsetX = (canvasWidth - contentWidth * scale) / 2 - minX * scale;
        const offsetY = (canvasHeight - contentHeight * scale) / 2 - minY * scale;

        canvas.value.viewportTransform = [scale, 0, 0, scale, offsetX, offsetY];
        canvas.value.renderAll();
    }

    // ==================== IMAGE CONVERSION ====================

    /**
     * Convierte una imagen de URL a data URL (base64)
     * Esto es necesario para preservar imágenes externas en el JSON
     */
    async function convertImageToDataUrl(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0);
                try {
                    const dataUrl = canvas.toDataURL('image/png');
                    resolve(dataUrl);
                } catch (e) {
                    reject(new Error('Failed to convert image to data URL - possibly due to CORS'));
                }
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = url;
        });
    }

    /**
     * Prepara todas las imágenes del canvas para exportación
     * Convierte URLs externas a data URLs para preservarlas en el JSON
     */
    async function prepareImagesForExport(): Promise<void> {
        if (!canvas.value) return;

        const objects = canvas.value.getObjects();
        const imagePromises: Promise<void>[] = [];

        for (const obj of objects) {
            if (obj instanceof fabric.Image) {
                const img = obj as fabric.Image;
                const src = img.getSrc();

                // Si la imagen no es ya un data URL, convertirla
                if (src && !src.startsWith('data:')) {
                    const promise = convertImageToDataUrl(src)
                        .then((dataUrl) => {
                            img.setSrc(dataUrl);
                        })
                        .catch((err) => {
                            console.warn('Failed to convert image to data URL:', err);
                        });
                    imagePromises.push(promise);
                }
            }
        }

        // Esperar a que todas las conversiones terminen
        await Promise.all(imagePromises);

        // Renderizar el canvas después de las conversiones
        canvas.value.renderAll();
    }

    // ==================== LIBRARY INTEGRATION ====================

    async function saveToLibrary(): Promise<boolean> {
        try {
            // Import the history store dynamically
            const { useHistoryStore } = await import('../../stores/history');
            const historyStore = useHistoryStore();

            if (!canvas.value) return false;

            // Preparar imágenes (convertir URLs externas a data URLs)
            await prepareImagesForExport();

            // Export canvas as PNG blob for thumbnail/preview
            const blob = await exportToBlob('png');
            if (!blob) return false;

            // Export JSON data for the complete project (después de preparar imágenes)
            const projectJson = exportToJSON();

            // Create a project data object
            const projectData = {
                json: projectJson,
                width: canvas.value.width || 800,
                height: canvas.value.height || 600,
                backgroundColor: getBackgroundColor()
            };

            // Add to library via history store
            const itemId = crypto.randomUUID();
            await historyStore.addItem({
                id: itemId,
                type: 'canva',
                mode: 'canva',
                model: 'Canva Editor',
                params: { projectName: `Canva Project ${new Date().toLocaleDateString()}` },
                blobKey: itemId,
                source: 'canva',
                projectData
            }, blob);

            return true;
        } catch (err) {
            console.error('Error saving to library:', err);
            return false;
        }
    }

    // ==================== PROJECTS (localStorage) ====================

    const STORAGE_KEY = 'pixeo-canva-projects';

    function saveProject(name: string): CanvaProject | null {
        if (!canvas.value) return null;

        const project: CanvaProject = {
            id: `project-${Date.now()}`,
            name,
            json: exportToJSON(),
            thumbnail: exportToPNG({ multiplier: 0.2 }),
            width: canvas.value.width || 900,
            height: canvas.value.height || 1200,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const projects = getProjects();
        projects.push(project);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));

        return project;
    }

    function getProjects(): CanvaProject[] {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) return [];

            const projects = JSON.parse(data);
            return projects.map((p: any) => ({
                ...p,
                createdAt: new Date(p.createdAt),
                updatedAt: new Date(p.updatedAt)
            }));
        } catch {
            return [];
        }
    }

    function loadProject(projectId: string): boolean {
        const projects = getProjects();
        const project = projects.find(p => p.id === projectId);

        if (project && canvas.value) {
            loadFromJSON(project.json);
            return true;
        }

        return false;
    }

    function deleteProject(projectId: string): boolean {
        const projects = getProjects();
        const index = projects.findIndex(p => p.id === projectId);

        if (index !== -1) {
            projects.splice(index, 1);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
            return true;
        }

        return false;
    }

    function updateProject(projectId: string): boolean {
        if (!canvas.value) return false;

        const projects = getProjects();
        const index = projects.findIndex(p => p.id === projectId);

        if (index !== -1) {
            projects[index].json = exportToJSON();
            projects[index].thumbnail = exportToPNG({ multiplier: 0.2 });
            projects[index].updatedAt = new Date();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
            return true;
        }

        return false;
    }

    // ==================== AUTO SAVE ====================

    let autoSaveInterval: number | null = null;

    function startAutoSave(projectId: string, intervalMs: number = 30000): void {
        stopAutoSave();
        autoSaveInterval = window.setInterval(() => {
            updateProject(projectId);
        }, intervalMs);
    }

    function stopAutoSave(): void {
        if (autoSaveInterval) {
            clearInterval(autoSaveInterval);
            autoSaveInterval = null;
        }
    }

    return {
        // State
        isLoading,
        error,

        // Shapes
        addRectangle,
        addCircle,
        addTriangle,
        addSoftRectangle,
        addInverseTriangle,
        addDiamond,
        addShape,

        // Text
        addText,
        updateText,

        // Images
        addImageFromURL,
        addImageFromFile,

        // Properties
        changeFillColor,
        changeStrokeColor,
        changeStrokeWidth,
        changeStrokeDashArray,
        changeFontFamily,
        changeFontSize,

        // Advanced Text Styles
        changeLetterSpacing,
        changeTextShadow,
        changeTextOutline,

        // Zoom
        getZoom,
        setZoom,
        zoomIn,
        zoomOut,
        resetZoom,
        zoomToFit,

        // Layer operations
        bringToFront,
        sendToBack,
        deleteObject,

        // Drawing
        enableDrawingMode,

        // Image Filters
        applyImageFilter,
        clearImageFilters,

        // Export
        exportToPNG,
        exportToJPEG,
        exportToSVG,
        exportToJSON,
        exportToBlob,
        exportMultipleSizes,
        loadFromJSON,

        // Templates
        loadTemplate,
        setCanvasSize,
        resizeCanvas,

        // Background
        setBackgroundColor,
        getBackgroundColor,

        // Image Conversion
        convertImageToDataUrl,
        prepareImagesForExport,

        // Library
        saveToLibrary,

        // Projects
        saveProject,
        getProjects,
        loadProject,
        deleteProject,
        updateProject,

        // Auto Save
        startAutoSave,
        stopAutoSave
    };
}
