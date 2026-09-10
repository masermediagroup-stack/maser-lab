import type { FrameLoopHandle, Gpu } from "vgpu";
import { clock, effect, frameLoop, init, surface } from "vgpu";
import movingGradientShader from "./moving-gradient.wgsl";

export const GRADIENT_STAGE_W = 1920;
export const GRADIENT_STAGE_H = 1080;
export const GRADIENT_DPR: readonly [number, number] = [1.5, 2];
export const GRADIENT_FALLBACK = "#060606";
/** Ambient TV drift — folds travel in a few seconds, not a splash. */
export const GRADIENT_MOTION = 0.55;

const FLOOR = 10 / 255;

export type GradientPausedRef = { current: boolean };

function paintFallback(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = GRADIENT_STAGE_W;
  const h = GRADIENT_STAGE_H;
  canvas.width = w;
  canvas.height = h;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = GRADIENT_FALLBACK;
  ctx.fillRect(0, 0, w, h);

  const blob = (
    x: number,
    y: number,
    radius: number,
    tone: number,
    alpha: number,
  ) => {
    const wash = ctx.createRadialGradient(x, y, 0, x, y, radius);
    wash.addColorStop(0, `rgba(${tone}, ${tone}, ${tone}, ${alpha})`);
    wash.addColorStop(1, "rgba(6, 6, 6, 0)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, w, h);
  };

  blob(w * 0.28, h * 0.3, w * 0.58, 92, 0.82);
  blob(w * 0.74, h * 0.62, w * 0.64, 72, 0.78);
  blob(w * 0.5, h * 0.82, w * 0.42, 118, 0.28);
  blob(w * 0.18, h * 0.72, w * 0.34, 54, 0.7);

  ctx.strokeStyle = "rgba(8, 8, 8, 0.72)";
  ctx.lineCap = "round";
  ctx.lineWidth = 120;
  ctx.beginPath();
  ctx.moveTo(w * -0.05, h * 0.18);
  ctx.quadraticCurveTo(w * 0.38, h * 0.42, w * 0.72, h * 0.08);
  ctx.stroke();
  ctx.lineWidth = 88;
  ctx.beginPath();
  ctx.moveTo(w * 0.12, h * 1.05);
  ctx.quadraticCurveTo(w * 0.58, h * 0.62, w * 1.08, h * 0.78);
  ctx.stroke();
}

/**
 * Full-bleed silk/fold moving gradient. Returns a disposer.
 * `pausedRef.current` freezes the field (reduced motion / pause = still frame).
 */
export function startMovingGradient(
  canvas: HTMLCanvasElement,
  pausedRef: GradientPausedRef,
): () => void {
  let disposed = false;
  let loop: FrameLoopHandle | undefined;
  let gpu: Gpu | undefined;

  void (async () => {
    try {
      gpu = await init();
    } catch {
      if (!disposed) paintFallback(canvas);
      return;
    }
    if (disposed) {
      gpu.dispose();
      return;
    }

    const canvasSurface = surface(gpu, canvas, {
      dpr: GRADIENT_DPR,
      alphaMode: "opaque",
      clearColor: [FLOOR, FLOOR, FLOOR, 1],
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
      if (!disposed) paintFallback(canvas);
      return;
    }
    if (disposed) {
      gpu.dispose();
      return;
    }

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
  };
}
