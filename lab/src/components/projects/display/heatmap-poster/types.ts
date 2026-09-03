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
  /** Held File. Decode from this; do not drop it for a blob URL. */
  file?: File;
  /** Revoke on replace when this came from a sample blob URL. */
  objectUrl?: boolean;
};

export type HeatmapReadStatus = "idle" | "reading";

export type HeatmapFileStatus = "ok" | "error" | "too-big";

export type HeatmapPosterProps = {
  className?: string;
  format?: HeatmapFormat;
  look?: HeatmapLook;
  image?: HeatmapImageSource | null;
  forceReducedMotion?: boolean;
  readStatus?: HeatmapReadStatus;
  fileStatus?: HeatmapFileStatus;
  onReadStatus?: (status: HeatmapReadStatus) => void;
  onFileStatus?: (status: HeatmapFileStatus) => void;
  caption?: string;
  isExport?: boolean;
};

export type FocalPoint = { cx: number; cy: number };

export type PackedMask = {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
  frame: { x: number; y: number; w: number; h: number } | null;
};

export type DepthOutcome = "unavailable" | "discarded" | "ok" | "error";
