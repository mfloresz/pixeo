# Pixeo App

Una webapp que funciona desde el navegador para generar imágenes, editar imágenes y crear videos usando la plataforma de Chutes AI.

# Tarea

Analizar el proyecto original/base 'chutes-img-ui' y crear una nueva versión mejorada que cumpla con los siguientes requisitos:

## Requisitos

- Replicar la funcionalidad de la webapp original:
    - Generar un unico archivo donde se almacena la configración de los modelos 'models.js'
    - Como se realizan las peticiones
    - El log de peticiones
    - El almacenamiento de las imagenes generadas y/o editadas
    - El almacenamiento de los videos generados
    - El conteo o muestra de la cuta disponible
    - Lo que no debes mantener únicamente es el sistema de emitir un sonido cuando la tarea se completa, en lugar de eso muestra una notificación usando Sonner.
    - Importa la lista de modelos desde el archivo 'models.js' junto con todos sus parámetros

## Consideraciones de la GUI

Si bien el backend o comportamiento se quiere replicar, la GUI se quiere mejorar para que sea más intuitiva y fácil de usar.

1. Para el layeout principal de la app toma como referencia la imagen en './plan/images/main.jpg'
En este caso si bien el campo donde se ingresan los prompts y opciones aparece en el centro, quiero que, cuando se escriba un prompt y se haga click en generar, entonces se desplace hacia la parte inferior, dejando el espacio del centro para mostrar las imagenes generadas.

2. En la parte superior quiero un menu de pestañas, como en './plan/images/main.jpg', pero en este caso serían 3 pestañas:
    - Generar/Editar Imagenes/Videos
    - Biblioteca: donde se muestren todos los archivos generados, editados y videos creados
    - Configuración: donde se pueda configurar la API key y mostrar el log

3. Para el elemento donde se ingresan los prompts y seleccionan modelos, considera las imágenes './plan/images/main.jpg' como referencia
   - Este elemento debe mostrar las opciones para elegir entre modos de texto a imagen, editar imágen, generar videos y Texto a voz. Como en './plan/images/mode_selection.jpg'
   - Al igual que el proyecto original, dependiendo de el moodo elegido, se deben cargar las opcones de los modelos disponibles para ese modo así como las resoluciones disponibles, como en las imágenes './plan/images/model-selector' y './plan/images/resolution_selection.jpg'

4. En esta nueva versión de usa vue, shadcn, tailwindcss, radix ui, lucide icons y DM Sans.

5. Añade soporte para multiples idiomas, en este caso español e inglés.

6. El proyecto debe ser fácil de mantener, por lo que es importante que el código sea limpio y bien organizado.


# Planeación

Es crucial que analices el proyecto original y no infieras funcionamientos o 'como debería funcionar', revisa el código para comprender como funciona el proyecto original y entonces realices la adaptación a este nuevo frameword.

No pierdas o elimines funcionalidades que existan en el proyecto original al realizar el desarrollo de este nuevo proyecto.

El proyecto inicial ya está ejecutado, puedes ver que ya existe index.hml, package.jso, etc.

No olvides analizar las imágenes en './plan/images' para entender mejor el diseño y el comportamiento de la app.

Si tienes dudas, pregunta primero. Tus interacciones conmigo son en español.


