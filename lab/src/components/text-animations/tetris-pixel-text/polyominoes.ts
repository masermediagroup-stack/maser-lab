import type { Cell, RotationDeg, ShapeId } from "./types";

export type PolyominoDef = {
  id: ShapeId;
  size: number;
  /** Cells at rotation 0. */
  cells: Cell[];
  weight: number;
};

function normalize(cells: Cell[]): Cell[] {
  const minX = Math.min(...cells.map((c) => c.x));
  const minY = Math.min(...cells.map((c) => c.y));
  return cells
    .map((c) => ({ x: c.x - minX, y: c.y - minY }))
    .sort((a, b) => a.y - b.y || a.x - b.x);
}

function rotateCells90(cells: Cell[]): Cell[] {
  return normalize(cells.map((c) => ({ x: -c.y, y: c.x })));
}

export function rotateShape(cells: Cell[], rotation: RotationDeg): Cell[] {
  let result = normalize(cells);
  const steps = (rotation / 90) % 4;
  for (let i = 0; i < steps; i++) {
    result = rotateCells90(result);
  }
  return result;
}

/** Rotate cells around their geometric center; return absolute positions at origin. */
export function rotateAroundCenter(cells: Cell[], rotation: RotationDeg): Cell[] {
  if (rotation === 0) return normalize(cells);
  const cx = cells.reduce((s, c) => s + c.x, 0) / cells.length;
  const cy = cells.reduce((s, c) => s + c.y, 0) / cells.length;
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return normalize(
    cells.map((c) => {
      const dx = c.x - cx;
      const dy = c.y - cy;
      return {
        x: Math.round(cx + dx * cos - dy * sin),
        y: Math.round(cy + dx * sin + dy * cos),
      };
    }),
  );
}

export const POLYOMINOES: PolyominoDef[] = [
  // Tetrominoes
  { id: "I", size: 4, weight: 1, cells: normalize([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }]) },
  { id: "O", size: 4, weight: 1, cells: normalize([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }]) },
  { id: "T", size: 4, weight: 1.1, cells: normalize([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }]) },
  { id: "L", size: 4, weight: 1, cells: normalize([{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }]) },
  { id: "J", size: 4, weight: 1, cells: normalize([{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 0, y: 2 }]) },
  { id: "S", size: 4, weight: 1, cells: normalize([{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }]) },
  { id: "Z", size: 4, weight: 1, cells: normalize([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }]) },
  // Triominoes
  { id: "I3", size: 3, weight: 0.7, cells: normalize([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }]) },
  { id: "V3", size: 3, weight: 0.7, cells: normalize([{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }]) },
  { id: "L3", size: 3, weight: 0.7, cells: normalize([{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }]) },
  // Domino
  { id: "D2", size: 2, weight: 0.4, cells: normalize([{ x: 0, y: 0 }, { x: 1, y: 0 }]) },
  // Selected pentominoes
  { id: "P5", size: 5, weight: 0.5, cells: normalize([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 2 }]) },
  { id: "U5", size: 5, weight: 0.45, cells: normalize([{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }]) },
  { id: "X5", size: 5, weight: 0.35, cells: normalize([{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }]) },
];

export const TETROMINO_IDS: ShapeId[] = ["I", "O", "T", "L", "J", "S", "Z"];
export const TRIOMINO_IDS: ShapeId[] = ["I3", "V3", "L3"];
export const PENTOMINO_IDS: ShapeId[] = ["P5", "U5", "X5"];

export function getShapeById(id: ShapeId): PolyominoDef | undefined {
  return POLYOMINOES.find((s) => s.id === id);
}

export function uniqueOrientations(def: PolyominoDef): Array<{ rotation: RotationDeg; cells: Cell[] }> {
  const seen = new Set<string>();
  const out: Array<{ rotation: RotationDeg; cells: Cell[] }> = [];
  for (const rotation of [0, 90, 180, 270] as RotationDeg[]) {
    const cells = rotateShape(def.cells, rotation);
    const key = cells.map((c) => `${c.x},${c.y}`).join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ rotation, cells });
  }
  return out;
}

export function translateCells(cells: Cell[], ox: number, oy: number): Cell[] {
  return cells.map((c) => ({ x: c.x + ox, y: c.y + oy }));
}

export function shapeBBox(cells: Cell[]): { w: number; h: number } {
  const maxX = Math.max(...cells.map((c) => c.x));
  const maxY = Math.max(...cells.map((c) => c.y));
  return { w: maxX + 1, h: maxY + 1 };
}
