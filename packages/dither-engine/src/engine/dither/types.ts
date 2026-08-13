/**
 * Dither algorithm configuration — Sprint 5.
 * Matrix size, pattern scale, and render density are distinct spatial systems.
 */

import type { DitherSize } from "../../types";

export type DitherAlgorithmId =
  | "bayer"
  | "blue-noise"
  | "random"
  | "clustered-dot"
  | "halftone"
  | "posterized"
  | "hybrid"
  | "animated"
  | "line-screen"
  | "crosshatch";

export type DitherConfig = {
  algorithm: DitherAlgorithmId;
  /** Ordered matrix complexity (Bayer family). */
  matrixSize: DitherSize;
  /**
   * How large the pattern appears on screen.
   * Independent of matrixSize and of render `pixelDensity`.
   */
  patternScale: number;
  /** Shifts quantization boundary (− soft / + hard ink). */
  thresholdBias: number;
  /** Invert light→ink response (bright core denser when true). */
  invertResponse: boolean;
  /** Blue-noise / random temporal evolution. */
  temporalDrift: number;
  /** Blue-noise distribution strength. */
  distribution: number;
  /** Clustered-dot / halftone cell size. */
  clusterSize: number;
  /** Clustered-dot roundness (0 = square, 1 = round). */
  dotRoundness: number;
  /** Screen / line / cluster angle in degrees. */
  angle: number;
  /** Clustered coverage bias. */
  coverage: number;
  /** Halftone cell size. */
  cellSize: number;
  /** Line-screen width. */
  lineWidth: number;
  /** Line-screen spacing. */
  spacing: number;
  /** Line-screen wave distortion. */
  waveDistortion: number;
  /** Crosshatch layer count (1–4). */
  lineCount: number;
  /** Crosshatch angle separation. */
  angleSeparation: number;
  /** Crosshatch roughness. */
  roughness: number;
  /** Hybrid secondary algorithm index (0=bayer, 1=blue-noise, 2=random, 3=line). */
  secondary: number;
  /** Hybrid blend amount. */
  blendAmount: number;
};

export type DitherUniformPayload = {
  algorithm: number;
  matrixSize: number;
  patternScale: number;
  thresholdBias: number;
  invertResponse: number;
  temporalDrift: number;
  distribution: number;
  clusterSize: number;
  dotRoundness: number;
  angle: number;
  coverage: number;
  cellSize: number;
  lineWidth: number;
  spacing: number;
  waveDistortion: number;
  lineCount: number;
  angleSeparation: number;
  roughness: number;
  secondary: number;
  blendAmount: number;
};

export const DITHER_ALGORITHM_INDEX: Record<DitherAlgorithmId, number> = {
  bayer: 0,
  "blue-noise": 1,
  random: 2,
  "clustered-dot": 3,
  halftone: 4,
  posterized: 5,
  hybrid: 6,
  animated: 7,
  "line-screen": 8,
  crosshatch: 9,
};

export const DITHER_ALGORITHMS: {
  id: DitherAlgorithmId;
  label: string;
  description: string;
}[] = [
  {
    id: "bayer",
    label: "Ordered Bayer",
    description: "Classic ordered matrix — matrix size changes pattern family.",
  },
  {
    id: "blue-noise",
    label: "Blue Noise",
    description: "Spatially distributed thresholds — soft grain without banding.",
  },
  {
    id: "random",
    label: "Random Threshold",
    description: "White-noise thresholds — harsh stochastic grain.",
  },
  {
    id: "clustered-dot",
    label: "Clustered Dot",
    description: "AM-style clusters that grow with coverage.",
  },
  {
    id: "halftone",
    label: "Halftone",
    description: "Circular dots on a screen grid with angle control.",
  },
  {
    id: "posterized",
    label: "Posterized Dither",
    description: "Quantized tones then Bayer — stepped print look.",
  },
  {
    id: "hybrid",
    label: "Hybrid Dither",
    description: "Blend Bayer with a secondary algorithm.",
  },
  {
    id: "animated",
    label: "Animated Threshold",
    description: "Time-evolving thresholds for living grain.",
  },
  {
    id: "line-screen",
    label: "Line Screen",
    description: "Engraving-style parallel lines.",
  },
  {
    id: "crosshatch",
    label: "Crosshatch",
    description: "Layered angled strokes with roughness.",
  },
];

export const DEFAULT_DITHER_CONFIG: DitherConfig = {
  algorithm: "bayer",
  matrixSize: 8,
  patternScale: 1,
  thresholdBias: 0,
  invertResponse: false,
  temporalDrift: 0.15,
  distribution: 0.85,
  clusterSize: 0.45,
  dotRoundness: 0.85,
  angle: 45,
  coverage: 0.5,
  cellSize: 0.4,
  lineWidth: 0.35,
  spacing: 0.45,
  waveDistortion: 0.1,
  lineCount: 2,
  angleSeparation: 75,
  roughness: 0.25,
  secondary: 1,
  blendAmount: 0.45,
};

export function idleDitherPayload(): DitherUniformPayload {
  const d = DEFAULT_DITHER_CONFIG;
  return {
    algorithm: DITHER_ALGORITHM_INDEX[d.algorithm],
    matrixSize: d.matrixSize,
    patternScale: d.patternScale,
    thresholdBias: d.thresholdBias,
    invertResponse: d.invertResponse ? 1 : 0,
    temporalDrift: d.temporalDrift,
    distribution: d.distribution,
    clusterSize: d.clusterSize,
    dotRoundness: d.dotRoundness,
    angle: d.angle,
    coverage: d.coverage,
    cellSize: d.cellSize,
    lineWidth: d.lineWidth,
    spacing: d.spacing,
    waveDistortion: d.waveDistortion,
    lineCount: d.lineCount,
    angleSeparation: d.angleSeparation,
    roughness: d.roughness,
    secondary: d.secondary,
    blendAmount: d.blendAmount,
  };
}

export function getDitherAlgorithm(id: DitherAlgorithmId) {
  return DITHER_ALGORITHMS.find((a) => a.id === id);
}
