import { Path, Shape } from "three";
import { assembleSilhouette } from "./assemble-silhouette";
import { LogoLoadError, type TraceSettings } from "../types";

type Point = { x: number; y: number };
type Ring = Point[];
type Edge = "top" | "right" | "bottom" | "left";

const MID: Record<Edge, Point> = {
  top: { x: 0.5, y: 0 },
  right: { x: 1, y: 0.5 },
  bottom: { x: 0.5, y: 1 },
  left: { x: 0, y: 0.5 },
};

const CELL_EDGES: Record<number, [Edge, Edge][]> = {
  1: [["left", "bottom"]],
  2: [["bottom", "right"]],
  3: [["left", "right"]],
  4: [["top", "right"]],
  5: [
    ["left", "top"],
    ["bottom", "right"],
  ],
  6: [["top", "bottom"]],
  7: [["left", "top"]],
  8: [["left", "top"]],
  9: [["top", "bottom"]],
  10: [
    ["left", "bottom"],
    ["top", "right"],
  ],
  11: [["top", "right"]],
  12: [["left", "right"]],
  13: [["bottom", "right"]],
  14: [["left", "bottom"]],
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function rdp(points: Ring, epsilon: number): Ring {
  if (points.length < 3) return points;
  const first = points[0]!;
  const last = points[points.length - 1]!;
  let maxDist = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i]!, first, last);
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }
  if (maxDist > epsilon) {
    const left = rdp(points.slice(0, index + 1), epsilon);
    const right = rdp(points.slice(index), epsilon);
    return left.slice(0, -1).concat(right);
  }
  return [first, last];
}

function perpendicularDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / len;
}

function signedArea(ring: Ring): number {
  let area = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]!;
    const b = ring[(i + 1) % ring.length]!;
    area += a.x * b.y - b.x * a.y;
  }
  return area / 2;
}

function pointInRing(point: Point, ring: Ring): boolean {
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

function chaikin(ring: Ring, iterations: number): Ring {
  let current = ring;
  for (let n = 0; n < iterations; n++) {
    const next: Ring = [];
    for (let i = 0; i < current.length; i++) {
      const a = current[i]!;
      const b = current[(i + 1) % current.length]!;
      next.push(
        { x: lerp(a.x, b.x, 0.25), y: lerp(a.y, b.y, 0.25) },
        { x: lerp(a.x, b.x, 0.75), y: lerp(a.y, b.y, 0.75) },
      );
    }
    current = next;
  }
  return current;
}

function stitch(segments: Array<[Point, Point]>): Ring[] {
  const rings: Ring[] = [];
  const unused = segments.map((segment) => [...segment] as [Point, Point]);
  const eq = (a: Point, b: Point) =>
    Math.abs(a.x - b.x) < 1e-4 && Math.abs(a.y - b.y) < 1e-4;

  while (unused.length > 0) {
    const [start, next] = unused.pop()!;
    const ring: Ring = [start, next];
    let guard = unused.length + 4;
    while (guard-- > 0) {
      const head = ring[ring.length - 1]!;
      const idx = unused.findIndex(
        (seg) => eq(seg[0], head) || eq(seg[1], head),
      );
      if (idx < 0) break;
      const [a, b] = unused.splice(idx, 1)[0]!;
      const add = eq(a, head) ? b : a;
      if (eq(add, ring[0]!)) break;
      ring.push(add);
    }
    if (ring.length >= 3) rings.push(ring);
  }
  return rings;
}

function marchingSquares(mask: Uint8Array, width: number, height: number): Ring[] {
  const segments: Array<[Point, Point]> = [];
  const at = (x: number, y: number) =>
    x < 0 || y < 0 || x >= width || y >= height
      ? 0
      : mask[y * width + x]!;

  for (let y = -1; y < height; y++) {
    for (let x = -1; x < width; x++) {
      const tl = at(x, y);
      const tr = at(x + 1, y);
      const br = at(x + 1, y + 1);
      const bl = at(x, y + 1);
      const code = (tl << 3) | (tr << 2) | (br << 1) | bl;
      const lines = CELL_EDGES[code];
      if (!lines) continue;
      for (const [from, to] of lines) {
        const a = MID[from];
        const b = MID[to];
        segments.push([
          { x: x + a.x, y: y + a.y },
          { x: x + b.x, y: y + b.y },
        ]);
      }
    }
  }
  return stitch(segments);
}

function ringToPath(ring: Ring): Path {
  const path = new Path();
  const first = ring[0]!;
  path.moveTo(first.x, first.y);
  for (let i = 1; i < ring.length; i++) {
    const p = ring[i]!;
    path.lineTo(p.x, p.y);
  }
  path.closePath();
  return path;
}

function ringToShape(ring: Ring): Shape {
  const shape = new Shape();
  const first = ring[0]!;
  shape.moveTo(first.x, first.y);
  for (let i = 1; i < ring.length; i++) {
    const p = ring[i]!;
    shape.lineTo(p.x, p.y);
  }
  shape.closePath();
  return shape;
}

export type RasterTraceResult = {
  shapes: Shape[];
  width: number;
  height: number;
  opaqueRaster: boolean;
};

export async function tracePngLogo(
  file: Blob,
  settings: TraceSettings,
): Promise<RasterTraceResult> {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new LogoLoadError(
      "malformed-png",
      "This PNG could not be decoded.",
    );
  });

  const srcW = bitmap.width;
  const srcH = bitmap.height;
  const maxDim = Math.round(lerp(640, 1536, settings.traceDetail));
  const scale = Math.min(1, maxDim / Math.max(srcW, srcH));
  const width = Math.max(8, Math.round(srcW * scale));
  const height = Math.max(8, Math.round(srcH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new LogoLoadError("malformed-png", "Could not read the PNG pixels.");
  }
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const image = ctx.getImageData(0, 0, width, height);
  const mask = new Uint8Array(width * height);
  let transparent = 0;
  let solid = 0;
  const threshold = settings.alphaThreshold;
  for (let i = 0, p = 0; i < mask.length; i++, p += 4) {
    const alpha = image.data[p + 3]!;
    if (alpha < 250) transparent += 1;
    const on = alpha >= threshold ? 1 : 0;
    mask[i] = on;
    solid += on;
  }

  if (solid === 0) {
    throw new LogoLoadError(
      "zero-size",
      "Nothing remained after the alpha threshold. Lower the threshold.",
    );
  }

  const rawRings = marchingSquares(mask, width, height);
  const epsilon = lerp(0.28, 0.045, settings.traceDetail);
  const smoothPasses = Math.round(settings.smoothing * 2);
  const rings = rawRings
    .map((ring) => {
      const simplified = rdp(ring, epsilon);
      return smoothPasses > 0 ? chaikin(simplified, smoothPasses) : simplified;
    })
    .filter((ring) => ring.length >= 4);

  const prepared = rings.map((ring) => ({
    ring,
    area: Math.abs(signedArea(ring)),
  }));

  const parentOf = prepared.map((entry, index) => {
    const sample = entry.ring[0]!;
    let parent = -1;
    for (let j = 0; j < prepared.length; j++) {
      if (j === index) continue;
      const candidate = prepared[j]!;
      if (candidate.area <= entry.area) continue;
      if (!pointInRing(sample, candidate.ring)) continue;
      if (parent < 0 || candidate.area < prepared[parent]!.area) parent = j;
    }
    return parent;
  });

  const shapes: Shape[] = [];
  for (let i = 0; i < prepared.length; i++) {
    const parent = parentOf[i]!;
    const isIsland = parent < 0 || parentOf[parent] >= 0;
    if (!isIsland) continue;
    const shape = ringToShape(prepared[i]!.ring);
    for (let j = 0; j < prepared.length; j++) {
      if (parentOf[j] === i) shape.holes.push(ringToPath(prepared[j]!.ring));
    }
    shapes.push(shape);
  }

  if (shapes.length === 0) {
    throw new LogoLoadError(
      "zero-size",
      "Could not trace a silhouette from this PNG.",
    );
  }

  return {
    shapes: assembleSilhouette(shapes),
    width: srcW,
    height: srcH,
    opaqueRaster: transparent === 0,
  };
}
