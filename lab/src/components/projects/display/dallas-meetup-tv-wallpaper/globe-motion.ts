/**
 * EPG timing lock. Loop is 8s. Do not shorten it to make the whip feel fast.
 * Super-fast means the 0.6s traveling bit is short.
 *
 * 6.4s rest = Idle: face-forward hold. No idle bob. Quiet parked orbits OK.
 * 0.6s whip = Working: chat-line filaments orbit the mark, one revolution.
 * ~1.0s settle back to Idle. Color SNAP + SDF blend land here.
 *
 * Silhouette stays planted. Eyes stay planted in face-space. No meridians.
 * Linear spin is compare-only (ribbons). Reduced motion freezes the rest pose.
 */

export const DEFAULT_LOOP_SECONDS = 8;
export const DEFAULT_WHIP_SECONDS = 0.6;
/** Settle window after the whip. Color + shape land here. */
export const SETTLE_SECONDS = 1;
/** Quiet Idle orbits on the mark — not a wallpaper field, not a second motion. */
export const IDLE_ORBIT_ENERGY = 0.26;

export type LoopBeat = "rest" | "whip" | "settle";
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
 * Hard cubic ease-in-out for the 0.6s traveling revolution.
 * Steep in and out so the wrap reads, then lands face-forward.
 */
export function kickEase(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

export const whipEase = kickEase;

/** Ease-out for the settle morph — comes to rest in the ~1s window. */
export function settleEaseOut(t: number): number {
  const u = Math.min(1, Math.max(0, t));
  return 1 - (1 - u) ** 3;
}

export function restSeconds(loopSeconds: number, whipSeconds: number): number {
  const whip = clampWhipSeconds(whipSeconds);
  return Math.max(0, loopSeconds - whip - SETTLE_SECONDS);
}

export function settleSeconds(loopSeconds: number, whipSeconds: number): number {
  const loop = loopSeconds > 0 ? loopSeconds : DEFAULT_LOOP_SECONDS;
  return Math.max(0, loop - restSeconds(loop, whipSeconds) - clampWhipSeconds(whipSeconds));
}

export function loopBeat(
  time: number,
  loopSeconds: number,
  whipSeconds: number,
  reducedMotion: boolean,
): LoopBeat {
  if (reducedMotion) return "rest";
  const loop = loopSeconds > 0 ? loopSeconds : DEFAULT_LOOP_SECONDS;
  const t = ((time % loop) + loop) % loop;
  const whip = clampWhipSeconds(whipSeconds);
  const rest = restSeconds(loop, whip);
  if (t < rest) return "rest";
  if (t < rest + whip) return "whip";
  return "settle";
}

/**
 * Ribbon travel only. Never yaw the silhouette or the eyes with this.
 * One turn during the 0.6s whip, 0 at rest and settle (landed face-forward).
 * Linear spin is compare-only.
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
 * Orbit energy on the mark.
 * Idle rest: quiet. Working whip: full. Settle: ease back to Idle.
 * Reduced motion freezes the Idle rest pose (quiet orbits, no travel).
 */
export function whipEnergy(
  time: number,
  loopSeconds: number,
  whipSeconds: number,
  linearSpin: boolean,
  reducedMotion: boolean,
): number {
  if (reducedMotion) return IDLE_ORBIT_ENERGY;
  if (linearSpin) return 1;
  const beat = loopBeat(time, loopSeconds, whipSeconds, reducedMotion);
  if (beat === "rest") return IDLE_ORBIT_ENERGY;
  if (beat === "whip") return 1;
  const loop = loopSeconds > 0 ? loopSeconds : DEFAULT_LOOP_SECONDS;
  const t = ((time % loop) + loop) % loop;
  const whip = clampWhipSeconds(whipSeconds);
  const rest = restSeconds(loop, whip);
  const settle = settleSeconds(loop, whip);
  const u = settle > 0 ? (t - rest - whip) / settle : 1;
  return 1 + (IDLE_ORBIT_ENERGY - 1) * settleEaseOut(u);
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

/** Rest has no second motion. Whip does not bob the ball. Always 0. */
export function kickWobbleRad(energy = 0, progress = 0): number {
  void energy;
  void progress;
  return 0;
}
