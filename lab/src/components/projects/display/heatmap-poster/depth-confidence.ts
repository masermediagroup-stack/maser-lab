import { DEPTH_VARIANCE_MIN } from "./constants";

/**
 * Coarse-scale variance: downsample into blockSize×blockSize blocks via
 * averaging, then compute CV² on the block means. Per-pixel noise
 * (film grain, JPEG artifacts, dither) averages out inside each block,
 * so only structure at subject scale inflates the variance.
 */
const BLOCK_SIZE = 8;

function coarseBlockMeans(
  depth: Float32Array,
  w: number,
  h: number,
): Float32Array {
  const bw = Math.max(1, Math.floor(w / BLOCK_SIZE));
  const bh = Math.max(1, Math.floor(h / BLOCK_SIZE));
  const means = new Float32Array(bw * bh);
  for (let by = 0; by < bh; by++) {
    for (let bx = 0; bx < bw; bx++) {
      let sum = 0;
      let count = 0;
      const y0 = by * BLOCK_SIZE;
      const x0 = bx * BLOCK_SIZE;
      const y1 = Math.min(h, y0 + BLOCK_SIZE);
      const x1 = Math.min(w, x0 + BLOCK_SIZE);
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const v = depth[y * w + x];
          if (v !== undefined && Number.isFinite(v)) {
            sum += v;
            count++;
          }
        }
      }
      means[by * bw + bx] = count > 0 ? sum / count : 0;
    }
  }
  return means;
}

/**
 * Spread test: population variance of mean-normalized depth,
 * measured at coarse block scale so per-pixel noise cannot inflate it.
 * Var(blockMean / globalMean). Scale-invariant.
 */
export function depthFieldVariance(depth: Float32Array, w?: number, h?: number): number {
  const n = depth.length;
  if (n < 16) return 0;

  const fieldW = w ?? Math.round(Math.sqrt(n));
  const fieldH = h ?? Math.round(n / fieldW);
  const blocks = coarseBlockMeans(depth, fieldW, fieldH);
  const bn = blocks.length;
  if (bn < 4) return 0;

  let sum = 0;
  for (let i = 0; i < bn; i++) sum += blocks[i]!;
  const mean = sum / bn;
  if (!(Math.abs(mean) > 1e-8)) return 0;
  let acc = 0;
  for (let i = 0; i < bn; i++) {
    const d = blocks[i]! / mean - 1;
    acc += d * d;
  }
  return acc / bn;
}

export function isDepthFieldConfident(depth: Float32Array, w?: number, h?: number): boolean {
  return depthFieldVariance(depth, w, h) >= DEPTH_VARIANCE_MIN;
}
