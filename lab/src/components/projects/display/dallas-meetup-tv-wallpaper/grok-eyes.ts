/**
 * Official product-face stadiums. Black. Planted. No morph.
 * Fallback if the PNG has not loaded. Matches grok-bot-face-tight.png.
 */

export type EyePose = {
  tilt: number;
  cx: number;
  cy: number;
};

/** Left / right black stadiums on the light organic head. Face-radii. */
export const GROK_LEFT_EYE: EyePose = {
  tilt: (18 * Math.PI) / 180,
  cx: -0.16,
  cy: 0.031,
};

export const GROK_RIGHT_EYE: EyePose = {
  tilt: (-15 * Math.PI) / 180,
  cx: 0.176,
  cy: 0.055,
};

/** Pair seat used by kick ribbons so bands cross the eyes. */
export const IDLE_EYE: EyePose = {
  tilt: GROK_LEFT_EYE.tilt,
  cx: (GROK_LEFT_EYE.cx + GROK_RIGHT_EYE.cx) * 0.5,
  cy: (GROK_LEFT_EYE.cy + GROK_RIGHT_EYE.cy) * 0.5,
};

export const WORKING_EYE = IDLE_EYE;

export function eyePoseAt(
  time: number,
  loopSeconds: number,
  whipSeconds: number,
  reducedMotion: boolean,
): EyePose {
  void time;
  void loopSeconds;
  void whipSeconds;
  void reducedMotion;
  return IDLE_EYE;
}
