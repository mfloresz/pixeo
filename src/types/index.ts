export type HistoryItemSource =
  | "generate"
  | "edit"
  | "canva"
  | "enhance"
  | "inpaint";

export type HistoryItem = {
  id: string;
  type: "image" | "video" | "audio" | "canva";
  mode: string;
  model: string;
  params: any;
  timestamp: Date;
  blobKey: string;
  /** Fuente/origin del item para distinguir entre generate, edit, canva, enhance, inpaint */
  source?: HistoryItemSource;
  /** Datos del proyecto Canva (solo para type='canva') */
  projectData?: any;
};
