import type { CubicBezier, Vec2 } from "../types";

export function vecSub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function vecAdd(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function vecScale(a: Vec2, s: number): Vec2 {
  return { x: a.x * s, y: a.y * s };
}

export function vecLen(a: Vec2): number {
  return Math.hypot(a.x, a.y);
}

export function vecNormalize(a: Vec2): Vec2 {
  const len = vecLen(a);
  if (len < 1e-6) return { x: 0, y: 0 };
  return { x: a.x / len, y: a.y / len };
}

export function vecPerp(a: Vec2): Vec2 {
  return { x: -a.y, y: a.x };
}

export function sampleCubic(curve: CubicBezier, t: number): Vec2 {
  const u = 1 - t;
  const uu = u * u;
  const tt = t * t;
  const uuu = uu * u;
  const ttt = tt * t;
  return {
    x:
      uuu * curve.p0.x +
      3 * uu * t * curve.p1.x +
      3 * u * tt * curve.p2.x +
      ttt * curve.p3.x,
    y:
      uuu * curve.p0.y +
      3 * uu * t * curve.p1.y +
      3 * u * tt * curve.p2.y +
      ttt * curve.p3.y,
  };
}

export function cubicToPathD(curve: CubicBezier): string {
  return `M ${curve.p0.x.toFixed(2)} ${curve.p0.y.toFixed(2)} C ${curve.p1.x.toFixed(2)} ${curve.p1.y.toFixed(2)}, ${curve.p2.x.toFixed(2)} ${curve.p2.y.toFixed(2)}, ${curve.p3.x.toFixed(2)} ${curve.p3.y.toFixed(2)}`;
}

/**
 * Cubic path from start → end.
 * `direction` bows the curve to one side of the chord.
 * `curvature` 0 = straight, 1 = extreme (offset ≈ full chord length).
 */
export function generateBezierPath(
  start: Vec2,
  end: Vec2,
  curvature: number,
  direction: 1 | -1,
): CubicBezier {
  const chord = vecSub(end, start);
  const dist = vecLen(chord);
  const perp = vecScale(vecNormalize(vecPerp(chord)), direction);
  const offset = vecScale(perp, dist * Math.max(0, curvature) * 0.55);
  return {
    p0: start,
    p1: vecAdd(vecAdd(start, vecScale(chord, 0.28)), offset),
    p2: vecAdd(vecAdd(start, vecScale(chord, 0.72)), offset),
    p3: end,
  };
}

/** Choose the bow that points away from the formation centroid. */
export function bowAwayDirection(start: Vec2, end: Vec2, centroid: Vec2): 1 | -1 {
  const chord = vecSub(end, start);
  const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  const perp = vecNormalize(vecPerp(chord));
  const toCentroid = vecSub(centroid, mid);
  const dot = perp.x * toCentroid.x + perp.y * toCentroid.y;
  return dot > 0 ? -1 : 1;
}
