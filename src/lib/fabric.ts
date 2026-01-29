// Fabric.js v6 - Exportaciones
// Fabric v6 exporta un objeto con todas las clases

// @ts-ignore - Fabric no tiene tipos ES module correctos
import * as fabricExports from 'fabric';

// El módulo fabric puede venir como default o como namespace
const fabricModule = (fabricExports as any).default || fabricExports;

// Reexportar todas las clases como named exports
export const Canvas = fabricModule.Canvas;
export const Rect = fabricModule.Rect;
export const Circle = fabricModule.Circle;
export const Triangle = fabricModule.Triangle;
export const Polygon = fabricModule.Polygon;
export const Text = fabricModule.Text;
export const IText = fabricModule.IText;
export const FabricImage = fabricModule.FabricImage;
export const Shadow = fabricModule.Shadow;
export const FabricObject = fabricModule.FabricObject;
export const Point = fabricModule.Point;
export const util = fabricModule.util;
export const ActiveSelection = fabricModule.ActiveSelection;
export const Pattern = fabricModule.Pattern;
export const Gradient = fabricModule.Gradient;
export const BaseBrush = fabricModule.BaseBrush;
export const PencilBrush = fabricModule.PencilBrush;
export const CircleBrush = fabricModule.CircleBrush;
export const SprayBrush = fabricModule.SprayBrush;
export const Path = fabricModule.Path;
export const Group = fabricModule.Group;
export const Line = fabricModule.Line;
export const Ellipse = fabricModule.Ellipse;
export const Polyline = fabricModule.Polyline;
export const Textbox = fabricModule.Textbox;
export const StaticCanvas = fabricModule.StaticCanvas;
export const Observable = fabricModule.Observable;
export const Color = fabricModule.Color;
export const Control = fabricModule.Control;
export const FabricText = fabricModule.FabricText;
export const Image = fabricModule.Image;
export const filters = fabricModule.filters;

// Export default y namespace
export default fabricModule;
export const fabric = fabricModule;

// Tipos - usando el fabricModule como tipo
export type CanvasInstance = InstanceType<typeof fabricModule.Canvas>;
export type FabricObjectInstance = InstanceType<typeof fabricModule.FabricObject>;
export type ImageInstance = InstanceType<typeof fabricModule.FabricImage>;
export type TextInstance = InstanceType<typeof fabricModule.FabricText>;
export type ITextInstance = InstanceType<typeof fabricModule.IText>;
export type RectInstance = InstanceType<typeof fabricModule.Rect>;
export type CircleInstance = InstanceType<typeof fabricModule.Circle>;
export type TriangleInstance = InstanceType<typeof fabricModule.Triangle>;
export type PolygonInstance = InstanceType<typeof fabricModule.Polygon>;
export type ActiveSelectionInstance = InstanceType<typeof fabricModule.ActiveSelection>;

// Alias para compatibilidad con código antiguo (v5)
export type ICircleOptions = ConstructorParameters<typeof fabricModule.Circle>[0];
export type ITriangleOptions = ConstructorParameters<typeof fabricModule.Triangle>[0];
export type IRectOptions = ConstructorParameters<typeof fabricModule.Rect>[0];
export type IPolylineOptions = ConstructorParameters<typeof fabricModule.Polygon>[0];
export type ITextOptions = ConstructorParameters<typeof fabricModule.IText>[1];
export type IImageOptions = ConstructorParameters<typeof fabricModule.FabricImage>[1];
export type IBaseFilter = any;

// Namespace type
export type FabricNamespace = typeof fabricModule;
