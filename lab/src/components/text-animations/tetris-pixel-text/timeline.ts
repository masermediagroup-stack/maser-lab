import {
  concurrencyFromDuration,
  peakConcurrentFor,
  type ConcurrencyLevel,
} from "./density";
import type { PixelPiece, TimelineSummary, TetrisPixelSettings } from "./types";

const MIN_FALL_MS = 420;
const MIN_LAND_GLOW_MS = 90;
const MIN_ROTATION_STEP_MS = 80;
const MIN_STAGGER_MS = 4;

export type TimelineNormalizeInput = {
  pieces: PixelPiece[];
  settings: Pick<
    TetrisPixelSettings,
    | "animationDuration"
    | "concurrency"
    | "fallDuration"
    | "stagger"
    | "staggerRandomness"
    | "horizontalCorrections"
    | "horizontalMovement"
    | "rotationAmount"
    | "maxQuarterTurns"
    | "landingDelay"
    | "glowDuration"
    | "finalHoldDuration"
  >;
};

function naturalEndMs(pieces: PixelPiece[], glowDuration: number, hold: number): number {
  let max = 0;
  for (const p of pieces) {
    max = Math.max(max, p.delay + p.duration + glowDuration * 0.35);
  }
  return max + hold * 0.25;
}

function peakConcurrent(pieces: PixelPiece[]): number {
  const events: Array<{ t: number; d: number }> = [];
  for (const p of pieces) {
    events.push({ t: p.delay, d: 1 });
    events.push({ t: p.delay + p.duration, d: -1 });
  }
  events.sort((a, b) => a.t - b.t || a.d - b.d);
  let cur = 0;
  let peak = 0;
  for (const e of events) {
    cur += e.d;
    peak = Math.max(peak, cur);
  }
  return peak;
}

/**
 * Normalize a piece schedule so the last lock lands near animationDuration.
 * Prefer concurrency/stagger adjustments over naive speed multiplication.
 */
export function normalizeTimeline(input: TimelineNormalizeInput): {
  pieces: PixelPiece[];
  summary: TimelineSummary;
} {
  const { settings } = input;
  const requestedSec = Math.max(0.8, Math.min(12, settings.animationDuration || 4));
  const requestedMs = requestedSec * 1000;
  const pieceCount = input.pieces.length;

  if (pieceCount === 0) {
    return {
      pieces: [],
      summary: {
        requestedDuration: requestedSec,
        calculatedDuration: 0,
        pieceCount: 0,
        peakConcurrent: 0,
        effectiveStagger: settings.stagger,
        effectiveConcurrency:
          settings.concurrency === "auto"
            ? concurrencyFromDuration(requestedSec)
            : settings.concurrency,
      },
    };
  }

  const resolvedConcurrency: Exclude<ConcurrencyLevel, "auto"> =
    settings.concurrency === "auto"
      ? concurrencyFromDuration(requestedSec)
      : settings.concurrency;

  const targetPeak = peakConcurrentFor(resolvedConcurrency, requestedSec, pieceCount);

  // Work on a mutable copy ordered by original delay.
  let pieces = input.pieces.map((p) => ({ ...p }));
  pieces.sort((a, b) => a.delay - b.delay || a.targetY - b.targetY);

  // 1) Rebuild stagger from concurrency budget
  // Ideal: with `targetPeak` in flight, stagger ≈ fallDuration / peak
  const baseFall = Math.max(MIN_FALL_MS, settings.fallDuration);
  let stagger = Math.max(
    MIN_STAGGER_MS,
    Math.round(baseFall / Math.max(2, targetPeak)),
  );

  // Blend with user stagger when duration is long (more intentional spacing)
  if (requestedSec >= 5) {
    stagger = Math.round(stagger * 0.45 + settings.stagger * 0.55);
  } else if (requestedSec <= 2) {
    stagger = Math.min(stagger, Math.max(MIN_STAGGER_MS, Math.round(settings.stagger * 0.55)));
  }

  // Short timelines: trim waypoints & rotations before speeding falls
  const shorten = requestedSec < 3.5;
  const lengthen = requestedSec > 6;

  pieces = pieces.map((p, seq) => {
    let waypoints = [...p.horizontalWaypoints];
    let steps = p.rotationSteps;

    if (shorten) {
      // Keep at most one correction + final column
      if (waypoints.length > 2) {
        waypoints = [waypoints[0]!, p.targetX];
      }
      if (settings.horizontalMovement < 0.2) {
        waypoints = [p.targetX];
      }
      // Cap rotations to readable quarter turns
      const maxTurns = Math.min(
        settings.maxQuarterTurns,
        requestedSec <= 1.2 ? 1 : 2,
      );
      steps = Math.min(steps, maxTurns);
      if (requestedSec <= 1.5 && steps > 1) steps = 1;
    }

    if (lengthen && settings.rotationAmount > 0.4 && steps === 0 && seq % 5 === 0) {
      steps = 1;
    }

    const delay = Math.max(0, Math.round(settings.landingDelay + seq * stagger));
    return {
      ...p,
      horizontalWaypoints: waypoints,
      rotationSteps: steps,
      delay,
      duration: baseFall,
    };
  });

  // 2) Measure natural length and scale fall durations gently
  let natural = naturalEndMs(pieces, settings.glowDuration, settings.finalHoldDuration);
  const scale = requestedMs / Math.max(1, natural);

  // Clamp scale so we never teleport or crawl unrealistically
  const clampedScale = Math.max(0.45, Math.min(2.4, scale));

  pieces = pieces.map((p) => {
    let duration = Math.round(p.duration * clampedScale);
    duration = Math.max(MIN_FALL_MS, duration);

    // Rotation readability: ensure fall lasts long enough for quarter turns
    const rotBudget = p.rotationSteps * MIN_ROTATION_STEP_MS;
    duration = Math.max(duration, rotBudget + MIN_FALL_MS * 0.5);

    return { ...p, duration };
  });

  // 3) Re-pack delays to hit target peak concurrency and end time
  natural = naturalEndMs(pieces, Math.max(MIN_LAND_GLOW_MS, settings.glowDuration), settings.finalHoldDuration);
  const endScale = requestedMs / Math.max(1, natural);

  if (endScale < 0.92 || endScale > 1.08) {
    // Adjust stagger primarily
    const staggerScale = Math.max(0.35, Math.min(2.8, endScale));
    stagger = Math.max(MIN_STAGGER_MS, Math.round(stagger * staggerScale));
    pieces = pieces.map((p, seq) => ({
      ...p,
      delay: Math.max(0, Math.round(settings.landingDelay + seq * stagger)),
    }));
  }

  // If still too long, compress fall durations slightly (floor at MIN)
  natural = naturalEndMs(pieces, settings.glowDuration, settings.finalHoldDuration);
  if (natural > requestedMs * 1.12) {
    const fallScale = Math.max(0.5, requestedMs / natural);
    pieces = pieces.map((p) => ({
      ...p,
      duration: Math.max(MIN_FALL_MS, Math.round(p.duration * fallScale)),
    }));
  }

  // If still too short, increase stagger to spread the show
  natural = naturalEndMs(pieces, settings.glowDuration, settings.finalHoldDuration);
  if (natural < requestedMs * 0.88) {
    const extra = (requestedMs - natural) / Math.max(1, pieceCount - 1);
    stagger = Math.max(stagger, Math.round(stagger + extra));
    pieces = pieces.map((p, seq) => ({
      ...p,
      delay: Math.max(0, Math.round(settings.landingDelay + seq * stagger)),
    }));
  }

  const calculatedMs = naturalEndMs(
    pieces,
    Math.max(MIN_LAND_GLOW_MS, settings.glowDuration),
    settings.finalHoldDuration,
  );
  const peak = peakConcurrent(pieces);

  return {
    pieces,
    summary: {
      requestedDuration: requestedSec,
      calculatedDuration: Math.round((calculatedMs / 1000) * 10) / 10,
      pieceCount,
      peakConcurrent: peak,
      effectiveStagger: stagger,
      effectiveConcurrency: resolvedConcurrency,
    },
  };
}
