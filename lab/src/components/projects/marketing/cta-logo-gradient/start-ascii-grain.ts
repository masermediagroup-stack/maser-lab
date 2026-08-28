/** Grain charset. Space omitted so every cell inks the mark at this scale. */
export const ASCII_CHARS = ".:+x*#";

function grainChar(column: number, row: number): string {
  const n = Math.sin(column * 12.9898 + row * 78.233) * 43758.5453;
  const frac = n - Math.floor(n);
  const index = Math.floor(Math.abs(frac) * ASCII_CHARS.length) % ASCII_CHARS.length;
  return ASCII_CHARS[index] ?? ".";
}

/**
 * Uniform tiny white grid filling the mark.
 * Cell size is the previous footer font/column pitch ÷ 5.
 * No column-height wave, fade, skip, or footer silhouette.
 */
export function startAsciiGrain(options: {
  canvas: HTMLCanvasElement;
}): () => void {
  const { canvas } = options;
  const parent = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  if (!parent || !ctx) return () => {};

  let disposed = false;

  const draw = () => {
    if (disposed) return;
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, parent.clientWidth);
    const height = Math.max(1, parent.clientHeight);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const footerFont = Math.max(12, Math.min(22, Math.round(height / 6)));
    const footerCol = Math.max(8, Math.round(footerFont * 0.78));
    const fontSize = footerFont / 5;
    const cellW = footerCol / 5;
    const cellH = footerFont / 5;
    const columns = Math.max(1, Math.ceil(width / cellW));
    const rows = Math.max(1, Math.ceil(height / cellH));

    ctx.clearRect(0, 0, width, height);
    ctx.font = `${fontSize}px ui-monospace, monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 1;

    for (let y = 0; y < rows; y++) {
      const posY = y * cellH;
      for (let x = 0; x < columns; x++) {
        ctx.fillText(grainChar(x, y), x * cellW, posY);
      }
    }
  };

  const observer = new ResizeObserver(draw);
  observer.observe(parent);
  draw();

  return () => {
    disposed = true;
    observer.disconnect();
  };
}
