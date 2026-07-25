import {
  applyEasing,
  applyOvershoot,
  clamp01,
  mix,
  shapeVelocity,
} from "./transition-easing";
import type {
  StartTransitionOptions,
  TornTransitionSettings,
  TransitionDirection,
  TransitionOrigin,
  TransitionPhase,
} from "./transition-types";

/**
 * A single in-flight transition. Everything the machine needs is captured at
 * start time, so a settings change mid-flight cannot retime a running sheet.
 */
export type TransitionRun = {
  id: number;
  startedAt: number;
  direction: TransitionDirection;
  origin: TransitionOrigin;
  settings: TornTransitionSettings;
  onCovered?: () => void;
  onComplete?: () => void;
  /** Set once `onCovered` has fired so it can never fire twice. */
  swapFired: boolean;
  /** Set once `onComplete` has fired. */
  completeFired: boolean;
};

export type TransitionFrame = {
  phase: TransitionPhase;
  /** Normalised lead-edge travel, 0 (off-screen start) → 1 (fully across). */
  lead: number;
  /** Normalised trail-edge travel, 0 (still covering) → 1 (fully gone). */
  trail: number;
  /** How much of the viewport the sheet hides, for UI readouts only. */
  coverage: number;
  /** True on the frame the swap threshold is first crossed. */
  swapDue: boolean;
  /** True once the sheet has fully left and settling has elapsed. */
  done: boolean;
};

/** Phases where the sheet still owns the screen. */
export const COVERING_PHASES: TransitionPhase[] = [
  "covered",
  "content-swapping",
];

/** Extra time beyond the scripted duration before the watchdog force-clears. */
export const WATCHDOG_SLACK_MS = 1500;

/** How long the `content-swapping` phase is reported after the swap fires. */
const SWAP_PHASE_WINDOW_MS = 140;

let nextRunId = 1;

export function createRun(
  settings: TornTransitionSettings,
  options: StartTransitionOptions | undefined,
  fallbackOrigin: TransitionOrigin,
  now: number,
): TransitionRun {
  const merged: TornTransitionSettings = options?.overrides
    ? { ...settings, ...options.overrides }
    : settings;

  return {
    id: nextRunId++,
    startedAt: now,
    direction: options?.direction ?? merged.direction,
    origin: options?.origin ?? fallbackOrigin,
    settings: merged,
    onCovered: options?.onCovered,
    onComplete: options?.onComplete,
    swapFired: false,
    completeFired: false,
  };
}

type Timeline = {
  delay: number;
  introEnd: number;
  coveredEnd: number;
  outroEnd: number;
  settleEnd: number;
};

function timeline(settings: TornTransitionSettings): Timeline {
  const delay = Math.max(0, settings.startDelay);
  const introEnd = delay + Math.max(60, settings.duration);
  const coveredEnd = introEnd + Math.max(0, settings.coveredHold);
  const outroEnd = coveredEnd + Math.max(60, settings.outroDuration);
  const settleEnd = outroEnd + Math.max(0, settings.settleDuration);
  return { delay, introEnd, coveredEnd, outroEnd, settleEnd };
}

export function runTotalDuration(settings: TornTransitionSettings): number {
  return timeline(settings).settleEnd;
}

/**
 * Derives the whole visual state from elapsed time. Pure — the provider calls
 * this every frame and reacts to `swapDue` / `done` rather than scheduling
 * timeouts, so tab throttling, interruption and scrubbing all stay consistent.
 */
export function computeFrame(run: TransitionRun, now: number): TransitionFrame {
  const s = run.settings;
  const t = timeline(s);
  const elapsed = now - run.startedAt;

  if (elapsed < t.delay) {
    return {
      phase: "entering",
      lead: 0,
      trail: 0,
      coverage: 0,
      swapDue: false,
      done: false,
    };
  }

  if (elapsed < t.introEnd) {
    const raw = clamp01((elapsed - t.delay) / (t.introEnd - t.delay));
    const eased = shapeVelocity(applyEasing(s.easing, raw), s.edgeVelocity);
    const lead = clamp01(applyOvershoot(eased, raw, s.overshoot));
    const swapDue = !run.swapFired && eased >= s.swapMidpoint;
    return {
      phase: swapDue ? "content-swapping" : "entering",
      lead,
      trail: 0,
      coverage: eased,
      swapDue,
      done: false,
    };
  }

  if (elapsed < t.coveredEnd) {
    const sinceIntro = elapsed - t.introEnd;
    const swapDue = !run.swapFired;
    const inSwapWindow = swapDue || sinceIntro < SWAP_PHASE_WINDOW_MS;
    return {
      phase: inSwapWindow && !run.swapFired ? "content-swapping" : "covered",
      lead: 1,
      trail: 0,
      coverage: 1,
      swapDue,
      done: false,
    };
  }

  if (elapsed < t.outroEnd) {
    const raw = clamp01(
      (elapsed - t.coveredEnd) / (t.outroEnd - t.coveredEnd),
    );
    const eased = shapeVelocity(applyEasing(s.easing, raw), s.edgeVelocity);
    return {
      phase: "revealing",
      lead: 1,
      trail: clamp01(applyOvershoot(eased, raw, s.overshoot)),
      coverage: 1 - eased,
      swapDue: !run.swapFired,
      done: false,
    };
  }

  if (elapsed < t.settleEnd) {
    return {
      phase: "settling",
      lead: 1,
      trail: 1,
      coverage: 0,
      swapDue: !run.swapFired,
      done: false,
    };
  }

  return {
    phase: "complete",
    lead: 1,
    trail: 1,
    coverage: 0,
    swapDue: !run.swapFired,
    done: true,
  };
}

/**
 * Builds a frame for a manually scrubbed progress value (lab inspection).
 * 0 → 0.5 drives the lead edge in; 0.5 → 1 drives the trail edge out.
 */
export function scrubFrame(progress: number): TransitionFrame {
  const p = clamp01(progress);
  if (p <= 0.5) {
    const lead = p / 0.5;
    return {
      phase: lead >= 1 ? "covered" : "entering",
      lead,
      trail: 0,
      coverage: lead,
      swapDue: false,
      done: false,
    };
  }
  const trail = (p - 0.5) / 0.5;
  return {
    phase: trail >= 1 ? "complete" : "revealing",
    lead: 1,
    trail,
    coverage: 1 - trail,
    swapDue: false,
    done: false,
  };
}

/**
 * Maps normalised edge travel into direction-field space, adding enough margin
 * on both sides that the torn displacement can never expose a straight edge.
 */
export function edgePosition(
  travel: number,
  settings: TornTransitionSettings,
): number {
  const margin = settings.bandWidth + settings.tearAmplitude + 0.08;
  return mix(-margin, 1 + margin, travel);
}

export const DIRECTION_MODE_INDEX: Record<TransitionDirection, number> = {
  "left-right": 0,
  "right-left": 1,
  "top-bottom": 2,
  "bottom-top": 3,
  diagonal: 4,
  "radial-expand": 5,
  "radial-collapse": 6,
  pointer: 7,
};

export const DIRECTION_OPTIONS: {
  value: TransitionDirection;
  label: string;
}[] = [
  { value: "left-right", label: "Left → right" },
  { value: "right-left", label: "Right → left" },
  { value: "top-bottom", label: "Top → bottom" },
  { value: "bottom-top", label: "Bottom → top" },
  { value: "diagonal", label: "Diagonal" },
  { value: "radial-expand", label: "Radial expand" },
  { value: "radial-collapse", label: "Radial collapse" },
  { value: "pointer", label: "Pointer origin" },
];

/** Directions whose origin handle is meaningful. */
export const ORIGIN_DIRECTIONS: TransitionDirection[] = [
  "radial-expand",
  "radial-collapse",
  "pointer",
];
