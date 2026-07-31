import type { DitherSize } from "../../types";

/** Classic ordered Bayer matrices, normalized to 0…1. */
const BAYER_2 = [
  [0, 2],
  [3, 1],
].map((row) => row.map((v) => (v + 0.5) / 4));

const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16));

const BAYER_8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
].map((row) => row.map((v) => (v + 0.5) / 64));

function expandBayer(src: number[][]): number[][] {
  const n = src.length;
  const out = Array.from({ length: n * 2 }, () => Array<number>(n * 2).fill(0));
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const v = src[y]![x]! * 4;
      out[y]![x] = v;
      out[y]![x + n] = v + 2;
      out[y + n]![x] = v + 3;
      out[y + n]![x + n] = v + 1;
    }
  }
  return out;
}

/** Build Bayer N×N from recursive expand of 2×2 index matrix, then normalize. */
function buildBayer(size: 32 | 64): number[][] {
  let m = [
    [0, 2],
    [3, 1],
  ];
  // 2 → 4 → 8 → 16 → 32 (→ 64)
  const steps = size === 32 ? 4 : 5;
  for (let i = 0; i < steps; i++) m = expandBayer(m);
  const denom = size * size;
  return m.map((row) => row.map((v) => (v + 0.5) / denom));
}

const BAYER_32 = buildBayer(32);
const BAYER_64 = buildBayer(64);

export const BAYER_MATRICES: Record<DitherSize, number[][]> = {
  2: BAYER_2,
  4: BAYER_4,
  8: BAYER_8,
  32: BAYER_32,
  64: BAYER_64,
};

export function getBayerMatrix(size: DitherSize): number[][] {
  return BAYER_MATRICES[size];
}

/** Pack Bayer matrix into RGBA8 texture data (R channel = threshold). */
export function bayerToTextureData(size: DitherSize): Uint8Array {
  const matrix = getBayerMatrix(size);
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const v = Math.round((matrix[y]![x] ?? 0) * 255);
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  return data;
}

export function sampleBayer(
  size: DitherSize,
  px: number,
  py: number,
): number {
  const matrix = getBayerMatrix(size);
  const x = ((Math.floor(px) % size) + size) % size;
  const y = ((Math.floor(py) % size) + size) % size;
  return matrix[y]![x] ?? 0.5;
}
