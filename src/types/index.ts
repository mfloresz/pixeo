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
export type EditorLayerType = "text" | "image" | "rect" | "circle" | "ellipse" | "line" | "star" | "arrow" | "polygon" | "path";

export interface EditorLayer {
  id: string;
  type: EditorLayerType;
  name: string;
  visible: boolean;
  locked: boolean;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  // Shape specific
  radius?: number;
  radiusX?: number; // Ellipse
  radiusY?: number; // Ellipse
  sides?: number; // RegularPolygon
  points?: number[];
  // Star specific
  numPoints?: number;
  innerRadius?: number;
  outerRadius?: number;
  // Arrow specific
  pointerLength?: number;
  pointerWidth?: number;
  pointerAtBeginning?: boolean;
  pointerAtEnding?: boolean;
  // Line specific
  dash?: number[];
  closed?: boolean;
  // Image specific
  src?: string;
  // Path specific
  data?: string;
  // Common
  draggable: boolean;
}

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
