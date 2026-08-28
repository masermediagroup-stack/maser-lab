import type { CtaLogoGradientLook } from "./types";

/** Live-site footer charset from maser-media `ascii-wave.tsx`. */
export const ASCII_CHARS = " .:+x*#";

export function startAsciiWave(options: {
  canvas: HTMLCanvasElement;
  lookRef: { current: CtaLogoGradientLook };
}): () => void {
  const { canvas, lookRef } = options;
  const parent = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  if (!parent || !ctx) return () => {};

  const chars = ASCII_CHARS.split("");
  let disposed = false;
  let rafId = 0;
  let time = 0;

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, parent.clientWidth);
    const height = Math.max(1, parent.clientHeight);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const observer = new ResizeObserver(resize);
  observer.observe(parent);
  resize();

  const drawFrame = () => {
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    const speed = lookRef.current.speed;
    const fontSize = Math.max(12, Math.min(22, Math.round(height / 6)));
    const columnWidth = Math.max(8, Math.round(fontSize * 0.78));
    const columns = Math.max(1, Math.ceil(width / columnWidth));
    const rows = Math.max(1, Math.ceil(height / fontSize));

    ctx.clearRect(0, 0, width, height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#ffffff";

    for (let x = 0; x < columns; x++) {
      const shapeBase = Math.sin(x * 0.1) * 0.6 + Math.cos(x * 0.25) * 0.4;
      const breath = Math.sin(time * 0.002 * speed) * 0.1;
      const flicker = Math.sin(time * 0.008 * speed + x * 100) * 0.05;
      const noise = shapeBase + breath + flicker;
      const columnHeightNormal = Math.min(
        1,
        Math.max(0.35, ((noise + 1) / 2) * 0.82 + 0.22),
      );
      const activeRows = Math.floor(columnHeightNormal * rows);

      for (let y = rows - 1; y > rows - activeRows; y--) {
        const flowShift = time * 0.005 * speed;
        const charNoise = Math.sin(y * 0.2 - flowShift + x * 10);
        const distFromTop = y - (rows - activeRows);
        const fade = Math.min(1, distFromTop / Math.max(4, fontSize * 0.45));
        const normalizedNoise = (charNoise + 1) / 2;
        const charIndex = Math.floor(normalizedNoise * chars.length);
        const char = chars[Math.min(charIndex, chars.length - 1)];
        const posX = x * columnWidth;
        const posY = y * fontSize;

        if (Math.random() > 0.9) continue;

        ctx.globalAlpha = fade;
        ctx.fillText(char ?? " ", posX, posY);
      }
    }

    ctx.globalAlpha = 1;
  };

  const tick = () => {
    if (disposed) return;
    drawFrame();
    time += 16;
    rafId = window.requestAnimationFrame(tick);
  };

  rafId = window.requestAnimationFrame(tick);

  return () => {
    disposed = true;
    observer.disconnect();
    window.cancelAnimationFrame(rafId);
  };
}
