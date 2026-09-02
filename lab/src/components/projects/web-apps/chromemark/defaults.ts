import type {
  AnimationSettings,
  CameraSettings,
  ChromeMarkSettings,
  ChromePresetId,
  EnvironmentSettings,
  ExportSettings,
  GeometrySettings,
  MaterialSettings,
  TraceSettings,
  ViewPresetId,
} from "./types";

export const GEOMETRY_DEFAULTS: GeometrySettings = {
  depth: 0.18,
  bevel: true,
  bevelSize: 0.036,
  bevelThickness: 0.046,
  bevelSegments: 12,
  curveDetail: 64,
};

export const TRACE_DEFAULTS: TraceSettings = {
  alphaThreshold: 16,
  traceDetail: 0.72,
  smoothing: 0.18,
};

export const MATERIAL_PRESETS: Record<
  ChromePresetId,
  Omit<MaterialSettings, "preset">
> = {
  "mirror-chrome": {
    metalness: 1,
    roughness: 0.14,
    tint: "#f4f6f8",
    brushedAmount: 0,
    brushedDirection: 0,
  },
  "polished-silver": {
    metalness: 1,
    roughness: 0.22,
    tint: "#e8eaee",
    brushedAmount: 0,
    brushedDirection: 0,
  },
  "dark-chrome": {
    metalness: 1,
    roughness: 0.16,
    tint: "#6d7178",
    brushedAmount: 0,
    brushedDirection: 0,
  },
  "brushed-steel": {
    metalness: 1,
    roughness: 0.28,
    tint: "#c5c8cc",
    brushedAmount: 0.72,
    brushedDirection: 90,
  },
};

export const MATERIAL_DEFAULTS: MaterialSettings = {
  preset: "mirror-chrome",
  ...MATERIAL_PRESETS["mirror-chrome"],
};

export const ENVIRONMENT_DEFAULTS: EnvironmentSettings = {
  envIntensity: 1.42,
  exposure: 1.08,
  keyWidth: 5.4,
  keyAngle: 32,
  stripStrength: 0.9,
  stripWidth: 0.22,
  blockerStrength: 0.7,
  envRotation: 0,
};

export const ANIMATION_DEFAULTS: AnimationSettings = {
  playing: true,
  speed: 0.125,
  direction: "cw",
  axis: "y",
  customAxis: { x: 0.35, y: 1, z: 0.12 },
  turns: 1,
  easing: "linear",
};

export const CAMERA_DEFAULTS: CameraSettings = {
  fov: 32,
  distance: 2.35,
  azimuth: 32,
  polar: 72,
  panX: 0,
  panY: 0,
  objectRotX: 0,
  objectRotY: 0,
  objectRotZ: 0,
};

export const EXPORT_DEFAULTS: ExportSettings = {
  stillPreset: "2048-square",
  width: 2048,
  height: 2048,
  lockAspect: true,
  sequenceFps: 30,
  sequenceDuration: 8,
  sequenceTurns: 1,
  includeWebM: false,
  mp4Ground: "black",
};

export const DEFAULT_SETTINGS: ChromeMarkSettings = {
  geometry: { ...GEOMETRY_DEFAULTS },
  trace: { ...TRACE_DEFAULTS },
  material: { ...MATERIAL_DEFAULTS },
  environment: { ...ENVIRONMENT_DEFAULTS },
  animation: { ...ANIMATION_DEFAULTS },
  camera: { ...CAMERA_DEFAULTS },
  export: { ...EXPORT_DEFAULTS },
  previewBackdrop: "black",
};

export const VIEW_PRESETS: Record<
  Exclude<ViewPresetId, "reset">,
  Pick<CameraSettings, "azimuth" | "polar">
> = {
  front: { azimuth: 0, polar: 90 },
  "three-quarter-left": { azimuth: 32, polar: 72 },
  "three-quarter-right": { azimuth: -32, polar: 72 },
  "slight-top": { azimuth: 28, polar: 58 },
};

export const EXPORT_PRESETS: Record<
  Exclude<ExportSettings["stillPreset"], "custom">,
  { width: number; height: number }
> = {
  "1080-square": { width: 1080, height: 1080 },
  "1920x1080": { width: 1920, height: 1080 },
  "1080x1920": { width: 1080, height: 1920 },
  "2048-square": { width: 2048, height: 2048 },
  "3840x2160": { width: 3840, height: 2160 },
};

export const PRESET_STORAGE_KEY = "chromemark-presets-v1";

export const SAMPLE_FIXTURES = [
  {
    id: "solid",
    label: "Solid mark",
    href: "/chromemark/fixtures/solid-mark.svg",
    filename: "solid-mark.svg",
  },
  {
    id: "hole",
    label: "Hole (O)",
    href: "/chromemark/fixtures/hole-mark.svg",
    filename: "hole-mark.svg",
  },
  {
    id: "multi",
    label: "Disconnected",
    href: "/chromemark/fixtures/multi-mark.svg",
    filename: "multi-mark.svg",
  },
  {
    id: "curve",
    label: "Curve (S)",
    href: "/chromemark/fixtures/curve-mark.svg",
    filename: "curve-mark.svg",
  },
  {
    id: "word",
    label: "Wordmark",
    href: "/chromemark/fixtures/word-mark.svg",
    filename: "word-mark.svg",
  },
  {
    id: "png",
    label: "PNG silhouette",
    href: "/chromemark/fixtures/silhouette.png",
    filename: "silhouette.png",
  },
] as const;
