# Plan de Implementación para la Pestaña 'Prompt Generator'

## Resumen
Este documento describe el plan detallado para implementar la nueva pestaña 'Prompt Generator' en la aplicación Pixeo, con los modos 'Replicar' y 'Mejorar'.

## Objetivos
1. Añadir una nueva pestaña 'Prompt Generator' en la interfaz de usuario.
2. Implementar dos modos de funcionamiento: 'Replicar' y 'Mejorar'.
3. Integrar el modelo `OpenGVLab/InternVL3-78B-TEE` para el análisis de imágenes.
4. Preparar la aplicación para la lectura automática de nuevos archivos de documentación.

## Diseño de la Interfaz de Usuario

### Nueva Pestaña
- **Nombre**: `Prompt Generator`
- **Icono**: Se utilizará un icono relevante de la biblioteca `lucide-vue-next`.
- **Posición**: Se añadirá al final de la lista de pestañas en la barra de navegación.

### Modos de Funcionamiento
1. **Replicar**:
   - **Descripción**: Analiza una imagen y genera un prompt para replicarla.
   - **Entrada**: Imagen subida por el usuario.
   - **Salida**: Prompt generado para replicar la imagen.

2. **Mejorar**:
   - **Descripción**: Toma un prompt del usuario y lo mejora según la documentación.
   - **Entrada**: Prompt proporcionado por el usuario.
   - **Salida**: Prompt mejorado.

### Componentes de la Interfaz
- **Selector de Modo**: Un selector para cambiar entre 'Replicar' y 'Mejorar'.
- **Área de Entrada**:
  - Para 'Replicar': Un área para subir imágenes.
  - Para 'Mejorar': Un área de texto para ingresar el prompt.
- **Botón de Generación**: Un botón para iniciar el proceso de generación.
- **Área de Salida**: Un área de texto para mostrar el prompt generado o mejorado.

## Implementación Técnica

### Cambios en el Archivo `src/App.vue`
1. **Añadir Nueva Pestaña**:
   - Añadir un nuevo objeto al array `tabs` con el ID `prompt-generator` y el icono correspondiente.
   - Añadir una nueva sección en el `Transition` para manejar la visualización de la pestaña.

2. **Componentes Necesarios**:
   - Crear un nuevo componente `PromptGenerator.vue` en `src/components/prompt-generator/`.
   - Este componente contendrá la lógica para los modos 'Replicar' y 'Mejorar'.

### Nuevo Componente `PromptGenerator.vue`
```vue
<template>
    <div class="flex flex-col gap-8">
        <div class="flex items-center justify-between mb-8">
            <h1 class="text-3xl font-bold tracking-tight">
                {{ $t("common.promptGenerator") }}
            </h1>
            <div class="flex items-center gap-4">
                <select v-model="selectedMode" class="px-3 py-1.5 text-sm rounded-lg border">
                    <option value="replicate">Replicar</option>
                    <option value="improve">Mejorar</option>
                </select>
            </div>
        </div>

        <div v-if="selectedMode === 'replicate'" class="flex flex-col gap-4">
            <div class="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                <input type="file" accept="image/*" @change="handleImageUpload" />
            </div>
            <button @click="generatePrompt" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                Generar Prompt
            </button>
        </div>

        <div v-else class="flex flex-col gap-4">
            <textarea v-model="userPrompt" placeholder="Ingresa tu prompt aquí..." class="w-full p-4 border rounded-lg min-h-[200px]"></textarea>
            <button @click="improvePrompt" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                Mejorar Prompt
            </button>
        </div>

        <div class="mt-8">
            <h2 class="text-xl font-semibold mb-4">Resultado:</h2>
            <textarea v-model="generatedPrompt" readonly class="w-full p-4 border rounded-lg min-h-[200px]"></textarea>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const selectedMode = ref('replicate');
const userPrompt = ref('');
const generatedPrompt = ref('');
const uploadedImage = ref<File | null>(null);

const handleImageUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        uploadedImage.value = target.files[0];
    }
};

const generatePrompt = async () => {
    if (!uploadedImage.value) {
        alert('Por favor, sube una imagen primero.');
        return;
    }
    
    // Lógica para generar el prompt a partir de la imagen
    // Utilizar el modelo OpenGVLab/InternVL3-78B-TEE
    generatedPrompt.value = 'Prompt generado a partir de la imagen...';
};

const improvePrompt = async () => {
    if (!userPrompt.value) {
        alert('Por favor, ingresa un prompt primero.');
        return;
    }
    
    // Lógica para mejorar el prompt
    generatedPrompt.value = 'Prompt mejorado...';
};
</script>
```

### Integración con el Modelo
1. **Configuración del Modelo**:
   - Utilizar el modelo `OpenGVLab/InternVL3-78B-TEE` para el análisis de imágenes.
   - Configurar el proveedor `chutes` para utilizar este modelo.

2. **Servicio de Generación de Prompts**:
   - Crear un nuevo servicio `src/services/promptGenerator.ts` para manejar la lógica de generación y mejora de prompts.
   - Este servicio interactuará con el modelo y devolverá los prompts generados o mejorados.

### Adaptación de la Documentación
1. **Actualizar Documentación Existente**:
   - Adaptar la documentación en `z-image-generator/` para incluir información sobre los nuevos modos.
   - Añadir ejemplos de uso para los modos 'Replicar' y 'Mejorar'.

2. **Preparar para Lectura Automática**:
   - Asegurar que la aplicación pueda leer automáticamente nuevos archivos de documentación.
   - Implementar un sistema de carga dinámica de documentación para nuevos modelos.

## Pasos para la Implementación

1. **Crear el Componente `PromptGenerator.vue`**:
   - Implementar la interfaz de usuario para los modos 'Replicar' y 'Mejorar'.

2. **Añadir la Nueva Pestaña en `App.vue`**:
   - Añadir la nueva pestaña al array `tabs`.
   - Añadir la lógica para mostrar el componente `PromptGenerator` cuando la pestaña esté activa.

3. **Implementar el Servicio `promptGenerator.ts`**:
   - Crear funciones para generar prompts a partir de imágenes.
   - Crear funciones para mejorar prompts existentes.

4. **Integrar el Modelo `OpenGVLab/InternVL3-78B-TEE`**:
   - Configurar el proveedor `chutes` para utilizar este modelo.
   - Asegurar que el modelo esté disponible para el análisis de imágenes.

5. **Probar la Funcionalidad**:
   - Probar los modos 'Replicar' y 'Mejorar' con diferentes imágenes y prompts.
   - Asegurar que la interfaz de usuario funcione correctamente.

6. **Documentar la Funcionalidad**:
   - Actualizar la documentación para incluir información sobre la nueva pestaña y sus modos.
   - Añadir ejemplos de uso y casos de prueba.

## Conclusión
Este plan detalla los pasos necesarios para implementar la nueva pestaña 'Prompt Generator' en la aplicación Pixeo. La implementación incluirá la creación de nuevos componentes, la integración con el modelo `OpenGVLab/InternVL3-78B-TEE`, y la adaptación de la documentación existente para soportar los nuevos modos de funcionamiento.