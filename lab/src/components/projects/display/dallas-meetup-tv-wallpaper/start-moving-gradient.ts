import { pinGradientCanvas, type GradientPausedRef } from "./moving-gradient-config";
import { DEFAULT_SILK_LOOK, type SilkLookRef } from "./silk-look";
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
  lookRef: SilkLookRef = { current: DEFAULT_SILK_LOOK },
): () => void {
  pinGradientCanvas(canvas);
  return (
    startSilkWebgl(canvas, pausedRef, lookRef) ??
    startSilkCpu(canvas, pausedRef, lookRef)
  );
}
