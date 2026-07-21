import { rotateShape, shapeBBox } from "./polyominoes";
import { createSeededRandom } from "./seeded-random";
import type { Cell, PixelPiece, RotationDeg, TetrisPixelSettings } from "./types";

export type MotionOptions = Pick<
  TetrisPixelSettings,
  | "motionSeed"
  | "fallDuration"
  | "stagger"
  | "staggerRandomness"
  | "horizontalMovement"
  | "horizontalCorrections"
  | "rotationAmount"
  | "maxQuarterTurns"
  | "spawnHeightMin"
  | "spawnHeightMax"
  | "pieceSpacing"
  | "landingDensity"
  | "landingDelay"
  | "glowRadius"
  | "spawnSafetyMargin"
  | "cellSize"
> & {
  /** CSS pixel height of the preview stage (for offscreen spawn calc). */
  stageCssHeight: number;
};

function asRotation(deg: number): RotationDeg {
  const n = ((Math.round(deg / 90) % 4) + 4) % 4;
  return (n * 90) as RotationDeg;
}

/** Height in cells of the piece at a given rotation (includes all orientations it may pass through). */
export function maxRotatedHeight(cells: Cell[], startRotation: RotationDeg, steps: number): number {
  let maxH = shapeBBox(cells).h;
  for (let s = 0; s <= steps; s++) {
    const rot = asRotation(startRotation - s * 90);
    const box = shapeBBox(rotateShape(cells, rot));
    maxH = Math.max(maxH, box.h, box.w);
  }
  return maxH;
}

export function maxRotatedWidth(cells: Cell[], startRotation: RotationDeg, steps: number): number {
  let maxW = shapeBBox(cells).w;
  for (let s = 0; s <= steps; s++) {
    const rot = asRotation(startRotation - s * 90);
    const box = shapeBBox(rotateShape(cells, rot));
    maxW = Math.max(maxW, box.w, box.h);
  }
  return maxW;
}

/**
 * Assign spawn, waypoints, rotations, delays, and durations.
 * Each piece's spawnY is computed from its rotated bounds so it starts fully offscreen.
 */
export function generateMotionPaths(
  pieces: PixelPiece[],
  gridWidth: number,
  gridHeight: number,
  options: MotionOptions,
): PixelPiece[] {
  const rng = createSeededRandom(options.motionSeed);
  const cellSize = Math.max(1, options.cellSize);
  const stageH = Math.max(gridHeight * cellSize, options.stageCssHeight);
  const offsetY = Math.floor((stageH - gridHeight * cellSize) / 2);
  // Grid Y of the canvas top edge (can be negative when the grid is smaller than the stage).
  const canvasTopInGrid = -offsetY / cellSize;
  const glowCells = Math.ceil(options.glowRadius / cellSize) + 1;

  const indexed = pieces.map((p, i) => ({ p, i }));

  // Bottom rows first, with column interleaving
  indexed.sort((a, b) => {
    const maxYA = Math.max(...a.p.cells.map((c) => c.y + a.p.targetY));
    const maxYB = Math.max(...b.p.cells.map((c) => c.y + b.p.targetY));
    if (maxYB !== maxYA) return maxYB - maxYA;
    const midXA = a.p.targetX + a.p.cells.reduce((s, c) => s + c.x, 0) / a.p.cells.length;
    const midXB = b.p.targetX + b.p.cells.reduce((s, c) => s + c.x, 0) / b.p.cells.length;
    const bucketA = Math.floor(midXA / 2);
    const bucketB = Math.floor(midXB / 2);
    if (bucketA !== bucketB) return ((bucketA % 3) - (bucketB % 3)) || bucketA - bucketB;
    return midXA - midXB;
  });

  const density = options.landingDensity;
  const order = indexed.map((entry, orderIndex) => ({ ...entry, orderIndex }));

  for (const entry of order) {
    if (rng.chance(0.12 * (1 - density))) {
      entry.orderIndex += rng.int(2, 6);
    }
  }
  order.sort((a, b) => a.orderIndex - b.orderIndex);

  return order.map((entry, seq) => {
    const piece = entry.p;
    const targetCol = piece.targetX;
    const moveAmt = options.horizontalMovement;
    const corrections = Math.max(
      0,
      Math.round(options.horizontalCorrections * (0.5 + moveAmt * 0.5)),
    );

    const maxDrift = Math.max(1, Math.round(gridWidth * 0.22 * moveAmt));
    const waypoints: number[] = [];
    let col = targetCol + rng.int(-maxDrift, maxDrift);
    col = Math.max(0, Math.min(gridWidth - 1, col));

    for (let i = 0; i < corrections; i++) {
      const toward = targetCol + rng.int(-Math.ceil(maxDrift * 0.4), Math.ceil(maxDrift * 0.4));
      col = Math.max(0, Math.min(gridWidth - 1, toward));
      if (waypoints.length === 0 || waypoints[waypoints.length - 1] !== col) {
        waypoints.push(col);
      }
    }
    if (waypoints[waypoints.length - 1] !== targetCol) {
      waypoints.push(targetCol);
    }
    if (waypoints.length === 0) waypoints.push(targetCol);

    const spawnCol =
      moveAmt < 0.15
        ? targetCol
        : Math.max(
            0,
            Math.min(
              gridWidth - 1,
              targetCol + rng.int(-Math.ceil(maxDrift * 1.2), Math.ceil(maxDrift * 1.2)),
            ),
          );

    const maxTurns = Math.max(0, Math.min(3, Math.round(options.maxQuarterTurns)));
    let steps = 0;
    if (options.rotationAmount > 0.05 && maxTurns > 0) {
      const likely = options.rotationAmount;
      if (rng.chance(likely)) {
        steps = rng.int(1, Math.max(1, Math.round(maxTurns * likely)));
      } else if (rng.chance(likely * 0.4)) {
        steps = 1;
      }
    }
    steps = Math.min(steps, maxTurns);
    const startRotation = asRotation(steps * 90);

    const rotatedH = maxRotatedHeight(piece.cells, startRotation, steps);
    // Extra stagger lift so later pieces stay stacked above the stage.
    const staggerLift =
      seq * options.pieceSpacing * 0.5 +
      rng.float(options.spawnHeightMin, options.spawnHeightMax) * rotatedH;

    const spawnSafetyMargin =
      rotatedH +
      glowCells +
      options.spawnSafetyMargin +
      2 +
      staggerLift;

    // Top of piece at spawn must be above the canvas top (in grid space).
    const spawnY = Math.floor(canvasTopInGrid - spawnSafetyMargin);

    const baseDelay = options.landingDelay + seq * options.stagger;
    const jitter = options.stagger * options.staggerRandomness * rng.float(-1, 1);
    const delay = Math.max(0, baseDelay + jitter);

    const duration =
      options.fallDuration * rng.float(0.88, 1.12) +
      Math.abs(spawnCol - targetCol) * 18 * moveAmt;

    return {
      ...piece,
      spawnX: spawnCol,
      spawnY,
      startRotation,
      rotationSteps: steps,
      horizontalWaypoints: waypoints,
      delay: Math.round(delay),
      duration: Math.round(duration),
      targetRotation: 0 as RotationDeg,
      landed: false,
    };
  });
}

export function remotionPieces(
  pieces: PixelPiece[],
  gridWidth: number,
  gridHeight: number,
  options: MotionOptions,
): PixelPiece[] {
  const base = pieces.map((p) => ({
    ...p,
    horizontalWaypoints: [] as number[],
    rotationSteps: 0,
    landed: false,
  }));
  return generateMotionPaths(base, gridWidth, gridHeight, options);
}
