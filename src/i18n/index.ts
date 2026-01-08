// src/i18n/index.ts
import { createI18n } from 'vue-i18n';

const messages = {
    en: {
        common: {
            generate: 'Generate',
            library: 'Library',
            settings: 'Settings',
            image: 'Image',
            video: 'Video',
            edit: 'Edit',
            audio: 'Audio',
            prompt: 'Prompt',
            negativePrompt: 'Negative Prompt',
            resolution: 'Resolution',
            steps: 'Steps',
            cfgScale: 'CFG Scale',
            seed: 'Seed',
            apiKey: 'API Key',
            save: 'Save',
            loading: 'Loading...',
            success: 'Success',
            error: 'Error',
        },
        generate: {
            placeholder: 'Describe what you want to create...',
            shifting: 'Generating your creation...',
        },
        library: {
            empty: 'No items found in your library.',
        },
        settings: {
            title: 'Application Settings',
            apiKeyPlaceholder: 'Enter your Chutes API Key',
            logs: 'Activity Logs',
        }
    },
    es: {
        common: {
            generate: 'Generar',
            library: 'Biblioteca',
            settings: 'Configuración',
            image: 'Imagen',
            video: 'Video',
            edit: 'Editar',
            audio: 'Audio',
            prompt: 'Prompt',
            negativePrompt: 'Prompt Negativo',
            resolution: 'Resolución',
            steps: 'Pasos',
            cfgScale: 'Escala CFG',
            seed: 'Semilla',
            apiKey: 'Clave API',
            save: 'Guardar',
            loading: 'Cargando...',
            success: 'Éxito',
            error: 'Error',
        },
        generate: {
            placeholder: 'Describe lo que quieres crear...',
            shifting: 'Generando tu creación...',
        },
        library: {
            empty: 'No se encontraron elementos en tu biblioteca.',
        },
        settings: {
            title: 'Configuración de la Aplicación',
            apiKeyPlaceholder: 'Ingresa tu Clave API de Chutes',
            logs: 'Log de Actividad',
        }
    }
};

export const i18n = createI18n({
    legacy: false,
    locale: 'es',
    fallbackLocale: 'en',
    messages,
});
