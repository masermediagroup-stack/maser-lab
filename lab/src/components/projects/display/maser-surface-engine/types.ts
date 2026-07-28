import type { CSSProperties } from "react";

/** Bayer matrix size options for ordered dithering. */
export type DitherSize = 2 | 4 | 8 | 16;

/** Tunable monochrome material parameters (targets → damped current). */
export type MonochromeParams = {
  ditherSize: DitherSize;
  posterization: number;
  noiseScale: number;
  noiseSpeed: number;
  contrast: number;
  brightness: number;
  gradientAngle: number;
  gradientColorA: number;
  gradientColorB: number;
  bloom: number;
  bloomRadius: number;
  grainAmount: number;
  pixelDensity: number;
  shadowStrength: number;
  highlightStrength: number;
  softEdge: number;
  randomSeed: number;
  animationSpeed: number;
  cursorInfluence: number;
  scrollInfluence: number;
  depth: number;
  lightX: number;
  lightY: number;
  opacity: number;
  blueNoiseAmount: number;
};

export type MonochromeUniformState = MonochromeParams & {
  time: number;
  pointerX: number;
  pointerY: number;
  scrollY: number;
  resolutionX: number;
  resolutionY: number;
  dpr: number;
};

export type SurfaceRendererKind = "webgl2" | "canvas2d";

export type MaterialId =
  | "monochrome"
  | "liquid"
  | "bubble"
  | "paper"
  | "foam"
  | "mesh"
  | "marble"
  | "crt"
  | "film"
  | "chrome"
  | "glass"
  | "ink"
  | "fabric"
  | "heatmap"
  | "topo"
  | "animated-gradient"
  | "sdf";

export type MaterialDefinition = {
  id: MaterialId;
  label: string;
  status: "ready" | "stub";
  defaults?: Partial<MonochromeParams>;
};

export type SurfaceCanvasProps = {
  params?: Partial<MonochromeParams>;
  className?: string;
  style?: CSSProperties;
  reducedMotion?: boolean;
  /** 0–1 normalized pointer within the canvas. */
  pointer?: { x: number; y: number } | null;
  scrollProgress?: number;
  "aria-label"?: string;
};

export type SurfaceCardProps = {
  title?: string;
  description?: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  params?: Partial<MonochromeParams>;
  reducedMotion?: boolean;
  className?: string;
};
