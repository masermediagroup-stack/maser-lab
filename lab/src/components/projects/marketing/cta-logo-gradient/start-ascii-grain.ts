import {
  ASCII_CELL_H,
  ASCII_CELL_W,
  ASCII_FONT_SIZE,
} from "./constants";
import type { WashClock } from "./wash-clock";
import type { CtaLogoGradientLook } from "./types";
import { paintSparkleLayer } from "./sparkle-bursts";
import { paintCornerWash } from "./wash-palette";

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
 * only when the canvas bitmap size actually changes — never on knob ticks
 * or sparkle. Sparkle is a per-cell intensity burst on glyphs that stay put.
 * Fill is the four-blob wash at opposite phase from the logo body.
 */
export function startAsciiGrain(options: {
  canvas: HTMLCanvasElement;
  lookRef: { current: CtaLogoGradientLook };
  clock: WashClock;
}): () => void {
  const { canvas, lookRef, clock } = options;
  const parent = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  if (!parent || !ctx) return () => {};

  const mask = document.createElement("canvas");
  const maskCtx = mask.getContext("2d");
  const sparkle = document.createElement("canvas");
  const sparkleCtx = sparkle.getContext("2d");
  if (!maskCtx || !sparkleCtx) return () => {};

  let disposed = false;
  let rafId = 0;
  let lastPxW = 0;
  let lastPxH = 0;
  let columns = 1;
  let rows = 1;
  let sparklePixels = sparkleCtx.createImageData(1, 1);

  const rebuildMask = (cssW: number, cssH: number, dpr: number) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    columns = Math.max(1, Math.ceil(cssW / ASCII_CELL_W));
    rows = Math.max(1, Math.ceil(cssH / ASCII_CELL_H));
    if (sparkle.width !== columns || sparkle.height !== rows) {
      sparkle.width = columns;
      sparkle.height = rows;
      sparklePixels = sparkleCtx.createImageData(columns, rows);
    }

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
      canvas.width,
      canvas.height,
      lookRef.current,
      clock.phase,
      0.5,
      "glyph",
    );
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(mask, 0, 0);

    const timeSec = performance.now() / 1000;
    ctx.imageSmoothingEnabled = false;
    paintSparkleLayer(sparklePixels, columns, rows, timeSec, "dim");
    sparkleCtx.putImageData(sparklePixels, 0, 0);
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(sparkle, 0, 0, canvas.width, canvas.height);
    paintSparkleLayer(sparklePixels, columns, rows, timeSec, "flash");
    sparkleCtx.putImageData(sparklePixels, 0, 0);
    ctx.globalCompositeOperation = "source-atop";
    ctx.drawImage(sparkle, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
    ctx.imageSmoothingEnabled = true;
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
