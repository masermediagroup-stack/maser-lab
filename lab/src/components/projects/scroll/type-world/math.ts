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

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/**
 * Scroll-linked inflate: 0.001 → 0.25 → 0.8 → overshoot → 1.
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

  const stops: ReadonlyArray<readonly [number, number]> = [
    [0, minScale],
    [0.16, 0.25],
    [0.42, 0.8],
    [0.78, overshoot],
    [1, 1],
  ];

  for (let i = 1; i < stops.length; i++) {
    const prev = stops[i - 1];
    const next = stops[i];
    if (!prev || !next) continue;
    if (t <= next[0]) {
      const span = Math.max(1e-6, next[0] - prev[0]);
      const u = (t - prev[0]) / span;
      const eased = i === stops.length - 1 ? 1 - (1 - u) ** 2 : easeOutCubic(u);
      return prev[1] + (next[1] - prev[1]) * eased;
    }
  }

  return 1;
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
