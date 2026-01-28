import { ref } from 'vue';
import type { Ref } from 'vue';
import { fabric } from '../../lib/fabric';

export interface UseClipboardOptions {
    canvas: Ref<fabric.Canvas | null>;
}

export function useClipboard(options: UseClipboardOptions) {
    const clipboard = ref<fabric.Object | null>(null);

    const copy = () => {
        const canvas = options.canvas.value;
        if (!canvas) return;

        const activeObject = canvas.getActiveObject();
        if (!activeObject) return;

        activeObject.clone((cloned: fabric.Object) => {
            clipboard.value = cloned;
        });
    };

    const paste = () => {
        const canvas = options.canvas.value;
        if (!canvas || !clipboard.value) return;

        clipboard.value.clone((clonedObject: fabric.Object) => {
            canvas.discardActiveObject();

            // Offset para el objeto pegado
            clonedObject.set({
                left: (clonedObject.left || 0) + 10,
                top: (clonedObject.top || 0) + 10,
                evented: true
            });

            if (clonedObject.type === 'activeSelection') {
                // Si es una selección múltiple
                (clonedObject as fabric.ActiveSelection).canvas = canvas;
                (clonedObject as fabric.ActiveSelection).forEachObject((obj: fabric.Object) => {
                    canvas.add(obj);
                });
                clonedObject.setCoords();
            } else {
                canvas.add(clonedObject);
            }

            // Actualizar el clipboard con el nuevo offset
            if (clipboard.value) {
                clipboard.value.set({
                    left: (clipboard.value.left || 0) + 10,
                    top: (clipboard.value.top || 0) + 10
                });
            }

            canvas.setActiveObject(clonedObject);
            canvas.requestRenderAll();
        });
    };

    const canCopy = () => {
        const canvas = options.canvas.value;
        if (!canvas) return false;
        return canvas.getActiveObject() !== null;
    };

    const canPaste = () => {
        return clipboard.value !== null;
    };

    return {
        copy,
        paste,
        canCopy,
        canPaste,
        clipboard
    };
}
