# Pixeo

Una aplicación web moderna para generar imágenes, editar imágenes y crear videos usando la plataforma de Chutes AI. Construida con Vue 3, TypeScript y Tailwind CSS.

## ✨ Características

- **Generación de Imágenes**: Crea imágenes de alta calidad usando modelos avanzados de IA como Z Image Turbo, Qwen Image, FLUX.1 Dev, y más.
- **Edición de Imágenes**: Edita imágenes existentes con modelos especializados como Qwen Image Edit.
- **Generación de Videos**: Crea videos desde texto o imágenes con modelos como Wan2.1 14B Video.
- **Texto a Voz**: Convierte texto en audio con modelos TTS como Kokoro y CSM 1B.
- **Biblioteca Personal**: Almacena y gestiona todos tus contenidos generados localmente.
- **Interfaz Intuitiva**: Diseño moderno con tres pestañas principales: Generar/Editar, Biblioteca y Configuración.
- **Soporte Multiidioma**: Disponible en español e inglés.
- **Almacenamiento Local**: Usa IndexedDB para guardar contenidos sin necesidad de servidor.
- **Notificaciones en Tiempo Real**: Recibe feedback inmediato sobre el progreso de tus generaciones.

## 🚀 Tecnologías

- **Framework**: Vue 3 con Composition API
- **Lenguaje**: TypeScript
- **Bundler**: Vite
- **Estilos**: Tailwind CSS con shadcn/ui components
- **Estado**: Pinia
- **Internacionalización**: vue-i18n
- **Iconos**: Lucide Vue Next
- **Notificaciones**: vue-sonner
- **Almacenamiento**: IndexedDB con idb
- **UI Components**: Radix UI con class-variance-authority

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd pixeo
```

2. Instala las dependencias:
```bash
npm install
# o
bun install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
# o
bun run dev
```

4. Abre tu navegador en `http://localhost:5173`

## 🛠️ Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la build de producción
- `npm run lint` - Ejecuta ESLint para verificar el código

## 🎯 Uso

### Configuración Inicial
1. Ve a la pestaña **Configuración**
2. Ingresa tu API key de Chutes AI
3. La aplicación verificará automáticamente tu cuota disponible

### Generar Contenido
1. Selecciona la pestaña **Generar/Editar**
2. Elige el modo: Imagen, Editar, Video o Audio
3. Selecciona un modelo disponible
4. Configura la resolución y parámetros avanzados
5. Escribe tu prompt
6. Haz clic en "Generar"

### Gestionar Biblioteca
- La pestaña **Biblioteca** muestra todos tus contenidos generados
- Usa el zoom para ver detalles completos
- Descarga contenidos individualmente
- Limpia la sesión actual con el botón de brush

## 🏗️ Arquitectura del Proyecto

```
src/
├── components/          # Componentes Vue reutilizables
│   ├── generate/        # Componentes para generación
│   ├── library/         # Componentes de biblioteca
│   └── settings/        # Componentes de configuración
├── config/              # Configuraciones de modelos y resoluciones
├── i18n/                # Archivos de internacionalización
├── lib/                 # Utilidades y helpers
├── services/            # Servicios API (Chutes AI)
├── stores/              # Estado global con Pinia
└── types/               # Definiciones TypeScript
```

## 🤖 Modelos Soportados

### Generación de Imágenes
- Z Image Turbo
- Hunyuan Image 3
- Qwen Image / Qwen Image 2512
- HiDream
- FLUX.1 Dev
- JuggernautXL
- Chroma
- iLustMix
- Neta Lumina
- Wan2.1 14B
- Y más...

### Edición de Imágenes
- Qwen Image Edit 2509/2511

### Generación de Videos
- Wan2.1 14B Video
- Wan 2.2 I2V 14B Fast

### Texto a Voz
- Kokoro
- CSM 1B

## 🌐 Internacionalización

La aplicación soporta español e inglés. Los archivos de traducción están en `src/i18n/`.

## 📱 Características Técnicas

- **Responsive Design**: Funciona en desktop y móvil
- **Tema Oscuro/Claro**: Cambia entre modos con el botón en la barra superior
- **Almacenamiento Offline**: Funciona sin conexión a internet (excepto para generar contenido)
- **Gestión de Cuota**: Monitorea tu uso de API en tiempo real
- **Logging Detallado**: Registra todas las operaciones en la configuración

## 🔧 Desarrollo

### Estructura de Modelos
Los modelos se configuran en `src/config/models_data.ts`. Cada modelo incluye:
- Endpoint de API
- Parámetros disponibles
- Resoluciones soportadas
- Mapeo de parámetros

### Añadir Nuevos Modelos
1. Agrega la configuración en `models_data.ts`
2. Actualiza las exportaciones en `models.ts`
3. Reinicia la aplicación

### Personalización de Resoluciones
Consulta `src/config/custom_resolutions.md` para aprender cómo definir resoluciones personalizadas.

## 📄 Licencia

Este proyecto es privado y está destinado para uso interno.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añade nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico o preguntas, contacta al equipo de desarrollo.
