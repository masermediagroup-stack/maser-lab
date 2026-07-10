/** Smoothstep 0–1 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Quintic smoothstep for softer landings. */
export function smootherstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Map a sine wave into a sculptural elevation curve:
 * more dwell near the resting (low) position, smooth passage through the peak.
 */
export function shapeElevation(sine01: number, power = 2.15): number {
  const clamped = Math.max(0, Math.min(1, sine01));
  return Math.pow(clamped, power);
}

/** Linear interpolation. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Exponential decay toward target (frame-rate independent). */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}
