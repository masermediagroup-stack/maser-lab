import {
  CENTRE_TIEBREAK,
  FLAT_MASS_COMPACTNESS,
  FRAME_CONTACT_MAX,
  NEAR_BAND_STEP,
  NEAR_BAND_THIN_COMPACTNESS,
  NEAR_FIELD_BAND_START,
} from "./constants";
import type { FocalPoint } from "./types";

export type BlobStats = {
  label: number;
  area: number;
  perimeter: number;
  frameEdges: number;
  frameContact: number;
  compactness: number;
  score: number;
  centroid: FocalPoint;
};

export type SubjectMassReport = {
  path: string;
  winner: BlobStats | null;
  blobs: BlobStats[];
  dropped: BlobStats[];
  fallbackFired: boolean;
  skippedFlat: boolean;
  band: number | null;
};

export type SubjectMassResult = {
  field: Float32Array;
  labels: Int32Array;
  centroid: FocalPoint;
  report: SubjectMassReport;
};

const FOUR = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

/** Isoperimetric compactness: 4πA / P². Formula, not a knob. */
export function compactness(area: number, perimeter: number): number {
  if (area <= 0) return 0;
  if (perimeter <= 0) return 1;
  return (4 * Math.PI * area) / (perimeter * perimeter);
}

export function otsuThreshold(values: Float32Array): number {
  const bins = 256;
  const hist = new Float64Array(bins);
  const counted = values.length;
  if (counted < 1) return 1;
  for (let i = 0; i < values.length; i++) {
    const v = Math.min(1, Math.max(0, values[i] ?? 0));
    const b = Math.min(bins - 1, Math.floor(v * (bins - 1)));
    hist[b] += 1;
  }
  let sum = 0;
  for (let i = 0; i < bins; i++) sum += i * (hist[i] ?? 0);
  let sumB = 0;
  let wB = 0;
  let best = 0;
  let bestT = 0;
  for (let t = 0; t < bins; t++) {
    wB += hist[t] ?? 0;
    if (wB === 0) continue;
    const wF = counted - wB;
    if (wF === 0) break;
    sumB += t * (hist[t] ?? 0);
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > best) {
      best = between;
      bestT = t;
    }
  }
  return bestT / (bins - 1);
}

export function binarizeOtsu(field: Float32Array): Uint8Array {
  const t = otsuThreshold(field);
  const out = new Uint8Array(field.length);
  for (let i = 0; i < field.length; i++) {
    out[i] = (field[i] ?? 0) >= t ? 1 : 0;
  }
  return out;
}

export function connectedComponents(
  binary: Uint8Array,
  w: number,
  h: number,
): { labels: Int32Array; blobs: BlobStats[] } {
  const labels = new Int32Array(w * h);
  const blobs: BlobStats[] = [];
  let next = 1;
  const stack: number[] = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const start = y * w + x;
      if ((binary[start] ?? 0) === 0 || labels[start] !== 0) continue;
      const label = next++;
      let area = 0;
      let perimeter = 0;
      let frameEdges = 0;
      let sumX = 0;
      let sumY = 0;
      stack.length = 0;
      stack.push(start);
      labels[start] = label;

      while (stack.length > 0) {
        const i = stack.pop()!;
        const cx = i % w;
        const cy = (i / w) | 0;
        area += 1;
        sumX += cx + 0.5;
        sumY += cy + 0.5;
        for (const [dx, dy] of FOUR) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) {
            perimeter += 1;
            frameEdges += 1;
            continue;
          }
          const ni = ny * w + nx;
          if ((binary[ni] ?? 0) === 0) {
            perimeter += 1;
            continue;
          }
          if (labels[ni] === 0) {
            labels[ni] = label;
            stack.push(ni);
          }
        }
      }

      const c = compactness(area, perimeter);
      blobs.push({
        label,
        area,
        perimeter,
        frameEdges,
        frameContact: perimeter > 0 ? frameEdges / perimeter : 0,
        compactness: c,
        score: area * c,
        centroid: { cx: sumX / area / w, cy: sumY / area / h },
      });
    }
  }

  return { labels, blobs };
}

function dist2ToCentre(c: FocalPoint): number {
  const dx = c.cx - 0.5;
  const dy = c.cy - 0.5;
  return dx * dx + dy * dy;
}

export function pickWinner(
  blobs: BlobStats[],
  opts?: { dropFrameContact?: boolean; frameContactMax?: number; tiebreak?: number },
): { winner: BlobStats | null; dropped: BlobStats[]; fallbackFired: boolean } {
  const drop = opts?.dropFrameContact ?? false;
  const maxContact = opts?.frameContactMax ?? FRAME_CONTACT_MAX;
  const tie = opts?.tiebreak ?? CENTRE_TIEBREAK;
  const dropped = drop ? blobs.filter((b) => b.frameContact >= maxContact) : [];
  let remaining = drop ? blobs.filter((b) => b.frameContact < maxContact) : blobs.slice();
  let fallbackFired = false;
  if (drop && remaining.length === 0 && blobs.length > 0) {
    remaining = blobs.slice();
    fallbackFired = true;
  }
  if (remaining.length === 0) {
    return { winner: null, dropped, fallbackFired };
  }
  remaining.sort((a, b) => b.score - a.score);
  const first = remaining[0]!;
  const second = remaining[1];
  if (second && first.score > 0 && (first.score - second.score) / first.score <= tie) {
    const winner =
      dist2ToCentre(first.centroid) <= dist2ToCentre(second.centroid) ? first : second;
    return { winner, dropped, fallbackFired };
  }
  return { winner: first, dropped, fallbackFired };
}

export function normalizeInsideWinner(
  source: Float32Array,
  labels: Int32Array,
  winnerLabel: number,
): Float32Array {
  const out = new Float32Array(source.length);
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < source.length; i++) {
    if (labels[i] !== winnerLabel) continue;
    const v = source[i] ?? 0;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = max - min;
  if (!Number.isFinite(min) || range < 1e-8) {
    for (let i = 0; i < source.length; i++) {
      out[i] = labels[i] === winnerLabel ? 1 : 0;
    }
    return out;
  }
  for (let i = 0; i < source.length; i++) {
    out[i] = labels[i] === winnerLabel ? ((source[i] ?? 0) - min) / range : 0;
  }
  return out;
}

export function normalizeInsideInk(
  source: Float32Array,
  ink: Uint8Array,
): Float32Array {
  const out = new Float32Array(source.length);
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < source.length; i++) {
    if ((ink[i] ?? 0) === 0) continue;
    const v = source[i] ?? 0;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = max - min;
  if (!Number.isFinite(min) || range < 1e-8) {
    for (let i = 0; i < source.length; i++) {
      out[i] = (ink[i] ?? 0) === 0 ? 0 : 1;
    }
    return out;
  }
  for (let i = 0; i < source.length; i++) {
    out[i] = (ink[i] ?? 0) === 0 ? 0 : ((source[i] ?? 0) - min) / range;
  }
  return out;
}

function inkCentroid(ink: Uint8Array, w: number, h: number): FocalPoint {
  let sumW = 0;
  let sumX = 0;
  let sumY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = ink[y * w + x] ?? 0;
      if (v === 0) continue;
      sumW += 1;
      sumX += x + 0.5;
      sumY += y + 0.5;
    }
  }
  if (sumW < 1) return { cx: 0.5, cy: 0.5 };
  return { cx: sumX / sumW / w, cy: sumY / sumW / h };
}

export function applyLumaMass(
  findField: Float32Array,
  luma: Float32Array,
  w: number,
  h: number,
  ink?: Uint8Array,
): SubjectMassResult {
  const binary = binarizeOtsu(findField);
  const { labels, blobs } = connectedComponents(binary, w, h);
  const { winner, dropped, fallbackFired } = pickWinner(blobs, {
    dropFrameContact: true,
    frameContactMax: FRAME_CONTACT_MAX,
    tiebreak: CENTRE_TIEBREAK,
  });
  if (!winner) {
    return {
      field: new Float32Array(w * h),
      labels,
      centroid: { cx: 0.5, cy: 0.5 },
      report: {
        path: "luma-empty",
        winner: null,
        blobs,
        dropped,
        fallbackFired,
        skippedFlat: false,
        band: null,
      },
    };
  }
  if (winner.compactness < FLAT_MASS_COMPACTNESS) {
    const mask = ink ?? new Uint8Array(w * h).fill(1);
    const field = normalizeInsideInk(findField, mask);
    return {
      field,
      labels,
      centroid: inkCentroid(mask, w, h),
      report: {
        path: "luma-flat-ink",
        winner,
        blobs,
        dropped,
        fallbackFired,
        skippedFlat: true,
        band: null,
      },
    };
  }
  const field = normalizeInsideWinner(luma, labels, winner.label);
  return {
    field,
    labels,
    centroid: winner.centroid,
    report: {
      path: fallbackFired ? "luma-full-bleed-fallback" : "luma-frame-contact",
      winner,
      blobs,
      dropped,
      fallbackFired,
      skippedFlat: false,
      band: null,
    },
  };
}

export function applyNearFieldMass(
  nearHot: Float32Array,
  w: number,
  h: number,
): SubjectMassResult & { crowned: boolean } {
  let band = NEAR_FIELD_BAND_START;
  let last: SubjectMassResult | null = null;

  // Never crown the 100% band: that is the whole field, not a near mass.
  while (band < 1 - 1e-9) {
    const cut = 1 - Math.min(1, band);
    const binary = new Uint8Array(w * h);
    for (let i = 0; i < nearHot.length; i++) {
      binary[i] = (nearHot[i] ?? 0) >= cut ? 1 : 0;
    }
    const { labels, blobs } = connectedComponents(binary, w, h);
    const { winner, dropped, fallbackFired } = pickWinner(blobs, {
      dropFrameContact: false,
      tiebreak: CENTRE_TIEBREAK,
    });
    const path = `near-band-${band.toFixed(2)}`;
    if (winner && winner.compactness >= NEAR_BAND_THIN_COMPACTNESS) {
      const field = normalizeInsideWinner(nearHot, labels, winner.label);
      return {
        field,
        labels,
        centroid: winner.centroid,
        crowned: true,
        report: {
          path,
          winner,
          blobs,
          dropped,
          fallbackFired,
          skippedFlat: false,
          band,
        },
      };
    }
    last = {
      field: new Float32Array(w * h),
      labels,
      centroid: winner?.centroid ?? { cx: 0.5, cy: 0.5 },
      report: {
        path,
        winner,
        blobs,
        dropped,
        fallbackFired,
        skippedFlat: false,
        band,
      },
    };
    const next = band + NEAR_BAND_STEP;
    if (next >= 1) break;
    band = next;
  }

  return {
    field: last?.field ?? new Float32Array(w * h),
    labels: last?.labels ?? new Int32Array(w * h),
    centroid: last?.centroid ?? { cx: 0.5, cy: 0.5 },
    crowned: false,
    report: {
      path: "luma-fallback",
      winner: last?.report.winner ?? null,
      blobs: last?.report.blobs ?? [],
      dropped: last?.report.dropped ?? [],
      fallbackFired: false,
      skippedFlat: false,
      band: 1,
    },
  };
}

const BLOB_COLORS: ReadonlyArray<readonly [number, number, number]> = [
  [80, 80, 90],
  [40, 140, 220],
  [220, 90, 40],
  [60, 180, 90],
  [200, 180, 40],
  [180, 70, 180],
  [40, 200, 200],
  [200, 100, 140],
];

/** Labelled blob map. Winner is yellow; others cycle. Ground is dark. */
export function paintBlobMap(
  labels: Int32Array,
  w: number,
  h: number,
  winnerLabel: number | null,
): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const lab = labels[i] ?? 0;
    const o = i * 4;
    if (lab === 0) {
      pixels[o] = 12;
      pixels[o + 1] = 8;
      pixels[o + 2] = 16;
      pixels[o + 3] = 255;
      continue;
    }
    if (winnerLabel != null && lab === winnerLabel) {
      pixels[o] = 255;
      pixels[o + 1] = 220;
      pixels[o + 2] = 80;
      pixels[o + 3] = 255;
      continue;
    }
    const c = BLOB_COLORS[lab % BLOB_COLORS.length]!;
    pixels[o] = c[0];
    pixels[o + 1] = c[1];
    pixels[o + 2] = c[2];
    pixels[o + 3] = 255;
  }
  return pixels;
}
