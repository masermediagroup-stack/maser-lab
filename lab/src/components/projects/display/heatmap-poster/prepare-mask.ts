import { FORMAT_ASPECT, HEATMAP_GROUND, PACK_MAX } from "./constants";
import type { HeatmapFormat, PackedMask } from "./types";

export function coverCrop(
  srcW: number,
  srcH: number,
  aspect: number,
): { sx: number; sy: number; sw: number; sh: number } {
  const srcAspect = srcW / srcH;
  if (srcAspect > aspect) {
    const sw = srcH * aspect;
    return { sx: (srcW - sw) / 2, sy: 0, sw, sh: srcH };
  }
  const sh = srcW / aspect;
  return { sx: 0, sy: (srcH - sh) / 2, sw: srcW, sh };
}

function packSize(cropW: number, cropH: number): { width: number; height: number } {
  const scale = PACK_MAX / Math.max(cropW, cropH);
  const width = Math.max(1, Math.round(cropW * Math.min(1, scale)));
  const height = Math.max(1, Math.round(cropH * Math.min(1, scale)));
  return { width, height };
}

function integralImage(src: Float32Array, w: number, h: number): Float64Array {
  const stride = w + 1;
  const ii = new Float64Array(stride * (h + 1));
  for (let y = 0; y < h; y++) {
    let row = 0;
    for (let x = 0; x < w; x++) {
      row += src[y * w + x] ?? 0;
      ii[(y + 1) * stride + (x + 1)] = (ii[y * stride + (x + 1)] ?? 0) + row;
    }
  }
  return ii;
}

function boxBlur(ii: Float64Array, w: number, h: number, radius: number): Float32Array {
  const out = new Float32Array(w * h);
  const stride = w + 1;
  const r = Math.max(1, radius);
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - r);
    const y1 = Math.min(h, y + r + 1);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - r);
      const x1 = Math.min(w, x + r + 1);
      const sum =
        (ii[y1 * stride + x1] ?? 0) -
        (ii[y0 * stride + x1] ?? 0) -
        (ii[y1 * stride + x0] ?? 0) +
        (ii[y0 * stride + x0] ?? 0);
      const area = (x1 - x0) * (y1 - y0) || 1;
      out[y * w + x] = sum / area;
    }
  }
  return out;
}

function sobelMag(src: Float32Array, w: number, h: number): Float32Array {
  const out = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const tl = src[(y - 1) * w + (x - 1)] ?? 0;
      const tc = src[(y - 1) * w + x] ?? 0;
      const tr = src[(y - 1) * w + (x + 1)] ?? 0;
      const ml = src[y * w + (x - 1)] ?? 0;
      const mr = src[y * w + (x + 1)] ?? 0;
      const bl = src[(y + 1) * w + (x - 1)] ?? 0;
      const bc = src[(y + 1) * w + x] ?? 0;
      const br = src[(y + 1) * w + (x + 1)] ?? 0;
      const gx = -tl + tr - 2 * ml + 2 * mr - bl + br;
      const gy = -tl - 2 * tc - tr + bl + 2 * bc + br;
      out[y * w + x] = Math.hypot(gx, gy);
    }
  }
  return out;
}

function hotFrame(mask: Float32Array, w: number, h: number): PackedMask["frame"] {
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  let found = false;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if ((mask[y * w + x] ?? 0) < 0.35) continue;
      found = true;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (!found) return null;
  const padX = (maxX - minX + 1) * 0.04;
  const padY = (maxY - minY + 1) * 0.04;
  const x = Math.max(0, minX - padX) / w;
  const y = Math.max(0, minY - padY) / h;
  const x2 = Math.min(w, maxX + 1 + padX) / w;
  const y2 = Math.min(h, maxY + 1 + padY) / h;
  return { x, y, w: x2 - x, h: y2 - y };
}

function packChannels(subject: Float32Array, w: number, h: number): PackedMask {
  const ii = integralImage(subject, w, h);
  const contour = boxBlur(ii, w, h, Math.max(1, Math.round(Math.min(w, h) * 0.012)));
  const outer = boxBlur(ii, w, h, Math.max(2, Math.round(Math.min(w, h) * 0.06)));
  const inner = boxBlur(ii, w, h, Math.max(1, Math.round(Math.min(w, h) * 0.022)));
  const edge = sobelMag(subject, w, h);
  const pixels = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const e = Math.min(1, (edge[i] ?? 0) * 1.8);
    const r = Math.min(1, Math.max(contour[i] ?? 0, e));
    pixels[i * 4] = Math.round(r * 255);
    pixels[i * 4 + 1] = Math.round(Math.min(1, outer[i] ?? 0) * 255);
    pixels[i * 4 + 2] = Math.round(Math.min(1, inner[i] ?? 0) * 255);
    pixels[i * 4 + 3] = 255;
  }
  return { width: w, height: h, pixels, frame: hotFrame(subject, w, h) };
}

function lumaEdgeSubject(data: Uint8ClampedArray, w: number, h: number): Float32Array {
  const luma = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = (data[i * 4] ?? 0) / 255;
    const g = (data[i * 4 + 1] ?? 0) / 255;
    const b = (data[i * 4 + 2] ?? 0) / 255;
    luma[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  const margin = Math.max(2, Math.floor(Math.min(w, h) * 0.08));
  let border = 0;
  let bc = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x >= margin && y >= margin && x < w - margin && y < h - margin) continue;
      border += luma[y * w + x] ?? 0;
      bc += 1;
    }
  }
  const borderMean = bc > 0 ? border / bc : 0.5;
  const edge = sobelMag(luma, w, h);
  const subject = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const unlikeBorder = Math.abs((luma[i] ?? 0) - borderMean);
    const e = Math.min(1, (edge[i] ?? 0) * 2.2);
    subject[i] = Math.min(1, unlikeBorder * 1.6 + e * 0.55);
  }
  return subject;
}

function sampleImage(
  image: CanvasImageSource,
  srcW: number,
  srcH: number,
  format: HeatmapFormat,
): { data: Uint8ClampedArray; width: number; height: number } {
  const crop = coverCrop(srcW, srcH, FORMAT_ASPECT[format]);
  const { width, height } = packSize(crop.sw, crop.sh);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return { data: new Uint8ClampedArray(width * height * 4), width, height };
  }
  ctx.fillStyle = `rgb(${Math.round(HEATMAP_GROUND[0] * 255)} ${Math.round(HEATMAP_GROUND[1] * 255)} ${Math.round(HEATMAP_GROUND[2] * 255)})`;
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, height);
  return { data: ctx.getImageData(0, 0, width, height).data, width, height };
}

export function packFallbackFromImage(
  image: CanvasImageSource,
  srcW: number,
  srcH: number,
  format: HeatmapFormat,
): PackedMask {
  const sampled = sampleImage(image, srcW, srcH, format);
  const subject = lumaEdgeSubject(sampled.data, sampled.width, sampled.height);
  return packChannels(subject, sampled.width, sampled.height);
}

export function packDepthField(
  depth: Float32Array,
  depthW: number,
  depthH: number,
  format: HeatmapFormat,
): PackedMask {
  const crop = coverCrop(depthW, depthH, FORMAT_ASPECT[format]);
  const { width, height } = packSize(crop.sw, crop.sh);
  const subject = new Float32Array(width * height);
  const xScale = crop.sw / width;
  const yScale = crop.sh / height;
  for (let y = 0; y < height; y++) {
    const sy = Math.min(depthH - 1, Math.floor(crop.sy + (y + 0.5) * yScale));
    for (let x = 0; x < width; x++) {
      const sx = Math.min(depthW - 1, Math.floor(crop.sx + (x + 0.5) * xScale));
      subject[y * width + x] = depth[sy * depthW + sx] ?? 0;
    }
  }
  orientNearHot(subject, width, height);
  return packChannels(subject, width, height);
}

function orientNearHot(depth: Float32Array, w: number, h: number): void {
  const margin = Math.max(2, Math.floor(Math.min(w, h) * 0.08));
  let border = 0;
  let bc = 0;
  let inner = 0;
  let ic = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = depth[y * w + x] ?? 0;
      const isBorder = x < margin || y < margin || x >= w - margin || y >= h - margin;
      if (isBorder) {
        border += v;
        bc += 1;
      } else {
        inner += v;
        ic += 1;
      }
    }
  }
  const invert = bc > 0 && ic > 0 && border / bc > inner / ic;
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < depth.length; i++) {
    const v = invert ? -(depth[i] ?? 0) : (depth[i] ?? 0);
    depth[i] = v;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = max - min;
  if (range < 1e-8) {
    depth.fill(0);
    return;
  }
  for (let i = 0; i < depth.length; i++) {
    depth[i] = ((depth[i] ?? 0) - min) / range;
  }
}

/**
 * Composite an image onto a Ground-filled canvas so transparent regions
 * become Ground and cannot carry heat. Returns an opaque HTMLCanvasElement
 * usable by both the luma+edge fallback and the depth pipeline.
 */
export function flattenOntoGround(
  image: CanvasImageSource,
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = `rgb(${Math.round(HEATMAP_GROUND[0] * 255)} ${Math.round(HEATMAP_GROUND[1] * 255)} ${Math.round(HEATMAP_GROUND[2] * 255)})`;
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);
  }
  return canvas;
}

export function emptyPack(): PackedMask {
  return {
    width: 1,
    height: 1,
    pixels: new Uint8ClampedArray([0, 0, 0, 255]),
    frame: null,
  };
}
