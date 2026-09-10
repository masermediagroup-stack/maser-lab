import { pinGradientCanvas, type GradientPausedRef } from "./moving-gradient-config";
import { startSilkCpu, startSilkWebgl } from "./start-silk-webgl";

export {
  GRADIENT_DPR,
  GRADIENT_FALLBACK,
  GRADIENT_MOTION,
  GRADIENT_STAGE_H,
  GRADIENT_STAGE_W,
  pinGradientCanvas,
} from "./moving-gradient-config";
export type { GradientPausedRef } from "./moving-gradient-config";

/**
 * Full-bleed silk/fold moving gradient. Always starts a live shader.
 * WebGL2 is the ground on every browser (including Vercel). CPU shader if GL cannot compile.
 * Never waits on WebGPU — a successful vgpu init can own the canvas and leave it black.
 * `pausedRef.current` freezes the field (reduced motion / pause = still frame of the live shader).
 */
export function startMovingGradient(
  canvas: HTMLCanvasElement,
  pausedRef: GradientPausedRef,
): () => void {
  pinGradientCanvas(canvas);
  return startSilkWebgl(canvas, pausedRef) ?? startSilkCpu(canvas, pausedRef);
}
