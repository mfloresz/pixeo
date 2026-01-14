# Plantillas de Prompts para los Modos 'Replicar' y 'Mejorar'

## Introducción
Este documento contiene las plantillas de prompts base para los modos 'Replicar' y 'Mejorar' de la pestaña 'Prompt Generator'. Estas plantillas están diseñadas para ser utilizadas con el modelo `OpenGVLab/InternVL3-78B-TEE` y siguen las guías de documentación proporcionadas.

## Plantilla para el Modo 'Replicar'

### Descripción
Esta plantilla se utiliza para generar un prompt que permita replicar una imagen basada en su análisis visual. La plantilla incluye instrucciones detalladas sobre cómo describir la imagen de manera efectiva.

### Plantilla Base
```markdown
# Instrucciones para Generar un Prompt de Réplica

Analiza la imagen proporcionada y genera un prompt detallado que permita replicarla. Sigue estas pautas:

1. **Estructura del Prompt**:
   - Utiliza un lenguaje natural y descriptivo.
   - Evita el uso de etiquetas meta como "8K", "masterpiece", etc.
   - No utilices prompts negativos; describe solo lo que deseas ver.

2. **Componentes a Incluir**:
   - **Encuadre y Composición**: Tipo de plano (primer plano, plano medio, etc.), ángulo de la cámara, profundidad de campo, composición.
   - **Sujeto**: Etnia, edad, género, características faciales, expresión.
   - **Cabello**: Peinado, color, textura, longitud.
   - **Ropa**: Descripción concisa de cada prenda, incluyendo tipo, color y material.
   - **Posición del Cuerpo**: Postura, posición de brazos y manos, ángulo del cuerpo.
   - **Entorno**: Fondo, escenario, accesorios.
   - **Iluminación**: Tipo de iluminación, dirección, calidad, temperatura de color.

3. **Ejemplo de Estructura**:
   ```
   Un primer plano de una mujer adulta de etnia [etnia], con piel [tono de piel], en sus [edad]. Tiene el cabello [descripción del cabello] y ojos [color y forma de los ojos]. Lleva puesto [descripción de la ropa]. La imagen está tomada desde un ángulo [ángulo de la cámara], con una profundidad de campo [profundidad de campo]. El fondo es [descripción del fondo], con una iluminación [descripción de la iluminación].
   ```

4. **Instrucciones Adicionales**:
   - Sé específico y detallado en cada descripción.
   - Utiliza términos técnicos de fotografía para describir la composición y la iluminación.
   - Asegúrate de que todas las descripciones sean visibles y concretas.

# Imagen a Analizar
[Imagen proporcionada por el usuario]

# Prompt Generado
