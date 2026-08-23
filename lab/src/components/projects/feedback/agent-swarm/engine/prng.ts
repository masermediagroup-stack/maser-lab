/** Deterministic 32-bit string hash (FNV-1a). */
export function hashSeed(seed: string | number): number {
  const text = String(seed);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Mulberry32 — same seed always yields the same sequence. */
export function createPrng(seed: string | number): () => number {
  let state = hashSeed(seed) || 1;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createCyclePrng(seed: string | number, cycleIndex: number): () => number {
  return createPrng(`${seed}:${cycleIndex}`);
}

export function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function pickIndex(rng: () => number, length: number): number {
  if (length <= 0) return 0;
  return Math.min(length - 1, Math.floor(rng() * length));
}

export function pickWeighted(weights: number[], rng: () => number): number {
  const total = weights.reduce((sum, w) => sum + Math.max(0, w), 0);
  if (total <= 0) return pickIndex(rng, weights.length);
  let cursor = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    cursor -= Math.max(0, weights[i] ?? 0);
    if (cursor <= 0) return i;
  }
  return weights.length - 1;
}
