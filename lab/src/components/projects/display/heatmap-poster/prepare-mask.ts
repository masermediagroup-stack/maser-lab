import { HEATMAP_GROUND, PACK_MAX } from "./constants";
import { applyLumaMass, applyNearFieldMass, type SubjectMassReport } from "./subject-mass";
import { heatmapTrace } from "./trace";
import type { FocalPoint, PackedMask } from "./types";

export type { FocalPoint, SubjectMassReport };

export function coverCrop(
  srcW: number,
  srcH: number,
  aspect: number,
  focal?: FocalPoint,
): { sx: number; sy: number; sw: number; sh: number } {
  const fx = focal?.cx ?? 0.5;
  const fy = focal?.cy ?? 0.5;
  const srcAspect = srcW / srcH;
  if (srcAspect > aspect) {
    const sw = srcH * aspect;
    const idealX = fx * srcW - sw / 2;
    const sx = Math.max(0, Math.min(srcW - sw, idealX));
    return { sx, sy: 0, sw, sh: srcH };
  }
  const sh = srcW / aspect;
  const idealY = fy * srcH - sh / 2;
  const sy = Math.max(0, Math.min(srcH - sh, idealY));
  return { sx: 0, sy, sw: srcW, sh };
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

function readLumaAndFind(
  data: Uint8ClampedArray,
  w: number,
  h: number,
): { luma: Float32Array; find: Float32Array } {
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
  const find = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const unlikeBorder = Math.abs((luma[i] ?? 0) - borderMean);
    const e = Math.min(1, (edge[i] ?? 0) * 2.2);
    find[i] = Math.min(1, unlikeBorder * 1.6 + e * 0.55);
  }
  return { luma, find };
}

export type FullSubjectRead = {
  subject: Float32Array;
  labels: Int32Array;
  width: number;
  height: number;
  centroid: FocalPoint;
  report: SubjectMassReport;
};

/**
 * Run the luma find-field + subject-mass rule on the FULL image (no crop).
 * Focal point is the winner centroid. The find field is never the ramp.
 */
export function readFullSubject(
  image: CanvasImageSource,
  srcW: number,
  srcH: number,
): FullSubjectRead {
  const { width, height } = packSize(srcW, srcH);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    const empty = new Float32Array(width * height);
    return {
      subject: empty,
      labels: new Int32Array(width * height),
      width,
      height,
      centroid: { cx: 0.5, cy: 0.5 },
      report: {
        path: "luma-empty",
        winner: null,
        blobs: [],
        dropped: [],
        fallbackFired: false,
        band: null,
      },
    };
  }
  ctx.fillStyle = `rgb(${Math.round(HEATMAP_GROUND[0] * 255)} ${Math.round(HEATMAP_GROUND[1] * 255)} ${Math.round(HEATMAP_GROUND[2] * 255)})`;
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);
  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, width, height).data;
  } catch (err) {
    heatmapTrace("luma:getImageData:fail", {
      message: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
  const { luma, find } = readLumaAndFind(data, width, height);
  const mass = applyLumaMass(find, luma, width, height);
  heatmapTrace("mass:luma", {
    path: mass.report.path,
    area: mass.report.winner?.area ?? 0,
    compactness: mass.report.winner?.compactness ?? 0,
    frameContact: mass.report.winner?.frameContact ?? 0,
    cx: mass.centroid.cx,
    cy: mass.centroid.cy,
    fallbackFired: mass.report.fallbackFired,
    blobCount: mass.report.blobs.length,
    droppedCount: mass.report.dropped.length,
  });
  return {
    subject: mass.field,
    labels: mass.labels,
    width,
    height,
    centroid: mass.centroid,
    report: mass.report,
  };
}

/** Crop a cached mass field. Never re-runs unlike-border on the crop. */
export function packSubjectField(
  field: Float32Array,
  fieldW: number,
  fieldH: number,
  aspect: number,
  focal?: FocalPoint,
): PackedMask {
  const crop = coverCrop(fieldW, fieldH, aspect, focal);
  const { width, height } = packSize(crop.sw, crop.sh);
  const subject = new Float32Array(width * height);
  const xScale = crop.sw / width;
  const yScale = crop.sh / height;
  for (let y = 0; y < height; y++) {
    const sy = Math.min(fieldH - 1, Math.floor(crop.sy + (y + 0.5) * yScale));
    for (let x = 0; x < width; x++) {
      const sx = Math.min(fieldW - 1, Math.floor(crop.sx + (x + 0.5) * xScale));
      subject[y * width + x] = field[sy * fieldW + sx] ?? 0;
    }
  }
  return packChannels(subject, width, height);
}

export function readFullDepthMass(
  depth: Float32Array,
  depthW: number,
  depthH: number,
): FullSubjectRead & { crowned: boolean } {
  const oriented = depth.slice();
  orientNearHot(oriented, depthW, depthH);
  const mass = applyNearFieldMass(oriented, depthW, depthH);
  heatmapTrace("mass:depth", {
    path: mass.report.path,
    crowned: mass.crowned,
    band: mass.report.band,
    area: mass.report.winner?.area ?? 0,
    compactness: mass.report.winner?.compactness ?? 0,
    cx: mass.centroid.cx,
    cy: mass.centroid.cy,
  });
  return {
    subject: mass.field,
    labels: mass.labels,
    width: depthW,
    height: depthH,
    centroid: mass.centroid,
    report: mass.report,
    crowned: mass.crowned,
  };
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
