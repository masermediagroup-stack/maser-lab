export type TextDensity = "coarse" | "medium" | "detailed" | "high" | "ultra";
export type RenderQuality = "performance" | "balanced" | "high" | "ultra";
export type EdgeDetailLevel = "clean" | "detailed" | "maximum";
export type PieceScale = "small" | "mixed" | "large";
export type ConcurrencyLevel = "low" | "balanced" | "high" | "maximum" | "auto";

/** Logical cells per em (fontSize). Higher = denser glyph reconstruction. */
export const DENSITY_CELLS_PER_EM: Record<TextDensity, number> = {
  coarse: 10,
  medium: 18,
  detailed: 28,
  high: 40,
  ultra: 56,
};

/** @deprecated alias */
export const CELLS_PER_EM = DENSITY_CELLS_PER_EM;

export const DENSITY_LABELS: Record<TextDensity, string> = {
  coarse: "1 · Coarse",
  medium: "2 · Medium",
  detailed: "3 · Detailed",
  high: "4 · High",
  ultra: "5 · Ultra",
};

export const DENSITY_SELECT_OPTIONS: { value: TextDensity; label: string }[] = [
  { value: "coarse", label: "1 · Coarse" },
  { value: "medium", label: "2 · Medium" },
  { value: "detailed", label: "3 · Detailed" },
  { value: "high", label: "4 · High" },
  { value: "ultra", label: "5 · Ultra" },
];

/** Offscreen supersample factor for text-mask rasterization. */
export const QUALITY_SUPERSAMPLE: Record<RenderQuality, number> = {
  performance: 2,
  balanced: 3,
  high: 4,
  ultra: 6,
};

/** @deprecated alias */
export const SUPER_SAMPLE = QUALITY_SUPERSAMPLE;

/** Coverage threshold — lower = more edge cells kept. */
export const EDGE_COVERAGE: Record<EdgeDetailLevel, number> = {
  clean: 0.28,
  detailed: 0.14,
  maximum: 0.08,
};

export type PieceScaleProfile = {
  preferredSizes: number[];
  tetrominoWeight: number;
  triominoWeight: number;
  pentominoWeight: number;
  maxCluster: number;
};

export const PIECE_SCALE_PROFILES: Record<PieceScale, PieceScaleProfile> = {
  small: {
    preferredSizes: [4, 3, 2, 1],
    tetrominoWeight: 0.7,
    triominoWeight: 0.85,
    pentominoWeight: 0.15,
    maxCluster: 4,
  },
  mixed: {
    preferredSizes: [4, 5, 3, 6, 2, 1],
    tetrominoWeight: 0.75,
    triominoWeight: 0.45,
    pentominoWeight: 0.55,
    maxCluster: 6,
  },
  large: {
    preferredSizes: [6, 5, 4, 3, 2, 1],
    tetrominoWeight: 0.55,
    triominoWeight: 0.35,
    pentominoWeight: 0.8,
    maxCluster: 10,
  },
};

export const CONCURRENCY_PEAK: Record<Exclude<ConcurrencyLevel, "auto">, number> = {
  low: 0.08,
  balanced: 0.16,
  high: 0.28,
  maximum: 0.42,
};

/** Sampling resolution in CSS px — independent of final on-stage block size. */
export function densityToLogicalCellPx(fontSize: number, density: TextDensity): number {
  const cellsPerEm = DENSITY_CELLS_PER_EM[density];
  return Math.max(0.85, fontSize / cellsPerEm);
}

/**
 * Final drawn cell size. Prefer density-derived size; shrink only to fit the stage.
 * Never enlarge past preferred — so larger fonts grow the word, not the blocks.
 */
export function resolveRenderCellSize(
  gridWidth: number,
  gridHeight: number,
  stageWidth: number,
  stageHeight: number,
  preferredCellPx: number,
  override?: number,
): number {
  if (override && override > 0) {
    return Math.max(2, Math.round(override));
  }
  const fitW = (stageWidth * 0.94) / Math.max(1, gridWidth);
  const fitH = (stageHeight * 0.86) / Math.max(1, gridHeight);
  const maxFit = Math.min(fitW, fitH);
  return Math.max(2, Math.floor(Math.min(Math.max(2, preferredCellPx), maxFit)));
}

export function concurrencyFromDuration(
  durationSec: number,
): Exclude<ConcurrencyLevel, "auto"> {
  if (durationSec <= 1.2) return "maximum";
  if (durationSec <= 2.5) return "high";
  if (durationSec <= 6) return "balanced";
  return "low";
}

export function peakConcurrentFor(
  level: ConcurrencyLevel,
  durationSec: number,
  pieceCount: number,
): number {
  const resolved =
    level === "auto" ? concurrencyFromDuration(durationSec) : level;
  const ratio = CONCURRENCY_PEAK[resolved];
  return Math.max(2, Math.min(pieceCount, Math.ceil(pieceCount * ratio)));
}

export function preferredRenderCellPx(logicalCellPx: number, density: TextDensity): number {
  const base = Math.max(2, Math.round(logicalCellPx * 0.85));
  if (density === "ultra") return Math.max(2, Math.min(base, 3));
  if (density === "high") return Math.max(2, Math.min(base, 4));
  if (density === "detailed") return Math.max(2, Math.min(base, 5));
  if (density === "medium") return Math.max(3, Math.min(base, 6));
  return Math.max(4, Math.min(base, 8));
}
