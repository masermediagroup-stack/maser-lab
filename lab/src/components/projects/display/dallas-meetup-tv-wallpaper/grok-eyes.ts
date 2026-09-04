/**
 * White stadiums on the black disc. Planted as a gaze pair.
 * They look together (up, side, center), then return. They still wink.
 * They do not orbit. They do not leave. They are not stuck bottom-left.
 */

export type EyePose = {
  /** Radians. Negative = clockwise on canvas. */
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
  tilt: number;
};

type Gaze = {
  cx: number;
  cy: number;
  tilt: number;
};

/** Local pair geometry. Distinct gap. Slight article-ish asymmetry. */
const LEFT_LOCAL: PairLocal = {
  lx: -0.17,
  ly: 0.03,
  tilt: (-28 * Math.PI) / 180,
};

const RIGHT_LOCAL: PairLocal = {
  lx: 0.17,
  ly: -0.05,
  tilt: (-22 * Math.PI) / 180,
};

/** Camera rest — center of the disc, not bottom-left. */
const GAZE_CENTER: Gaze = { cx: 0, cy: 0, tilt: (-6 * Math.PI) / 180 };
const GAZE_UP: Gaze = { cx: 0.04, cy: -0.3, tilt: (-10 * Math.PI) / 180 };
const GAZE_RIGHT: Gaze = { cx: 0.34, cy: 0.02, tilt: (12 * Math.PI) / 180 };
const GAZE_LEFT: Gaze = { cx: -0.34, cy: 0.05, tilt: (-16 * Math.PI) / 180 };

/**
 * Idle rest: look around during the 6.4s hold, return to camera before the kick.
 * Keys are loop-local seconds.
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
  const c = Math.cos(gaze.tilt);
  const s = Math.sin(gaze.tilt);
  return {
    tilt: local.tilt + gaze.tilt,
    cx: gaze.cx + local.lx * c - local.ly * s,
    cy: gaze.cy + local.lx * s + local.ly * c,
    scaleY: 1,
  };
}

/** Rest left stadium — camera pair, not stuck BL. */
export const GROK_LEFT_EYE: EyePose = plant(LEFT_LOCAL, GAZE_CENTER);

/** Rest right stadium — camera pair, distinct gap. */
export const GROK_RIGHT_EYE: EyePose = plant(RIGHT_LOCAL, GAZE_CENTER);

/** Pair seat used by kick lines so bands cross the stadiums. */
export const IDLE_EYE: EyePose = {
  tilt: GAZE_CENTER.tilt,
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
    tilt: lerp(a.tilt, b.tilt, e),
  };
}

/** Directed gaze of the planted pair at loop-local time. */
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
  const t = loopTime(time, loopSeconds);
  const gaze = gazeAt(t);
  return {
    tilt: gaze.tilt,
    cx: (pair.left.cx + pair.right.cx) * 0.5,
    cy: (pair.left.cy + pair.right.cy) * 0.5,
    scaleY: 1,
  };
}
