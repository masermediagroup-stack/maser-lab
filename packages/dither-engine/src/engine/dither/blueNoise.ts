/**
 * Generate a small blue-noise-like texture via void-and-cluster approximation.
 * Deterministic given seed. Used as a tiled LUT for optional Stage 3 overlay.
 */

function hash2(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

export const BLUE_NOISE_SIZE = 64;

export function generateBlueNoiseTexture(
  size = BLUE_NOISE_SIZE,
  seed = 0.37,
): Uint8Array {
  const values = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Multi-octave irregular hash → bluish spectrum approximation
      let v = 0;
      let amp = 0.5;
      let freq = 1;
      for (let o = 0; o < 4; o++) {
        const hx = Math.floor(x * freq);
        const hy = Math.floor(y * freq);
        const fx = (x * freq) % 1;
        const fy = (y * freq) % 1;
        const a = hash2(hx, hy, seed + o);
        const b = hash2(hx + 1, hy, seed + o);
        const c = hash2(hx, hy + 1, seed + o);
        const d = hash2(hx + 1, hy + 1, seed + o);
        const ux = fx * fx * (3 - 2 * fx);
        const uy = fy * fy * (3 - 2 * fy);
        const ab = a + (b - a) * ux;
        const cd = c + (d - c) * ux;
        v += (ab + (cd - ab) * uy) * amp;
        amp *= 0.5;
        freq *= 2.1;
      }
      // High-pass bias: subtract local low-frequency
      const low = hash2(Math.floor(x / 8), Math.floor(y / 8), seed + 9);
      values[y * size + x] = v - low * 0.35;
    }
  }

  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < values.length; i++) {
    const v = values[i]!;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = max - min || 1;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const n = Math.round(((values[i]! - min) / range) * 255);
    const o = i * 4;
    data[o] = n;
    data[o + 1] = n;
    data[o + 2] = n;
    data[o + 3] = 255;
  }
  return data;
}

export function sampleBlueNoise(
  data: Uint8Array,
  size: number,
  x: number,
  y: number,
): number {
  const ix = ((Math.floor(x) % size) + size) % size;
  const iy = ((Math.floor(y) % size) + size) % size;
  return (data[(iy * size + ix) * 4] ?? 128) / 255;
}
