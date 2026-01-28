// Utilidad para importar Fabric.js correctamente según la versión
import * as fabricModule from 'fabric';

// La versión 5.3.0-browser exporta los constructores directamente en el namespace
// pero pueden estar anidados en una propiedad 'fabric'
const fabric = (fabricModule as any).fabric || fabricModule;

export default fabric as typeof fabricModule;
export { fabric };

// Tipo para usar en importaciones de tipo
export type FabricNamespace = typeof fabric;
