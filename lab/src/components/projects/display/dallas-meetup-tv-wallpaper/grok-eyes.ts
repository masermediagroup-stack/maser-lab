/**
 * Article Idle stadiums, planted in face-space.
 *
 * EPG check: eyes stay planted through whip and morph. Orbiting the pair
 * mid-yaw smears the stadiums — that is a miss. No back-occlusion hide.
 * Reduced motion freezes the same rest pose.
 */

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

/** Article Working pump — not applied on the TV loop (planted only). */
export const WORKING_EYE: EyePose = {
  tilt: (-6 * Math.PI) / 180,
  cx: 0.05,
  cy: 0.14,
};

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
 * Always the Idle seat. Whip and morph do not move the pair.
 * Linear-spin compare also keeps stadiums planted (smear miss).
 */
export function eyeWhipAt(
  time: number,
  loopSeconds: number,
  whipSeconds: number,
  linearSpin: boolean,
  reducedMotion: boolean,
): EyeWhip {
  void time;
  void loopSeconds;
  void whipSeconds;
  void linearSpin;
  void reducedMotion;
  return PLANTED;
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
