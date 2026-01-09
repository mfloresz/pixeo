// src/i18n/index.ts
import { createI18n } from "vue-i18n";

const messages = {
  en: {
    common: {
      generate: "Generate",
      library: "Library",
      settings: "Settings",
      image: "Image",
      video: "Video",
      edit: "Edit",
      audio: "Audio",
      prompt: "Prompt",
      negativePrompt: "Negative Prompt",
      resolution: "Resolution",
      steps: "Steps",
      cfgScale: "CFG Scale",
      seed: "Seed",
      apiKey: "API Key",
      save: "Save",
      loading: "Loading...",
      success: "Success",
      error: "Error",
      model: "Model",
      usageQuota: "{used} / {quota} usage",
      itemCount: "{count} items",
    },
    generate: {
      placeholder: "Describe what you want to create...",
      shifting: "Generating your creation...",
      advanced: "Advanced",
      optimize: "Optimize",
      clearGenerations: "Clear Generations",
      success: "Generation completed!",
      heroTitle: "Pixeo Creative Studio",
      heroSubtitle:
        "Your AI-powered creative studio. Choose a model, write your idea, and let the magic happen.",
    },
    library: {
      empty: "No items found in your library.",
      deletedAll: "All items deleted",
    },
    settings: {
      title: "Application Settings",
      apiKeyPlaceholder: "Enter your Chutes API Key",
      logs: "Activity Logs",
      theme: "Theme",
      clearLogs: "Clear logs",
      waitingActivity: "Waiting for activity...",
    },
    actions: {
      zoom: "Zoom",
      download: "Download",
      delete: "Delete",
      downloadContent: "Download Content",
      deleteAll: "Delete All",
      deleteAllConfirm:
        "Are you sure you want to delete all items? This action cannot be undone.",
    },
    logs: {
      promptOptimized: "[{model}] Prompt optimized",
      optimizationFailed: "Optimization failed, using original prompt: {error}",
      sendingRequest: "[{model}] Sending request to: {endpoint}",
      generationSuccess: "Generation successful: {model}",
    },
    errors: {
      quotaFetchFailed: "Failed to fetch quota",
      apiError: "API Error: {status} - {message}",
    },
  },
  es: {
    common: {
      generate: "Generar",
      library: "Biblioteca",
      settings: "Configuración",
      image: "Imagen",
      video: "Video",
      edit: "Editar",
      audio: "Audio",
      prompt: "Prompt",
      negativePrompt: "Prompt Negativo",
      resolution: "Resolución",
      steps: "Pasos",
      cfgScale: "Escala CFG",
      seed: "Semilla",
      apiKey: "Clave API",
      save: "Guardar",
      loading: "Cargando...",
      success: "Éxito",
      error: "Error",
      model: "Modelo",
      usageQuota: "{used} / {quota} uso",
      itemCount: "{count} elementos",
    },
    generate: {
      placeholder: "Describe lo que quieres crear...",
      shifting: "Generando tu creación...",
      advanced: "Avanzado",
      optimize: "Optimizar",
      clearGenerations: "Limpiar Generaciones",
      success: "¡Generación completada!",
      heroTitle: "Pixeo Creative Studio",
      heroSubtitle:
        "Tu estudio creativo potenciado por IA. Elige un modelo, escribe tu idea y deja que la magia ocurra.",
    },
    library: {
      empty: "No se encontraron elementos en tu biblioteca.",
      deletedAll: "Todos los elementos han sido eliminados",
    },
    settings: {
      title: "Configuración de la Aplicación",
      apiKeyPlaceholder: "Ingresa tu Clave API de Chutes",
      logs: "Log de Actividad",
      theme: "Tema",
      clearLogs: "Limpiar logs",
      waitingActivity: "Esperando actividad...",
    },
    actions: {
      zoom: "Zoom",
      download: "Descargar",
      delete: "Eliminar",
      downloadContent: "Descargar Contenido",
      deleteAll: "Eliminar Todo",
      deleteAllConfirm:
        "¿Estás seguro de que quieres eliminar todos los elementos? Esta acción no se puede deshacer.",
    },
    logs: {
      promptOptimized: "[{model}] Prompt optimizado",
      optimizationFailed:
        "Optimización fallida, usando prompt original: {error}",
      sendingRequest: "[{model}] Enviando petición a: {endpoint}",
      generationSuccess: "Generación exitosa: {model}",
    },
    errors: {
      quotaFetchFailed: "Error al obtener cuota",
      apiError: "Error de API: {status} - {message}",
    },
  },
};

export const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem("pixeo_locale") || "en",
  fallbackLocale: "en",
  messages,
});
