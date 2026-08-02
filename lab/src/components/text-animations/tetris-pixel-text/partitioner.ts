import {
  PIECE_SCALE_PROFILES,
  type PieceScale,
} from "./density";
import {
  POLYOMINOES,
  PENTOMINO_IDS,
  TETROMINO_IDS,
  TRIOMINO_IDS,
  getShapeById,
  rotateShape,
  shapeBBox,
  translateCells,
  uniqueOrientations,
  type PolyominoDef,
} from "./polyominoes";
import { createSeededRandom, type SeededRandom } from "./seeded-random";
import type { Cell, OccupancyGrid, PixelPiece, RotationDeg, ShapeId } from "./types";
import { cellKey } from "./types";

export type PartitionOptions = {
  grid: OccupancyGrid;
  layoutSeed: number;
  tetrominoFrequency?: number;
  triominoFrequency?: number;
  pieceSizePreference?: number;
  shapeVariety?: number;
  pieceScale?: PieceScale;
};

type Placement = {
  shapeId: ShapeId;
  rotation: RotationDeg;
  originX: number;
  originY: number;
  cells: Cell[];
};

function remainingCells(mask: Set<string>): Cell[] {
  return [...mask].map((k) => {
    const [xs, ys] = k.split(",");
    return { x: Number(xs), y: Number(ys) };
  });
}

function canPlace(cells: Cell[], remaining: Set<string>): boolean {
  for (const c of cells) {
    if (!remaining.has(cellKey(c.x, c.y))) return false;
  }
  return true;
}

function applyPlacement(cells: Cell[], remaining: Set<string>) {
  for (const c of cells) remaining.delete(cellKey(c.x, c.y));
}

function catalogForPrefs(
  rng: SeededRandom,
  tetrominoFrequency: number,
  triominoFrequency: number,
  pieceSizePreference: number,
): PolyominoDef[] {
  const catalog: PolyominoDef[] = [];
  for (const def of POLYOMINOES) {
    let keep = true;
    if (TETROMINO_IDS.includes(def.id)) {
      keep = rng.chance(0.35 + tetrominoFrequency * 0.65);
    } else if (TRIOMINO_IDS.includes(def.id)) {
      keep = rng.chance(0.25 + triominoFrequency * 0.7);
    } else if (PENTOMINO_IDS.includes(def.id)) {
      keep = rng.chance(0.15 + (1 - pieceSizePreference) * 0.4);
    } else if (def.id === "D2") {
      keep = rng.chance(0.4);
    }
    if (keep) catalog.push(def);
  }
  // Always keep core tetrominoes available
  for (const id of TETROMINO_IDS) {
    if (!catalog.some((c) => c.id === id)) {
      const def = getShapeById(id);
      if (def) catalog.push(def);
    }
  }
  return catalog;
}

function scorePlacement(
  placement: Placement,
  shapeCounts: Map<ShapeId, number>,
  shapeVariety: number,
  sizePreference: number,
): number {
  const size = placement.cells.length;
  let score = size * (0.5 + sizePreference);
  if (size === 4) score += 3;
  if (size === 5) score += 1.2;
  if (size === 3) score += 0.8;
  const count = shapeCounts.get(placement.shapeId) ?? 0;
  score -= count * (1.2 + shapeVariety * 2);
  // Prefer placements that sit on denser rows (lower first later via order)
  const avgY = placement.cells.reduce((s, c) => s + c.y, 0) / size;
  score += avgY * 0.05;
  return score;
}

function findBestPlacement(
  remaining: Set<string>,
  catalog: PolyominoDef[],
  rng: SeededRandom,
  shapeCounts: Map<ShapeId, number>,
  shapeVariety: number,
  sizePreference: number,
  startBudget = 48,
): Placement | null {
  const cells = remainingCells(remaining);
  if (cells.length === 0) return null;

  // Prefer starting from denser / lower cells with seeded shuffle
  const starts = rng.shuffle(cells).slice(0, Math.min(startBudget, cells.length));
  const shapes = rng.shuffle(catalog);

  let best: Placement | null = null;
  let bestScore = -Infinity;

  for (const start of starts) {
    for (const def of shapes) {
      for (const orient of uniqueOrientations(def)) {
        // Align each local cell of the shape onto `start`
        for (const local of orient.cells) {
          const ox = start.x - local.x;
          const oy = start.y - local.y;
          const world = translateCells(orient.cells, ox, oy);
          if (!canPlace(world, remaining)) continue;
          const placement: Placement = {
            shapeId: def.id,
            rotation: orient.rotation,
            originX: ox,
            originY: oy,
            cells: world,
          };
          const score =
            scorePlacement(placement, shapeCounts, shapeVariety, sizePreference) +
            rng.float(0, 0.15);
          if (score > bestScore) {
            bestScore = score;
            best = placement;
          }
        }
      }
    }
  }

  // Fast path: try size-descending exact fits from a random start if none found
  if (!best) {
    const ordered = [...catalog].sort((a, b) => b.size - a.size);
    for (const start of starts) {
      for (const def of ordered) {
        for (const orient of uniqueOrientations(def)) {
          for (const local of orient.cells) {
            const ox = start.x - local.x;
            const oy = start.y - local.y;
            const world = translateCells(orient.cells, ox, oy);
            if (!canPlace(world, remaining)) continue;
            return {
              shapeId: def.id,
              rotation: orient.rotation,
              originX: ox,
              originY: oy,
              cells: world,
            };
          }
        }
      }
    }
  }

  return best;
}

/** Group remaining adjacent cells into connected components (fallback pieces). */
function floodGroups(remaining: Set<string>, maxCluster: number): Cell[][] {
  const groups: Cell[][] = [];
  const left = new Set(remaining);
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const;
  const chunk = Math.max(2, maxCluster);

  while (left.size > 0) {
    const startKey = left.values().next().value as string;
    const [sx, sy] = startKey.split(",").map(Number);
    const stack: Cell[] = [{ x: sx!, y: sy! }];
    const group: Cell[] = [];
    left.delete(startKey);
    while (stack.length) {
      const cur = stack.pop()!;
      group.push(cur);
      for (const [dx, dy] of dirs) {
        const nk = cellKey(cur.x + dx, cur.y + dy);
        if (!left.has(nk)) continue;
        left.delete(nk);
        stack.push({ x: cur.x + dx, y: cur.y + dy });
      }
    }
    if (group.length <= chunk) {
      groups.push(group);
    } else {
      const sorted = group.sort((a, b) => a.y - b.y || a.x - b.x);
      for (let i = 0; i < sorted.length; i += chunk) {
        groups.push(sorted.slice(i, i + chunk));
      }
    }
  }
  return groups;
}

function toLocalCells(world: Cell[]): { originX: number; originY: number; cells: Cell[] } {
  const minX = Math.min(...world.map((c) => c.x));
  const minY = Math.min(...world.map((c) => c.y));
  return {
    originX: minX,
    originY: minY,
    cells: world
      .map((c) => ({ x: c.x - minX, y: c.y - minY }))
      .sort((a, b) => a.y - b.y || a.x - b.x),
  };
}

/**
 * Partition an occupancy mask into connected polyomino pieces.
 * Guarantees every occupied cell is covered exactly once.
 */
export function partitionGrid(options: PartitionOptions): PixelPiece[] {
  const {
    grid,
    layoutSeed,
    pieceScale = "mixed",
    shapeVariety = 0.85,
  } = options;

  const profile = PIECE_SCALE_PROFILES[pieceScale];
  const tetrominoFrequency =
    options.tetrominoFrequency ?? profile.tetrominoWeight;
  const triominoFrequency = options.triominoFrequency ?? profile.triominoWeight;
  const pieceSizePreference =
    options.pieceSizePreference ??
    (pieceScale === "large" ? 0.9 : pieceScale === "small" ? 0.45 : 0.7);

  const targetOccupiedCellCount = grid.cells.size;
  const rng = createSeededRandom(layoutSeed);
  const remaining = new Set(grid.cells);
  const catalog = catalogForPrefs(rng, tetrominoFrequency, triominoFrequency, pieceSizePreference);
  // Soft-include pentominoes based on scale profile
  for (const id of PENTOMINO_IDS) {
    if (rng.chance(profile.pentominoWeight) && !catalog.some((c) => c.id === id)) {
      const def = getShapeById(id);
      if (def) catalog.push(def);
    }
  }
  const shapeCounts = new Map<ShapeId, number>();
  const placements: Placement[] = [];

  const preferredSizes = profile.preferredSizes;

  let guard = 0;
  const maxGuards = Math.max(grid.occupied.length * 4, 400);
  // Limit start probes on huge grids for responsiveness
  const startBudget = Math.min(64, Math.max(24, Math.floor(2000 / Math.max(1, Math.sqrt(remaining.size)))));

  while (remaining.size > 0 && guard < maxGuards) {
    guard++;
    let placed: Placement | null = null;

    for (const size of preferredSizes) {
      if (size === 1) break;
      if (size > profile.maxCluster) continue;
      const sized = catalog.filter((c) => c.size === size);
      if (!sized.length) continue;
      placed = findBestPlacement(
        remaining,
        sized,
        rng,
        shapeCounts,
        shapeVariety,
        pieceSizePreference,
        startBudget,
      );
      if (placed) break;
    }

    if (!placed) {
      placed = findBestPlacement(
        remaining,
        catalog.filter((c) => c.size >= 2 && c.size <= profile.maxCluster),
        rng,
        shapeCounts,
        shapeVariety,
        pieceSizePreference,
        startBudget,
      );
    }

    if (!placed) break;

    applyPlacement(placed.cells, remaining);
    shapeCounts.set(placed.shapeId, (shapeCounts.get(placed.shapeId) ?? 0) + 1);
    placements.push(placed);
  }

  // Fallback: flood-fill leftovers as connected groups (never discard).
  if (remaining.size > 0) {
    for (const group of floodGroups(remaining, profile.maxCluster)) {
      applyPlacement(group, remaining);
      const local = toLocalCells(group);
      placements.push({
        shapeId: group.length === 1 ? "F1" : "custom",
        rotation: 0,
        originX: local.originX,
        originY: local.originY,
        cells: group,
      });
    }
  }

  // Absolute last resort: any stray keys still remaining (should be empty).
  if (remaining.size > 0) {
    for (const key of [...remaining]) {
      const [xs, ys] = key.split(",");
      const cell = { x: Number(xs), y: Number(ys) };
      remaining.delete(key);
      placements.push({
        shapeId: "F1",
        rotation: 0,
        originX: cell.x,
        originY: cell.y,
        cells: [cell],
      });
    }
  }

  const pieces = placements.map((p, index) => {
    const local = toLocalCells(p.cells);
    return {
      id: `piece-${layoutSeed}-${index}`,
      shapeId: p.shapeId,
      cells: local.cells,
      targetX: local.originX,
      targetY: local.originY,
      targetRotation: 0 as RotationDeg,
      spawnX: local.originX,
      spawnY: -4,
      startRotation: p.rotation,
      rotationSteps: 0,
      horizontalWaypoints: [],
      delay: 0,
      duration: 1800,
      color: "#ffffff",
      glowColor: "#ffffff",
      landed: false,
    } satisfies PixelPiece;
  });

  validatePartition(grid.cells, pieces, targetOccupiedCellCount);

  return pieces;
}

export type PartitionValidation = {
  ok: boolean;
  targetOccupiedCellCount: number;
  assignedPieceCellCount: number;
  missing: string[];
  duplicates: string[];
  outside: string[];
  pieceCount: number;
};

export function validatePartition(
  targetCells: Set<string>,
  pieces: PixelPiece[],
  targetOccupiedCellCount = targetCells.size,
): PartitionValidation {
  const assigned = new Map<string, string>();
  const duplicates: string[] = [];
  const outside: string[] = [];

  for (const piece of pieces) {
    for (const c of piece.cells) {
      const k = cellKey(c.x + piece.targetX, c.y + piece.targetY);
      if (!targetCells.has(k)) outside.push(k);
      if (assigned.has(k)) duplicates.push(k);
      else assigned.set(k, piece.id);
    }
  }

  const missing: string[] = [];
  for (const k of targetCells) {
    if (!assigned.has(k)) missing.push(k);
  }

  const assignedPieceCellCount = assigned.size;
  const ok =
    missing.length === 0 &&
    duplicates.length === 0 &&
    outside.length === 0 &&
    assignedPieceCellCount === targetOccupiedCellCount;

  if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
    if (!ok) {
      console.warn("[TetrisPixelText] partition validation failed", {
        targetOccupiedCellCount,
        assignedPieceCellCount,
        missing: missing.length,
        duplicates: duplicates.length,
        outside: outside.length,
        pieceCount: pieces.length,
      });
    }
  }

  return {
    ok,
    targetOccupiedCellCount,
    assignedPieceCellCount,
    missing,
    duplicates,
    outside,
    pieceCount: pieces.length,
  };
}

export function pieceAbsoluteCells(
  piece: Pick<PixelPiece, "cells" | "targetX" | "targetY" | "targetRotation">,
  rotation: RotationDeg = piece.targetRotation,
  originX = piece.targetX,
  originY = piece.targetY,
): Cell[] {
  const rotated = rotateShape(piece.cells, rotation);
  return translateCells(rotated, originX, originY);
}

export function pieceCenter(
  piece: Pick<PixelPiece, "cells" | "targetX" | "targetY">,
): { x: number; y: number } {
  const box = shapeBBox(piece.cells);
  return {
    x: piece.targetX + box.w / 2,
    y: piece.targetY + box.h / 2,
  };
}
