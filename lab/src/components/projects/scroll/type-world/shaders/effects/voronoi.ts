/**
 * Spherical Worley / Voronoi mask — 3D cellular distance on sphereDir.
 *
 * Source: packages/shaders/src/shaders/voronoi.ts (F1 cellular idea + distortion)
 * https://github.com/paper-design/shaders (Apache-2.0)
 * Powered by Paper Shaders: https://shaders.paper.design
 *
 * Paper’s 2D IQ voronoi + noise texture becomes 3×3×3 Worley on
 * `sphereDir * scale` so cells do not jump at the UV wrap.
 * Cell centers wobble with `sin(t + TAU * hash)` like Paper.
 * V1 is a monochrome F1 threshold mask, not a colorful cell visualization.
 */

export const EFFECT_VORONOI_GLSL = /* glsl */ `
vec2 twWorley(vec3 p, float distortion, float t) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  float d = 8.0;
  float cell = 0.0;
  for (int z = -1; z <= 1; z++) {
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec3 g = vec3(float(x), float(y), float(z));
        vec3 h = twHash33(i + g);
        vec3 o = 0.5 + distortion * sin(t + TW_TAU * h);
        vec3 r = g + o - f;
        float dist2 = dot(r, r);
        if (dist2 < d) {
          d = dist2;
          cell = h.x;
        }
      }
    }
  }
  return vec2(sqrt(d), cell);
}

EffectResult twEffect(vec3 sphereDir, float time) {
  vec3 p = normalize(sphereDir);
  float sc = max(uScale, 0.2) * 1.65;
  vec3 q = p * sc;
  q += vec3(uSeed * 0.00013);
  vec2 cell = twWorley(q, clamp(uDistortion, 0.0, 0.5), time);
  float F1 = cell.x;
  float w = max(fwidth(F1), 1.0e-4) * max(uEdge, 0.2);
  float localT = uThreshold * mix(0.84, 1.14, cell.y);
  float fill = 1.0 - smoothstep(localT - w, localT + w, F1);
  EffectResult r;
  r.mask = fill;
  r.color = uOrbColor;
  return r;
}
`
