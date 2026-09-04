/**
 * White stadiums in face-space on the morphing body. Parallel pair, slight left lean.
 * They translate together as a gaze (center, up, side), then return. They still wink.
 * They do not spin independently. They do not orbit. They are not stuck BL or TR.
 *
 * They SURVIVE the morph: planted in face-space on every body, never sheared or
 * smashed by the silhouette. Clip to the inscribed face disc — not the polar
 * outline — so stadium geometry stays readable through the SDF blend.
 */

/** Inscribed face disc (face-radii). Every official SDF and every blend contains it. */
export const FACE_DISC_R = 0.86;

/** Stadium size as a fraction of face diameter — article Idle/Working. */
export const EYE_W_FACE = 0.12;
export const EYE_H_FACE = 0.3;

export type EyePose = {
  /** Radians. Negative = slight left lean on canvas. */
  tilt: number;
  /** Face-radii, +right of body center. */
  cx: number;
  /** Face-radii, +down of body center. */
  cy: number;
  /** 1 = open. Near 0 = wink shut along the stadium's long axis. */
  scaleY: number;
};

type PairLocal = {
  lx: number;
  ly: number;
};

type Gaze = {
  cx: number;
  cy: number;
};

/** User lock: vertical long axis, slight left. Not −28°. Not 45° stuck. */
export const STADIUM_TILT_DEG = -12;
const STADIUM_TILT = (STADIUM_TILT_DEG * Math.PI) / 180;

/** Local pair geometry. Distinct gap. Parallel — same tilt on both. */
const LEFT_LOCAL: PairLocal = {
  lx: -0.16,
  ly: 0.02,
};

const RIGHT_LOCAL: PairLocal = {
  lx: 0.16,
  ly: -0.02,
};

/** Camera rest — center of the disc. Not stuck TR. Not stuck BL. */
const GAZE_CENTER: Gaze = { cx: 0, cy: -0.02 };
const GAZE_UP: Gaze = { cx: 0.08, cy: -0.32 };
const GAZE_RIGHT: Gaze = { cx: 0.34, cy: -0.02 };
const GAZE_LEFT: Gaze = { cx: -0.3, cy: 0.04 };

/**
 * Idle rest: look around during the 6.4s hold, return to camera before the kick.
 * Keys are loop-local seconds. Travel is translation only.
 */
const GAZE_KEYS: ReadonlyArray<{ t: number; pose: Gaze }> = [
  { t: 0, pose: GAZE_CENTER },
  { t: 0.85, pose: GAZE_CENTER },
  { t: 1.65, pose: GAZE_UP },
  { t: 2.45, pose: GAZE_UP },
  { t: 3.25, pose: GAZE_RIGHT },
  { t: 4.05, pose: GAZE_RIGHT },
  { t: 4.85, pose: GAZE_LEFT },
  { t: 5.55, pose: GAZE_LEFT },
  { t: 6.35, pose: GAZE_CENTER },
  { t: 8, pose: GAZE_CENTER },
];

function plant(local: PairLocal, gaze: Gaze): EyePose {
  return {
    tilt: STADIUM_TILT,
    cx: gaze.cx + local.lx,
    cy: gaze.cy + local.ly,
    scaleY: 1,
  };
}

/** Rest left stadium — upright slight-left pair, not stuck BL/TR. */
export const GROK_LEFT_EYE: EyePose = plant(LEFT_LOCAL, GAZE_CENTER);

/** Rest right stadium — parallel to left, distinct gap. */
export const GROK_RIGHT_EYE: EyePose = plant(RIGHT_LOCAL, GAZE_CENTER);

/** Pair seat (orbit y-bias leftover). Gaze + wink live on `eyesAt`. */
export const IDLE_EYE: EyePose = {
  tilt: STADIUM_TILT,
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

function easeInOutCubic(u: number): number {
  const t = Math.min(1, Math.max(0, u));
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function lerp(a: number, b: number, u: number): number {
  return a + (b - a) * u;
}

function lerpGaze(a: Gaze, b: Gaze, u: number): Gaze {
  const e = easeInOutCubic(u);
  return {
    cx: lerp(a.cx, b.cx, e),
    cy: lerp(a.cy, b.cy, e),
  };
}

/** Directed gaze of the planted pair at loop-local time. Translate only. */
export function gazeAt(t: number): Gaze {
  const keys = GAZE_KEYS;
  const first = keys[0]!;
  const last = keys[keys.length - 1]!;
  if (t <= first.t) return first.pose;
  if (t >= last.t) return last.pose;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const a = keys[i]!;
    const b = keys[i + 1]!;
    if (t >= a.t && t <= b.t) {
      const span = b.t - a.t;
      const u = span <= 0 ? 1 : (t - a.t) / span;
      return lerpGaze(a.pose, b.pose, u);
    }
  }
  return last.pose;
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

export function eyesAt(
  time: number,
  loopSeconds: number,
  whipSeconds: number,
  reducedMotion: boolean,
): { left: EyePose; right: EyePose } {
  void whipSeconds;
  if (reducedMotion) {
    return { left: GROK_LEFT_EYE, right: GROK_RIGHT_EYE };
  }
  const t = loopTime(time, loopSeconds);
  const gaze = gazeAt(t);
  const left = plant(LEFT_LOCAL, gaze);
  const right = plant(RIGHT_LOCAL, gaze);
  left.scaleY = winkScaleForEye(t, "left", reducedMotion);
  right.scaleY = winkScaleForEye(t, "right", reducedMotion);
  return { left, right };
}

/**
 * Pair seat (line y-bias). Gaze + wink live on `eyesAt`.
 * Reduced motion freezes the Idle camera rest.
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
    tilt: STADIUM_TILT,
    cx: (pair.left.cx + pair.right.cx) * 0.5,
    cy: (pair.left.cy + pair.right.cy) * 0.5,
    scaleY: 1,
  };
}

/**
 * Half-diagonal of one stadium in face-radii after tilt (and wink scale).
 * Stadiums are never warped by the SDF — this reach is constant geometry.
 */
export function stadiumReach(scaleY = 1, sizeScale = 1): number {
  const hw = EYE_W_FACE * sizeScale;
  const hh = EYE_H_FACE * scaleY * sizeScale;
  const c = Math.cos(STADIUM_TILT);
  const s = Math.sin(STADIUM_TILT);
  let max = 0;
  for (const sx of [-hw, hw] as const) {
    for (const sy of [-hh, hh] as const) {
      max = Math.max(max, Math.hypot(sx * c - sy * s, sx * s + sy * c));
    }
  }
  return max;
}

/** True when the stadium's AABB corners sit inside the face disc. */
export function eyeFitsFaceDisc(
  pose: EyePose,
  discR = FACE_DISC_R,
  sizeScale = 1,
): boolean {
  return Math.hypot(pose.cx, pose.cy) + stadiumReach(pose.scaleY, sizeScale) <= discR;
}

/**
 * Seat a gaze pair in face-space: scale travel from camera rest, then lift.
 * Kept bodies use camera rest (lift 0, travel 1). Helper stays for tests.
 */
export function seatPair(
  pair: { left: EyePose; right: EyePose },
  faceLift: number,
  gazeTravel = 1,
): { left: EyePose; right: EyePose } {
  const travel = gazeTravel;
  const seat = (pose: EyePose, rest: EyePose): EyePose => ({
    tilt: pose.tilt,
    cx: rest.cx + (pose.cx - rest.cx) * travel,
    cy: rest.cy + (pose.cy - rest.cy) * travel + faceLift,
    scaleY: pose.scaleY,
  });
  return {
    left: seat(pair.left, GROK_LEFT_EYE),
    right: seat(pair.right, GROK_RIGHT_EYE),
  };
}
