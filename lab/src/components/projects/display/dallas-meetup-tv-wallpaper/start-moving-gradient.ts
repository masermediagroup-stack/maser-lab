import type { FrameLoopHandle, Gpu } from "vgpu";
import { clock, effect, frameLoop, init, surface } from "vgpu";
import {
  GRADIENT_DPR,
  GRADIENT_FLOOR,
  GRADIENT_MOTION,
  GRADIENT_STAGE_H,
  GRADIENT_STAGE_W,
  pinGradientCanvas,
  type GradientPausedRef,
} from "./moving-gradient-config";
import movingGradientShader from "./moving-gradient.wgsl";
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

function startMovingFallback(
  canvas: HTMLCanvasElement,
  pausedRef: GradientPausedRef,
): () => void {
  return startSilkWebgl(canvas, pausedRef) ?? startSilkCpu(canvas, pausedRef);
}

/**
 * Full-bleed silk/fold moving gradient. Returns a disposer.
 * Prefers vgpu WebGPU, then a WebGL2 shader of the same field, then a CPU shader.
 * `pausedRef.current` freezes the field (reduced motion / pause = still frame).
 */
export function startMovingGradient(
  canvas: HTMLCanvasElement,
  pausedRef: GradientPausedRef,
): () => void {
  pinGradientCanvas(canvas);
  let disposed = false;
  let loop: FrameLoopHandle | undefined;
  let gpu: Gpu | undefined;
  let stopFallback: (() => void) | undefined;

  void (async () => {
    try {
      gpu = await init();
    } catch {
      if (!disposed) stopFallback = startMovingFallback(canvas, pausedRef);
      return;
    }
    if (disposed) {
      gpu.dispose();
      return;
    }

    const canvasSurface = surface(gpu, canvas, {
      autoResize: false,
      size: [GRADIENT_STAGE_W, GRADIENT_STAGE_H],
      dpr: GRADIENT_DPR,
      alphaMode: "opaque",
      clearColor: [GRADIENT_FLOOR, GRADIENT_FLOOR, GRADIENT_FLOOR, 1],
      label: "dallas-moving-gradient",
    });

    const field = effect(gpu, movingGradientShader, {
      label: "dallas-moving-gradient-field",
      set: { params: { time: 0 } },
    });

    try {
      await field.compile(canvasSurface);
    } catch {
      gpu.dispose();
      gpu = undefined;
      if (!disposed) stopFallback = startMovingFallback(canvas, pausedRef);
      return;
    }
    if (disposed) {
      gpu.dispose();
      return;
    }

    canvas.dataset.dallasGround = "webgpu";
    const time = clock(gpu);
    let hold = 0;
    loop = frameLoop(gpu, (frame) => {
      const now = time.time * GRADIENT_MOTION;
      if (!pausedRef.current) hold = now;
      field.set({ params: { time: hold } });
      frame.pass(canvasSurface, field);
    });
  })();

  return () => {
    disposed = true;
    loop?.stop();
    gpu?.dispose();
    stopFallback?.();
  };
}
