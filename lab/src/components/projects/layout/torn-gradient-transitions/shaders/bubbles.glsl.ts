/**
 * Bubble field: jittered Voronoi spherical caps with per-cell radius variation,
 * smooth merging, and an **analytic** surface gradient.
 *
 * For a cap of radius `r` centred at site `c`, height is
 *   h(p) = sqrt(r² − |p − c|²)
 * so the gradient is
 *   ∇h = −(p − c) / h
 * The Voronoi pass already returns the winning offset, which means normals come
 * for free instead of costing three extra height taps.
 *
 * Two caps are tracked (winner + runner-up) so merging can blend both the
 * height and the gradient with the same weight, producing a soft crease where
 * neighbouring bubbles meet instead of a hard intersection.
 */
export const BUBBLES_CHUNK = /* glsl */ `
// Returns: .x height (0..~1), .yz gradient in cell space, .w winning cell id.
vec4 bubbleField(vec2 p, float variation, float mergeAmount, float radiusScale) {
  vec2 cell = floor(p);
  vec2 local = fract(p);

  float bestH = 0.0;
  vec2 bestQ = vec2(0.0);
  float bestR = 0.5;
  float bestId = 0.0;

  float secondH = 0.0;
  vec2 secondQ = vec2(0.0);
  float secondR = 0.5;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 rnd = hash22(cell + g);

      // Strong jitter keeps the lattice from reading as a repeated grid.
      vec2 site = g + 0.5 + (rnd - 0.5) * 0.92;

      // Per-cell radius: wide spread so no two neighbours match.
      float rid = hash21(cell + g + 7.31);
      float r = mix(0.30, 1.02, rid) * radiusScale;
      r *= mix(1.0, mix(0.45, 1.45, hash21(cell + g + 41.7)), variation);

      // Mild per-cell anisotropy — bubbles read as squashed, not stamped.
      vec2 q = local - site;
      float squash = mix(1.0, mix(0.72, 1.38, rnd.y), variation * 0.85);
      q.y *= squash;

      float d2 = dot(q, q);
      float capSq = r * r - d2;
      // Branchless guard rather than a continue: ESSL 1.00 restricts loop
      // control flow, and this keeps the shader portable to WebGL1 fallbacks.
      float capH = capSq > 0.0 ? sqrt(capSq) : 0.0;

      if (capH > bestH) {
        secondH = bestH;
        secondQ = bestQ;
        secondR = bestR;
        bestH = capH;
        bestQ = q;
        bestR = r;
        bestId = rid;
      } else if (capH > secondH) {
        secondH = capH;
        secondQ = q;
        secondR = r;
      }
    }
  }

  if (bestH <= 0.0) {
    return vec4(0.0, 0.0, 0.0, 0.0);
  }

  // Smooth-max between the top two caps. k = 0 gives a hard intersection
  // crease; larger k inflates the joint until neighbours read as merged.
  float k = max(mergeAmount * 0.55, 1e-4);
  float w = clamp(0.5 + 0.5 * (bestH - secondH) / k, 0.0, 1.0);
  float h = mix(secondH, bestH, w) + k * w * (1.0 - w);

  // Clamp the divisor so the near-vertical bubble rim stays finite. The
  // remaining steepness is what produces the bright raised highlight.
  vec2 gBest = -bestQ / max(bestH, 0.14 * bestR);
  vec2 gSecond = -secondQ / max(secondH, 0.14 * secondR);
  vec2 grad = mix(gSecond, gBest, w);

  return vec4(h, grad, bestId);
}
`;
