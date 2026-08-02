/** Hash-based grain for Canvas2D fallback and documentation of Stage 7. */
export function grainHash(x: number, y: number, t: number, seed: number): number {
  const n =
    Math.sin(x * 12.9898 + y * 78.233 + t * 45.164 + seed * 91.17) * 43758.5453;
  return n - Math.floor(n);
}
