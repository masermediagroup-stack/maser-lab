import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { MAX_TRAIL, WARNING_TINT } from "../constants";
import type {
  AgentSwarmParams,
  Anchor,
  CubicBezier,
  CyclePhase,
  DebugSnapshot,
  Movement,
  Vec2,
} from "../types";
import { generateMovementCycle } from "../engine/choreography";
import { travelEase } from "../engine/easing";
import { generateBezierPath, sampleCubic, vecAdd, vecNormalize, vecScale, vecSub } from "../engine/path";
import { createCyclePrng } from "../engine/prng";
import { identityOccupancy } from "../engine/permutation";
import { formationCentroid } from "../engine/anchors";

type ActiveMove = {
  agentId: number;
  curve: CubicBezier;
  delay: number;
  duration: number;
  toAnchor: number;
  end: Vec2;
};

type CachedAgent = {
  group: SVGElement | null;
  core: SVGElement | null;
  bloom: SVGElement | null;
  halo: SVGElement | null;
  trails: (SVGElement | null)[];
};

type EngineOptions = {
  svgRef: RefObject<SVGSVGElement | null>;
  params: AgentSwarmParams;
  anchors: Anchor[];
  reducedMotion: boolean;
  restartToken: string;
  onDebug?: (snapshot: DebugSnapshot) => void;
};

function pickNeighborAgent(agentId: number, count: number): number {
  if (count < 2) return agentId;
  return (agentId + 1) % count;
}

function setTransform(node: SVGElement | null, x: number, y: number, scale = 1) {
  if (!node) return;
  node.setAttribute("transform", `translate(${x} ${y}) scale(${scale})`);
}

export function useAgentEngine({
  svgRef,
  params,
  anchors,
  reducedMotion,
  restartToken,
  onDebug,
}: EngineOptions) {
  const occupancyRef = useRef<number[]>([]);
  const visualRef = useRef<Vec2[]>([]);
  const cycleIndexRef = useRef(0);
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const tapAgentRef = useRef<number | null>(null);
  const successHoldRef = useRef(false);
  const resolveScatterRef = useRef(false);
  const paramsRef = useRef(params);
  const anchorsRef = useRef(anchors);
  const onDebugRef = useRef(onDebug);

  useEffect(() => {
    paramsRef.current = params;
    anchorsRef.current = anchors;
    onDebugRef.current = onDebug;
  }, [params, anchors, onDebug]);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    let raf = 0;
    let running = true;
    let visible = true;
    let pageHidden = document.hidden;
    let lastTs = performance.now();
    let phase: CyclePhase = "waiting";
    let phaseStarted = lastTs;
    let moves: ActiveMove[] = [];
    let plannedMoves: Movement[] = [];
    let bloom = 0;
    let debugPublished = false;
    const trails: Vec2[][] = [];
    let cache: CachedAgent[] = [];

    occupancyRef.current = identityOccupancy(anchorsRef.current.length);
    visualRef.current = anchorsRef.current.map((a) => ({ x: a.x, y: a.y }));
    cycleIndexRef.current = 0;
    successHoldRef.current = false;
    resolveScatterRef.current = false;

    const rebuildCache = (count: number) => {
      cache = Array.from({ length: count }, (_, i) => ({
        group: svg.querySelector(`[data-agent-id="${i}"]`),
        core: svg.querySelector(`[data-agent-core="${i}"]`),
        bloom: svg.querySelector(`[data-agent-bloom="${i}"]`),
        halo: svg.querySelector(`[data-agent-halo="${i}"]`),
        trails: Array.from({ length: MAX_TRAIL }, (_, step) =>
          svg.querySelector(`[data-trail="${i}-${step}"]`),
        ),
      }));
    };

    const syncCount = () => {
      const count = anchorsRef.current.length;
      if (occupancyRef.current.length !== count) {
        occupancyRef.current = identityOccupancy(count);
        visualRef.current = anchorsRef.current.map((a) => ({ x: a.x, y: a.y }));
        trails.length = 0;
      }
      while (trails.length < count) trails.push([]);
      trails.length = count;
      if (cache.length !== count) rebuildCache(count);
    };

    const applyPointer = (pos: Vec2, current: AgentSwarmParams): Vec2 => {
      if (
        !pointerRef.current.active ||
        current.interaction === "off" ||
        current.interaction === "tap-swap"
      ) {
        return pos;
      }
      const pointer = { x: pointerRef.current.x, y: pointerRef.current.y };
      const delta = vecSub(pos, pointer);
      const dist = Math.hypot(delta.x, delta.y);
      if (dist > current.pointerRadius || dist < 1e-3) return pos;
      const falloff = 1 - dist / current.pointerRadius;
      const mag = falloff * falloff * current.pointerStrength * 28;
      const dir = vecNormalize(delta);
      if (current.interaction === "attract") {
        return vecAdd(pos, vecScale(dir, -mag));
      }
      return vecAdd(pos, vecScale(dir, mag));
    };

    const emitDebug = (nextPhase: CyclePhase, nextMoves: ActiveMove[]) => {
      const current = paramsRef.current;
      if (!current.debug) {
        debugPublished = false;
        return;
      }
      onDebugRef.current?.({
        phase: nextPhase,
        cycleIndex: cycleIndexRef.current,
        occupancy: occupancyRef.current.slice(),
        moves: plannedMoves,
        paths: nextMoves.map((item) => item.curve),
      });
      debugPublished = true;
    };

    const paint = (current: AgentSwarmParams, now: number) => {
      if (!current.debug) debugPublished = false;
      const anchorsNow = anchorsRef.current;
      const occupancy = occupancyRef.current;
      const count = occupancy.length;
      const pulseAmp = reducedMotion || current.mode === "pulse" || current.status === "idle" ? 0.045 : 0.012;
      const error = current.status === "error";

      for (let i = 0; i < count; i++) {
        const els = cache[i];
        const base = visualRef.current[i] ?? anchorsNow[i] ?? { x: 0, y: 0 };
        let pos = applyPointer(base, current);
        if (error) {
          const wobble = 1.6;
          pos = {
            x: pos.x + Math.sin(now * 0.0018 + i) * wobble,
            y: pos.y + Math.cos(now * 0.0015 + i * 0.7) * wobble,
          };
        }
        const pulse =
          1 +
          Math.sin(now * (error ? 0.003 : 0.0022) + i * 0.9) * pulseAmp +
          bloom * 0.08;
        const velocityScale = els?.group?.dataset.speedScale
          ? Number(els.group.dataset.speedScale)
          : 1;
        setTransform(els?.group ?? null, pos.x, pos.y, pulse);
        if (els?.core) {
          els.core.setAttribute("transform", `scale(${velocityScale})`);
          const baseColor = els.core.getAttribute("data-base-color") ?? "#ffffff";
          els.core.setAttribute("fill", error && i < 2 ? WARNING_TINT : baseColor);
        }
        if (els?.bloom) els.bloom.setAttribute("opacity", String(0.85 + bloom * 0.35));
        if (els?.halo) els.halo.setAttribute("opacity", String(current.atmosphericGlow));

        const trailCount = Math.max(0, Math.min(MAX_TRAIL, Math.round(current.trailLength)));
        const history = trails[i] ?? [];
        for (let step = 0; step < MAX_TRAIL; step++) {
          const trail = els?.trails[step];
          if (!trail) continue;
          if (step >= trailCount || !history[step]) {
            trail.setAttribute("opacity", "0");
            continue;
          }
          const point = history[step];
          if (!point) continue;
          trail.setAttribute("cx", String(point.x));
          trail.setAttribute("cy", String(point.y));
          trail.setAttribute(
            "opacity",
            String(current.trailOpacity * (1 - step / Math.max(1, trailCount)) * 0.7),
          );
        }
      }

      if (current.debug && !debugPublished) emitDebug(phase, moves);
    };

    const startMoves = (nextMoves: ActiveMove[], now: number, nextPlanned: Movement[]) => {
      moves = nextMoves;
      plannedMoves = nextPlanned;
      phase = nextMoves.length === 0 ? "settling" : "moving";
      phaseStarted = now;
      if (nextMoves.length === 0) bloom = 1;
      emitDebug(phase, nextMoves);
    };

    const planCycle = (current: AgentSwarmParams, now: number) => {
      const anchorsNow = anchorsRef.current;
      syncCount();
      const occupancy = occupancyRef.current;
      const rng = createCyclePrng(current.seed, cycleIndexRef.current);
      cycleIndexRef.current += 1;
      phase = "planning";

      const tap = tapAgentRef.current;
      tapAgentRef.current = null;

      if (tap !== null) {
        const partner = pickNeighborAgent(tap, occupancy.length);
        const fromA = occupancy[tap] ?? tap;
        const fromB = occupancy[partner] ?? partner;
        const startA = visualRef.current[tap] ?? anchorsNow[fromA] ?? { x: 0, y: 0 };
        const startB = visualRef.current[partner] ?? anchorsNow[fromB] ?? { x: 0, y: 0 };
        const endA = anchorsNow[fromB] ?? startA;
        const endB = anchorsNow[fromA] ?? startB;
        const dir: 1 | -1 = rng() > 0.5 ? 1 : -1;
        occupancyRef.current = occupancy.map((anchorId, agentId) => {
          if (agentId === tap) return fromB;
          if (agentId === partner) return fromA;
          return anchorId;
        });
        const nextMoves: ActiveMove[] = [
          {
            agentId: tap,
            curve: generateBezierPath(startA, endA, current.pathCurvature, dir),
            delay: 0,
            duration: current.travelDuration,
            toAnchor: fromB,
            end: { x: endA.x, y: endA.y },
          },
          {
            agentId: partner,
            curve: generateBezierPath(startB, endB, current.pathCurvature, dir),
            delay: 0,
            duration: current.travelDuration,
            toAnchor: fromA,
            end: { x: endB.x, y: endB.y },
          },
        ];
        startMoves(nextMoves, now, [
          {
            agentId: tap,
            fromAnchor: fromA,
            toAnchor: fromB,
            delay: 0,
            duration: current.travelDuration,
            curvature: current.pathCurvature,
            direction: dir,
          },
          {
            agentId: partner,
            fromAnchor: fromB,
            toAnchor: fromA,
            delay: 0,
            duration: current.travelDuration,
            curvature: current.pathCurvature,
            direction: dir,
          },
        ]);
        return;
      }

      if (current.mode === "resolve" && resolveScatterRef.current) {
        resolveScatterRef.current = false;
        const converge: ActiveMove[] = [];
        for (let i = 0; i < occupancy.length; i++) {
          const anchorId = occupancy[i] ?? i;
          const start = visualRef.current[i] ?? anchorsNow[anchorId];
          const home = anchorsNow[anchorId];
          if (!start || !home) continue;
          converge.push({
            agentId: i,
            curve: generateBezierPath(start, home, 0.22, rng() > 0.5 ? 1 : -1),
            delay: i * current.stagger * 30,
            duration: current.travelDuration * 0.7,
            toAnchor: anchorId,
            end: { x: home.x, y: home.y },
          });
        }
        startMoves(converge, now, []);
        return;
      }

      if (current.mode === "resolve" && current.status !== "success") {
        resolveScatterRef.current = true;
        const centroid = formationCentroid(anchorsNow);
        const scatterMoves: ActiveMove[] = [];
        for (let i = 0; i < occupancy.length; i++) {
          const anchorId = occupancy[i] ?? i;
          const start = visualRef.current[i] ?? anchorsNow[anchorId];
          const home = anchorsNow[anchorId];
          if (!start || !home) continue;
          const outward = vecNormalize(vecSub(home, centroid));
          const amount = 18 + rng() * 10;
          const end = vecAdd(home, vecScale(outward, amount));
          scatterMoves.push({
            agentId: i,
            curve: generateBezierPath(start, end, 0.18, rng() > 0.5 ? 1 : -1),
            delay: i * current.stagger * 40,
            duration: current.travelDuration * 0.55,
            toAnchor: anchorId,
            end,
          });
        }
        startMoves(scatterMoves, now, []);
        return;
      }

      const plan = generateMovementCycle({
        occupancy,
        anchors: anchorsNow,
        mode: current.mode,
        rng,
        movementDistance: current.movementDistance,
        activePercentage: current.activeAgentPercentage,
        curvature: current.pathCurvature,
        stagger: current.stagger,
        travelDuration: current.travelDuration,
        randomness: current.randomness,
      });

      occupancyRef.current = plan.occupancy;
      const nextMoves = plan.moves.map((move) => {
        const fromVisual = visualRef.current[move.agentId];
        const from = fromVisual ?? anchorsNow[move.fromAnchor] ?? { x: 0, y: 0 };
        const to = anchorsNow[move.toAnchor] ?? { x: 0, y: 0 };
        return {
          agentId: move.agentId,
          curve: generateBezierPath(from, to, move.curvature, move.direction),
          delay: move.delay,
          duration: move.duration,
          toAnchor: move.toAnchor,
          end: { x: to.x, y: to.y },
        };
      });
      startMoves(nextMoves, now, plan.moves);
    };

    const tick = (now: number) => {
      if (!running) return;
      const current = paramsRef.current;
      syncCount();
      const dt = Math.min(48, now - lastTs);
      lastTs = now;

      const speed = current.animation ? current.speed : 0;
      const freeze =
        pageHidden ||
        !visible ||
        speed <= 0 ||
        current.status === "error" ||
        (current.status === "success" && successHoldRef.current);

      if (current.status !== "success") successHoldRef.current = false;

      if (reducedMotion || current.mode === "pulse" || current.status === "idle") {
        const occ = occupancyRef.current;
        for (let i = 0; i < occ.length; i++) {
          const anchor = anchorsRef.current[occ[i] ?? i];
          if (anchor) visualRef.current[i] = { x: anchor.x, y: anchor.y };
        }
        paint(current, now);
        raf = requestAnimationFrame(tick);
        return;
      }

      if (freeze) {
        paint(current, now);
        raf = requestAnimationFrame(tick);
        return;
      }

      if (phase === "waiting" || phase === "idle") {
        const occ = occupancyRef.current;
        for (let i = 0; i < occ.length; i++) {
          const anchor = anchorsRef.current[occ[i] ?? i];
          if (anchor) visualRef.current[i] = { x: anchor.x, y: anchor.y };
        }
        if (tapAgentRef.current !== null) {
          planCycle(current, now);
        } else {
          const idle = current.idleDuration / speed;
          if (now - phaseStarted >= idle) {
            if (current.status === "success") {
              planCycle({ ...current, mode: "resolve" }, now);
            } else {
              planCycle(current, now);
            }
          }
        }
      }

      if (phase === "moving") {
        const t0 = now - phaseStarted;
        let doneCount = 0;
        for (const move of moves) {
          const local = (t0 - move.delay / speed) / (move.duration / speed);
          const clamped = Math.max(0, Math.min(1, local));
          const eased = travelEase(clamped);
          const pos = sampleCubic(move.curve, eased);
          visualRef.current[move.agentId] = pos;
          const prev = sampleCubic(move.curve, travelEase(Math.max(0, clamped - dt / move.duration)));
          const speedMag = Math.hypot(pos.x - prev.x, pos.y - prev.y);
          const group = cache[move.agentId]?.group;
          if (group) {
            const scale = 1 - Math.min(0.05, speedMag * 0.015);
            group.dataset.speedScale = String(scale);
          }
          const history = trails[move.agentId] ?? [];
          history.unshift({ ...pos });
          history.length = MAX_TRAIL;
          trails[move.agentId] = history;
          if (clamped >= 1) doneCount += 1;
        }
        if (moves.length === 0 || doneCount === moves.length) {
          for (const move of moves) {
            visualRef.current[move.agentId] = { x: move.end.x, y: move.end.y };
            const group = cache[move.agentId]?.group;
            if (group) group.dataset.speedScale = "1";
          }
          phase = "settling";
          phaseStarted = now;
          bloom = 1;
          emitDebug(phase, moves);
        }
      }

      if (phase === "settling") {
        const settle = current.settleDuration / speed;
        const t = Math.min(1, (now - phaseStarted) / settle);
        bloom = 1 - t;
        if (t >= 1) {
          bloom = 0;
          phase = "waiting";
          phaseStarted = now;
          if (current.status === "success") successHoldRef.current = true;
          emitDebug(phase, moves);
        }
      }

      paint(current, now);
      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      pageHidden = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
      },
      { threshold: 0.05 },
    );
    io.observe(svg);

    rebuildCache(anchorsRef.current.length);
    paint(paramsRef.current, performance.now());
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
    };
  }, [svgRef, reducedMotion, restartToken]);

  return {
    setPointer(point: Vec2) {
      pointerRef.current = { ...point, active: true };
    },
    clearPointer() {
      pointerRef.current.active = false;
    },
    setTap(agentId: number) {
      tapAgentRef.current = agentId;
    },
    visuals() {
      return visualRef.current;
    },
  };
}

export function clientToSvgPoint(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): Vec2 | null {
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const mapped = point.matrixTransform(ctm.inverse());
  return { x: mapped.x, y: mapped.y };
}

export function nearestAgent(positions: Vec2[], point: Vec2): number | null {
  if (positions.length === 0) return null;
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    if (!pos) continue;
    const d = Math.hypot(pos.x - point.x, pos.y - point.y);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}
