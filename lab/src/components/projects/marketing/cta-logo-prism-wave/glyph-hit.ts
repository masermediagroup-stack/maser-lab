import { LOGO_ASPECT, LOGO_SRC } from "./constants";

const MASK_WIDTH = 512;
const ALPHA_HIT = 12;

export type GlyphHitMask = {
  width: number;
  height: number;
  alpha: Uint8Array;
  /** Tight opaque bounds in 0–1 UV of the SVG / mark image. */
  minU: number;
  minV: number;
  maxU: number;
  maxV: number;
};

let maskPromise: Promise<GlyphHitMask | null> | null = null;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error(`Could not load glyph hit mask: ${url}`));
    image.src = url;
  });
}

async function buildGlyphHitMask(url: string): Promise<GlyphHitMask | null> {
  const image = await loadImage(url);
  try {
    await image.decode();
  } catch {
    /* onload already fired */
  }
  const width = MASK_WIDTH;
  const height = Math.max(1, Math.round(width / LOGO_ASPECT));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);
  const alpha = new Uint8Array(width * height);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const a = data[(y * width + x) * 4 + 3] ?? 0;
      alpha[y * width + x] = a;
      if (a < ALPHA_HIT) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < minX || maxY < minY) return null;
  return {
    width,
    height,
    alpha,
    minU: minX / width,
    minV: minY / height,
    maxU: (maxX + 1) / width,
    maxV: (maxY + 1) / height,
  };
}

export function loadGlyphHitMask(
  url: string = LOGO_SRC,
): Promise<GlyphHitMask | null> {
  if (!maskPromise) {
    maskPromise = buildGlyphHitMask(url).catch((error) => {
      console.error("[cta-logo-prism-wave] glyph hit mask failed", error);
      maskPromise = null;
      return null;
    });
  }
  return maskPromise;
}

/** Layout box of the mark image (viewport), not the projected AABB. */
export function markLayoutRect(
  shell: HTMLElement,
  viewport: HTMLElement,
): { left: number; top: number; width: number; height: number } {
  const shellRect = shell.getBoundingClientRect();
  return {
    left: shellRect.left + viewport.offsetLeft,
    top: shellRect.top + viewport.offsetTop,
    width: viewport.offsetWidth,
    height: viewport.offsetHeight,
  };
}

export function sampleGlyphHit(
  mask: GlyphHitMask,
  u: number,
  v: number,
): boolean {
  if (u < mask.minU || u > mask.maxU || v < mask.minV || v > mask.maxV) {
    return false;
  }
  if (u < 0 || u > 1 || v < 0 || v > 1) return false;
  const x = Math.min(mask.width - 1, Math.max(0, Math.floor(u * mask.width)));
  const y = Math.min(mask.height - 1, Math.max(0, Math.floor(v * mask.height)));
  return (mask.alpha[y * mask.width + x] ?? 0) >= ALPHA_HIT;
}
