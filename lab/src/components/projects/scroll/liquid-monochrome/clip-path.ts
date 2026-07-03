import type { LiquidDirection } from "./types";

export type LiquidClipOptions = {
  direction: LiquidDirection;
  turbulence: number;
  noiseScale: number;
  liquidStrength: number;
  edgeSoftness: number;
  segments: number;
  seed: number;
  /** Scroll-driven phase - animates edge while scrubbing */
  phase: number;
};

type Point = {
  x: number;
  y: number;
};

const DEFAULT_SEGMENTS = 72;

function pct(value: number, total: number): string {
  return `${((value / total) * 100).toFixed(3)}%`;
}

function getWaveAmp(height: number, edgeSoftness: number): number {
  return height * (0.016 + Math.max(0, edgeSoftness) * 0.018);
}

function sampleWaveOffset(
  t: number,
  phase: number,
  options: Pick<
    LiquidClipOptions,
    "turbulence" | "noiseScale" | "liquidStrength" | "seed"
  >,
  amplitude: number,
): number {
  const seedOffset = options.seed * 0.173;
  const primaryFrequency = 1.15 + options.noiseScale * 2.2;
  const secondaryFrequency = primaryFrequency * 2.15;
  const primary =
    Math.sin(t * Math.PI * 2 * primaryFrequency + phase * 0.42 + seedOffset) *
    0.78;
  const secondary =
    Math.sin(t * Math.PI * 2 * secondaryFrequency - phase * 0.31 + seedOffset) *
    0.22;
  return (
    (primary + secondary) *
    amplitude *
    options.liquidStrength *
    options.turbulence
  );
}

function buildEdgePoints(
  progress: number,
  width: number,
  height: number,
  options: LiquidClipOptions,
): Point[] {
  if (width <= 0 || height <= 0) return [];

  const clamped = Math.min(1, Math.max(0, progress));
  const segments = options.segments || DEFAULT_SEGMENTS;
  const waveAmp = getWaveAmp(height, options.edgeSoftness);

  if (options.direction === "bottom-to-top") {
    const fillLine = height * (1 - clamped);
    const points: Point[] = [];
    for (let i = segments; i >= 0; i--) {
      const x = (i / segments) * width;
      const t = i / segments;
      const y = Math.min(
        height,
        Math.max(0, fillLine + sampleWaveOffset(t, options.phase, options, waveAmp)),
      );
      points.push({ x, y });
    }
    return points;
  }

  if (options.direction === "top-to-bottom") {
    const fillLine = height * clamped;
    const points: Point[] = [];
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width;
      const t = i / segments;
      const y = Math.min(
        height,
        Math.max(0, fillLine + sampleWaveOffset(t, options.phase, options, waveAmp)),
      );
      points.push({ x, y });
    }
    return points;
  }

  if (options.direction === "left-to-right") {
    const fillLine = width * clamped;
    const points: Point[] = [];
    for (let i = 0; i <= segments; i++) {
      const y = (i / segments) * height;
      const t = i / segments;
      const x = Math.min(
        width,
        Math.max(0, fillLine + sampleWaveOffset(t, options.phase, options, waveAmp)),
      );
      points.push({ x, y });
    }
    return points;
  }

  const fillLine = width * (1 - clamped);
  const points: Point[] = [];
  for (let i = segments; i >= 0; i--) {
    const y = (i / segments) * height;
    const t = i / segments;
    const x = Math.min(
      width,
      Math.max(0, fillLine - sampleWaveOffset(t, options.phase, options, waveAmp)),
    );
    points.push({ x, y });
  }
  return points;
}

function pointsToPath(points: Point[]): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  return [
    `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`,
    ...rest.map((point) => `L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`),
  ].join(" ");
}

/**
 * Builds a polygon clip-path for the monochrome overlay.
 * Progress 0 = no mono visible; 1 = fully mono.
 */
export function buildLiquidClipPath(
  progress: number,
  width: number,
  height: number,
  options: LiquidClipOptions,
): string {
  if (width <= 0 || height <= 0) return "polygon(0% 0%, 0% 0%)";

  const edgePoints = buildEdgePoints(progress, width, height, options);

  if (options.direction === "bottom-to-top") {
    const points = ["0% 100%", "100% 100%"];
    for (const point of edgePoints) points.push(`${pct(point.x, width)} ${pct(point.y, height)}`);
    return `polygon(${points.join(", ")})`;
  }

  if (options.direction === "top-to-bottom") {
    const points = ["0% 0%", "100% 0%"];
    for (const point of edgePoints) points.push(`${pct(point.x, width)} ${pct(point.y, height)}`);
    return `polygon(${points.join(", ")})`;
  }

  if (options.direction === "left-to-right") {
    const points = ["0% 0%", "0% 100%"];
    for (const point of edgePoints) points.push(`${pct(point.x, width)} ${pct(point.y, height)}`);
    return `polygon(${points.join(", ")})`;
  }

  const points = ["100% 0%", "100% 100%"];
  for (const point of edgePoints) points.push(`${pct(point.x, width)} ${pct(point.y, height)}`);
  return `polygon(${points.join(", ")})`;
}

export function buildLiquidEdgePath(
  progress: number,
  width: number,
  height: number,
  options: LiquidClipOptions,
): string {
  return pointsToPath(buildEdgePoints(progress, width, height, options));
}
