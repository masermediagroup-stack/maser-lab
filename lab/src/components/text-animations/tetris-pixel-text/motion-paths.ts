import { createSeededRandom } from "./seeded-random";
import type { PixelPiece, RotationDeg, TetrisPixelSettings } from "./types";

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
>;

function asRotation(deg: number): RotationDeg {
  const n = ((Math.round(deg / 90) % 4) + 4) % 4;
  return (n * 90) as RotationDeg;
}

/**
 * Assign spawn, waypoints, rotations, delays, and durations.
 * Preserves piece cell layout / targets from the partitioner.
 */
export function generateMotionPaths(
  pieces: PixelPiece[],
  gridWidth: number,
  gridHeight: number,
  options: MotionOptions,
): PixelPiece[] {
  const rng = createSeededRandom(options.motionSeed);

  // Landing order: prefer lower pieces first, with column interleaving
  const indexed = pieces.map((p, i) => ({ p, i }));
  indexed.sort((a, b) => {
    const ay = a.p.targetY + a.p.cells.reduce((s, c) => s + c.y, 0) / a.p.cells.length;
    const by = b.p.targetY + b.p.cells.reduce((s, c) => s + c.y, 0) / b.p.cells.length;
    if (Math.abs(by - ay) > 0.5) return by - ay; // lower first (higher y lands earlier conceptually — wait)
    // Actually lower on screen = higher y. Lower pieces should land first → higher targetY first in time (smaller delay)
    // So sort by targetY descending for earlier delay assignment... 
    // We'll assign delay by order index after sort: bottom-first means larger Y first.
    const ax = a.p.targetX;
    const bx = b.p.targetX;
    // Interleave columns: use column bucket
    const colA = Math.floor(ax / 3);
    const colB = Math.floor(bx / 3);
    if (colA !== colB) return colA - colB;
    return by - ay;
  });

  // Re-sort for believable assembly: bottom rows first, parallel columns
  indexed.sort((a, b) => {
    const maxYA = Math.max(...a.p.cells.map((c) => c.y + a.p.targetY));
    const maxYB = Math.max(...b.p.cells.map((c) => c.y + b.p.targetY));
    if (maxYB !== maxYA) return maxYB - maxYA; // bottom (larger y) first
    const midXA = a.p.targetX + a.p.cells.reduce((s, c) => s + c.x, 0) / a.p.cells.length;
    const midXB = b.p.targetX + b.p.cells.reduce((s, c) => s + c.x, 0) / b.p.cells.length;
    // Alternate left/right columns for parallel feel
    const bucketA = Math.floor(midXA / 2);
    const bucketB = Math.floor(midXB / 2);
    if (bucketA !== bucketB) return ((bucketA % 3) - (bucketB % 3)) || bucketA - bucketB;
    return midXA - midXB;
  });

  const density = options.landingDensity;
  const order = indexed.map((entry, orderIndex) => ({ ...entry, orderIndex }));

  // Occasionally move a few upper-gap fillers later
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

    const spawnLift =
      gridHeight * rng.float(options.spawnHeightMin, options.spawnHeightMax) +
      seq * options.pieceSpacing * 0.4;

    // Rotations: discrete quarter turns ending at 0 (cells already oriented)
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

    const baseDelay = options.landingDelay + seq * options.stagger;
    const jitter =
      options.stagger * options.staggerRandomness * rng.float(-1, 1);
    const delay = Math.max(0, baseDelay + jitter);

    const duration =
      options.fallDuration * rng.float(0.88, 1.12) +
      Math.abs(spawnCol - targetCol) * 18 * moveAmt;

    return {
      ...piece,
      spawnX: spawnCol,
      spawnY: -Math.ceil(spawnLift),
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

/**
 * Regenerate only motion fields; keep partition cells/targets/colors.
 */
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
