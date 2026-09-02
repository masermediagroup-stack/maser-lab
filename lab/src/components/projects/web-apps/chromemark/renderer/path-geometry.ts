import { Path, Shape, Vector2 } from "three";

export type Ring = Vector2[];

export function signedArea(ring: Ring): number {
  let area = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]!;
    const b = ring[(i + 1) % ring.length]!;
    area += a.x * b.y - b.x * a.y;
  }
  return area / 2;
}

export function pointInRing(point: Vector2, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i]!;
    const b = ring[j]!;
    const intersect =
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y || 1e-8) + a.x;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function interiorPoint(ring: Ring): Vector2 {
  const boxMin = new Vector2(Infinity, Infinity);
  const boxMax = new Vector2(-Infinity, -Infinity);
  for (const point of ring) {
    boxMin.min(point);
    boxMax.max(point);
  }
  const point = boxMin.clone().add(boxMax).multiplyScalar(0.5);
  if (pointInRing(point, ring)) return point;

  const y = point.y;
  const intercepts: number[] = [];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]!;
    const b = ring[(i + 1) % ring.length]!;
    if (a.y > y !== b.y > y) {
      intercepts.push(a.x + ((y - a.y) * (b.x - a.x)) / (b.y - a.y || 1e-8));
    }
  }
  if (intercepts.length > 1) {
    intercepts.sort((a, b) => a - b);
    point.x = (intercepts[0]! + intercepts[1]!) / 2;
  }
  return point;
}

export function clonePath(path: Path): Path {
  const next = new Path();
  next.curves = path.curves.slice();
  return next;
}

export function shapeFromCurves(source: Shape): Shape {
  const shape = new Shape();
  shape.curves = source.curves.slice();
  shape.holes = source.holes.map(clonePath);
  return shape;
}

export function pathFromShape(shape: Shape): Path {
  const path = new Path();
  path.curves = shape.curves.slice();
  return path;
}
