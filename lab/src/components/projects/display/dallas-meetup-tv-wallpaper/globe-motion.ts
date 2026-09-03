/**
 * Grok look-lock motion (article Idle / Working lifecycle).
 *
 * The silhouette stays planted. The kick is an illusion: SDF morph + two-stop
 * color + wrapping ribbons + eyes that whip around the form (occlude on the
 * back, reappear on the front). Tiny wobble is fine. A 360° disc spin is not.
 * Linear spin is compare-only (ribbons + eye-whip). Reduced motion freezes Idle.
 */

export const DEFAULT_LOOP_SECONDS = 8;
export const DEFAULT_WHIP_SECONDS = 0.6;
/** Post-kick Idle dwell on the new body. Not a morph window. */
export const SETTLE_SECONDS = 1;
export const WHIP_MIN_SECONDS = 0.5;
export const WHIP_MAX_SECONDS = 0.7;
export const AXIS_TILT_DEG = 16;

/** Product face tilt is −28° (clockwise on canvas = +28). */
export const EYE_TILT_DEG = -28;

export function clampWhipSeconds(seconds: number): number {
  if (!Number.isFinite(seconds)) return DEFAULT_WHIP_SECONDS;
  return Math.min(WHIP_MAX_SECONDS, Math.max(WHIP_MIN_SECONDS, seconds));
}

/**
 * Cubic ease-in-out for the stream / eye-whip phase so the wrap reads,
 * without rotating the disc.
 */
export function kickEase(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

export const whipEase = kickEase;

export function restSeconds(loopSeconds: number, whipSeconds: number): number {
  const whip = clampWhipSeconds(whipSeconds);
  return Math.max(0, loopSeconds - whip - SETTLE_SECONDS);
}

/**
 * Stream / eye-whip phase only. Never scale the silhouette with this.
 * One turn during the kick, 0 at Idle. Linear spin is compare-only.
 */
export function streamPhase(
  time: number,
  loopSeconds: number,
  whipSeconds: number,
  linearSpin: boolean,
  reducedMotion: boolean,
): number {
  if (reducedMotion) return 0;
  if (linearSpin) {
    const loop = loopSeconds > 0 ? loopSeconds : DEFAULT_LOOP_SECONDS;
    return ((time % loop) / loop) * Math.PI * 2;
  }
  const loop = loopSeconds > 0 ? loopSeconds : DEFAULT_LOOP_SECONDS;
  const t = ((time % loop) + loop) % loop;
  const whip = clampWhipSeconds(whipSeconds);
  const rest = restSeconds(loop, whip);
  if (t < rest) return 0;
  if (t >= rest + whip) return 0;
  return kickEase((t - rest) / whip) * Math.PI * 2;
}

/** @deprecated use streamPhase — not a globe yaw of the body. */
export const globeYaw = streamPhase;

/**
 * Stream energy. Idle rest and post-kick Idle: 0. Kick: in, wrap, leave.
 */
export function whipEnergy(
  time: number,
  loopSeconds: number,
  whipSeconds: number,
  linearSpin: boolean,
  reducedMotion: boolean,
): number {
  if (reducedMotion) return 0;
  if (linearSpin) return 1;
  const loop = loopSeconds > 0 ? loopSeconds : DEFAULT_LOOP_SECONDS;
  const t = ((time % loop) + loop) % loop;
  const whip = clampWhipSeconds(whipSeconds);
  const rest = restSeconds(loop, whip);
  if (t < rest || t >= rest + whip) return 0;
  const u = (t - rest) / whip;
  if (u < 0.12) return u / 0.12;
  if (u > 0.82) return Math.max(0, (1 - u) / 0.18);
  return 1;
}

/** 0–1 during the kick, else 0. */
export function kickProgress(
  time: number,
  loopSeconds: number,
  whipSeconds: number,
  linearSpin: boolean,
  reducedMotion: boolean,
): number {
  if (reducedMotion) return 0;
  if (linearSpin) {
    const loop = loopSeconds > 0 ? loopSeconds : DEFAULT_LOOP_SECONDS;
    const t = ((time % loop) + loop) % loop;
    return t / loop;
  }
  const loop = loopSeconds > 0 ? loopSeconds : DEFAULT_LOOP_SECONDS;
  const t = ((time % loop) + loop) % loop;
  const whip = clampWhipSeconds(whipSeconds);
  const rest = restSeconds(loop, whip);
  if (t < rest || t >= rest + whip) return 0;
  return (t - rest) / whip;
}

/** Tiny article wobble. A few degrees, not a planet revolution. */
export function kickWobbleRad(energy: number, progress: number): number {
  if (energy < 0.02) return 0;
  const deg = -2 + 6.5 * progress;
  return ((deg * Math.PI) / 180) * energy;
}
