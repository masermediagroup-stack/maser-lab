/**
 * Article Idle / Working eye poses from the Grok Bot lifecycle tour.
 * Body does not yaw. Eyes plant in face-space and change pose with the beat.
 *
 * Idle: diagonal, higher-right, nearly static.
 * Working (whip): more upright, sit lower, small nodding/pumping cadence.
 * Settle: ease back to Idle on the new shape.
 */

import {
  DEFAULT_LOOP_SECONDS,
  SETTLE_SECONDS,
  clampWhipSeconds,
  restSeconds,
  whipEase,
} from "./globe-motion";

export type EyePose = {
  /** Radians. Negative = clockwise on canvas (article Idle ~−28°). */
  tilt: number;
  /** Face-radii, +right of body center. */
  cx: number;
  /** Face-radii, +down of body center. */
  cy: number;
};

/** Article Idle: diagonal, higher-right, calm/curious. */
export const IDLE_EYE: EyePose = {
  tilt: (-28 * Math.PI) / 180,
  cx: 0.22,
  cy: -0.3,
};

/** Article Working: more upright, sit lower. */
export const WORKING_EYE: EyePose = {
  tilt: (-6 * Math.PI) / 180,
  cx: 0.05,
  cy: 0.14,
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(t: number): number {
  const u = Math.min(1, Math.max(0, t));
  return u * u * (3 - 2 * u);
}

function mixPose(from: EyePose, to: EyePose, t: number, nod = 0): EyePose {
  const u = Math.min(1, Math.max(0, t));
  return {
    tilt: lerp(from.tilt, to.tilt, u),
    cx: lerp(from.cx, to.cx, u),
    cy: lerp(from.cy, to.cy, u) + nod,
  };
}

/**
 * Idle rest holds IDLE_EYE. Whip pumps toward WORKING_EYE with a small nod.
 * Settle returns to Idle. Reduced motion freezes Idle. Linear spin holds Working.
 */
export function eyePoseAt(
  time: number,
  loopSeconds: number,
  whipSeconds: number,
  linearSpin: boolean,
  reducedMotion: boolean,
): EyePose {
  if (reducedMotion) return IDLE_EYE;
  if (linearSpin) return WORKING_EYE;

  const loop = loopSeconds > 0 ? loopSeconds : DEFAULT_LOOP_SECONDS;
  const t = ((time % loop) + loop) % loop;
  const whip = clampWhipSeconds(whipSeconds);
  const rest = restSeconds(loop, whip);
  const whipEnd = rest + whip;

  if (t < rest) return IDLE_EYE;

  if (t < whipEnd) {
    const u = (t - rest) / whip;
    const toward = whipEase(Math.min(1, u / 0.22));
    const nod =
      u > 0.12 && u < 0.92 ? Math.sin(u * Math.PI * 4) * 0.045 : 0;
    return mixPose(IDLE_EYE, WORKING_EYE, toward, nod);
  }

  const settleLen = Math.max(1e-6, SETTLE_SECONDS);
  const s = smoothstep((t - whipEnd) / settleLen);
  return mixPose(WORKING_EYE, IDLE_EYE, s);
}
