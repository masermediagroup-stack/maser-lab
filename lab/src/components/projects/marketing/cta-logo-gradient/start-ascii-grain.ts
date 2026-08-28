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
 * Cell size is the previous footer font/column pitch ÷ 5 (locked).
 * Glyphs stay put — no sparkle, punch-out, or drift.
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
  let width = 1;
  let height = 1;

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = Math.max(1, parent.clientWidth);
    height = Math.max(1, parent.clientHeight);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    mask.width = canvas.width;
    mask.height = canvas.height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const footerFont = Math.max(12, Math.min(22, Math.round(height / 6)));
    const footerCol = Math.max(8, Math.round(footerFont * 0.78));
    const fontSize = footerFont / 5;
    const cellW = footerCol / 5;
    const cellH = footerFont / 5;
    const columns = Math.max(1, Math.ceil(width / cellW));
    const rows = Math.max(1, Math.ceil(height / cellH));

    maskCtx.clearRect(0, 0, width, height);
    maskCtx.font = `${fontSize}px ui-monospace, monospace`;
    maskCtx.textAlign = "left";
    maskCtx.textBaseline = "top";
    maskCtx.fillStyle = "#ffffff";
    for (let y = 0; y < rows; y++) {
      const posY = y * cellH;
      for (let x = 0; x < columns; x++) {
        maskCtx.fillText(grainChar(x, y), x * cellW, posY);
      }
    }
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

  const observer = new ResizeObserver(resize);
  observer.observe(parent);
  resize();
  rafId = window.requestAnimationFrame(tick);

  return () => {
    disposed = true;
    observer.disconnect();
    window.cancelAnimationFrame(rafId);
  };
}
