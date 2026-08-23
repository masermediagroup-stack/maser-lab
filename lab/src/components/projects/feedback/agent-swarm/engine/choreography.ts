import type { AgentSwarmMode, Anchor, Movement } from "../types";
import { formationCentroid } from "./anchors";
import { bowAwayDirection } from "./path";
import { pickIndex } from "./prng";
import { applyCycle, identityOccupancy, pickPartner } from "./permutation";

export type CyclePlan = {
  moves: Movement[];
  occupancy: number[];
};

function availableAgents(count: number, used: Set<number>): number[] {
  const ids: number[] = [];
  for (let i = 0; i < count; i++) {
    if (!used.has(i)) ids.push(i);
  }
  return ids;
}

function pushCycleMoves(
  moves: Movement[],
  agentIds: number[],
  occupancy: number[],
  anchors: Anchor[],
  delay: number,
  duration: number,
  curvature: number,
  swapPair: boolean,
): void {
  const centroid = formationCentroid(anchors);
  const first = agentIds[0];
  const second = agentIds[1];
  const firstFrom = first === undefined ? undefined : occupancy[first];
  const firstTo = second === undefined ? undefined : occupancy[second];
  const firstStart = firstFrom === undefined ? undefined : anchors[firstFrom];
  const firstEnd = firstTo === undefined ? undefined : anchors[firstTo];
  const pairDirection =
    firstStart && firstEnd ? bowAwayDirection(firstStart, firstEnd, centroid) : 1;
  const count = agentIds.length;
  for (let i = 0; i < count; i++) {
    const agentId = agentIds[i];
    if (agentId === undefined) continue;
    const fromAnchor = occupancy[agentId];
    const nextAgent = agentIds[(i + 1) % count];
    if (fromAnchor === undefined || nextAgent === undefined) continue;
    const toAnchor = occupancy[nextAgent];
    if (toAnchor === undefined) continue;
    const start = anchors[fromAnchor];
    const end = anchors[toAnchor];
    if (!start || !end) continue;
    const away = bowAwayDirection(start, end, centroid);
    const direction: 1 | -1 = swapPair ? pairDirection : away;
    moves.push({
      agentId,
      fromAnchor,
      toAnchor,
      delay,
      duration,
      curvature,
      direction,
    });
  }
}

function resolvedMode(mode: AgentSwarmMode): AgentSwarmMode {
  if (mode === "orbit" || mode === "process") return "swap";
  return mode;
}

export function generateMovementCycle(options: {
  occupancy: number[];
  anchors: Anchor[];
  mode: AgentSwarmMode;
  rng: () => number;
  movementDistance: number;
  activePercentage: number;
  curvature: number;
  stagger: number;
  travelDuration: number;
  randomness: number;
}): CyclePlan {
  const {
    occupancy,
    anchors,
    rng,
    movementDistance,
    activePercentage,
    curvature,
    stagger,
    travelDuration,
    randomness,
  } = options;
  const mode = resolvedMode(options.mode);
  const count = occupancy.length;
  const moves: Movement[] = [];

  if (mode === "pulse" || count < 2) {
    return { moves, occupancy: occupancy.slice() };
  }

  if (mode === "resolve") {
    const next = identityOccupancy(count);
    const identityMoves: Movement[] = [];
    const centroid = formationCentroid(anchors);
    for (let agentId = 0; agentId < count; agentId++) {
      const fromAnchor = occupancy[agentId] ?? agentId;
      const toAnchor = agentId;
      if (fromAnchor === toAnchor) continue;
      const start = anchors[fromAnchor];
      const end = anchors[toAnchor];
      if (!start || !end) continue;
      identityMoves.push({
        agentId,
        fromAnchor,
        toAnchor,
        delay: 0,
        duration: travelDuration,
        curvature: Math.min(1, curvature + 0.12),
        direction: bowAwayDirection(start, end, centroid),
      });
    }
    return { moves: identityMoves, occupancy: next };
  }

  const used = new Set<number>();
  const nActive = Math.max(2, Math.min(count, Math.round(count * activePercentage)));
  let remaining = nActive;
  let pairIndex = 0;
  let next = occupancy.slice();

  const takeAgent = (): number | null => {
    const pool = availableAgents(count, used);
    if (pool.length === 0) return null;
    const id = pool[pickIndex(rng, pool.length)];
    if (id === undefined) return null;
    used.add(id);
    return id;
  };

  while (remaining >= 2) {
    const free = availableAgents(count, used);
    if (free.length < 2) break;

    const delay = pairIndex * stagger * travelDuration;
    const wantRoute = mode === "route" && remaining >= 3 && free.length >= 3;
    const wantCascade = mode === "cascade" && remaining >= 3 && free.length >= 3;
    const wantTriple =
      (mode === "shuffle" && remaining >= 3 && free.length >= 3 && rng() < 0.62) ||
      (mode === "swap" && remaining >= 3 && free.length >= 3 && rng() < 0.2 * (0.4 + randomness)) ||
      wantRoute ||
      wantCascade;
    const wantQuad = mode === "shuffle" && remaining >= 4 && free.length >= 4 && rng() < 0.28;
    const size = wantQuad ? 4 : wantTriple ? 3 : 2;

    const first = takeAgent();
    if (first === null) break;
    const group = [first];
    while (group.length < size) {
      const pool = availableAgents(count, used);
      const partner = pickPartner(
        first,
        pool,
        occupancy,
        anchors,
        rng,
        wantCascade ? Math.min(movementDistance, 0.22) : movementDistance,
        randomness,
      );
      if (partner === null) break;
      used.add(partner);
      group.push(partner);
    }

    if (group.length < 2) break;
    pushCycleMoves(
      moves,
      group,
      occupancy,
      anchors,
      delay,
      travelDuration,
      curvature,
      group.length === 2,
    );
    next = applyCycle(next, group);
    remaining -= group.length;
    pairIndex += 1;
  }

  return { moves, occupancy: next };
}
