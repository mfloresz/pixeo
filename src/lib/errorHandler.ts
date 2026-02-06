/**
 * Extrae un mensaje de error limpio manteniendo el prefijo descriptivo
 * @param error - El error original (Error object, string, o response text)
 * @returns Mensaje de error limpio y legible
 */
export function extractErrorMessage(error: unknown): string {
    let errorMessage = error instanceof Error ? error.message : String(error);

    // Extraer prefijo descriptivo: "Translation failed", "API Error", "Optimization failed", etc.
    const prefixMatch = errorMessage.match(/^(Translation failed|API Error|Optimization failed|Error|Failed):\s*/);
    const prefix = prefixMatch ? prefixMatch[1] + ': ' : '';

    // Eliminar el código de estado HTTP y el JSON wrapper
    const contentMatch = errorMessage.match(/:\s*\d+\s*-\s*({.*})$/s);

    let content = contentMatch ? contentMatch[1] : errorMessage;

    // Intentar extraer el campo "detail" del JSON
    try {
        const parsed = JSON.parse(content);
        if (parsed.detail) {
            if (typeof parsed.detail === 'string') {
                content = parsed.detail;
            } else if (typeof parsed.detail === 'object' && parsed.detail.message) {
                content = parsed.detail.message;
            } else {
                content = JSON.stringify(parsed.detail);
            }
        }
    } catch {
        // No es JSON, usar el contenido original
    }

    // Combinar prefijo con contenido limpio
    return prefix + content;
}