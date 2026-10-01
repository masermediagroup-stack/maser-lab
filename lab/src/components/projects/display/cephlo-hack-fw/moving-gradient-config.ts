/** True TV stage. CSS and GPU buffer stay 1920×1080 — never stretch the board. */
export const GRADIENT_STAGE_W = 1920;
export const GRADIENT_STAGE_H = 1080;
/** Pin backing store to TV pixels so the canvas cannot overflow the stage. */
export const GRADIENT_DPR = 1;
/** Deep end of the Cephlo reference wash (#2A10D6). */
export const GRADIENT_FALLBACK = "#2A10D6";
/** Ambient TV drift — slow idle (matches demo Speed default 0.15×). */
export const GRADIENT_MOTION = 0.15;
export const GRADIENT_FLOOR = 10 / 255;

export type GradientPausedRef = { current: boolean };

/**
 * Backing store stays 1920×1080 (same as the Dallas wallpaper shader).
 * CSS stretches the element to its parent so the field fills the stage.
 */
export function pinGradientCanvas(canvas: HTMLCanvasElement) {
  canvas.width = GRADIENT_STAGE_W;
  canvas.height = GRADIENT_STAGE_H;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.left = "0";
  canvas.style.top = "0";
  canvas.style.maxWidth = "none";
  canvas.style.maxHeight = "none";
  canvas.style.transform = "none";
}
