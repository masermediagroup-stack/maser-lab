import type { FrameLoopHandle, Gpu } from "vgpu";
import { clock, effect, frameLoop, init, surface } from "vgpu";
import codeGroundShader from "./code-ground.wgsl";

export const CODE_GROUND_STAGE_W = 1920;
export const CODE_GROUND_STAGE_H = 1080;
export const CODE_GROUND_DPR: readonly [number, number] = [1.5, 2];
export const CODE_GROUND_FALLBACK = "#060606";
/** Quiet TV dwell — shader owns px/s drift. */
export const CODE_GROUND_MOTION = 1;

const FLOOR = 6 / 255;
const TAU = Math.PI * 2;

export type CodeGroundPausedRef = { current: boolean };

function hash2(x: number, y: number): [number, number] {
  const n = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453);
  const m = Math.abs(Math.sin(x * 39.346 + y * 11.135) * 23421.631);
  return [n - Math.floor(n), m - Math.floor(m)];
}

function circleGlyph(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cell: number,
  kind: number,
  bitX: number,
  bitY: number,
  ink: number,
) {
  const r = cell * 0.42;
  const luma = Math.round((FLOOR + (0.94 - FLOOR) * ink) * 255);
  ctx.strokeStyle = `rgb(${luma}, ${luma}, ${luma})`;
  ctx.fillStyle = `rgb(${luma}, ${luma}, ${luma})`;
  ctx.lineWidth = Math.max(1.5, cell * 0.12);
  ctx.beginPath();
  if (kind < 1) {
    ctx.arc(cx, cy, r * (0.72 + bitY * 0.2), 0, TAU);
    ctx.fill();
    return;
  }
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.stroke();
  if (kind < 2) return;
  if (kind < 3) {
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.58, 0, TAU);
    ctx.stroke();
    return;
  }
  if (kind < 4) {
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.28, 0, TAU);
    ctx.fill();
    return;
  }
  if (kind < 5) {
    const spokes = 3 + Math.floor(bitX * 5);
    for (let i = 0; i < spokes; i += 1) {
      const a = (i / spokes) * TAU + bitY;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r * 0.3, cy + Math.sin(a) * r * 0.3);
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.stroke();
    }
    return;
  }
  if (kind < 6) {
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.stroke();
    return;
  }
  if (kind < 7) {
    const nDots = 6 + Math.floor(bitY * 5);
    for (let i = 0; i < nDots; i += 1) {
      const a = (i / nDots) * TAU;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * r * 0.74, cy + Math.sin(a) * r * 0.74, cell * 0.05, 0, TAU);
      ctx.fill();
    }
    return;
  }
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.58, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.28, 0, TAU);
  ctx.fill();
}

function paintLattice(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cell: number,
  density: number,
  gutterEvery: number,
  salt: number,
) {
  for (let x = cell * 0.5; x < w; x += cell) {
    const col = Math.floor(x / cell);
    if (gutterEvery > 0 && col % gutterEvery === gutterEvery - 1) continue;
    const colGain = hash2(col, 19)[0] > 0.38 ? 1 : 0.82;
    for (let y = cell * 0.5; y < h; y += cell) {
      const row = Math.floor(y / cell);
      if (row % 11 > 9) continue;
      const [liveX, liveY] = hash2(col + salt, row - salt * 0.31);
      if (liveX < 1 - density) continue;
      const kind = Math.floor(liveY * 8);
      const [bitX, bitY] = hash2(col + 11, row + salt);
      circleGlyph(ctx, x, y, cell, kind, bitX, bitY, (0.72 + liveX * 0.28) * colGain);
    }
  }
}

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
  paintLattice(ctx, w, h, 18, 0.9, 8, 11);
  paintLattice(ctx, w, h, 36, 0.38, 0, 41);
}

/**
 * Full-bleed B/W circular neo-code field. Returns a disposer.
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
