import type { Anchor, Vec2 } from "../types";

export function triangularRowCount(nodeCount: number): number {
  return Math.round((Math.sqrt(8 * nodeCount + 1) - 1) / 2);
}

export function isTriangularCount(nodeCount: number): boolean {
  const rows = triangularRowCount(nodeCount);
  return (rows * (rows + 1)) / 2 === nodeCount;
}

export function layoutTriangleAnchors(options: {
  count: number;
  horizontalSpacing: number;
  verticalSpacing: number;
}): Anchor[] {
  const { count, horizontalSpacing, verticalSpacing } = options;
  const rows = triangularRowCount(count);
  const anchors: Anchor[] = [];
  let id = 0;

  for (let row = 0; row < rows; row++) {
    const cols = row + 1;
    const rowWidth = (cols - 1) * horizontalSpacing;
    const startX = -rowWidth / 2;
    const y = row * verticalSpacing;
    for (let column = 0; column < cols; column++) {
      anchors.push({
        id,
        row,
        column,
        x: startX + column * horizontalSpacing,
        y,
      });
      id += 1;
    }
  }

  const minY = 0;
  const maxY = (rows - 1) * verticalSpacing;
  const offsetY = -(minY + maxY) / 2;
  return anchors.map((anchor) => ({ ...anchor, y: anchor.y + offsetY }));
}

export function formationCentroid(anchors: Anchor[]): Vec2 {
  if (anchors.length === 0) return { x: 0, y: 0 };
  let x = 0;
  let y = 0;
  for (const anchor of anchors) {
    x += anchor.x;
    y += anchor.y;
  }
  return { x: x / anchors.length, y: y / anchors.length };
}

export function anchorDistance(a: Anchor, b: Anchor): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function areGridNeighbors(a: Anchor, b: Anchor): boolean {
  if (a.id === b.id) return false;
  const dr = b.row - a.row;
  const dc = b.column - a.column;
  if (dr === 0) return Math.abs(dc) === 1;
  if (dr === -1) return dc === 0 || dc === -1;
  if (dr === 1) return dc === 0 || dc === 1;
  return false;
}

export function formationBounds(anchors: Anchor[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const anchor of anchors) {
    minX = Math.min(minX, anchor.x);
    minY = Math.min(minY, anchor.y);
    maxX = Math.max(maxX, anchor.x);
    maxY = Math.max(maxY, anchor.y);
  }
  if (!Number.isFinite(minX)) {
    return { minX: -1, minY: -1, maxX: 1, maxY: 1 };
  }
  return { minX, minY, maxX, maxY };
}
