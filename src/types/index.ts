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
export type EditorLayerType = "text" | "image" | "rect" | "circle" | "line" | "star" | "arrow";

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
  points?: number[];
  // Image specific
  src?: string;
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
