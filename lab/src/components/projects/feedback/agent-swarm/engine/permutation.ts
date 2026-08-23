import type { Anchor } from "../types";
import { anchorDistance, areGridNeighbors } from "./anchors";
import { pickIndex, pickWeighted } from "./prng";

export function identityOccupancy(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i);
}

export function invertOccupancy(occupancy: number[]): number[] {
  const agentAt = new Array<number>(occupancy.length).fill(-1);
  for (let agentId = 0; agentId < occupancy.length; agentId++) {
    const anchorId = occupancy[agentId];
    if (anchorId === undefined) continue;
    agentAt[anchorId] = agentId;
  }
  return agentAt;
}

export function occupancyValid(occupancy: number[]): boolean {
  const seen = new Set<number>();
  for (const anchorId of occupancy) {
    if (!Number.isInteger(anchorId) || anchorId < 0 || anchorId >= occupancy.length) {
      return false;
    }
    if (seen.has(anchorId)) return false;
    seen.add(anchorId);
  }
  return seen.size === occupancy.length;
}

function distanceBand(
  from: Anchor,
  to: Anchor,
  maxDistance: number,
): "neighbor" | "medium" | "long" {
  if (areGridNeighbors(from, to)) return "neighbor";
  const norm = maxDistance <= 1e-6 ? 0 : anchorDistance(from, to) / maxDistance;
  if (norm < 0.42) return "medium";
  return "long";
}

function bandWeights(movementDistance: number): {
  neighbor: number;
  medium: number;
  long: number;
} {
  const t = Math.max(0, Math.min(1, movementDistance));
  return {
    neighbor: 0.55 * (1 - t) + 0.12 * t,
    medium: 0.3,
    long: 0.15 * (1 - t) + 0.58 * t,
  };
}

export function pickPartner(
  fromAgent: number,
  candidates: number[],
  occupancy: number[],
  anchors: Anchor[],
  rng: () => number,
  movementDistance: number,
  randomness: number,
): number | null {
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0] ?? null;

  const fromAnchor = anchors[occupancy[fromAgent] ?? 0];
  if (!fromAnchor) return candidates[0] ?? null;

  let maxDistance = 0;
  for (const other of candidates) {
    const otherAnchor = anchors[occupancy[other] ?? 0];
    if (!otherAnchor) continue;
    maxDistance = Math.max(maxDistance, anchorDistance(fromAnchor, otherAnchor));
  }

  if (rng() > randomness) {
    let best = candidates[0] ?? 0;
    let bestScore = Infinity;
    for (const other of candidates) {
      const otherAnchor = anchors[occupancy[other] ?? 0];
      if (!otherAnchor) continue;
      const d = anchorDistance(fromAnchor, otherAnchor);
      if (d < bestScore) {
        bestScore = d;
        best = other;
      }
    }
    return best;
  }

  const weights = bandWeights(movementDistance);
  const bandRoll = rng();
  let target: "neighbor" | "medium" | "long" = "neighbor";
  if (bandRoll < weights.neighbor) target = "neighbor";
  else if (bandRoll < weights.neighbor + weights.medium) target = "medium";
  else target = "long";

  const inBand = candidates.filter((other) => {
    const otherAnchor = anchors[occupancy[other] ?? 0];
    if (!otherAnchor) return false;
    return distanceBand(fromAnchor, otherAnchor, maxDistance) === target;
  });
  const pool = inBand.length > 0 ? inBand : candidates;
  const poolWeights = pool.map((other) => {
    const otherAnchor = anchors[occupancy[other] ?? 0];
    if (!otherAnchor) return 0;
    const d = anchorDistance(fromAnchor, otherAnchor);
    const local = 1 / (d * d + 12);
    const global = 1;
    return local * (1 - movementDistance) + global * movementDistance;
  });
  return pool[pickWeighted(poolWeights, rng)] ?? pool[pickIndex(rng, pool.length)] ?? null;
}

export function applyCycle(
  occupancy: number[],
  agentIds: number[],
): number[] {
  if (agentIds.length < 2) return occupancy.slice();
  const next = occupancy.slice();
  const anchors = agentIds.map((id) => occupancy[id] ?? 0);
  for (let i = 0; i < agentIds.length; i++) {
    const agentId = agentIds[i];
    if (agentId === undefined) continue;
    const nextAnchor = anchors[(i + 1) % anchors.length];
    if (nextAnchor === undefined) continue;
    next[agentId] = nextAnchor;
  }
  return next;
}
