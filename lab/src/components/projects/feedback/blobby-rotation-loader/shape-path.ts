import type { CanvasLayout, DrawLoaderOptions, ShapeParams } from "./constants";

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
  const radius = params.drawSize * 0.34;

  const minSweep = Math.PI * 0.48;
  const maxSweep = Math.PI * 1.42;
  const sweep =
    minSweep + (params.corner / 100) * (maxSweep - minSweep);

  const startAngle = -Math.PI * 0.72;
  const strokeWidth =
    params.drawSize * (0.18 + (params.corner / 100) * 0.14);

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

function computeNormal(points: Point[], index: number): Point {
  let dx: number;
  let dy: number;

  if (index === 0) {
    dx = points[1].x - points[0].x;
    dy = points[1].y - points[0].y;
  } else if (index === points.length - 1) {
    dx = points[index].x - points[index - 1].x;
    dy = points[index].y - points[index - 1].y;
  } else {
    dx = points[index + 1].x - points[index - 1].x;
    dy = points[index + 1].y - points[index - 1].y;
  }

  const len = Math.hypot(dx, dy) || 1;
  return { x: -dy / len, y: dx / len };
}

function computeTangent(points: Point[], index: number): Point {
  let dx: number;
  let dy: number;

  if (index === 0) {
    dx = points[1].x - points[0].x;
    dy = points[1].y - points[0].y;
  } else {
    dx = points[index].x - points[index - 1].x;
    dy = points[index].y - points[index - 1].y;
  }

  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

/**
 * Taper stroke width only at the path END (tail tip).
 * The start of the arc keeps full width — like a brush with one blunt end.
 */
function widthAtPoint(
  index: number,
  total: number,
  strokeWidth: number,
  tail: number,
): number {
  if (total <= 1 || tail <= 0) return strokeWidth;

  const tailNorm = tail / 100;
  const t = index / (total - 1);

  // Only the last segment of the arc tapers — not the whole curve
  const taperZone = 0.07 + tailNorm * 0.16;
  const taperStart = 1 - taperZone;

  if (t <= taperStart) {
    return strokeWidth;
  }

  const localT = (t - taperStart) / taperZone;
  const profile = 1 - Math.pow(localT, 1.4);

  return strokeWidth * Math.max(0.015, profile * tailNorm);
}

/** Semicircular cap at the blunt (start) end of the stroke. */
function roundCapArc(
  center: Point,
  tangent: Point,
  normal: Point,
  halfWidth: number,
  segments = 10,
): Point[] {
  const arc: Point[] = [];

  for (let i = 0; i <= segments; i++) {
    const angle = Math.PI + (Math.PI * i) / segments;
    const ox = tangent.x * Math.cos(angle) + normal.x * Math.sin(angle);
    const oy = tangent.y * Math.cos(angle) + normal.y * Math.sin(angle);
    arc.push({
      x: center.x + ox * halfWidth,
      y: center.y + oy * halfWidth,
    });
  }

  return arc;
}

export function buildRibbonPolygon(
  points: Point[],
  strokeWidth: number,
  tail: number,
): Point[] {
  const left: Point[] = [];
  const right: Point[] = [];

  for (let i = 0; i < points.length; i++) {
    const width = widthAtPoint(i, points.length, strokeWidth, tail);
    const halfW = width / 2;
    const normal = computeNormal(points, i);

    left.push({
      x: points[i].x + normal.x * halfW,
      y: points[i].y + normal.y * halfW,
    });
    right.push({
      x: points[i].x - normal.x * halfW,
      y: points[i].y - normal.y * halfW,
    });
  }

  if (tail <= 0) {
    return [...left, ...right.reverse()];
  }

  const bluntHalf = strokeWidth / 2;
  const tangent0 = computeTangent(points, 0);
  const normal0 = computeNormal(points, 0);
  const cap = roundCapArc(points[0], tangent0, normal0, bluntHalf);

  return [...cap, ...left.slice(1), ...right.reverse().slice(1)];
}

export function tracePolygonPath(
  ctx: CanvasRenderingContext2D,
  polygon: Point[],
): void {
  if (polygon.length < 3) return;

  ctx.beginPath();
  ctx.moveTo(polygon[0].x, polygon[0].y);
  for (let i = 1; i < polygon.length; i++) {
    ctx.lineTo(polygon[i].x, polygon[i].y);
  }
  ctx.closePath();
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

export function computeCanvasLayout(options: DrawLoaderOptions): CanvasLayout {
  const shapeParams: ShapeParams = {
    power: options.power,
    corner: options.corner,
    tail: options.tail,
    drawSize: options.drawSize,
  };

  const { radius } = getArcGeometry(shapeParams);
  const strokeWidth = getStrokeWidth(shapeParams);
  const aberration = options.chromaticAberration * 0.85;

  const padding = Math.ceil(
    options.blur +
      aberration +
      strokeWidth * 0.65 +
      radius * 0.08 +
      12,
  );

  const canvasSize = options.drawSize + padding * 2;

  return { canvasSize, center: canvasSize / 2, padding };
}
