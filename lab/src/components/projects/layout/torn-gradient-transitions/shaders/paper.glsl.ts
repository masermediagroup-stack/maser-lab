/**
 * Handmade-paper micro surface.
 *
 * Everything here contributes to a single scalar height so the caller can take
 * one gradient over the whole stack. Amplitudes are deliberately small — this
 * layer supplies the *tooth* of the material; bubbles supply the volume.
 */
export const PAPER_CHUNK = /* glsl */ `
uniform float uFiberAmount;
uniform float uFiberLength;
uniform float uFiberDir;
uniform float uPulpGrain;
uniform float uSpeckle;
uniform float uWrinkleAmount;
uniform float uWrinkleScale;
uniform float uPaperDensity;
uniform float uFoldAmount;

/**
 * Long directional strands. Frequency is low along the fibre axis and high
 * across it, which is what separates "paper fibre" from "digital static".
 */
float fiberLayer(vec2 p) {
  vec2 f = rot2(uFiberDir) * p;
  vec2 q = vec2(f.x * (2.4 / max(uFiberLength, 0.6)), f.y * 26.0);
  float strands = ridged(q) - 0.55;
  float breakup = snoise(q * vec2(3.1, 0.35) + 13.7) * 0.35;
  return (strands + breakup) * 0.5;
}

/** Uneven pulp density — the slow lumpiness of a hand-pulled sheet. */
float pulpLayer(vec2 p) {
  float coarse = fbm(p * 5.5 + 3.1);
  float fine = fbm(p * 21.0 - 8.4) * 0.55;
  return (coarse * 0.62 + fine * 0.38);
}

/** Soft creases. Ridged noise stretched slightly so folds have a bias. */
float wrinkleLayer(vec2 p) {
  vec2 q = p * max(uWrinkleScale, 0.4);
  q = rot2(0.7) * q;
  float w = ridged(vec2(q.x * 0.55, q.y * 1.35)) - 0.58;
  return w;
}

/** Large-scale thickness variation. Reads as backlit density in the gradient. */
float densityLayer(vec2 p) {
  return fbm2(p * 1.9 + 27.4);
}

/** Periodic folds running across the sweep, gated by uFoldAmount. */
float foldLayer(vec2 q) {
  float wob = fbm2(q * 0.55) * 1.6;
  float folds = 1.0 - abs(sin(q.y * 2.3 + wob));
  return (folds - 0.5);
}

/**
 * Combined micro height. p is in aspect-corrected screen space scaled by
 * uTextureScale; q is the same point rotated into the sweep-aligned frame.
 */
float microHeight(vec2 p, vec2 q) {
  float h = 0.0;
  // Uniform-driven branches. They are coherent across the whole draw call, so
  // dialling a layer to zero genuinely removes its cost rather than just its
  // contribution — which matters because this runs three times per pixel.
  if (uFiberAmount > 0.001) h += fiberLayer(p) * uFiberAmount * 0.30;
  if (uPulpGrain > 0.001) h += pulpLayer(p) * uPulpGrain * 0.22;
  if (uWrinkleAmount > 0.001) h += wrinkleLayer(p) * uWrinkleAmount * 0.42;
  if (uPaperDensity > 0.001) h += densityLayer(p) * uPaperDensity * 0.30;
  if (uFoldAmount > 0.001) h += foldLayer(q) * uFoldAmount * 0.38;
  if (uSpeckle > 0.001) h += speckle(p * 62.0, 0.10) * uSpeckle * 0.16;
  return h;
}
`;
