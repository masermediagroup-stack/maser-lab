import { DEPTH_VARIANCE_MIN } from "./constants";

/**
 * Spread test: population variance of mean-normalized raw depth.
 * Var(x / mean(x)). Scale-invariant. Not IQR — design.md says low-variance.
 */
export function depthFieldVariance(depth: Float32Array): number {
  const n = depth.length;
  if (n < 16) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const v = depth[i];
    if (v !== undefined && Number.isFinite(v)) sum += v;
  }
  const mean = sum / n;
  if (!(Math.abs(mean) > 1e-8)) return 0;
  let acc = 0;
  for (let i = 0; i < n; i++) {
    const v = depth[i];
    if (v === undefined || !Number.isFinite(v)) continue;
    const d = v / mean - 1;
    acc += d * d;
  }
  return acc / n;
}

export function isDepthFieldConfident(depth: Float32Array): boolean {
  return depthFieldVariance(depth) >= DEPTH_VARIANCE_MIN;
}
