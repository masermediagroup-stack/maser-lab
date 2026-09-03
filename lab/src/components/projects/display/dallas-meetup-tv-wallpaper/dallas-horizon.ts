/**
 * Noun Project Dallas horizon (Blaise Sewell, icon 3583788).
 *
 * Ink silhouette, sit low, behind the globe — never mapped onto the sphere.
 * Not a photograph. Not the teal tourist illustration.
 */

import { DALLAS_MARK_INK } from "./grok-cycle";

export const HORIZON_SRC = "/images/dallas-noun-skyline.svg";
export const HORIZON_NOUN_ID = "3583788";
export const HORIZON_SOURCE_CREDIT =
  "Dallas skyline by Blaise Sewell from Noun Project (3583788).";

/** Short silhouette band in the lower frame. */
export const HORIZON_HEIGHT_FRAC = 0.16;
export const HORIZON_WIDTH_FRAC = 0.92;

function inkRgb(): readonly [number, number, number] {
  const h = DALLAS_MARK_INK.replace("#", "");
  return [
    Number.parseInt(h.slice(0, 2), 16),
    Number.parseInt(h.slice(2, 4), 16),
    Number.parseInt(h.slice(4, 6), 16),
  ];
}

/** Stamp the silhouette to ink on transparent paper. */
export function stampHorizon(img: HTMLImageElement): HTMLCanvasElement {
  const srcW = Math.max(1, img.naturalWidth || img.width);
  const srcH = Math.max(1, img.naturalHeight || img.height);
  const canvas = document.createElement("canvas");
  canvas.width = srcW;
  canvas.height = srcH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.drawImage(img, 0, 0, srcW, srcH);
  const pixels = ctx.getImageData(0, 0, srcW, srcH);
  const [ir, ig, ib] = inkRgb();
  const { data } = pixels;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3]! < 8) continue;
    data[i] = ir;
    data[i + 1] = ig;
    data[i + 2] = ib;
    data[i + 3] = 255;
  }
  ctx.putImageData(pixels, 0, 0);
  return canvas;
}

/** Full-width-ish, bottom-sitting blit. Uniform scale — not mapped onto the globe. */
export function drawDallasHorizon(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  plate: HTMLCanvasElement,
) {
  const destW = width * HORIZON_WIDTH_FRAC;
  const destH = height * HORIZON_HEIGHT_FRAC;
  const dx = (width - destW) * 0.5;
  const dy = height - destH - height * 0.04;
  ctx.drawImage(plate, dx, dy, destW, destH);
}
