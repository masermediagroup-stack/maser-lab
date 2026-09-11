/**
 * Idle wallpaper loop timing. Default loop is 120s (2 min).
 * Whip/rest/settle helpers retained for legacy tests only — idle wallpaper
 * does not use kick beats.
 */

export const DEFAULT_LOOP_SECONDS = 120;
export const LOOP_MIN_SECONDS = 30;
export const LOOP_MAX_SECONDS = 120;
export const DEFAULT_WHIP_SECONDS = 0.5;
/** Live preview, scrub step, and MP4/WebM export frame rate. */
export const DALLAS_WALLPAPER_FPS = 60;
/** Legacy settle window — unused by idle wallpaper render. */
export const SETTLE_SECONDS = 1;

export type LoopBeat = "rest" | "whip" | "settle";
export const WHIP_MIN_SECONDS = 0.5;
export const WHIP_MAX_SECONDS = 1.2;

export const LOOP_DURATION_OPTIONS = [
  { value: "120", label: "2 min (default)" },
  { value: "90", label: "90s" },
  { value: "60", label: "60s" },
  { value: "45", label: "45s" },
  { value: "30", label: "30s" },
] as const;

export const EYE_TILT_DEG = -12;
export const WHIP_BAND_IN = 0.12;
export const WHIP_BAND_LEAVE = 0.72;
export const CURSOR_IDLE_FLOAT_X_PX = 6;
export const CURSOR_IDLE_FLOAT_Y_PX = 5;
export const CURSOR_IDLE_FLOAT_PERIOD_X = 7.2;
export const CURSOR_IDLE_FLOAT_PERIOD_Y = 9.4;
export const CURSOR_IDLE_FLOAT_FADE_SECONDS = 0.35;

export type CursorIdleFloatOffset = { x: number; y: number };
export const CURSOR_IDLE_FLOAT_AT_REST: CursorIdleFloatOffset = { x: 0, y: 0 };

export function clampWhipSeconds(seconds: number): number {
  if (!Number.isFinite(seconds)) return DEFAULT_WHIP_SECONDS;
  return Math.min(WHIP_MAX_SECONDS, Math.max(WHIP_MIN_SECONDS, seconds));
}

export function clampLoopSeconds(seconds: number): number {
  if (!Number.isFinite(seconds)) return DEFAULT_LOOP_SECONDS;
  return Math.min(
    LOOP_MAX_SECONDS,
    Math.max(LOOP_MIN_SECONDS, seconds),
  );
}

export function kickEase(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

export const whipEase = kickEase;

export function settleEaseOut(t: number): number {
  const u = Math.min(1, Math.max(0, t));
  return 1 - (1 - u) ** 3;
}

export function restSeconds(loopSeconds: number, whipSeconds: number): number {
  const whip = clampWhipSeconds(whipSeconds);
  const loop = clampLoopSeconds(loopSeconds);
  return Math.max(0, loop - whip - SETTLE_SECONDS);
}

export function loopBeatAt(
  elapsed: number,
  loopSeconds: number,
  whipSeconds: number,
): LoopBeat {
  const loop = clampLoopSeconds(loopSeconds);
  const whip = clampWhipSeconds(whipSeconds);
  const t = ((elapsed % loop) + loop) % loop;
  const rest = restSeconds(loop, whip);
  if (t < rest) return "rest";
  if (t < rest + whip) return "whip";
  return "settle";
}

export function kickProgress(
  elapsed: number,
  loopSeconds: number,
  whipSeconds: number,
): number {
  const loop = clampLoopSeconds(loopSeconds);
  const whip = clampWhipSeconds(whipSeconds);
  const t = ((elapsed % loop) + loop) % loop;
  const rest = restSeconds(loop, whip);
  if (t < rest || t >= rest + whip) return 0;
  return (t - rest) / Math.max(whip, 0.001);
}

export function whipEnergy(
  elapsed: number,
  loopSeconds: number,
  whipSeconds: number,
): number {
  const p = kickProgress(elapsed, loopSeconds, whipSeconds);
  return p <= 0 ? 0 : kickEase(p);
}

export function cursorWhipRad(
  elapsed: number,
  loopSeconds: number,
  whipSeconds: number,
): number {
  const p = kickProgress(elapsed, loopSeconds, whipSeconds);
  if (p <= 0) return 0;
  return kickEase(p) * Math.PI * 2;
}

export function cursorIdleFloatOffset(
  elapsed: number,
  loopSeconds: number,
  whipSeconds: number,
): CursorIdleFloatOffset {
  const beat = loopBeatAt(elapsed, loopSeconds, whipSeconds);
  if (beat === "whip") return CURSOR_IDLE_FLOAT_AT_REST;

  const loop = clampLoopSeconds(loopSeconds);
  const t = ((elapsed % loop) + loop) % loop;
  const x =
    Math.sin((t / CURSOR_IDLE_FLOAT_PERIOD_X) * Math.PI * 2) *
    CURSOR_IDLE_FLOAT_X_PX;
  const y =
    Math.cos((t / CURSOR_IDLE_FLOAT_PERIOD_Y) * Math.PI * 2) *
    CURSOR_IDLE_FLOAT_Y_PX;
  return { x, y };
}
