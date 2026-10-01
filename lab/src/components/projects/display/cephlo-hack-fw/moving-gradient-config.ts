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

/** Drawing buffer tracks the stage. CSS fills the parent — never a fixed 1920×1080 box. */
export function pinGradientCanvas(canvas: HTMLCanvasElement) {
  const parent = canvas.parentElement;
  const rect = parent?.getBoundingClientRect();
  const cssW = Math.max(1, Math.round(rect?.width || window.innerWidth));
  const cssH = Math.max(1, Math.round(rect?.height || window.innerHeight));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const nextW = Math.max(1, Math.floor(cssW * dpr));
  const nextH = Math.max(1, Math.floor(cssH * dpr));
  if (canvas.style.width !== "100%") canvas.style.width = "100%";
  if (canvas.style.height !== "100%") canvas.style.height = "100%";
  if (canvas.style.transform !== "none") canvas.style.transform = "none";
  if (canvas.width !== nextW) canvas.width = nextW;
  if (canvas.height !== nextH) canvas.height = nextH;
}
