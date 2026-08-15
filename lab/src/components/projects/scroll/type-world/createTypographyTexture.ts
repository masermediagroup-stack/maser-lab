import {
  CanvasTexture,
  ClampToEdgeWrapping,
  LinearFilter,
  LinearMipmapLinearFilter,
  SRGBColorSpace,
} from "three";
import type { TypographyTextureOptions } from "./types";

function quoteLines(quote: string): string[] {
  const lines = quote
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : [""];
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  family: string,
  maxWidth: number,
  maxHeight: number,
): number {
  let lo = 8;
  let hi = Math.max(12, maxHeight / Math.max(1, lines.length));

  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    ctx.font = `400 ${mid}px ${family}`;
    const widest = lines.reduce(
      (w, line) => Math.max(w, ctx.measureText(line).width),
      0,
    );
    const blockHeight = mid * 1.12 * lines.length;
    if (widest <= maxWidth && blockHeight <= maxHeight) lo = mid;
    else hi = mid;
  }

  return lo;
}

function drawQuotePanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  lines: string[],
  family: string,
): void {
  // Keep the composition on the facing cap so the rest state stays
  // editorial, not a wraparound globe. ~46% of 180° ≈ 83° of longitude.
  const maxWidth = width * 0.46;
  const maxHeight = height * 0.3;
  const size = fitFontSize(ctx, lines, family, maxWidth, maxHeight);
  const leading = size * 1.12;
  const blockHeight = leading * lines.length;
  const cx = x + width / 2;
  const cy = y + height / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  ctx.font = `400 ${size}px ${family}`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  lines.forEach((line, index) => {
    const ly = cy - blockHeight / 2 + leading * (index + 0.5);
    ctx.fillText(line, cx, ly, maxWidth);
  });
  ctx.restore();
}

/**
 * Packs the same quote twice across U (two 180° longitude panels).
 *
 * SphereGeometry default UVs put u=0.25 on +Z (camera-facing) and u=0.75
 * on −Z. Both panels are drawn LTR, so the 180° copy is readable rather
 * than mirrored — we only ever sample FrontSide, the outside of the mesh.
 */
export function createTypographyTexture({
  quote,
  fontFamily,
  width,
  height,
}: TypographyTextureOptions): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    throw new Error("Type World: 2D canvas context unavailable");
  }

  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const lines = quoteLines(quote);
  const panelWidth = width / 2;
  drawQuotePanel(ctx, 0, 0, panelWidth, height, lines, fontFamily);
  drawQuotePanel(ctx, panelWidth, 0, panelWidth, height, lines, fontFamily);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

export async function ensureFontLoaded(fontFamily: string): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await Promise.race([
      document.fonts.load(`400 128px ${fontFamily}`),
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, 2000);
      }),
    ]);
  } catch {
    // Draw with the fallback stack; glyphs still exist.
  }
}

export function pickTextureSize(): { width: number; height: number } {
  if (typeof window === "undefined") {
    return { width: 2048, height: 1024 };
  }
  return window.innerWidth < 640
    ? { width: 1024, height: 512 }
    : { width: 2048, height: 1024 };
}
