/**
 * Bayer-dithered Dallas skyline horizon from the Trammell Crow Park CC0 photo.
 *
 * Source: https://commons.wikimedia.org/wiki/File:Dallas_Texas_skyline_overlooking_Trammell_Crow_Park.png
 * CC0 1.0, IcedCowboyCoffee. Commercial use OK. No attribution required.
 *
 * Paper/ink only. Fade the top so it reads as a horizon, not a sticker.
 * Sit low, behind the globe — never mapped onto the sphere.
 *
 * Refused: teal tourist illustration, Noun Project / clipart, skyline-on-sphere.
 */

import { DALLAS_MARK_INK } from "./grok-cycle";

export const HORIZON_SRC = "/images/dallas-trammell-crow.png";
export const HORIZON_SOURCE_CREDIT =
  "Trammell Crow Park skyline, CC0 1.0 (IcedCowboyCoffee). Wikimedia Commons.";

/** Crop to the building band: Reunion Tower (ball-on-a-stalk) + Bank of America Plaza. */
export const SKYLINE_CROP_TOP = 0.2;
export const SKYLINE_CROP_BOTTOM = 0.52;
export const HORIZON_PROCESS_WIDTH = 1280;
export const HORIZON_TOP_FADE = 0.22;

export const BAYER8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
] as const;

export function lumaOf(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function isSkyPixel(r: number, g: number, b: number): boolean {
  const luma = lumaOf(r, g, b);
  const blueBias = b - Math.max(r, g);
  if (blueBias > 10 && luma > 95) return true;
  if (luma > 208 && Math.abs(r - g) < 22 && Math.abs(g - b) < 28) return true;
  return false;
}

export function isFoliagePixel(r: number, g: number, b: number): boolean {
  return g > r + 16 && g > b + 6 && g > 70;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x >= edge1 ? 1 : 0;
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function inkRgb(): readonly [number, number, number] {
  const h = DALLAS_MARK_INK.replace("#", "");
  return [
    Number.parseInt(h.slice(0, 2), 16),
    Number.parseInt(h.slice(2, 4), 16),
    Number.parseInt(h.slice(4, 6), 16),
  ];
}

/**
 * In-place Bayer dither of a skyline crop to ink on transparent paper.
 * Sky and foliage become paper. Structure (including pale Reunion Tower)
 * dithers to ink. Top rows fade into the field.
 */
export function ditherHorizonImageData(
  pixels: { data: Uint8ClampedArray; width: number; height: number },
  topFade = HORIZON_TOP_FADE,
): void {
  const { data, width, height } = pixels;
  const [ir, ig, ib] = inkRgb();

  for (let y = 0; y < height; y += 1) {
    const fade = smoothstep(0, topFade, y / Math.max(1, height - 1));
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      const a = data[i + 3]!;

      if (a < 8 || fade <= 0.002 || isSkyPixel(r, g, b) || isFoliagePixel(r, g, b)) {
        data[i + 3] = 0;
        continue;
      }

      const luma = lumaOf(r, g, b);
      // Pale structures (Reunion Tower ball) still occupy; dark towers go solid.
      const occupancy = Math.min(1, Math.max(0.42, 1 - luma / 255)) * fade;
      const threshold = (BAYER8[y & 7]![x & 7]! + 0.5) / 64;
      if (occupancy < threshold) {
        data[i + 3] = 0;
        continue;
      }
      data[i] = ir;
      data[i + 1] = ig;
      data[i + 2] = ib;
      data[i + 3] = 255;
    }
  }
}

export function stampHorizon(img: HTMLImageElement): HTMLCanvasElement {
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  const processW = Math.min(HORIZON_PROCESS_WIDTH, srcW);
  const processH = Math.max(1, Math.round((srcH / srcW) * processW));
  const src = document.createElement("canvas");
  src.width = processW;
  src.height = processH;
  const sctx = src.getContext("2d");
  if (!sctx) return src;
  sctx.drawImage(img, 0, 0, processW, processH);

  const cropY = Math.round(processH * SKYLINE_CROP_TOP);
  const cropH = Math.max(1, Math.round(processH * (SKYLINE_CROP_BOTTOM - SKYLINE_CROP_TOP)));
  const crop = document.createElement("canvas");
  crop.width = processW;
  crop.height = cropH;
  const cctx = crop.getContext("2d");
  if (!cctx) return crop;
  cctx.drawImage(src, 0, cropY, processW, cropH, 0, 0, processW, cropH);
  const pixels = cctx.getImageData(0, 0, processW, cropH);
  ditherHorizonImageData(pixels);
  cctx.putImageData(pixels, 0, 0);
  return crop;
}

/** Full-width, bottom-sitting blit. Uniform scale — not mapped onto the globe. */
export function drawDallasHorizon(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  plate: HTMLCanvasElement,
) {
  const destW = width;
  const destH = destW * (plate.height / plate.width);
  const dx = 0;
  const dy = height - destH;
  ctx.drawImage(plate, dx, dy, destW, destH);
}
