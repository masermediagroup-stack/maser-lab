import type { CtaLogoGradientLook } from "./types";

/** Grain charset. Space omitted so every cell inks the mark at this scale. */
export const ASCII_CHARS = ".:+x*#";

function grainChar(column: number, row: number): string {
  const n = Math.sin(column * 12.9898 + row * 78.233) * 43758.5453;
  const frac = n - Math.floor(n);
  const index = Math.floor(Math.abs(frac) * ASCII_CHARS.length) % ASCII_CHARS.length;
  return ASCII_CHARS[index] ?? ".";
}

/** Stable 0..1 seed per cell. Never Math.random. */
function cellSeed(column: number, row: number): number {
  const n = Math.sin(column * 127.1 + row * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function cellPhase(column: number, row: number): number {
  const n = Math.sin(column * 269.5 + row * 183.3) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Star sparkle: most cells stay filled. A seeded minority (~10%) briefly
 * wink off (~40–90ms) then return. No persistent holes, no drift.
 */
function cellOccupied(column: number, row: number, timeMs: number): boolean {
  const seed = cellSeed(column, row);
  if (seed < 0.9) return true;

  const t = (seed - 0.9) / 0.1;
  const period = 2400 + t * 3600;
  const phase = cellPhase(column, row);
  const cycle = ((timeMs + phase * period) % period) / period;
  const wink = 0.016 + t * 0.014;
  return cycle > wink;
}

/**
 * Uniform tiny white grid filling the mark.
 * Cell size is the previous footer font/column pitch ÷ 5 (locked).
 * Sparkle occupancy uses a per-cell seed; glyphs do not drift, slide, or scale.
 */
export function startAsciiGrain(options: {
  canvas: HTMLCanvasElement;
  lookRef: { current: CtaLogoGradientLook };
}): () => void {
  const { canvas, lookRef } = options;
  const parent = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  if (!parent || !ctx) return () => {};

  let disposed = false;
  let rafId = 0;
  let fontSize = 0;
  let cellW = 0;
  let cellH = 0;
  let columns = 1;
  let rows = 1;
  let width = 1;
  let height = 1;

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = Math.max(1, parent.clientWidth);
    height = Math.max(1, parent.clientHeight);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const footerFont = Math.max(12, Math.min(22, Math.round(height / 6)));
    const footerCol = Math.max(8, Math.round(footerFont * 0.78));
    fontSize = footerFont / 5;
    cellW = footerCol / 5;
    cellH = footerFont / 5;
    columns = Math.max(1, Math.ceil(width / cellW));
    rows = Math.max(1, Math.ceil(height / cellH));
  };

  const draw = (timeMs: number) => {
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${fontSize}px ui-monospace, monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 1;

    for (let y = 0; y < rows; y++) {
      const posY = y * cellH;
      for (let x = 0; x < columns; x++) {
        if (!cellOccupied(x, y, timeMs)) continue;
        ctx.fillText(grainChar(x, y), x * cellW, posY);
      }
    }
  };

  const tick = (now: number) => {
    if (disposed) return;
    const speed = lookRef.current.speed;
    draw(now * speed);
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
