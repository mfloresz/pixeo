export type HistoryItem = {
  id: string;
  type: "image" | "video" | "audio";
  mode: string;
  model: string;
  params: any;
  timestamp: Date;
  blobKey: string;
};

// Editor Types
export type EditorLayerType = "text" | "image" | "rect" | "circle" | "ellipse" | "line" | "star" | "arrow" | "polygon" | "path" | "group";

// Text layer properties
export interface TextLayerProps {
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  width?: number;
  height?: number;
}

// Rectangle layer properties
export interface RectLayerProps {
  width: number;
  height: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

// Circle layer properties
export interface CircleLayerProps {
  radius: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

// Ellipse layer properties
export interface EllipseLayerProps {
  radiusX: number;
  radiusY: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

// Line layer properties
export interface LineLayerProps {
  points: number[];
  stroke: string;
  strokeWidth: number;
  dash?: number[];
  closed?: boolean;
}

// Star layer properties
export interface StarLayerProps {
  numPoints: number;
  innerRadius: number;
  outerRadius: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

// Arrow layer properties
export interface ArrowLayerProps {
  points: number[];
  pointerLength: number;
  pointerWidth: number;
  pointerAtBeginning?: boolean;
  pointerAtEnding?: boolean;
  stroke: string;
  strokeWidth: number;
}

// Polygon layer properties
export interface PolygonLayerProps {
  sides: number;
  radius: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

// Path layer properties
export interface PathLayerProps {
  data: string;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

// Common layer properties
export interface CommonLayerProps {
  id: string;
  type: EditorLayerType;
  name: string;
  visible: boolean;
  locked: boolean;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  draggable: boolean;
}

// Text layer type
export interface TextLayer extends CommonLayerProps, TextLayerProps {}

// Image layer type
export interface ImageLayer extends CommonLayerProps {
  src: string;
  width?: number;
  height?: number;
}

// Rectangle layer type
export interface RectLayer extends CommonLayerProps, RectLayerProps {}

// Circle layer type
export interface CircleLayer extends CommonLayerProps, CircleLayerProps {}

// Ellipse layer type
export interface EllipseLayer extends CommonLayerProps, EllipseLayerProps {}

// Line layer type
export interface LineLayer extends CommonLayerProps, LineLayerProps {}

// Star layer type
export interface StarLayer extends CommonLayerProps, StarLayerProps {}

// Arrow layer type
export interface ArrowLayer extends CommonLayerProps, ArrowLayerProps {}

// Polygon layer type
export interface PolygonLayer extends CommonLayerProps, PolygonLayerProps {}

// Path layer type
export interface PathLayer extends CommonLayerProps, PathLayerProps {}

// Group child type
export interface GroupChild {
  id: string;
  type: Exclude<EditorLayerType, "group" | "image">;
  name: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  // Shape specific properties
  width?: number;
  height?: number;
  radius?: number;
  radiusX?: number;
  radiusY?: number;
  sides?: number;
  points?: number[];
  numPoints?: number;
  innerRadius?: number;
  outerRadius?: number;
  pointerLength?: number;
  pointerWidth?: number;
  pointerAtBeginning?: boolean;
  pointerAtEnding?: boolean;
  dash?: number[];
  closed?: boolean;
  data?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
  offsetX?: number;
  offsetY?: number;
  rotation?: number;
}

// Group layer type
export interface GroupLayer extends CommonLayerProps {
  children: GroupChild[];
  isGroupOpen?: boolean;
  editingChildId?: string | null;
}

// Union type for all layer types
export type EditorLayer = TextLayer | ImageLayer | RectLayer | CircleLayer | EllipseLayer | LineLayer | StarLayer | ArrowLayer | PolygonLayer | PathLayer | GroupLayer;

export interface EditorTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  category: string;
  icon?: string;
}

export interface EditorProject {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
  layers: EditorLayer[];
  createdAt: Date;
  updatedAt: Date;
}

// Sidebar types
export type SidebarTool = "text" | "elements" | "settings" | "image";
