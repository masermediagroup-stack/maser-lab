import type { PageSample } from "./types";

/**
 * Paint a destination-page stand-in — Maser blue / white only.
 * Safe on tiny / zero-size surfaces (mobile layout, display:none hosts).
 */
export function paintPageTexture(
  canvas: HTMLCanvasElement,
  sample: PageSample,
  width: number,
  height: number,
) {
  const blue = sample.accent || "#10a4ff";
  const safeW = Math.max(1, Math.floor(width));
  const safeH = Math.max(1, Math.floor(height));
  if (safeW < 8 || safeH < 8) {
    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2);
    canvas.width = Math.max(1, Math.floor(safeW * dpr));
    canvas.height = Math.max(1, Math.floor(safeH * dpr));
    const tiny = canvas.getContext("2d");
    if (!tiny) return;
    tiny.setTransform(dpr, 0, 0, dpr, 0, 0);
    tiny.fillStyle = "#02060a";
    tiny.fillRect(0, 0, safeW, safeH);
    return;
  }

  const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2);
  canvas.width = Math.max(1, Math.floor(safeW * dpr));
  canvas.height = Math.max(1, Math.floor(safeH * dpr));

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, safeW, safeH);

  ctx.fillStyle = "#02060a";
  ctx.fillRect(0, 0, safeW, safeH);

  const pad = Math.max(10, Math.min(22, safeW * 0.05));
  const cardW = Math.max(48, Math.min(420, safeW * 0.78));
  const cardH = Math.max(64, Math.min(320, safeH * 0.72));
  const cardX = (safeW - cardW) / 2;
  const cardY = (safeH - cardH) / 2;
  const radius = Math.max(0, Math.min(16, cardW / 8, cardH / 8));

  roundRect(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = "#05080c";
  ctx.fill();
  ctx.strokeStyle = "rgba(16,164,255,0.35)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = blue;
  ctx.font = `600 ${Math.max(9, Math.min(11, cardW * 0.035))}px ui-sans-serif, system-ui, sans-serif`;
  ctx.fillText(sample.label.toUpperCase(), cardX + pad, cardY + pad + 10);
  ctx.textAlign = "right";
  ctx.fillText(sample.kicker.toUpperCase(), cardX + cardW - pad, cardY + pad + 10);
  ctx.textAlign = "left";

  const visualX = cardX + pad;
  const visualY = cardY + pad + 22;
  const visualW = Math.max(8, cardW - pad * 2);
  const visualH = Math.max(8, cardH * 0.48);
  roundRect(ctx, visualX, visualY, visualW, visualH, Math.min(12, visualW / 6, visualH / 6));
  const gradient = ctx.createLinearGradient(
    visualX,
    visualY,
    visualX + visualW,
    visualY + visualH,
  );
  gradient.addColorStop(0, "#00365a");
  gradient.addColorStop(0.55, blue);
  gradient.addColorStop(1, "#0065a3");
  ctx.fillStyle = gradient;
  ctx.fill();

  const blobRx = Math.max(2, visualW * 0.16);
  const blobRy = Math.max(2, visualH * 0.28);
  ctx.beginPath();
  ctx.ellipse(
    visualX + visualW / 2,
    visualY + visualH / 2,
    blobRx,
    blobRy,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  const titleSize = Math.max(16, Math.min(28, cardW * 0.08));
  ctx.font = `700 ${titleSize}px ui-sans-serif, system-ui, sans-serif`;
  wrapText(
    ctx,
    sample.title,
    cardX + pad,
    visualY + visualH + titleSize + 10,
    Math.max(8, cardW - pad * 2),
    titleSize * 1.15,
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  if (w <= 0 || h <= 0) return;
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  if (radius <= 0) {
    ctx.rect(x, y, w, h);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
  }
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  if (maxWidth <= 0) return;
  const words = text.split(" ");
  let line = "";
  let cursorY = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = word;
      cursorY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cursorY);
}
