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
  const { n, radius, sweep, startAngle, strokeWidth } = getArcGeometry(params);
  const segments = Math.max(24, Math.round(48 + (params.corner / 100) * 32));
  const points: Point[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = startAngle + (sweep * i) / segments;
    points.push(superellipsePoint(t, radius, radius, n));
  }

  if (params.tail > 0 && points.length >= 2) {
    const tailNorm = params.tail / 100;
    const extend = strokeWidth * (1.2 + tailNorm * 2.8);
    const dx = points[0].x - points[1].x;
    const dy = points[0].y - points[1].y;
    const len = Math.hypot(dx, dy) || 1;
    points.unshift({
      x: points[0].x + (dx / len) * extend,
      y: points[0].y + (dy / len) * extend,
    });
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

function widthAtPoint(index: number, total: number, strokeWidth: number, tail: number): number {
  if (total <= 1 || tail <= 0) return strokeWidth;

  const t = index / (total - 1);
  const tailNorm = tail / 100;
  const taper = 1 - tailNorm * (1 - t) * 0.97;
  return strokeWidth * Math.max(0.02, taper);
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

  return [...left, ...right.reverse()];
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
  const tailExtend =
    options.tail > 0 ? strokeWidth * (1.2 + (options.tail / 100) * 2.8) : 0;

  const padding = Math.ceil(
    options.blur +
      aberration +
      strokeWidth * 0.65 +
      tailExtend +
      radius * 0.08 +
      12,
  );

  const canvasSize = options.drawSize + padding * 2;

  return { canvasSize, center: canvasSize / 2, padding };
}
