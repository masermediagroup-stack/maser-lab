/** True TV stage. CSS and GPU buffer stay 1920×1080 — never stretch the board. */
export const GRADIENT_STAGE_W = 1920;
export const GRADIENT_STAGE_H = 1080;
/** Pin backing store to TV pixels so the canvas cannot overflow the stage. */
export const GRADIENT_DPR = 1;
export const GRADIENT_FALLBACK = "#060606";
/** Ambient TV drift — folds travel in a few seconds, not a splash. */
export const GRADIENT_MOTION = 1.15;
export const GRADIENT_FLOOR = 10 / 255;

export type GradientPausedRef = { current: boolean };

export function pinGradientCanvas(canvas: HTMLCanvasElement) {
  canvas.width = GRADIENT_STAGE_W;
  canvas.height = GRADIENT_STAGE_H;
  canvas.style.width = `${GRADIENT_STAGE_W}px`;
  canvas.style.height = `${GRADIENT_STAGE_H}px`;
}
