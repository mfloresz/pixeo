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
  // Group specific
  children?: GroupChild[];
  isGroupOpen?: boolean; // For tracking if group is expanded in UI
  editingChildId?: string | null; // Track which child is being edited
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
