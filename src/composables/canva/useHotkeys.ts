import { onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';
import { fabric } from '../../lib/fabric';

export interface UseHotkeysOptions {
    canvas: Ref<fabric.Canvas | null>;
    undo: () => void;
    redo: () => void;
    save?: () => void;
    copy?: () => void;
    paste?: () => void;
}

export function useHotkeys(options: UseHotkeysOptions) {
    const handleKeyDown = (event: KeyboardEvent) => {
        const isCtrlKey = event.ctrlKey || event.metaKey;
        const isRemove = event.key === 'Backspace' || event.key === 'Delete';
        const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement).tagName);

        // Ignorar si estamos en un input
        if (isInput) return;

        // Delete / Backspace - Eliminar objetos seleccionados
        if (isRemove) {
            event.preventDefault();
            const canvas = options.canvas.value;
            if (canvas) {
                const activeObjects = canvas.getActiveObjects();
                activeObjects.forEach((obj) => canvas.remove(obj));
                canvas.discardActiveObject();
                canvas.renderAll();
            }
        }

        // Ctrl+Z - Undo
        if (isCtrlKey && (event.key === 'z' || event.key === 'Z') && !event.shiftKey) {
            event.preventDefault();
            options.undo();
        }

        // Ctrl+Shift+Z o Ctrl+Y - Redo
        if ((isCtrlKey && event.shiftKey && (event.key === 'z' || event.key === 'Z')) ||
            (isCtrlKey && (event.key === 'y' || event.key === 'Y'))) {
            event.preventDefault();
            options.redo();
        }

        // Ctrl+A - Select All
        if (isCtrlKey && (event.key === 'a' || event.key === 'A')) {
            event.preventDefault();
            const canvas = options.canvas.value;
            if (canvas) {
                canvas.discardActiveObject();
                const allObjects = canvas.getObjects().filter((obj) => obj.selectable);
                if (allObjects.length > 0) {
                    const selection = new fabric.ActiveSelection(allObjects, { canvas });
                    canvas.setActiveObject(selection);
                    canvas.renderAll();
                }
            }
        }

        // Ctrl+S - Save
        if (isCtrlKey && (event.key === 's' || event.key === 'S')) {
            event.preventDefault();
            options.save?.();
        }

        // Ctrl+C - Copy
        if (isCtrlKey && (event.key === 'c' || event.key === 'C')) {
            event.preventDefault();
            options.copy?.();
        }

        // Ctrl+V - Paste
        if (isCtrlKey && (event.key === 'v' || event.key === 'V')) {
            event.preventDefault();
            options.paste?.();
        }
    };

    onMounted(() => {
        window.addEventListener('keydown', handleKeyDown);
    });

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeyDown);
    });

    return {
        handleKeyDown
    };
}
