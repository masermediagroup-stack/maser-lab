import type { FrameLoopHandle, Gpu } from "vgpu";
import { clock, effect, frameLoop, init, surface } from "vgpu";
import codeGroundShader from "./code-ground.wgsl";

export const CODE_GROUND_STAGE_W = 1920;
export const CODE_GROUND_STAGE_H = 1080;
export const CODE_GROUND_DPR: readonly [number, number] = [1.5, 2];
export const CODE_GROUND_FALLBACK = "#060606";
/** Quiet field — wall TV dwell, not a splash. */
export const CODE_GROUND_MOTION = 0.22;

const FLOOR = 6 / 255;

export type CodeGroundPausedRef = { current: boolean };

function paintFallback(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = CODE_GROUND_STAGE_W;
  const h = CODE_GROUND_STAGE_H;
  canvas.width = w;
  canvas.height = h;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = CODE_GROUND_FALLBACK;
  ctx.fillRect(0, 0, w, h);

  const cell = 10.5;
  for (let x = cell * 0.5; x < w; x += cell) {
    const col = Math.floor(x / cell);
    if (col % 8 === 7) continue;
    for (let y = cell * 0.5; y < h; y += cell) {
      const row = Math.floor(y / cell);
      const n = Math.abs(Math.sin(col * 12.9898 + row * 78.233) * 43758.5453);
      const live = n - Math.floor(n);
      if (live < 0.42) continue;
      const cx = (uvQuiet(x, y) * (0.28 + live * 0.72) + FLOOR) * 255;
      const radius = (0.16 + live * 0.2) * cell;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${cx}, ${cx}, ${cx})`;
      ctx.fill();
    }
  }
}

function uvQuiet(x: number, y: number): number {
  const nx = (x / CODE_GROUND_STAGE_W - 0.5);
  const ny = (y / CODE_GROUND_STAGE_H - 0.5) * (1920 / 1080);
  const d = Math.hypot(nx, ny);
  const t = Math.min(1, Math.max(0, (d - 0.1) / 0.42));
  return 0.38 + t * 0.62;
}

/**
 * Full-bleed B/W circle-glyph field. Returns a disposer.
 * `pausedRef.current` freezes the field (reduced motion = still frame).
 */
export function startCodeGround(
  canvas: HTMLCanvasElement,
  pausedRef: CodeGroundPausedRef,
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
      dpr: CODE_GROUND_DPR,
      alphaMode: "opaque",
      clearColor: [FLOOR, FLOOR, FLOOR, 1],
      label: "dallas-code-ground",
    });

    const field = effect(gpu, codeGroundShader, {
      label: "dallas-code-ground-field",
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
      const now = time.time * CODE_GROUND_MOTION;
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
