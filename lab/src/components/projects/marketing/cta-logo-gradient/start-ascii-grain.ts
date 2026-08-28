import {
  ASCII_CELL_H,
  ASCII_CELL_W,
  ASCII_FONT_SIZE,
} from "./constants";
import type { CtaLogoGradientLook } from "./types";
import { paintCornerWash, washTimeSeconds } from "./wash-palette";

/** Grain charset. Space omitted so every cell inks the mark at this scale. */
export const ASCII_CHARS = ".:+x*#";

function grainChar(column: number, row: number): string {
  const n = Math.sin(column * 12.9898 + row * 78.233) * 43758.5453;
  const frac = n - Math.floor(n);
  const index = Math.floor(Math.abs(frac) * ASCII_CHARS.length) % ASCII_CHARS.length;
  return ASCII_CHARS[index] ?? ".";
}

/**
 * Uniform tiny grid filling the mark.
 * Cell size is pinned (footer font/column ÷ 5). The lattice is restroked
 * only when the canvas bitmap size actually changes — never on knob ticks.
 * Fill is the four-corner wash at opposite phase from the logo body.
 */
export function startAsciiGrain(options: {
  canvas: HTMLCanvasElement;
  lookRef: { current: CtaLogoGradientLook };
}): () => void {
  const { canvas, lookRef } = options;
  const parent = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  if (!parent || !ctx) return () => {};

  const mask = document.createElement("canvas");
  const maskCtx = mask.getContext("2d");
  const corners = document.createElement("canvas");
  corners.width = 2;
  corners.height = 2;
  if (!maskCtx) return () => {};

  let disposed = false;
  let rafId = 0;
  let lastPxW = 0;
  let lastPxH = 0;

  const rebuildMask = (cssW: number, cssH: number, dpr: number) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const columns = Math.max(1, Math.ceil(cssW / ASCII_CELL_W));
    const rows = Math.max(1, Math.ceil(cssH / ASCII_CELL_H));

    maskCtx.clearRect(0, 0, cssW, cssH);
    maskCtx.font = `${ASCII_FONT_SIZE}px ui-monospace, monospace`;
    maskCtx.textAlign = "left";
    maskCtx.textBaseline = "top";
    maskCtx.fillStyle = "#ffffff";
    for (let y = 0; y < rows; y++) {
      const posY = y * ASCII_CELL_H;
      for (let x = 0; x < columns; x++) {
        maskCtx.fillText(grainChar(x, y), x * ASCII_CELL_W, posY);
      }
    }
  };

  const syncCanvasSize = () => {
    const dpr = window.devicePixelRatio || 1;
    const cssW = Math.max(1, parent.clientWidth);
    const cssH = Math.max(1, parent.clientHeight);
    const pxW = Math.max(1, Math.floor(cssW * dpr));
    const pxH = Math.max(1, Math.floor(cssH * dpr));
    if (pxW === lastPxW && pxH === lastPxH) return;

    lastPxW = pxW;
    lastPxH = pxH;
    canvas.width = pxW;
    canvas.height = pxH;
    mask.width = pxW;
    mask.height = pxH;
    rebuildMask(cssW, cssH, dpr);
  };

  const draw = () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "copy";
    paintCornerWash(
      ctx,
      corners,
      canvas.width,
      canvas.height,
      lookRef.current,
      washTimeSeconds(),
      0.5,
      "glyph",
    );
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(mask, 0, 0);
    ctx.globalCompositeOperation = "source-over";
  };

  const tick = () => {
    if (disposed) return;
    draw();
    rafId = window.requestAnimationFrame(tick);
  };

  const observer = new ResizeObserver(syncCanvasSize);
  observer.observe(parent);
  syncCanvasSize();
  rafId = window.requestAnimationFrame(tick);

  return () => {
    disposed = true;
    observer.disconnect();
    window.cancelAnimationFrame(rafId);
  };
}
