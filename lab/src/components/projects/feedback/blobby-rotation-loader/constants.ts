export const LOADER_PARAM_RANGES = {
  blur: { min: 0, max: 24, step: 1, default: 7 },
  corner: { min: 0, max: 100, step: 1, default: 10 },
  power: { min: 1, max: 8, step: 0.5, default: 2 },
  chromaticAberration: { min: 0, max: 12, step: 1, default: 4 },
  tail: { min: 0, max: 100, step: 1, default: 0 },
  speed: { min: 0, max: 100, step: 1, default: 15 },
} as const;

/** Maps speed slider (0–100) to rotations per second (0.05–3.05). */
export function speedSliderToRps(slider: number): number {
  return 0.05 + (slider / 100) * 3;
}

export function rpsToSpeedSlider(rps: number): number {
  return Math.round(((rps - 0.05) / 3) * 100);
}

export const LOADER_DEFAULTS = {
  blur: LOADER_PARAM_RANGES.blur.default,
  corner: LOADER_PARAM_RANGES.corner.default,
  power: LOADER_PARAM_RANGES.power.default,
  chromaticAberration: LOADER_PARAM_RANGES.chromaticAberration.default,
  tail: LOADER_PARAM_RANGES.tail.default,
  speed: LOADER_PARAM_RANGES.speed.default,
  drawSize: 300,
} as const;

export const LOADER_COLOR_DEFAULTS = {
  core: "#ffffff",
  aberrationWarm: "#ff8c42",
  aberrationCool: "#4da6ff",
} as const;

export const CALIBRATION_PRESETS = {
  tightCorner: { blur: 7, corner: 10, power: 2, chromaticAberration: 4, tail: 0 },
  softBlob: { blur: 16, corner: 100, power: 2, chromaticAberration: 4, tail: 0 },
  crispBean: { blur: 0, corner: 100, power: 2, chromaticAberration: 4, tail: 0 },
} as const;

export type BlobbyLoaderColors = {
  core?: string;
  aberrationWarm?: string;
  aberrationCool?: string;
};

export type ShapeParams = {
  power: number;
  corner: number;
  tail: number;
  drawSize: number;
};

export type DrawLoaderOptions = {
  blur: number;
  power: number;
  corner: number;
  tail: number;
  chromaticAberration: number;
  rotation: number;
  drawSize: number;
  colors?: BlobbyLoaderColors;
};

export type CanvasLayout = {
  canvasSize: number;
  center: number;
  padding: number;
};
