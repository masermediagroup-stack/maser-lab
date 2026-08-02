/**
 * Lightweight 2D value noise + FBM for organic liquid edge displacement.
 * Deterministic, no allocations in hot path when using precomputed tables.
 */

function fract(n: number): number {
  return n - Math.floor(n);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Hash-based 2D gradient noise in [-1, 1]. */
export function noise2D(x: number, y: number, seed = 0): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const hash = (i: number, j: number) => {
    const h =
      Math.sin((i + seed * 127.1) * 12.9898 + (j + seed * 311.7) * 78.233) *
      43758.5453;
    return fract(h) * 2 - 1;
  };

  const n00 = hash(ix, iy);
  const n10 = hash(ix + 1, iy);
  const n01 = hash(ix, iy + 1);
  const n11 = hash(ix + 1, iy + 1);

  const ux = smoothstep(fx);
  const uy = smoothstep(fy);

  const nx0 = lerp(n00, n10, ux);
  const nx1 = lerp(n01, n11, ux);
  return lerp(nx0, nx1, uy);
}

/** Fractal Brownian motion — layered noise for turbulent liquid edges. */
export function fbm(
  x: number,
  y: number,
  options: {
    octaves?: number;
    lacunarity?: number;
    gain?: number;
    seed?: number;
    turbulence?: number;
  } = {},
): number {
  const {
    octaves = 4,
    lacunarity = 2,
    gain = 0.5,
    seed = 0,
    turbulence = 1,
  } = options;

  let amplitude = 1;
  let frequency = 1;
  let sum = 0;
  let norm = 0;

  for (let i = 0; i < octaves; i++) {
    const n = noise2D(x * frequency, y * frequency, seed + i * 17.3);
    sum += n * amplitude;
    norm += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }

  const value = norm > 0 ? sum / norm : 0;
  return value * turbulence;
}
