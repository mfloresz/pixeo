export type HistoryItem = {
  id: string;
  type: "image" | "video" | "audio";
  mode: string;
  model: string;
  params: any;
  timestamp: Date;
  blobKey: string;
};
