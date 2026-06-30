export const LOADER_PARAM_RANGES = {
  blur: { min: 0, max: 24, step: 1, default: 7 },
  corner: { min: 0, max: 100, step: 1, default: 10 },
  power: { min: 1, max: 8, step: 0.5, default: 2 },
  chromaticAberration: { min: 0, max: 12, step: 1, default: 4 },
} as const;

export const LOADER_DEFAULTS = {
  blur: LOADER_PARAM_RANGES.blur.default,
  corner: LOADER_PARAM_RANGES.corner.default,
  power: LOADER_PARAM_RANGES.power.default,
  chromaticAberration: LOADER_PARAM_RANGES.chromaticAberration.default,
  size: 280,
  speed: 0.5,
} as const;

export const LOADER_COLOR_DEFAULTS = {
  core: "#ffffff",
  aberrationWarm: "#ff8c42",
  aberrationCool: "#4da6ff",
} as const;

export const CALIBRATION_PRESETS = {
  tightCorner: { blur: 7, corner: 10, power: 2, chromaticAberration: 4 },
  softBlob: { blur: 16, corner: 100, power: 2, chromaticAberration: 4 },
  crispBean: { blur: 0, corner: 100, power: 2, chromaticAberration: 4 },
} as const;

export type BlobbyLoaderColors = {
  core?: string;
  aberrationWarm?: string;
  aberrationCool?: string;
};

export type ShapeParams = {
  power: number;
  corner: number;
  size: number;
};

export type DrawLoaderOptions = {
  blur: number;
  power: number;
  corner: number;
  chromaticAberration: number;
  rotation: number;
  size: number;
  colors?: BlobbyLoaderColors;
};
