export type ChromePresetId =
  | "mirror-chrome"
  | "polished-silver"
  | "dark-chrome"
  | "brushed-steel";

export type SpinAxisId = "x" | "y" | "z" | "custom";

export type SpinDirection = "cw" | "ccw";

export type EasingId = "linear" | "ease-in-out" | "smooth";

export type ViewPresetId =
  | "front"
  | "three-quarter-left"
  | "three-quarter-right"
  | "slight-top"
  | "reset";

export type PreviewBackdropId =
  | "black"
  | "charcoal"
  | "white"
  | "checker"
  | "transparent";

export type LogoKind = "svg" | "png";

export type GeometrySettings = {
  depth: number;
  bevel: boolean;
  bevelSize: number;
  bevelThickness: number;
  bevelSegments: number;
  curveDetail: number;
};

export type TraceSettings = {
  alphaThreshold: number;
  traceDetail: number;
  smoothing: number;
};

export type MaterialSettings = {
  preset: ChromePresetId;
  metalness: number;
  roughness: number;
  tint: string;
  brushedAmount: number;
  brushedDirection: number;
};

export type EnvironmentSettings = {
  envIntensity: number;
  exposure: number;
  keyWidth: number;
  keyAngle: number;
  stripStrength: number;
  stripWidth: number;
  blockerStrength: number;
  envRotation: number;
};

export type AnimationSettings = {
  playing: boolean;
  speed: number;
  direction: SpinDirection;
  axis: SpinAxisId;
  customAxis: { x: number; y: number; z: number };
  turns: number;
  easing: EasingId;
};

export type CameraSettings = {
  fov: number;
  distance: number;
  azimuth: number;
  polar: number;
  panX: number;
  panY: number;
  objectRotX: number;
  objectRotY: number;
  objectRotZ: number;
};

export type ExportPresetId =
  | "1080-square"
  | "1920x1080"
  | "1080x1920"
  | "2048-square"
  | "3840x2160"
  | "custom";

/** Opaque social ground under MP4. Not an alpha channel. */
export type Mp4Ground = "black" | "white";

export type ExportSettings = {
  stillPreset: ExportPresetId;
  width: number;
  height: number;
  lockAspect: boolean;
  sequenceFps: 24 | 30 | 60;
  sequenceDuration: number;
  sequenceTurns: number;
  includeWebM: boolean;
  mp4Ground: Mp4Ground;
};

export type LogoInfo = {
  filename: string;
  kind: LogoKind;
  width?: number;
  height?: number;
  opaqueRaster: boolean;
};

export type ChromeMarkSettings = {
  geometry: GeometrySettings;
  trace: TraceSettings;
  material: MaterialSettings;
  environment: EnvironmentSettings;
  animation: AnimationSettings;
  camera: CameraSettings;
  export: ExportSettings;
  previewBackdrop: PreviewBackdropId;
};

export type SavedRendererPreset = {
  name: string;
  savedAt: number;
  geometry: GeometrySettings;
  material: MaterialSettings;
  environment: EnvironmentSettings;
  camera: CameraSettings;
  animation: AnimationSettings;
};

export type LogoLoadErrorCode =
  | "invalid-svg"
  | "no-fills"
  | "zero-size"
  | "malformed-png"
  | "unsupported"
  | "webgl"
  | "gpu-limit"
  | "cancelled";

export class LogoLoadError extends Error {
  readonly code: LogoLoadErrorCode;

  constructor(code: LogoLoadErrorCode, message: string) {
    super(message);
    this.name = "LogoLoadError";
    this.code = code;
  }
}

export type ChromeMarkAppProps = {
  forceReducedMotion?: boolean;
};
