import {
  Image,
  ImagePlus,
  ImageUpscale,
  AudioLines,
  Video,
  PencilRuler,
  HelpCircle,
  type LucideIcon,
} from "lucide-vue-next";

export type ToolMode =
  | "text2image"
  | "image-edit"
  | "inpaint"
  | "text2speech"
  | "text2video"
  | "image2video"
  | "editor"
  | string;

interface ModeConfig {
  icon: LucideIcon;
  labelKey: string;
  defaultLabel: string;
}

const modeConfigMap: Record<string, ModeConfig> = {
  text2image: {
    icon: Image,
    labelKey: "modes.text2image",
    defaultLabel: "Texto a imagen",
  },
  "image-edit": {
    icon: ImagePlus,
    labelKey: "modes.imageEdit",
    defaultLabel: "Edición de imagen",
  },
  inpaint: {
    icon: ImageUpscale,
    labelKey: "modes.inpaint",
    defaultLabel: "Mejorar",
  },
  text2speech: {
    icon: AudioLines,
    labelKey: "modes.text2speech",
    defaultLabel: "Texto a voz",
  },
  text2video: {
    icon: Video,
    labelKey: "modes.text2video",
    defaultLabel: "Texto a video",
  },
  image2video: {
    icon: Video,
    labelKey: "modes.image2video",
    defaultLabel: "Imagen a video",
  },
  editor: {
    icon: PencilRuler,
    labelKey: "modes.editor",
    defaultLabel: "Editor",
  },
};

export function getModeConfig(mode: string | undefined): ModeConfig {
  if (!mode) {
    return {
      icon: HelpCircle,
      labelKey: "modes.unknown",
      defaultLabel: "Desconocido",
    };
  }
  return (
    modeConfigMap[mode] || {
      icon: HelpCircle,
      labelKey: "modes.unknown",
      defaultLabel: "Desconocido",
    }
  );
}

export function getModeIcon(mode: string | undefined): LucideIcon {
  return getModeConfig(mode).icon;
}

export function getModeLabelKey(mode: string | undefined): string {
  return getModeConfig(mode).labelKey;
}

export function getModeDefaultLabel(mode: string | undefined): string {
  return getModeConfig(mode).defaultLabel;
}
