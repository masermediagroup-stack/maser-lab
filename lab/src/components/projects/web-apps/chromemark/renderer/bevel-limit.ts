import { Vector2, type Shape } from "three";
import { signedArea, type Ring } from "./path-geometry";

const SAMPLE = 64;
const KEEP_FRACTION = 0.42;

function cross(ax: number, ay: number, bx: number, by: number): number {
  return ax * by - ay * bx;
}

function raySegmentHit(
  origin: Vector2,
  dx: number,
  dy: number,
  a: Vector2,
  b: Vector2,
): number | null {
  const ex = b.x - a.x;
  const ey = b.y - a.y;
  const denom = cross(dx, dy, ex, ey);
  if (Math.abs(denom) < 1e-12) return null;
  const t = cross(a.x - origin.x, a.y - origin.y, ex, ey) / denom;
  const u = cross(a.x - origin.x, a.y - origin.y, dx, dy) / denom;
  if (t > 1e-4 && u >= 0 && u <= 1) return t;
  return null;
}

function isNearIndex(i: number, skip: number, n: number): boolean {
  if (Math.abs(i - skip) <= 1) return true;
  if (skip === 0 && i === n - 1) return true;
  if (skip === n - 1 && i === 0) return true;
  return false;
}

function firstHit(
  origin: Vector2,
  dx: number,
  dy: number,
  rings: Ring[],
  skipRing: number,
  skipIndex: number,
): number {
  let best = Infinity;
  for (let r = 0; r < rings.length; r++) {
    const ring = rings[r]!;
    const n = ring.length;
    for (let i = 0; i < n; i++) {
      if (r === skipRing && isNearIndex(i, skipIndex, n)) continue;
      const hit = raySegmentHit(origin, dx, dy, ring[i]!, ring[(i + 1) % n]!);
      if (hit !== null) best = Math.min(best, hit);
    }
  }
  return best;
}

function inwardWidth(ring: Ring, rings: Ring[], ringIndex: number): number {
  const n = ring.length;
  if (n < 3) return Infinity;
  const ccw = signedArea(ring) > 0;
  const sign = (ccw ? 1 : -1) * (ringIndex === 0 ? 1 : -1);
  let min = Infinity;
  for (let i = 0; i < n; i++) {
    const a = ring[i]!;
    const b = ring[(i + 1) % n]!;
    const tx = b.x - a.x;
    const ty = b.y - a.y;
    const len = Math.hypot(tx, ty) || 1;
    const nx = (sign * -ty) / len;
    const ny = (sign * tx) / len;
    const origin = new Vector2((a.x + b.x) * 0.5, (a.y + b.y) * 0.5);
    const hit = firstHit(origin, nx, ny, rings, ringIndex, i);
    if (hit < Infinity) min = Math.min(min, hit);
  }
  return min;
}

export function minFeatureWidth(shape: Shape): number {
  const outer = shape.getPoints(SAMPLE);
  if (outer.length < 3 || Math.abs(signedArea(outer)) < 1e-10) return 0;
  const holes = shape.holes.map((hole) => hole.getPoints(SAMPLE));
  const rings = [outer, ...holes];
  let min = inwardWidth(outer, rings, 0);
  for (let i = 0; i < holes.length; i++) {
    min = Math.min(min, inwardWidth(holes[i]!, rings, i + 1));
  }
  return Number.isFinite(min) ? min : 0;
}

/** Bevel size in shape units. Never more than ~42% of the thinnest stroke. */
export function maxSafeBevelSize(shape: Shape): number {
  return Math.max(0, minFeatureWidth(shape) * KEEP_FRACTION);
}

export function clampBevelSize(requested: number, shape: Shape): number {
  if (requested <= 0) return 0;
  const safe = maxSafeBevelSize(shape);
  if (safe <= 1e-8) return 0;
  return Math.min(requested, safe);
}
