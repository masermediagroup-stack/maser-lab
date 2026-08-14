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

/**
 * Scroll-linked inflate: tiny point → fast ease-out to overshoot → settle at 1.
 * Never returns 0 (WebGL / matrix issues); floor is `minScale`.
 */
export function revealScale(
  progress: number,
  revealEnd: number,
  overshoot: number,
  minScale: number,
): number {
  const windowEnd = Math.max(0.08, revealEnd);
  const t = clamp(progress / windowEnd, 0, 1);
  if (t <= 0) return minScale;

  const peakAt = 0.78;
  if (t < peakAt) {
    const u = t / peakAt;
    const eased = 1 - (1 - u) ** 3;
    return minScale + (overshoot - minScale) * eased;
  }

  const u = (t - peakAt) / (1 - peakAt);
  const eased = 1 - (1 - u) ** 2;
  return overshoot + (1 - overshoot) * eased;
}

/** Map 0–1 inertia (more coast) to a per-second velocity decay. */
export function inertiaDecay(inertia: number): number {
  const t = clamp(inertia, 0, 1);
  return 14 - t * 9;
}
