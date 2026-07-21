import { shapeElevation, smootherstep } from "./easing";
import type { MotionMode } from "../types/kinetic-bars";

/**
 * Normalized elevation 0–1 for a bar under a given motion mode.
 * Loops seamlessly via continuous time (no discrete reset).
 */
export function sampleModeElevation(
  mode: MotionMode,
  time: number,
  index: number,
  count: number,
  waveSpeed: number,
  phaseOffset: number,
  direction: 1 | -1,
): number {
  const i = index;
  const n = Math.max(1, count - 1);

  switch (mode) {
    case "traveling": {
      const phase = time * waveSpeed - i * phaseOffset * direction;
      const sine01 = (Math.sin(phase) + 1) * 0.5;
      return shapeElevation(sine01);
    }
    case "reverse": {
      const phase = time * waveSpeed - i * phaseOffset * -1;
      const sine01 = (Math.sin(phase) + 1) * 0.5;
      return shapeElevation(sine01);
    }
    case "breathing": {
      // Shared breath with tiny phase stagger for organic depth.
      const phase = time * waveSpeed * 0.55 - i * phaseOffset * 0.12;
      const sine01 = (Math.sin(phase) + 1) * 0.5;
      return shapeElevation(sine01, 1.85);
    }
    case "pulse": {
      // Concentrated pulse: quick rise, brief hold, smooth settle.
      const travel = ((time * waveSpeed * 0.35) % (n + 4)) - 1;
      const dist = Math.abs(i - travel);
      if (dist > 2.2) return 0;
      // Rise lobe
      const rise = 1 - smootherstep(0, 1.1, dist);
      // Soft hold near crest
      const hold = dist < 0.35 ? 1 : rise;
      return shapeElevation(hold, 1.4);
    }
    default:
      return 0;
  }
}

export function blendElevations(a: number, b: number, mix: number): number {
  return a * (1 - mix) + b * mix;
}

/**
 * Click ripple contribution: delayed ring from origin, fades with time and distance.
 */
export function sampleRipple(
  index: number,
  originIndex: number,
  elapsed: number,
  strength: number,
  speed: number,
  decay: number,
): number {
  if (strength <= 0 || elapsed < 0) return 0;
  const distance = Math.abs(index - originIndex);
  const arrival = distance / Math.max(0.001, speed);
  const localT = elapsed - arrival;
  if (localT < 0) return 0;

  // Single pulse envelope: rise then fall.
  const pulse = Math.exp(-decay * localT) * Math.sin(Math.min(Math.PI, localT * Math.PI * 1.6));
  const distanceFalloff = Math.exp(-0.08 * distance * distance);
  return Math.max(0, pulse) * strength * distanceFalloff;
}

/**
 * Gaussian hover falloff by bar index distance.
 */
export function sampleHoverLift(
  index: number,
  nearestIndex: number,
  strength: number,
  radius: number,
): number {
  if (strength <= 0 || radius <= 0 || nearestIndex < 0) return 0;
  const d = index - nearestIndex;
  const sigma = radius / 2.2;
  return strength * Math.exp(-(d * d) / (2 * sigma * sigma));
}
