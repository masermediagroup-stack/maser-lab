/**
 * Official Grok Bot body picker — kept Ver 02 subset (5 silhouettes).
 * Body is an SDF. Morph is a blend of SDFs, not a bitmap crossfade, not a cut,
 * not globe yaw. Body stays planted; blend in place during the kick.
 * Pill, Cloud, and Teardrop are out of the cycle.
 * Do not put meridians, orbits, or bands on any of them.
 * Every kept body contains the face disc (`FACE_DISC_R`) so eyes never shear.
 * Draw through `outlineFitScale` so every silhouette fits the shared mark box.
 * Magenta triangle is point-down; pull its optical mass in vs the circle and
 * plant the face in the wide upper third. Other kept bodies fill the box.
 */

import type { GrokShapeId } from "./grok-cycle";
import { FACE_DISC_R } from "./grok-eyes";

/** Rounded triangle (picker #5 / Magenta). Point-down Grok body. */
export const TRIANGLE_ID: GrokShapeId = 5;
/** ~10% tighter than the circle inside the same mark box. Do not grow the box. */
export const TRIANGLE_MASS_SCALE = 0.9;
/**
 * Face-radii, +down. Shift the pair into the wide upper third of the
 * point-down triangle. Clip disc stays origin-centered (face-space).
 */
export const TRIANGLE_FACE_LIFT = -0.28;
/** Slightly smaller stadiums on the triangle so they don't smash the edges. */
export const TRIANGLE_EYE_SCALE = 0.86;
/** Damp gaze travel on the triangle so "up" stays in the wide third. */
export const TRIANGLE_GAZE_TRAVEL = 0.7;

export const GROK_SHAPE_COUNT = 5;

function clamp(v: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, v));
}

function sdCircle(x: number, y: number, r: number): number {
  return Math.hypot(x, y) - r;
}

function sdRoundedBox(
  x: number,
  y: number,
  hx: number,
  hy: number,
  r: number,
): number {
  const ax = Math.abs(x) - hx + r;
  const ay = Math.abs(y) - hy + r;
  const ox = Math.max(ax, 0);
  const oy = Math.max(ay, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(ax, ay), 0) - r;
}

/** IQ equilateral triangle, then rounded. Point down in y-up / canvas-up (wide top). */
function sdRoundedTriangle(x: number, y: number, r: number, round: number): number {
  const k = Math.sqrt(3);
  let px = Math.abs(x) - r;
  let py = -y + r / k;
  if (px + k * py > 0) {
    const nx = px - k * py;
    const ny = -k * px - py;
    px = nx * 0.5;
    py = ny * 0.5;
  }
  px -= clamp(px, -2 * r, 0);
  return -Math.hypot(px, py) * Math.sign(py) - round;
}

/** Pointy-top hexagon (vertical sides). IQ hexagon with axes swapped. */
function sdHexagonPointy(x: number, y: number, r: number): number {
  const kx = -0.866025404;
  const ky = 0.5;
  const kz = 0.577350269;
  let px = Math.abs(y);
  let py = Math.abs(x);
  const minDot = Math.min(kx * px + ky * py, 0);
  px -= 2 * minDot * kx;
  py -= 2 * minDot * ky;
  px -= clamp(px, -kz * r, kz * r);
  py -= r;
  return Math.hypot(px, py) * Math.sign(py);
}

/**
 * 1 Circle — geometrically perfect.
 * 2 Irregular oval — SELECTED product blob / REST.
 *    Squashed, slightly wider at the bottom-left than the top-right.
 *    Not a perfect circle. Not a regular ellipse.
 * 3 Rounded square / squircle
 * 5 Rounded triangle — point-down, soft vertices, slightly bowed sides
 * 6 Hexagon — vertical, two parallel vertical sides, pointed top and bottom
 */
export function grokBodySd(id: GrokShapeId, x: number, y: number): number {
  switch (id) {
    case 1:
      return sdCircle(x, y, 1);
    case 2: {
      const taper = 1.1 - 0.16 * y;
      const x2 = (x + 0.1 * Math.max(0, -y)) / taper;
      const y2 = y / 0.92;
      return sdCircle(x2, y2, 1);
    }
    case 3:
      return sdRoundedBox(x, y, 0.88, 0.88, 0.36);
    case 5:
      return sdRoundedTriangle(x, y + 0.06, 1.38, 0.18);
    case 6:
      return sdHexagonPointy(x, y, 1.05);
  }
}

export function mixedBodySd(
  from: GrokShapeId,
  to: GrokShapeId,
  morphT: number,
  x: number,
  y: number,
): number {
  const t = clamp(morphT, 0, 1);
  if (t <= 0 || from === to) return grokBodySd(from, x, y);
  if (t >= 1) return grokBodySd(to, x, y);
  return grokBodySd(from, x, y) * (1 - t) + grokBodySd(to, x, y) * t;
}

const OUTLINE_SAMPLES = 160;

const outlineCache = new Map<string, Float64Array>();

function outlineKey(from: GrokShapeId, to: GrokShapeId, morphT: number): string {
  return `${from}:${to}:${Math.round(clamp(morphT, 0, 1) * 48)}`;
}

function rayRadius(
  from: GrokShapeId,
  to: GrokShapeId,
  morphT: number,
  angle: number,
): number {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let lo = 0;
  let hi = 2.8;
  for (let i = 0; i < 18; i += 1) {
    const mid = (lo + hi) * 0.5;
    if (mixedBodySd(from, to, morphT, dx * mid, dy * mid) < 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) * 0.5;
}

export function bodyOutline(
  from: GrokShapeId,
  to: GrokShapeId,
  morphT: number,
): Float64Array {
  const key = outlineKey(from, to, morphT);
  const cached = outlineCache.get(key);
  if (cached) return cached;
  const radii = new Float64Array(OUTLINE_SAMPLES);
  for (let i = 0; i < OUTLINE_SAMPLES; i += 1) {
    radii[i] = rayRadius(from, to, morphT, (i / OUTLINE_SAMPLES) * Math.PI * 2);
  }
  outlineCache.set(key, radii);
  return radii;
}

export function maxOutlineRadius(radii: Float64Array): number {
  let max = 0;
  for (let i = 0; i < radii.length; i += 1) {
    const r = radii[i]!;
    if (r > max) max = r;
  }
  return max;
}

export function minOutlineRadius(radii: Float64Array): number {
  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i < radii.length; i += 1) {
    const r = radii[i]!;
    if (r < min) min = r;
  }
  return min;
}

/** Axis-aligned half-extents of the polar outline in SDF units. */
export function outlineAabb(radii: Float64Array): {
  halfW: number;
  halfH: number;
} {
  let halfW = 0;
  let halfH = 0;
  const n = radii.length;
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    const r = radii[i]!;
    halfW = Math.max(halfW, Math.abs(r * Math.cos(a)));
    halfH = Math.max(halfH, Math.abs(r * Math.sin(a)));
  }
  return { halfW, halfH };
}

/**
 * Uniform scale that fits the outline into the unit square.
 * Apply to body, face disc, and stadiums together so eyes stay planted.
 * Never scale the Cursor cube to match a runaway silhouette.
 */
export function outlineFitScale(radii: Float64Array): number {
  const { halfW, halfH } = outlineAabb(radii);
  return 1 / Math.max(halfW, halfH, 1e-6);
}

/** 1 when the blend is fully `id`, 0 when it is fully the other body. */
export function morphWeight(
  from: GrokShapeId,
  to: GrokShapeId,
  morphT: number,
  id: GrokShapeId,
): number {
  const t = clamp(morphT, 0, 1);
  const a = from === id ? 1 : 0;
  const b = to === id ? 1 : 0;
  if (t <= 0 || from === to) return a;
  if (t >= 1) return b;
  return a * (1 - t) + b * t;
}

export type MarkLayout = {
  massScale: number;
  faceLift: number;
  eyeScale: number;
  gazeTravel: number;
};

/**
 * Triangle-only optical mass + face seat. Other bodies stay at identity
 * (fill the shared box, camera face at the disc origin).
 */
export function markLayout(
  from: GrokShapeId,
  to: GrokShapeId,
  morphT: number,
): MarkLayout {
  const tri = morphWeight(from, to, morphT, TRIANGLE_ID);
  return {
    massScale: 1 + (TRIANGLE_MASS_SCALE - 1) * tri,
    faceLift: TRIANGLE_FACE_LIFT * tri,
    eyeScale: 1 + (TRIANGLE_EYE_SCALE - 1) * tri,
    gazeTravel: 1 + (TRIANGLE_GAZE_TRAVEL - 1) * tri,
  };
}

/**
 * True when the origin-centered disc of `radius` sits inside the blended SDF.
 * Linear SDF mixes preserve this: if both bodies contain the disc, so does the blend.
 */
export function sdContainsDisc(
  from: GrokShapeId,
  to: GrokShapeId,
  morphT: number,
  radius: number = FACE_DISC_R,
  samples = 72,
): boolean {
  if (mixedBodySd(from, to, morphT, 0, 0) > 0) return false;
  for (let i = 0; i < samples; i += 1) {
    const a = (i / samples) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    if (mixedBodySd(from, to, morphT, x, y) > 1e-6) return false;
  }
  return true;
}

export function outlineRadiusAt(
  radii: Float64Array,
  angle: number,
): number {
  const n = radii.length;
  const turns = ((angle / (Math.PI * 2)) % 1 + 1) % 1;
  const f = turns * n;
  const i = Math.floor(f);
  const t = f - i;
  const a = radii[i % n]!;
  const b = radii[(i + 1) % n]!;
  return a * (1 - t) + b * t;
}

export function traceBodyPath(
  ctx: CanvasRenderingContext2D,
  radii: Float64Array,
  R: number,
): void {
  ctx.beginPath();
  for (let i = 0; i <= radii.length; i += 1) {
    const a = (i / radii.length) * Math.PI * 2;
    const r = radii[i % radii.length]! * R;
    const x = r * Math.cos(a);
    const y = -r * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}
