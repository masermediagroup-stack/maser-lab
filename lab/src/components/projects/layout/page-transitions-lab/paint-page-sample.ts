/**
 * Paint a simplified wireframe page onto a canvas for pixel sampling.
 * Matches DemoPageCard layout enough for preserve-color mode.
 */

import type { PageSample } from "./types";

export function paintPageSample(
  sample: PageSample,
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(8, Math.round(width));
  canvas.height = Math.max(8, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const w = canvas.width;
  const h = canvas.height;
  const accent = sample.accent || "#10a4ff";

  // Page card background
  ctx.fillStyle = "#05080c";
  roundRect(ctx, 0, 0, w, h, Math.min(18, w * 0.04));
  ctx.fill();

  // Border glow
  ctx.strokeStyle = "rgba(16, 164, 255, 0.35)";
  ctx.lineWidth = 2;
  roundRect(ctx, 1, 1, w - 2, h - 2, Math.min(18, w * 0.04));
  ctx.stroke();

  const pad = Math.max(10, w * 0.04);
  let y = pad;

  // Nav brand
  ctx.fillStyle = accent;
  ctx.font = `bold ${Math.max(10, w * 0.035)}px system-ui, sans-serif`;
  ctx.fillText(sample.brand, pad, y + 14);
  y += 28;

  // Nav rule
  ctx.strokeStyle = "rgba(16, 164, 255, 0.2)";
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(w - pad, y);
  ctx.stroke();
  y += 16;

  if (sample.kind === "article") {
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = `${Math.max(9, w * 0.028)}px system-ui, sans-serif`;
    ctx.fillText("Journal · 6 min", pad, y + 10);
    y += 28;

    ctx.fillStyle = "#ffffff";
    ctx.font = `600 ${Math.max(14, w * 0.055)}px system-ui, sans-serif`;
    wrapText(ctx, sample.title, pad, y, w - pad * 2, Math.max(18, w * 0.06));
    y += Math.max(48, h * 0.18);

    // Body lines
    for (let i = 0; i < 6; i++) {
      const lineW = i % 3 === 2 ? w * 0.45 : i % 2 === 0 ? w - pad * 2 : w * 0.72;
      ctx.fillStyle = "rgba(255,255,255,0.16)";
      roundRect(ctx, pad, y, lineW, Math.max(6, h * 0.018), 3);
      ctx.fill();
      y += Math.max(14, h * 0.04);
    }

    // Aside blocks
    const asideY = h - pad - h * 0.18;
    ctx.fillStyle = "rgba(16, 164, 255, 0.12)";
    roundRect(ctx, pad, asideY, (w - pad * 3) / 2, h * 0.14, 8);
    ctx.fill();
    ctx.fillStyle = `linear-gradient`;
    const grad = ctx.createLinearGradient(w / 2, asideY, w - pad, asideY + h * 0.14);
    grad.addColorStop(0, "#00365a");
    grad.addColorStop(1, accent);
    ctx.fillStyle = grad;
    roundRect(
      ctx,
      pad * 2 + (w - pad * 3) / 2,
      asideY,
      (w - pad * 3) / 2,
      h * 0.14,
      8,
    );
    ctx.fill();
  } else {
    // Landing hero
    const colW = (w - pad * 3) / 2;
    ctx.fillStyle = "rgba(16, 164, 255, 0.55)";
    roundRect(ctx, pad, y, w * 0.18, 6, 3);
    ctx.fill();
    y += 18;

    ctx.fillStyle = "#ffffff";
    ctx.font = `600 ${Math.max(14, w * 0.05)}px system-ui, sans-serif`;
    wrapText(ctx, sample.title, pad, y, colW, Math.max(18, w * 0.055));
    y += Math.max(44, h * 0.16);

    ctx.fillStyle = "rgba(255,255,255,0.16)";
    roundRect(ctx, pad, y, colW * 0.95, 7, 3);
    ctx.fill();
    y += 14;
    roundRect(ctx, pad, y, colW * 0.7, 7, 3);
    ctx.fill();
    y += 22;

    ctx.fillStyle = accent;
    roundRect(ctx, pad, y, Math.max(48, w * 0.16), Math.max(18, h * 0.05), 6);
    ctx.fill();

    // Media block
    const mediaX = pad * 2 + colW;
    const mediaY = pad + 36;
    const mediaH = h * 0.42;
    const mediaGrad = ctx.createLinearGradient(mediaX, mediaY, mediaX + colW, mediaY + mediaH);
    mediaGrad.addColorStop(0, "#0a1a28");
    mediaGrad.addColorStop(1, "#00365a");
    ctx.fillStyle = mediaGrad;
    roundRect(ctx, mediaX, mediaY, colW, mediaH, 12);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.arc(mediaX + colW / 2, mediaY + mediaH / 2, Math.min(colW, mediaH) * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // Feature strips
    const featY = h - pad - h * 0.12;
    const featW = (w - pad * 4) / 3;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = "rgba(16, 164, 255, 0.1)";
      roundRect(ctx, pad + i * (featW + pad), featY, featW, h * 0.1, 8);
      ctx.fill();
    }
  }

  return canvas;
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
  let cy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = word;
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
}
