import { MODEL_CONFIGS as ORIG_IMG, VIDEO_MODEL_CONFIGS as ORIG_VID, EDIT_MODEL_CONFIGS as ORIG_EDIT, TTS_MODEL_CONFIGS as ORIG_TTS } from './models_data';

export const IMG_MODELS = ORIG_IMG as Record<string, any>;
export const VIDEO_MODELS = ORIG_VID as Record<string, any>;
export const EDIT_MODELS = ORIG_EDIT as Record<string, any>;
export const TTS_MODELS = ORIG_TTS as Record<string, any>;

export type ModelMode = 'text2image' | 'image2video' | 'text2video' | 'image-edit' | 'text2speech';

export const MODES: { id: ModelMode; label: string; icon: string }[] = [
  { id: 'text2image', label: 'Image', icon: 'Image' },
  { id: 'image-edit', label: 'Edit', icon: 'Edit' },
  { id: 'text2video', label: 'Video', icon: 'Video' },
  { id: 'text2speech', label: 'Audio', icon: 'Mic' },
];
