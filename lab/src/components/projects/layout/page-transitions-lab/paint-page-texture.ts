import type { PageSample } from "./types";

/**
 * Paint a destination-page stand-in onto a canvas for Three.js textures.
 * Keeps the curtain effect self-contained (no html2canvas dependency).
 */
export function paintPageTexture(
  canvas: HTMLCanvasElement,
  sample: PageSample,
  width: number,
  height: number,
) {
  const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2);
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  // Stage background
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, width, height);

  const cardW = Math.min(420, width * 0.72);
  const cardH = Math.min(360, height * 0.78);
  const cardX = (width - cardW) / 2;
  const cardY = (height - cardH) / 2;
  const radius = 16;

  // Card
  roundRect(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = "#111111";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Header
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "600 11px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(sample.label.toUpperCase(), cardX + 22, cardY + 28);
  ctx.textAlign = "right";
  ctx.fillText(sample.kicker.toUpperCase(), cardX + cardW - 22, cardY + 28);
  ctx.textAlign = "left";

  // Visual block
  const visualX = cardX + 22;
  const visualY = cardY + 48;
  const visualW = cardW - 44;
  const visualH = cardH * 0.42;
  roundRect(ctx, visualX, visualY, visualW, visualH, 12);
  const gradient = ctx.createLinearGradient(visualX, visualY, visualX + visualW, visualY + visualH);
  gradient.addColorStop(0, "#1a1a1a");
  gradient.addColorStop(0.55, sample.accent);
  gradient.addColorStop(1, "#2a2a2a");
  ctx.fillStyle = gradient;
  ctx.fill();

  // Blob
  ctx.beginPath();
  ctx.ellipse(
    visualX + visualW / 2,
    visualY + visualH / 2,
    visualW * 0.16,
    visualH * 0.28,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.fill();

  // Title
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${Math.max(22, cardW * 0.08)}px ui-sans-serif, system-ui, sans-serif`;
  wrapText(ctx, sample.title, cardX + 22, visualY + visualH + 42, cardW - 44, 30);

  // Items
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "600 11px ui-sans-serif, system-ui, sans-serif";
  const itemY = cardY + cardH - 36;
  const itemWidth = (cardW - 44) / sample.items.length;
  sample.items.forEach((item, index) => {
    ctx.fillText(item.toUpperCase(), cardX + 22 + itemWidth * index, itemY);
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
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
