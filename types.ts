export type FontOption = "'Bebas Neue', sans-serif" | "'Oswald', sans-serif" | "'Montserrat', sans-serif" | "'Roboto Mono', monospace";

export interface ElementTransform {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  crop: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface SequenceConfig {
  start: number;
  end: number;
  duration: number;
}

export interface VisibilityConfig {
  showRing: boolean;
  showCountdown: boolean;
  showStatus: boolean;
  showCustom: boolean;
  showPercentage: boolean;
  isPrime: boolean;
}

export interface VisualConfig {
  accentColor: string;
  ringColor: string;
  font: FontOption;
  glow: boolean;
  sound: boolean;
  backgroundStyle: 'solid' | 'gradient' | 'particles';
  motivationalText: string;
  startText: string;
  endText: string;
  customText: string;
  ringThickness: number;
}

export type ExportFormat = 'webm' | 'mp4' | 'png' | 'gif';
export type ResolutionPreset = '720p' | '1080p' | '4k';

export interface ExportSettings {
  format: ExportFormat;
  resolution: ResolutionPreset;
  fps: 30 | 60;
  quality: number;
}

export interface AppState {
  sequence: SequenceConfig;
  visuals: VisualConfig;
  visibility: VisibilityConfig;
  transforms: {
    ring: ElementTransform;
    countdown: ElementTransform;
    status: ElementTransform;
    custom: ElementTransform;
    percentage: ElementTransform;
  };
  canvas: {
    width: number;
    height: number;
    aspectRatio: '9:16' | '1:1' | '16:9';
  };
  exportSettings: ExportSettings;
  selectedElement: 'ring' | 'countdown' | 'status' | 'custom' | 'percentage' | null;
  isExporting: boolean;
  isPreviewing: boolean;
  progress: number;
  currentCount: number;
}

export interface AIThemeSuggestion {
  accentColor: string;
  ringColor?: string;
  font: FontOption;
  backgroundStyle: 'solid' | 'gradient' | 'particles';
  motivationalText: string;
  startText?: string;
  endText?: string;
  vibeDescription?: string;
}
