/**
 * Article Idle / Working eyes.
 *
 * Idle: planted stadiums, diagonal, higher-right.
 * Kick: the pair WHIPS around the morphing form — projected on the surface,
 * occluded on the back, reappearing on the front. That sells the turn.
 * The disc itself does not spin. Land Idle on the new body.
 */

import {
  DEFAULT_LOOP_SECONDS,
  clampWhipSeconds,
  kickProgress,
  restSeconds,
  streamPhase,
} from "./globe-motion";

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
  /** False when the pair is on the back — occluded. */
  visible: boolean;
  /** Foreshorten as the pair nears the limb. */
  squashX: number;
};

/** Article Idle: diagonal, higher-right, calm/curious. */
export const IDLE_EYE: EyePose = {
  tilt: (-28 * Math.PI) / 180,
  cx: 0.22,
  cy: -0.3,
};

/** Mid-kick pump: more upright. */
export const WORKING_EYE: EyePose = {
  tilt: (-6 * Math.PI) / 180,
  cx: 0.05,
  cy: 0.14,
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

const IDLE_Z = Math.sqrt(
  Math.max(0.08, 1 - IDLE_EYE.cx * IDLE_EYE.cx - IDLE_EYE.cy * IDLE_EYE.cy),
);

const PLANTED: EyeWhip = {
  ...IDLE_EYE,
  z: IDLE_Z,
  visible: true,
  squashX: 1,
};

/**
 * Idle: planted. Kick: one orbit of the pair around the form.
 * Reduced motion freezes Idle. Linear spin is compare (continuous whip).
 */
export function eyeWhipAt(
  time: number,
  loopSeconds: number,
  whipSeconds: number,
  linearSpin: boolean,
  reducedMotion: boolean,
): EyeWhip {
  if (reducedMotion) return PLANTED;

  const loop = loopSeconds > 0 ? loopSeconds : DEFAULT_LOOP_SECONDS;
  const t = ((time % loop) + loop) % loop;
  const whip = clampWhipSeconds(whipSeconds);
  const rest = restSeconds(loop, whip);
  const onKick =
    linearSpin || (t >= rest && t < rest + whip);

  if (!onKick) return PLANTED;

  const theta = streamPhase(time, loop, whip, linearSpin, reducedMotion);
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  const x = IDLE_EYE.cx * ct + IDLE_Z * st;
  const z = -IDLE_EYE.cx * st + IDLE_Z * ct;
  const y = IDLE_EYE.cy;
  const u = kickProgress(time, loop, whip, linearSpin, reducedMotion);
  const upright = Math.sin(Math.min(1, Math.max(0, u)) * Math.PI);
  const visible = z > 0.05;

  return {
    tilt: lerp(IDLE_EYE.tilt, WORKING_EYE.tilt, upright),
    cx: x,
    cy: y,
    z,
    visible,
    squashX: visible ? Math.max(0.28, z) : 1,
  };
}

/** 2D pose for callers that only need cx/cy/tilt. Hidden kick frames still report the projected pair. */
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
