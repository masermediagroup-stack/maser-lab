import { FIELD_PACK_INNER, FIELD_PACK_MAX } from "./constants";
import type { PackedMask } from "./types";

/** Paper heatmap preprocess inner size (their default is 1000). */
const PACK_SIZE = FIELD_PACK_INNER;

/**
 * Paper pads by ceil(maxBlur * 2.5) so the outer glow isn’t clipped.
 * maxBlur = floor(size * 0.15).
 */
function packPadding(size: number): number {
  const maxBlur = Math.floor(size * 0.15);
  return Math.ceil(maxBlur * 2.5);
}

/** Empty field: white = no ink = heat 0 = Ground. */
export function emptyPack(): PackedMask {
  return {
    width: 1,
    height: 1,
    pixels: new Uint8ClampedArray([255, 255, 255, 255]),
    frame: null,
  };
}

export type ImageKind = "logo" | "photo";

export type Raster = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
};

function createRaster(width: number, height: number): Raster {
  return { data: new Uint8ClampedArray(width * height * 4), width, height };
}

/**
 * Logo = few quantized colors and/or a real alpha cutout.
 * Photo = the rest. Photos must become ink-on-Ground before the pack;
 * logos already are a shape (alpha or dark ink).
 */
export function classifyImageKind(image: Raster): ImageKind {
  const { data, width, height } = image;
  const n = width * height;
  if (n === 0) return "logo";

  let transparent = 0;
  let opaque = 0;
  const colors = new Set<number>();
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3] ?? 0;
    if (a < 24) {
      transparent += 1;
      continue;
    }
    opaque += 1;
    const r = (data[i] ?? 0) >> 4;
    const g = (data[i + 1] ?? 0) >> 4;
    const b = (data[i + 2] ?? 0) >> 4;
    colors.add((r << 8) | (g << 4) | b);
    if (colors.size > 48) break;
  }

  const alphaCutout = n > 0 && transparent / n > 0.12 && opaque > 16;
  if (alphaCutout) return "logo";
  if (colors.size > 0 && colors.size <= 24 && opaque > 16) return "logo";
  return "photo";
}

function luma(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** Logo: the mark is the shape. Transparent → paper; remaining dark/alpha → ink. */
export function silhouetteLogo(image: Raster): Raster {
  const out = createRaster(image.width, image.height);
  const src = image.data;
  const dst = out.data;
  for (let i = 0; i < src.length; i += 4) {
    const a = src[i + 3] ?? 0;
    const r = src[i] ?? 0;
    const g = src[i + 1] ?? 0;
    const b = src[i + 2] ?? 0;
    const ink = a >= 30 && luma(r, g, b) < 248;
    const v = ink ? 0 : 255;
    dst[i] = v;
    dst[i + 1] = v;
    dst[i + 2] = v;
    dst[i + 3] = 255;
  }
  return out;
}

function colorDist(
  r: number,
  g: number,
  b: number,
  mr: number,
  mg: number,
  mb: number,
): number {
  const dr = r - mr;
  const dg = g - mg;
  const db = b - mb;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Photo: SILHOUETTE FIRST. Flood from the border (pixels like the frame
 * are Ground/paper). Remainder is solid ink. Never pack JPEG texture.
 * If the flood eats the frame (full-bleed), the plate itself is the stamp.
 */
export function silhouettePhoto(image: Raster): Raster {
  const { width: w, height: h, data } = image;
  const n = w * h;
  const out = createRaster(w, h);
  if (n === 0) return out;

  let br = 0;
  let bg = 0;
  let bb = 0;
  let count = 0;
  const add = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    br += data[i] ?? 0;
    bg += data[i + 1] ?? 0;
    bb += data[i + 2] ?? 0;
    count += 1;
  };
  for (let x = 0; x < w; x += 1) {
    add(x, 0);
    add(x, h - 1);
  }
  for (let y = 1; y < h - 1; y += 1) {
    add(0, y);
    add(w - 1, y);
  }
  const mr = count > 0 ? br / count : 255;
  const mg = count > 0 ? bg / count : 255;
  const mb = count > 0 ? bb / count : 255;
  const thresh = 42;

  const visited = new Uint8Array(n);
  const stack: number[] = [];
  const tryPush = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (visited[p]) return;
    const i = p * 4;
    if (
      colorDist(data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0, mr, mg, mb) >
      thresh
    ) {
      return;
    }
    visited[p] = 1;
    stack.push(p);
  };

  for (let x = 0; x < w; x += 1) {
    tryPush(x, 0);
    tryPush(x, h - 1);
  }
  for (let y = 1; y < h - 1; y += 1) {
    tryPush(0, y);
    tryPush(w - 1, y);
  }

  while (stack.length > 0) {
    const p = stack.pop() ?? 0;
    const x = p % w;
    const y = (p / w) | 0;
    tryPush(x - 1, y);
    tryPush(x + 1, y);
    tryPush(x, y - 1);
    tryPush(x, y + 1);
  }

  let ink = 0;
  const dst = out.data;
  for (let p = 0; p < n; p += 1) {
    const isInk = visited[p] === 0;
    if (isInk) ink += 1;
    const v = isInk ? 0 : 255;
    const i = p * 4;
    dst[i] = v;
    dst[i + 1] = v;
    dst[i + 2] = v;
    dst[i + 3] = 255;
  }

  if (ink / n < 0.005) {
    for (let i = 0; i < dst.length; i += 4) {
      dst[i] = 0;
      dst[i + 1] = 0;
      dst[i + 2] = 0;
      dst[i + 3] = 255;
    }
  }

  return out;
}

function clampInt(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function boxBlurGray(
  src: Uint8Array,
  w: number,
  h: number,
  radius: number,
  passes: number,
): Uint8Array {
  const r = Math.max(0, Math.round(radius));
  let cur = src;
  for (let p = 0; p < passes; p += 1) {
    cur = boxBlurPass(cur, w, h, r);
  }
  return cur;
}

function boxBlurPass(
  src: Uint8Array,
  w: number,
  h: number,
  radius: number,
): Uint8Array {
  if (radius <= 0) return src.slice();
  const window = radius * 2 + 1;
  const tmp = new Uint8Array(w * h);
  const out = new Uint8Array(w * h);

  for (let y = 0; y < h; y += 1) {
    const row = y * w;
    let sum = 0;
    for (let x = -radius; x <= radius; x += 1) {
      sum += src[row + clampInt(x, 0, w - 1)] ?? 0;
    }
    for (let x = 0; x < w; x += 1) {
      tmp[row + x] = Math.round(sum / window);
      const leave = src[row + clampInt(x - radius, 0, w - 1)] ?? 0;
      const enter = src[row + clampInt(x + radius + 1, 0, w - 1)] ?? 0;
      sum += enter - leave;
    }
  }

  for (let x = 0; x < w; x += 1) {
    let sum = 0;
    for (let y = -radius; y <= radius; y += 1) {
      sum += tmp[clampInt(y, 0, h - 1) * w + x] ?? 0;
    }
    for (let y = 0; y < h; y += 1) {
      out[y * w + x] = Math.round(sum / window);
      const leave = tmp[clampInt(y - radius, 0, h - 1) * w + x] ?? 0;
      const enter = tmp[clampInt(y + radius + 1, 0, h - 1) * w + x] ?? 0;
      sum += enter - leave;
    }
  }

  return out;
}

function lumaPlane(image: Raster): Uint8Array {
  const { data, width, height } = image;
  const gray = new Uint8Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    gray[p] = Math.round(
      luma(data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0),
    );
  }
  return gray;
}

/**
 * Paper’s CPU pack: white paper, contained silhouette, then
 * R = contour blur, G = outer/big blur, B = inner blur.
 * Run once per image. The shader reads this pack.
 */
export function packHeatmapField(silhouette: Raster): PackedMask {
  const padding = packPadding(PACK_SIZE);
  const size = Math.min(PACK_SIZE + padding * 2, FIELD_PACK_MAX);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return emptyPack();

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  const sw = Math.max(1, silhouette.width);
  const sh = Math.max(1, silhouette.height);
  const inner = PACK_SIZE;
  const scale = Math.min(inner / sw, inner / sh);
  const dw = Math.max(1, Math.round(sw * scale));
  const dh = Math.max(1, Math.round(sh * scale));
  const dx = Math.round((size - dw) / 2);
  const dy = Math.round((size - dh) / 2);

  const tmp = document.createElement("canvas");
  tmp.width = sw;
  tmp.height = sh;
  const tctx = tmp.getContext("2d");
  if (!tctx) return emptyPack();
  const stamp = tctx.createImageData(sw, sh);
  stamp.data.set(silhouette.data);
  tctx.putImageData(stamp, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(tmp, dx, dy, dw, dh);

  const drawn = ctx.getImageData(0, 0, size, size);
  const gray = lumaPlane(drawn);
  const maxBlur = Math.floor(PACK_SIZE * 0.15);
  const innerBlur = Math.max(1, Math.round(0.12 * maxBlur));

  const contour = boxBlurGray(gray, size, size, 5, 1);
  const outer = boxBlurGray(gray, size, size, maxBlur, 3);
  const innerG = boxBlurGray(gray, size, size, innerBlur, 3);

  const data = new Uint8ClampedArray(size * size * 4);
  for (let i = 0, p = 0; i < contour.length; i += 1, p += 4) {
    data[p] = contour[i] ?? 255;
    data[p + 1] = outer[i] ?? 255;
    data[p + 2] = innerG[i] ?? 255;
    data[p + 3] = 255;
  }

  return { width: size, height: size, pixels: data, frame: null };
}

function sourceSize(source: CanvasImageSource): { w: number; h: number } {
  if ("naturalWidth" in source && typeof source.naturalWidth === "number") {
    return {
      w: Math.max(1, source.naturalWidth),
      h: Math.max(1, source.naturalHeight),
    };
  }
  if ("width" in source && typeof source.width === "number") {
    return { w: Math.max(1, source.width), h: Math.max(1, source.height as number) };
  }
  return { w: 1, h: 1 };
}

function sourceToRaster(source: CanvasImageSource): Raster {
  const { w: sw, h: sh } = sourceSize(source);
  const scale = Math.min(1, PACK_SIZE / Math.max(sw, sh));
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return createRaster(1, 1);
  ctx.drawImage(source, 0, 0, w, h);
  const drawn = ctx.getImageData(0, 0, w, h);
  return { data: drawn.data, width: w, height: h };
}

/** Decode → silhouette (logo ink or photo stamp) → Paper RGB pack. Once per image. */
export function packImageField(source: CanvasImageSource): PackedMask {
  const image = sourceToRaster(source);
  const kind = classifyImageKind(image);
  const silhouette =
    kind === "logo" ? silhouetteLogo(image) : silhouettePhoto(image);
  return packHeatmapField(silhouette);
}
