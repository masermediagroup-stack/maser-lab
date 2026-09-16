import { GRADIENT_STAGE_H, GRADIENT_STAGE_W } from "./moving-gradient-config";

/**
 * Uniform contain scale so the 1920×1080 board fits a viewport.
 * Same scale on X and Y — never stretch logos or type.
 */
export function containScale(viewportW: number, viewportH: number): number {
  if (!Number.isFinite(viewportW) || !Number.isFinite(viewportH)) return 1;
  if (viewportW <= 0 || viewportH <= 0) return 1;
  return Math.min(viewportW / GRADIENT_STAGE_W, viewportH / GRADIENT_STAGE_H);
}
