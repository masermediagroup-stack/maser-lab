export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Frame-rate independent exponential approach. */
export function damp(
  current: number,
  target: number,
  lambda: number,
  dt: number,
): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

/** World-unit sphere radius so the quote fills most of the stage. */
export function sphereFitRadius(
  viewWidth: number,
  viewHeight: number,
  widthFrac: number,
  heightFrac: number,
): number {
  const diameter = Math.min(viewWidth * widthFrac, viewHeight * heightFrac);
  return Math.max(0.08, diameter / 2);
}

/** Map 0–1 inertia (more coast) to a per-second velocity decay. */
export function inertiaDecay(inertia: number): number {
  const t = clamp(inertia, 0, 1);
  return 14 - t * 9;
}
