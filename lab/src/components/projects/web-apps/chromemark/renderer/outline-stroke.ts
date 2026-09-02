import { Path, Shape, Vector2 } from "three";
import type { ShapePath } from "three";
import { signedArea } from "./path-geometry";

const MIN_DIST = 1e-6;
const CLOSED_EPS = 1e-8;

export type StrokeStyle = {
  stroke?: string;
  strokeOpacity?: number;
  opacity?: number;
  strokeWidth?: number;
  strokeLineJoin?: string;
  strokeLineCap?: string;
  strokeMiterLimit?: number;
};

type StrokeOptions = {
  strokeWidth: number;
  strokeLineJoin: string;
  strokeLineCap: string;
  strokeMiterLimit: number;
};

function readStyle(path: ShapePath): StrokeStyle {
  const userData = path.userData as { style?: StrokeStyle } | undefined;
  return userData?.style ?? {};
}

export function hasStroke(path: ShapePath): boolean {
  const style = readStyle(path);
  if (style.stroke === undefined || style.stroke === "none") return false;
  if ((style.strokeOpacity ?? 1) * (style.opacity ?? 1) <= 0) return false;
  return (style.strokeWidth ?? 0) > MIN_DIST;
}

function subPathsOf(path: ShapePath): Path[] {
  const withSubs = path as ShapePath & { subPaths?: Path[] };
  return withSubs.subPaths ?? [];
}

function isClosedPoints(points: Vector2[]): boolean {
  if (points.length < 3) return false;
  return points[0]!.distanceToSquared(points[points.length - 1]!) <= CLOSED_EPS;
}

function uniqueRing(points: Vector2[]): Vector2[] {
  if (points.length < 2) return points;
  if (isClosedPoints(points)) return points.slice(0, -1);
  return points;
}

function dedupe(points: Vector2[]): Vector2[] {
  const out: Vector2[] = [];
  for (const point of points) {
    const prev = out[out.length - 1];
    if (prev && prev.distanceToSquared(point) < MIN_DIST * MIN_DIST) continue;
    out.push(point);
  }
  if (
    out.length > 2 &&
    out[0]!.distanceToSquared(out[out.length - 1]!) < MIN_DIST * MIN_DIST
  ) {
    out.pop();
  }
  return out;
}

function edgeNormal(a: Vector2, b: Vector2): Vector2 {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return new Vector2(-dy / len, dx / len);
}

function intersectLines(
  p1: Vector2,
  d1: Vector2,
  p2: Vector2,
  d2: Vector2,
): Vector2 | null {
  const cross = d1.x * d2.y - d1.y * d2.x;
  if (Math.abs(cross) < 1e-12) return null;
  const t = ((p2.x - p1.x) * d2.y - (p2.y - p1.y) * d2.x) / cross;
  return new Vector2(p1.x + d1.x * t, p1.y + d1.y * t);
}

function offsetPolyline(
  points: Vector2[],
  dist: number,
  closed: boolean,
  miterLimit: number,
): Vector2[] {
  const n = points.length;
  if (n < 2) return [];
  const out: Vector2[] = [];

  for (let i = 0; i < n; i++) {
    const curr = points[i]!;
    const prev = closed ? points[(i - 1 + n) % n]! : points[Math.max(0, i - 1)]!;
    const next = closed ? points[(i + 1) % n]! : points[Math.min(n - 1, i + 1)]!;

    if (!closed && i === 0) {
      out.push(curr.clone().addScaledVector(edgeNormal(curr, next), dist));
      continue;
    }
    if (!closed && i === n - 1) {
      out.push(curr.clone().addScaledVector(edgeNormal(prev, curr), dist));
      continue;
    }

    const n1 = edgeNormal(prev, curr);
    const n2 = edgeNormal(curr, next);
    const dir1 = new Vector2(curr.x - prev.x, curr.y - prev.y);
    const dir2 = new Vector2(next.x - curr.x, next.y - curr.y);
    if (dir1.lengthSq() < MIN_DIST * MIN_DIST || dir2.lengthSq() < MIN_DIST * MIN_DIST) {
      out.push(curr.clone().addScaledVector(n1, dist));
      continue;
    }

    const p1 = curr.clone().addScaledVector(n1, dist);
    const p2 = curr.clone().addScaledVector(n2, dist);
    const hit = intersectLines(p1, dir1, p2, dir2);
    if (!hit) {
      out.push(p1);
      continue;
    }
    const miterLen = hit.distanceTo(curr);
    if (miterLen > Math.abs(dist) * miterLimit) {
      out.push(p1, p2);
    } else {
      out.push(hit);
    }
  }

  return dedupe(out);
}

function ensureWinding(ring: Vector2[], ccw: boolean): Vector2[] {
  const isCcw = signedArea(ring) > 0;
  return isCcw === ccw ? ring : ring.slice().reverse();
}

function capArc(
  center: Vector2,
  from: Vector2,
  to: Vector2,
  ccw: boolean,
): Vector2[] {
  const radius = center.distanceTo(from);
  if (radius < MIN_DIST) return [];
  const a0 = Math.atan2(from.y - center.y, from.x - center.x);
  const a1 = Math.atan2(to.y - center.y, to.x - center.x);
  let delta = a1 - a0;
  if (ccw && delta <= 0) delta += Math.PI * 2;
  if (!ccw && delta >= 0) delta -= Math.PI * 2;
  const steps = Math.max(3, Math.round((Math.abs(delta) / Math.PI) * 8));
  const pts: Vector2[] = [];
  for (let i = 1; i < steps; i++) {
    const t = a0 + (delta * i) / steps;
    pts.push(
      new Vector2(center.x + Math.cos(t) * radius, center.y + Math.sin(t) * radius),
    );
  }
  return pts;
}

function squareCap(
  tangent: Vector2,
  half: number,
  left: Vector2,
  right: Vector2,
  outward: boolean,
): Vector2[] {
  const sign = outward ? 1 : -1;
  const extend = new Vector2(tangent.x * half * sign, tangent.y * half * sign);
  const a = right.clone().add(extend);
  const b = left.clone().add(extend);
  return outward ? [a, b] : [b, a];
}

function shapeFromRing(ring: Vector2[]): Shape {
  const shape = new Shape();
  shape.setFromPoints(ring);
  shape.closePath();
  return shape;
}

function holeFromRing(ring: Vector2[]): Path {
  const hole = new Path();
  hole.setFromPoints(ring);
  hole.closePath();
  return hole;
}

/**
 * Offset a stroke centerline into a single extrudable Shape.
 * Closed strokes become an outer ring with the inner offset as a hole —
 * never two islands.
 */
export function outlineStrokePolyline(
  rawPoints: Vector2[],
  options: StrokeOptions,
): Shape | null {
  const half = options.strokeWidth / 2;
  if (half <= MIN_DIST) return null;

  const closed = isClosedPoints(rawPoints);
  const points = uniqueRing(dedupe(rawPoints));
  if (points.length < 2) return null;
  if (closed && points.length < 3) return null;

  const miterLimit = Math.max(1, options.strokeLineJoin === "bevel" ? 1 : options.strokeMiterLimit);
  const left = offsetPolyline(points, half, closed, miterLimit);
  const right = offsetPolyline(points, -half, closed, miterLimit);
  if (left.length < 2 || right.length < 2) return null;

  if (closed) {
    const areaL = Math.abs(signedArea(left));
    const areaR = Math.abs(signedArea(right));
    if (areaL < MIN_DIST && areaR < MIN_DIST) return null;
    const outer = areaL >= areaR ? left : right;
    const inner = areaL >= areaR ? right : left;
    const shape = shapeFromRing(ensureWinding(outer, true));
    if (Math.abs(signedArea(inner)) > MIN_DIST) {
      shape.holes.push(holeFromRing(ensureWinding(inner, false)));
    }
    return shape;
  }

  const start = points[0]!;
  const end = points[points.length - 1]!;
  const startTan = new Vector2(
    points[1]!.x - start.x,
    points[1]!.y - start.y,
  ).normalize();
  const endTan = new Vector2(
    end.x - points[points.length - 2]!.x,
    end.y - points[points.length - 2]!.y,
  ).normalize();
  const leftStart = left[0]!;
  const rightStart = right[0]!;
  const leftEnd = left[left.length - 1]!;
  const rightEnd = right[right.length - 1]!;
  const cap = options.strokeLineCap;

  let endCap: Vector2[] = [];
  let startCap: Vector2[] = [];
  if (cap === "round") {
    endCap = capArc(end, leftEnd, rightEnd, true);
    startCap = capArc(start, rightStart, leftStart, true);
  } else if (cap === "square") {
    endCap = squareCap(endTan, half, leftEnd, rightEnd, true);
    startCap = squareCap(startTan, half, leftStart, rightStart, false);
  }

  const ring = [...left, ...endCap, ...right.slice().reverse(), ...startCap];
  if (ring.length < 3) return null;
  return shapeFromRing(ensureWinding(dedupe(ring), true));
}

export function outlineStrokePath(path: ShapePath): Shape[] {
  const style = readStyle(path);
  const options: StrokeOptions = {
    strokeWidth: style.strokeWidth ?? 1,
    strokeLineJoin: style.strokeLineJoin ?? "miter",
    strokeLineCap: style.strokeLineCap ?? "butt",
    strokeMiterLimit: style.strokeMiterLimit ?? 4,
  };
  const shapes: Shape[] = [];
  for (const sub of subPathsOf(path)) {
    const divisions = Math.max(32, Math.round(sub.curves.length * 16));
    const points = sub.getPoints(divisions);
    const outlined = outlineStrokePolyline(points, options);
    if (outlined) shapes.push(outlined);
  }
  return shapes;
}
