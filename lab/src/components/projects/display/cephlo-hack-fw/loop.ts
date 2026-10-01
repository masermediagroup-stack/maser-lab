/** Idle wallpaper loop timing. Default loop is 120s. */

export const DEFAULT_LOOP_SECONDS = 120;
export const LOOP_MIN_SECONDS = 30;
export const LOOP_MAX_SECONDS = 120;
export const CEPHLO_WALLPAPER_FPS = 60;

export const LOOP_DURATION_OPTIONS = [
  { value: "120", label: "2 min (default)" },
  { value: "90", label: "90s" },
  { value: "60", label: "60s" },
  { value: "45", label: "45s" },
  { value: "30", label: "30s" },
] as const;

export function clampLoopSeconds(seconds: number): number {
  if (!Number.isFinite(seconds)) return DEFAULT_LOOP_SECONDS;
  return Math.min(LOOP_MAX_SECONDS, Math.max(LOOP_MIN_SECONDS, seconds));
}
