import type { ShapeParams } from "./constants";

type Point = { x: number; y: number };

function superellipsePoint(
  t: number,
  a: number,
  b: number,
  n: number,
): Point {
  const cosT = Math.cos(t);
  const sinT = Math.sin(t);
  const x = a * Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / n);
  const y = b * Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / n);
  return { x, y };
}

function getArcGeometry(params: ShapeParams) {
  const n = Math.max(1, params.power);
  const radius = params.size * 0.38;

  const minSweep = Math.PI * 0.48;
  const maxSweep = Math.PI * 1.42;
  const sweep =
    minSweep + (params.corner / 100) * (maxSweep - minSweep);

  const startAngle = -Math.PI * 0.72;
  const strokeWidth =
    params.size * (0.18 + (params.corner / 100) * 0.14);

  return { n, radius, sweep, startAngle, strokeWidth };
}

export function sampleSuperellipseArc(params: ShapeParams): Point[] {
  const { n, radius, sweep, startAngle } = getArcGeometry(params);
  const segments = Math.max(24, Math.round(48 + (params.corner / 100) * 32));
  const points: Point[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = startAngle + (sweep * i) / segments;
    points.push(superellipsePoint(t, radius, radius, n));
  }

  return points;
}

export function traceArcPath(
  ctx: CanvasRenderingContext2D,
  points: Point[],
): void {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
}

export function getStrokeWidth(params: ShapeParams): number {
  return getArcGeometry(params).strokeWidth;
}
