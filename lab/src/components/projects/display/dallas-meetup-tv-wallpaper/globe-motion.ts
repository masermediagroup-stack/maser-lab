/**
 * Grok look-lock motion (article Idle / Working lifecycle).
 *
 * The body itself does not yaw. Rest is Idle (still, no ribbons). The whip is
 * one Working stream: 2–4 thick bands wrap once and leave. Eyes pump on the
 * kick. Settle returns Idle eyes; color SNAP + shape BLEND. TV does not hold
 * Working. Linear spin is compare-only. Reduced motion freezes Idle.
 */

export const DEFAULT_LOOP_SECONDS = 8;
export const DEFAULT_WHIP_SECONDS = 0.6;
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
 * Hard ease-in-out. 7th power so the traveling revolution spends almost
 * no time at mid-yaw — a whip, not a planet spin.
 */
export function whipEase(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t < 0.5 ? 64 * t ** 7 : 1 - (-2 * t + 2) ** 7 / 2;
}

export function restSeconds(loopSeconds: number, whipSeconds: number): number {
  const whip = clampWhipSeconds(whipSeconds);
  return Math.max(0, loopSeconds - whip - SETTLE_SECONDS);
}

/**
 * Sweep phase for the Idle→Working flourish only. Body does not use this as yaw.
 * Linear spin is compare-only (constant ω). Reduced motion freezes.
 */
export function globeYaw(
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
  return whipEase((t - rest) / whip) * Math.PI * 2;
}

/**
 * Flourish energy. Idle rest: 0. Whip: kick in, hold, leave.
 * Settle is Idle again — no held nest. Linear spin compare: on.
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
