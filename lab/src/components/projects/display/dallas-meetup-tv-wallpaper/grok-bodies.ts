/**
 * Official Grok Bot body picker — 8 silhouettes, 1-indexed.
 * Body is an SDF. Morph is a blend of SDFs, not a bitmap crossfade, not a cut,
 * not globe yaw. Body stays planted; blend in place during the kick.
 * Do not invent extra bodies. Do not put meridians, orbits, or bands on any of them.
 */

import type { GrokShapeId } from "./grok-cycle";

export const GROK_SHAPE_COUNT = 8;

function clamp(v: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, v));
}

function smin(a: number, b: number, k: number): number {
  const h = clamp(0.5 + (0.5 * (b - a)) / k, 0, 1);
  return b * h + a * (1 - h) - k * h * (1 - h);
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

function sdCapsule(
  x: number,
  y: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  r: number,
): number {
  const pax = x - ax;
  const pay = y - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const denom = bax * bax + bay * bay;
  const h = denom <= 1e-8 ? 0 : clamp((pax * bax + pay * bay) / denom, 0, 1);
  return Math.hypot(pax - bax * h, pay - bay * h) - r;
}

/** IQ equilateral triangle, then rounded. Point up in y-up space. */
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

function sdCloud(x: number, y: number): number {
  const center = sdCircle(x, y - 0.08, 0.7);
  const left = sdCircle(x + 0.48, y + 0.04, 0.46);
  const right = sdCircle(x - 0.48, y + 0.04, 0.46);
  const base = sdRoundedBox(x, y + 0.22, 0.74, 0.4, 0.4);
  return smin(smin(center, left, 0.16), smin(right, base, 0.16), 0.14);
}

function sdTeardrop(x: number, y: number): number {
  const bulb = sdCircle(x, y + 0.28, 0.7);
  const tip = sdRoundedTriangle(x, y - 0.08, 0.72, 0.14);
  return smin(bulb, tip, 0.18);
}

/**
 * 1 Circle — geometrically perfect.
 * 2 Irregular oval — SELECTED product blob / REST.
 *    Squashed, slightly wider at the bottom-left than the top-right.
 *    Not a perfect circle. Not a regular ellipse.
 * 3 Rounded square / squircle
 * 4 Pill — horizontal stadium
 * 5 Rounded triangle — soft vertices, slightly bowed sides
 * 6 Hexagon — vertical, two parallel vertical sides, pointed top and bottom
 * 7 Cloud — three-lobed, larger center hump + two smaller side humps
 * 8 Teardrop — point up, wide rounded base
 */
export function grokBodySd(id: GrokShapeId, x: number, y: number): number {
  switch (id) {
    case 1:
      return sdCircle(x, y, 1);
    case 2: {
      const taper = 1.1 - 0.16 * y;
      const x2 = (x + 0.1 * Math.max(0, -y)) / taper;
      const y2 = y / 0.84;
      return sdCircle(x2, y2, 1);
    }
    case 3:
      return sdRoundedBox(x, y, 0.8, 0.8, 0.36);
    case 4:
      return sdCapsule(x, y, -0.5, 0, 0.5, 0, 0.5);
    case 5:
      return sdRoundedTriangle(x, y + 0.18, 0.92, 0.14);
    case 6:
      return sdHexagonPointy(x, y, 0.92);
    case 7:
      return sdCloud(x, y);
    case 8:
      return sdTeardrop(x, y);
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
  let hi = 2.4;
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
