import { MAX_SURFACE_ORBS } from "../../constants";

/**
 * Surface orbs — geodesic discs from the existing TYPE WORLD orb system.
 * Motion stays in JS (`surfaceOrbs.ts`); this shader only samples packed
 * `uOrbs[i]` (xyz unit direction, w angular radius).
 *
 * Disc / AA math is copied from the previous glyph fragment so Orbs
 * remain visually unchanged after the compositor extraction.
 */

export const EFFECT_ORBS_GLSL = /* glsl */ `
EffectResult twEffect(vec3 sphereDir, float time) {
  vec3 dir = normalize(sphereDir);
  float mask = 0.0;
  for (int i = 0; i < ${MAX_SURFACE_ORBS}; i++) {
    if (float(i) >= uOrbCount) {
      continue;
    }
    vec4 orb = uOrbs[i];
    float radius = orb.w;
    if (radius <= 0.0001) {
      continue;
    }
    vec3 center = normalize(orb.xyz);
    float ang = acos(clamp(dot(dir, center), -1.0, 1.0));
    float aa = fwidth(ang);
    float art = radius * clamp(uOrbEdge, 0.0, 0.35);
    float halfW = aa * 1.05 + art * 0.55;
    float inner = max(radius - halfW, 0.0);
    float outer = radius + aa * 0.25;
    if (outer <= inner) {
      outer = inner + max(aa, 1.0e-5);
    }
    mask = max(mask, 1.0 - smoothstep(inner, outer, ang));
  }
  EffectResult r;
  r.mask = mask;
  r.color = uOrbColor;
  return r;
}
`
