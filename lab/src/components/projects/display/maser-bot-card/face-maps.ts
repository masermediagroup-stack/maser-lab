import { CanvasTexture, SRGBColorSpace } from "three";
import { PARKED_COPY } from "./copy";

/** Paint resolution matches the 1299 artboard so Figma boxes stay 1:1. */
export const FACE_ART = 1299;
const FONT = "UniversalSansGrokTest Display Trial";
const WIDOW = "room moving.";
const WORDMARK_SRC = "/maser-bot-card/grok-bot-wordmark.svg";
const FILL = "#000000";
const TYPE = "#ffffff";

export type CardFaceTextures = {
  front: CanvasTexture;
  back: CanvasTexture;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`face map failed: ${src}`));
    img.src = src;
  });
}

function makeTexture(canvas: HTMLCanvasElement): CanvasTexture {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  texture.flipY = true;
  texture.needsUpdate = true;
  return texture;
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const hasWidow = text.endsWith(WIDOW);
  const prefix = hasWidow ? text.slice(0, -WIDOW.length).trimEnd() : text;
  const words = prefix.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (hasWidow) {
    const withWidow = current ? `${current} ${WIDOW}` : WIDOW;
    if (ctx.measureText(withWidow).width <= maxWidth) {
      current = withWidow;
    } else {
      if (current) lines.push(current);
      current = WIDOW;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function paintFront(canvas: HTMLCanvasElement, wordmark: HTMLImageElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const s = canvas.width / FACE_ART;
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.fillStyle = FILL;
  ctx.fillRect(0, 0, FACE_ART, FACE_ART);
  ctx.drawImage(wordmark, 100, 988, 1100, 212);
}

function paintBack(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const s = canvas.width / FACE_ART;
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.fillStyle = FILL;
  ctx.fillRect(0, 0, FACE_ART, FACE_ART);
  ctx.fillStyle = TYPE;
  ctx.textBaseline = "top";

  ctx.font = `400 96px "${FONT}"`;
  ctx.textAlign = "right";
  ctx.fillText(PARKED_COPY.name, 969 + 231, 138, 231);

  ctx.font = `400 64px "${FONT}"`;
  ctx.fillText(PARKED_COPY.role, 574 + 626, 253, 626);

  ctx.textAlign = "left";
  const bioWidth = 840;
  const lineHeight = 64 * 1.2;
  const lines = wrapLines(ctx, PARKED_COPY.body, bioWidth);
  let y = 560;
  for (const line of lines) {
    ctx.fillText(line, 97, y, bioWidth);
    y += lineHeight;
  }
}

/**
 * Type as albedo on the cuboid lids (Vercel badge: paint onto mesh.map).
 * Display Trial, black fill. No Geist, no iridescence, no band.
 */
export async function createCardFaceTextures(): Promise<CardFaceTextures> {
  await document.fonts.load(`400 96px "${FONT}"`);
  await document.fonts.load(`400 64px "${FONT}"`);
  await document.fonts.ready;
  const wordmark = await loadImage(WORDMARK_SRC);
  const frontCanvas = document.createElement("canvas");
  const backCanvas = document.createElement("canvas");
  frontCanvas.width = FACE_ART;
  frontCanvas.height = FACE_ART;
  backCanvas.width = FACE_ART;
  backCanvas.height = FACE_ART;
  paintFront(frontCanvas, wordmark);
  paintBack(backCanvas);
  return {
    front: makeTexture(frontCanvas),
    back: makeTexture(backCanvas),
  };
}
