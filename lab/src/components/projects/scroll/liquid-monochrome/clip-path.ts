import { fbm } from "./noise";
import type { LiquidDirection } from "./types";

export type LiquidClipOptions = {
  direction: LiquidDirection;
  turbulence: number;
  noiseScale: number;
  liquidStrength: number;
  edgeSoftness: number;
  segments: number;
  seed: number;
  /** Scroll-driven phase — animates edge while scrubbing */
  phase: number;
};

const DEFAULT_SEGMENTS = 72;

function pct(value: number, total: number): string {
  return `${((value / total) * 100).toFixed(3)}%`;
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
  const primary = fbm(t * options.noiseScale * 3 + phase, phase * 0.4, {
    octaves: 4,
    turbulence: options.turbulence,
    seed: options.seed,
  });
  const secondary = fbm(t * options.noiseScale * 7 - phase * 0.6, phase * 0.25, {
    octaves: 3,
    turbulence: options.turbulence * 0.6,
    seed: options.seed + 42,
  });
  const tertiary = fbm(t * options.noiseScale * 1.5 + phase * 1.2, phase, {
    octaves: 2,
    turbulence: options.turbulence * 0.35,
    seed: options.seed + 91,
  });

  const blend = primary * 0.55 + secondary * 0.3 + tertiary * 0.15;
  return blend * amplitude * options.liquidStrength;
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

  const clamped = Math.min(1, Math.max(0, progress));
  const segments = options.segments || DEFAULT_SEGMENTS;
  const softness = Math.max(0, options.edgeSoftness);
  const waveAmp = height * (0.06 + softness * 0.08);

  const { direction } = options;

  if (direction === "bottom-to-top") {
    const fillLine = height * (1 - clamped);
    const points: string[] = ["0% 100%", "100% 100%"];

    for (let i = segments; i >= 0; i--) {
      const x = (i / segments) * width;
      const t = i / segments;
      const offset = sampleWaveOffset(t, options.phase, options, waveAmp);
      const y = Math.min(height, Math.max(0, fillLine + offset));
      points.push(`${pct(x, width)} ${pct(y, height)}`);
    }

    return `polygon(${points.join(", ")})`;
  }

  if (direction === "top-to-bottom") {
    const fillLine = height * clamped;
    const points: string[] = ["0% 0%", "100% 0%"];

    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width;
      const t = i / segments;
      const offset = sampleWaveOffset(t, options.phase, options, waveAmp);
      const y = Math.min(height, Math.max(0, fillLine + offset));
      points.push(`${pct(x, width)} ${pct(y, height)}`);
    }

    return `polygon(${points.join(", ")})`;
  }

  if (direction === "left-to-right") {
    const fillLine = width * clamped;
    const points: string[] = ["0% 0%", "0% 100%"];

    for (let i = 0; i <= segments; i++) {
      const y = (i / segments) * height;
      const t = i / segments;
      const offset = sampleWaveOffset(t, options.phase, options, waveAmp);
      const x = Math.min(width, Math.max(0, fillLine + offset));
      points.push(`${pct(x, width)} ${pct(y, height)}`);
    }

    return `polygon(${points.join(", ")})`;
  }

  // right-to-left
  const fillLine = width * (1 - clamped);
  const points: string[] = ["100% 0%", "100% 100%"];

  for (let i = segments; i >= 0; i--) {
    const y = (i / segments) * height;
    const t = i / segments;
    const offset = sampleWaveOffset(t, options.phase, options, waveAmp);
    const x = Math.min(width, Math.max(0, fillLine - offset));
    points.push(`${pct(x, width)} ${pct(y, height)}`);
  }

  return `polygon(${points.join(", ")})`;
}
