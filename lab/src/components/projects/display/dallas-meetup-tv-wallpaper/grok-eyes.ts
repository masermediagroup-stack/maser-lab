/**
 * Article stadiums. Idle is planted. Kick whips the pair around the form.
 *
 * Illusion of spin (disc stays): planted SDF morph + ribbon wrap + this orbit.
 * Rotate the Idle seat around Y with the kick ease. Hide when z ≤ 0 (behind).
 * Land Idle on the new face. Reduced motion and linear-spin compare freeze Idle.
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

export type EyeWhip = EyePose & {
  /** Camera-facing depth. >0 is the front of the form. */
  z: number;
  /** False when the pair is behind the planted fill. */
  visible: boolean;
  squashX: number;
};

/** Article Idle: diagonal, higher-right, calm/curious. */
export const IDLE_EYE: EyePose = {
  tilt: (-28 * Math.PI) / 180,
  cx: 0.22,
  cy: -0.3,
};

/** Article Working pump — geometry lock only. TV kick orbits Idle, then lands Idle. */
export const WORKING_EYE: EyePose = {
  tilt: (-6 * Math.PI) / 180,
  cx: 0.05,
  cy: 0.14,
};

const IDLE_Z = Math.sqrt(
  Math.max(0.08, 1 - IDLE_EYE.cx * IDLE_EYE.cx - IDLE_EYE.cy * IDLE_EYE.cy),
);

function planted(pose: EyePose, z: number): EyeWhip {
  return {
    ...pose,
    z,
    visible: true,
    squashX: 1,
  };
}

const IDLE_PLANTED = planted(IDLE_EYE, IDLE_Z);

/**
 * Idle at rest, settle, reduced motion, and linear-spin compare.
 * Kick: one Y-orbit of the Idle seat with the ribbon wrap. Hide behind the fill.
 */
export function eyeWhipAt(
  time: number,
  loopSeconds: number,
  whipSeconds: number,
  linearSpin: boolean,
  reducedMotion: boolean,
): EyeWhip {
  if (reducedMotion || linearSpin) return IDLE_PLANTED;
  if (loopBeat(time, loopSeconds, whipSeconds, reducedMotion) !== "whip") {
    return IDLE_PLANTED;
  }

  const progress = kickProgress(time, loopSeconds, whipSeconds, linearSpin, reducedMotion);
  // Eye orbit around the planted form — not a globe yaw of the disc.
  const orbit = kickEase(progress) * Math.PI * 2;
  const c = Math.cos(orbit);
  const s = Math.sin(orbit);
  const x = IDLE_EYE.cx * c + IDLE_Z * s;
  const z = -IDLE_EYE.cx * s + IDLE_Z * c;

  if (z <= 0) {
    return {
      tilt: IDLE_EYE.tilt,
      cx: x,
      cy: IDLE_EYE.cy,
      z,
      visible: false,
      squashX: 0.2,
    };
  }

  return {
    tilt: IDLE_EYE.tilt,
    cx: x,
    cy: IDLE_EYE.cy,
    z,
    visible: true,
    squashX: Math.max(0.28, Math.min(1, z / IDLE_Z)),
  };
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
