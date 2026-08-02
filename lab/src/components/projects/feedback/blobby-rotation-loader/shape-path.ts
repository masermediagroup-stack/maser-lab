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
  const segments = Math.max(32, Math.round(64 + (params.corner / 100) * 32));
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

/**
 * Surfboard-pin taper at the path END only (index → total).
 * Start end always stays full width. Taper zone grows with tail slider.
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

  // At tail=100 ~50% of arc tapers; at tail=10 only the tip region
  const taperLength = 0.05 + tailNorm * 0.48;
  const taperStart = 1 - taperLength;

  if (t < taperStart) {
    return strokeWidth;
  }

  const localT = (t - taperStart) / taperLength;
  const eased = 0.5 * (1 + Math.cos(localT * Math.PI));
  const minRatio = 0.08;
  const ratio = minRatio + (1 - minRatio) * eased;

  return strokeWidth * ratio;
}

/** Semicircle on the blunt (start) side between left and right rail points. */
function bluntEndCap(
  center: Point,
  left: Point,
  right: Point,
  segments = 14,
): Point[] {
  const angleLeft = Math.atan2(left.y - center.y, left.x - center.x);
  const angleRight = Math.atan2(right.y - center.y, right.x - center.x);
  const radius = Math.hypot(left.x - center.x, left.y - center.y);

  let start = angleRight;
  let end = angleLeft;

  let sweep = end - start;
  if (sweep <= 0) sweep += Math.PI * 2;
  if (sweep > Math.PI) {
    start = angleLeft;
    end = angleRight;
    sweep = end - start;
    if (sweep <= 0) sweep += Math.PI * 2;
  }

  const arc: Point[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = start + (sweep * i) / segments;
    arc.push({
      x: center.x + Math.cos(a) * radius,
      y: center.y + Math.sin(a) * radius,
    });
  }

  return arc;
}

export function buildRibbonPolygon(
  points: Point[],
  strokeWidth: number,
  tail: number,
): Point[] {
  const n = points.length;
  if (n < 2) return [];

  const left: Point[] = [];
  const right: Point[] = [];

  for (let i = 0; i < n; i++) {
    const width = widthAtPoint(i, n, strokeWidth, tail);
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
    const startCap = bluntEndCap(points[0], left[0], right[0]);
    const endCap = bluntEndCap(points[n - 1], right[n - 1], left[n - 1]);
    return [
      ...startCap,
      ...left.slice(1),
      ...endCap.slice(1),
      ...right.slice(1, n - 1).reverse(),
    ];
  }

  const tip = points[n - 1];
  const startCap = bluntEndCap(points[0], right[0], left[0]);

  return [
    ...startCap,
    ...left.slice(1),
    tip,
    ...right.slice(1, n - 1).reverse(),
  ];
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
