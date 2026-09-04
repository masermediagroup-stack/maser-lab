/**
 * EPG timing lock. Loop is 8s. Do not shorten it to make the whip feel fast.
 * Super-fast means the 0.6s traveling bit is short.
 *
 * USER OVERRIDE: Idle → one kick → Idle. Black disc forever. No Grok body turn.
 * Kick = thin even Ver 02 lines on Grok + Cursor 360 whip. Gaze pair winks.
 * Reduced motion freezes Idle.
 */

export const DEFAULT_LOOP_SECONDS = 8;
export const DEFAULT_WHIP_SECONDS = 0.6;
/** Settle window after the whip. Idle hold. Same product face. */
export const SETTLE_SECONDS = 1;

export type LoopBeat = "rest" | "whip" | "settle";
export const WHIP_MIN_SECONDS = 0.5;
export const WHIP_MAX_SECONDS = 0.7;

/** Product Idle face tilt is −28° (clockwise on canvas = +28). */
export const EYE_TILT_DEG = -28;

/** First 12% of the kick: bands fade in. */
export const WHIP_BAND_IN = 0.12;
/** Last 28% of the kick: bands leave. Do not park into settle/rest. */
export const WHIP_BAND_LEAVE = 0.72;

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

/** Ease-out kept for tests. */
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
 * Ribbon head travel **and** Cursor 360 whip. Never rotate the Grok disc with this.
 * One wrap / one cube revolution during the 0.6s kick. 0 at rest and settle.
 */
export function streamPhase(
  time: number,
  loopSeconds: number,
  whipSeconds: number,
  reducedMotion: boolean,
): number {
  if (reducedMotion) return 0;
  const loop = loopSeconds > 0 ? loopSeconds : DEFAULT_LOOP_SECONDS;
  const t = ((time % loop) + loop) % loop;
  const whip = clampWhipSeconds(whipSeconds);
  const rest = restSeconds(loop, whip);
  if (t < rest) return 0;
  if (t >= rest + whip) return 0;
  return kickEase((t - rest) / whip) * Math.PI * 2;
}

/** Cursor cube 360° during the kick. Same window as Grok bands. Lands upright. */
export function cursorWhipRad(
  time: number,
  loopSeconds: number,
  whipSeconds: number,
  reducedMotion: boolean,
): number {
  return streamPhase(time, loopSeconds, whipSeconds, reducedMotion);
}

/**
 * Kick-band envelope. 0 at rest, settle, and reduced motion.
 * During the whip: fade in, wrap, then leave before the beat ends.
 */
export function kickBandEnergy(progress: number): number {
  if (progress <= 0 || progress >= 1) return 0;
  if (progress < WHIP_BAND_IN) return progress / WHIP_BAND_IN;
  if (progress >= WHIP_BAND_LEAVE) {
    return 1 - (progress - WHIP_BAND_LEAVE) / (1 - WHIP_BAND_LEAVE);
  }
  return 1;
}

export function whipEnergy(
  time: number,
  loopSeconds: number,
  whipSeconds: number,
  reducedMotion: boolean,
): number {
  if (reducedMotion) return 0;
  const beat = loopBeat(time, loopSeconds, whipSeconds, reducedMotion);
  if (beat !== "whip") return 0;
  return kickBandEnergy(kickProgress(time, loopSeconds, whipSeconds, reducedMotion));
}

/** 0–1 during the kick, else 0. */
export function kickProgress(
  time: number,
  loopSeconds: number,
  whipSeconds: number,
  reducedMotion: boolean,
): number {
  if (reducedMotion) return 0;
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
