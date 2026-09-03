export type HeatmapFormat = "9-16" | "a4";

export type HeatmapRgb = readonly [number, number, number];

export type HeatmapLook = {
  heat: HeatmapRgb;
  mid: HeatmapRgb;
  ground: HeatmapRgb;
  grain: number;
  wave: number;
  speed: number;
};

export type HeatmapImageSource = {
  src: string;
  /** Revoke on replace when this came from a file. */
  objectUrl?: boolean;
};

export type HeatmapReadStatus = "idle" | "reading" | "rough-read";

export type HeatmapFileStatus = "ok" | "error" | "too-big";

export type HeatmapPosterProps = {
  className?: string;
  format?: HeatmapFormat;
  look?: HeatmapLook;
  image?: HeatmapImageSource | null;
  forceReducedMotion?: boolean;
  readStatus?: HeatmapReadStatus;
  onReadStatus?: (status: HeatmapReadStatus) => void;
  caption?: string;
  isExport?: boolean;
};

export type PackedMask = {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
  frame: { x: number; y: number; w: number; h: number } | null;
};

export type DepthOutcome = "unavailable" | "discarded" | "ok" | "error";
