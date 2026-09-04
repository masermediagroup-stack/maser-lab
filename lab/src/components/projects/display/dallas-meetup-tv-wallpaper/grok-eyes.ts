/**
 * Article stadiums. White pills on the black disc. Planted. They wink and glance.
 * Eyes stay on the disc. They do not orbit. They do not leave.
 */

export type EyePose = {
  /** Radians. Negative = clockwise on canvas (article Idle ~−28°). */
  tilt: number;
  /** Face-radii, +right of body center. */
  cx: number;
  /** Face-radii, +down of body center. */
  cy: number;
  /** 1 = open. Near 0 = wink shut along the stadium's long axis. */
  scaleY: number;
};

/** Article Idle left stadium — lower-left, clockwise tilt. */
export const GROK_LEFT_EYE: EyePose = {
  tilt: (-28 * Math.PI) / 180,
  cx: -0.3,
  cy: 0.28,
  scaleY: 1,
};

/** Article Idle right stadium — higher, slightly less tilt, distinct gap. */
export const GROK_RIGHT_EYE: EyePose = {
  tilt: (-22 * Math.PI) / 180,
  cx: 0.04,
  cy: 0.16,
  scaleY: 1,
};

/** Pair seat used by kick ribbons so bands cross the stadiums. */
export const IDLE_EYE: EyePose = {
  tilt: GROK_LEFT_EYE.tilt,
  cx: (GROK_LEFT_EYE.cx + GROK_RIGHT_EYE.cx) * 0.5,
  cy: (GROK_LEFT_EYE.cy + GROK_RIGHT_EYE.cy) * 0.5,
  scaleY: 1,
};

export const WORKING_EYE = IDLE_EYE;

const WINK_AT = [1.65, 4.85] as const;
const WINK_DUR = 0.16;
const WINK_SHUT = 0.08;

function loopTime(time: number, loopSeconds: number): number {
  const loop = loopSeconds > 0 ? loopSeconds : 8;
  if (!Number.isFinite(time)) return 0;
  return ((time % loop) + loop) % loop;
}

/** 1 open → WINK_SHUT closed → 1. Cubic-ish pulse over WINK_DUR. */
export function winkEnvelope(local: number): number {
  if (local <= 0 || local >= WINK_DUR) return 1;
  const u = local / WINK_DUR;
  const pulse = Math.sin(u * Math.PI);
  return 1 - (1 - WINK_SHUT) * pulse * pulse;
}

function winkScaleForEye(
  t: number,
  eye: "left" | "right",
  reducedMotion: boolean,
): number {
  if (reducedMotion) return 1;
  let scale = 1;
  for (let i = 0; i < WINK_AT.length; i += 1) {
    const which: "left" | "right" = i % 2 === 0 ? "left" : "right";
    if (which !== eye) continue;
    scale = Math.min(scale, winkEnvelope(t - WINK_AT[i]!));
  }
  return scale;
}

function glanceShift(t: number, reducedMotion: boolean): { dx: number; dy: number } {
  if (reducedMotion) return { dx: 0, dy: 0 };
  return {
    dx: 0.045 * Math.sin(t * 0.72),
    dy: 0.035 * Math.sin(t * 0.51 + 1.1),
  };
}

export function eyesAt(
  time: number,
  loopSeconds: number,
  whipSeconds: number,
  reducedMotion: boolean,
): { left: EyePose; right: EyePose } {
  void whipSeconds;
  const t = loopTime(time, loopSeconds);
  const glance = glanceShift(t, reducedMotion);
  return {
    left: {
      ...GROK_LEFT_EYE,
      cx: GROK_LEFT_EYE.cx + glance.dx,
      cy: GROK_LEFT_EYE.cy + glance.dy,
      scaleY: winkScaleForEye(t, "left", reducedMotion),
    },
    right: {
      ...GROK_RIGHT_EYE,
      cx: GROK_RIGHT_EYE.cx + glance.dx,
      cy: GROK_RIGHT_EYE.cy + glance.dy,
      scaleY: winkScaleForEye(t, "right", reducedMotion),
    },
  };
}

/**
 * Pair seat (ribbon y-bias). Wink/glance live on `eyesAt`.
 * Reduced motion freezes the Idle seat.
 */
export function eyePoseAt(
  time: number,
  loopSeconds: number,
  whipSeconds: number,
  reducedMotion: boolean,
): EyePose {
  if (reducedMotion) return IDLE_EYE;
  const pair = eyesAt(time, loopSeconds, whipSeconds, reducedMotion);
  return {
    tilt: IDLE_EYE.tilt,
    cx: (pair.left.cx + pair.right.cx) * 0.5,
    cy: (pair.left.cy + pair.right.cy) * 0.5,
    scaleY: 1,
  };
}
