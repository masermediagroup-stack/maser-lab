/**
 * Article stadiums. Idle planted. Kick may pump more upright.
 * Eyes stay on the face. They do not orbit the disc. They do not leave.
 */

import { kickEase, kickProgress, loopBeat } from "./globe-motion";

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

/** Article Working pump — more upright. Position stays planted Idle. */
export const WORKING_EYE: EyePose = {
  tilt: (-6 * Math.PI) / 180,
  cx: 0.05,
  cy: 0.14,
};

/**
 * Idle at rest, settle, and reduced motion.
 * Kick: same seat, tilt pumps toward Working then back. Always visible.
 */
export function eyePoseAt(
  time: number,
  loopSeconds: number,
  whipSeconds: number,
  reducedMotion: boolean,
): EyePose {
  if (reducedMotion) return IDLE_EYE;
  if (loopBeat(time, loopSeconds, whipSeconds, reducedMotion) !== "whip") {
    return IDLE_EYE;
  }

  const progress = kickProgress(time, loopSeconds, whipSeconds, reducedMotion);
  const pump = Math.sin(kickEase(progress) * Math.PI);
  return {
    cx: IDLE_EYE.cx,
    cy: IDLE_EYE.cy,
    tilt: IDLE_EYE.tilt + (WORKING_EYE.tilt - IDLE_EYE.tilt) * pump,
  };
}
