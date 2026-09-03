/**
 * Article stadiums, planted in face-space.
 *
 * Idle rest / settle / reduced motion: diagonal Idle (~−28°), higher-right.
 * Whip: Working eye pump (more upright). Still planted — no orbit, no yaw smear.
 * Held Working after the bands leave is this pump only. Still no orbits.
 * Linear-spin compare keeps Idle planted (smear miss).
 */

import { loopBeat } from "./globe-motion";

export type EyePose = {
  /** Radians. Negative = clockwise on canvas (article Idle ~−28°). */
  tilt: number;
  /** Face-radii, +right of body center. */
  cx: number;
  /** Face-radii, +down of body center. */
  cy: number;
};

export type EyeWhip = EyePose & {
  /** Camera-facing depth. >0 is the front of the form. */
  z: number;
  /** Always true on this lock — the pair never leaves the face. */
  visible: boolean;
  squashX: number;
};

/** Article Idle: diagonal, higher-right, calm/curious. */
export const IDLE_EYE: EyePose = {
  tilt: (-28 * Math.PI) / 180,
  cx: 0.22,
  cy: -0.3,
};

/** Article Working pump — more upright. TV uses this for the kick only. */
export const WORKING_EYE: EyePose = {
  tilt: (-6 * Math.PI) / 180,
  cx: 0.05,
  cy: 0.14,
};

function planted(pose: EyePose): EyeWhip {
  return {
    ...pose,
    z: Math.sqrt(Math.max(0.08, 1 - pose.cx * pose.cx - pose.cy * pose.cy)),
    visible: true,
    squashX: 1,
  };
}

const IDLE_PLANTED = planted(IDLE_EYE);
const WORKING_PLANTED = planted(WORKING_EYE);

/**
 * Idle at rest, settle, reduced motion, and linear-spin compare.
 * Working pump for the whole whip beat (including after bands leave).
 * Never yaws or occludes the pair.
 */
export function eyeWhipAt(
  time: number,
  loopSeconds: number,
  whipSeconds: number,
  linearSpin: boolean,
  reducedMotion: boolean,
): EyeWhip {
  if (reducedMotion || linearSpin) return IDLE_PLANTED;
  if (loopBeat(time, loopSeconds, whipSeconds, reducedMotion) === "whip") {
    return WORKING_PLANTED;
  }
  return IDLE_PLANTED;
}

export function eyePoseAt(
  time: number,
  loopSeconds: number,
  whipSeconds: number,
  linearSpin: boolean,
  reducedMotion: boolean,
): EyePose {
  const whip = eyeWhipAt(time, loopSeconds, whipSeconds, linearSpin, reducedMotion);
  return { tilt: whip.tilt, cx: whip.cx, cy: whip.cy };
}
