/**
 * Spherical wave bands — Paper Waves sine-band math on sphere-space axes.
 *
 * Source: packages/shaders/src/shaders/waves.ts (shape + softness)
 * https://github.com/paper-design/shaders (Apache-2.0)
 * Powered by Paper Shaders: https://shaders.paper.design
 *
 * Paper is static 2D UV stripes (`shape_uv.x` / `shape_uv.y`).
 * Here the wave coordinate is `dot(sphereDir, axis)` so bands wrap
 * continuously with no UV longitude seam. Time travels the bands.
 * V1 uses Paper's sine shape (`u_shape ≈ 1`), not zigzag.
 */

export const EFFECT_WAVES_GLSL = /* glsl */ `
EffectResult twEffect(vec3 sphereDir, float time) {
  vec3 p = normalize(sphereDir);
  float ang = uDirection;
  vec3 axis = normalize(vec3(cos(ang), 0.32, sin(ang)));
  vec3 up = abs(axis.y) > 0.92 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 ortho = normalize(cross(axis, up));
  float sc = max(uScale, 0.12) * 3.2;
  float x = dot(p, ortho) * sc;
  float y = dot(p, axis) * sc - time;

  float freq = max(uFrequency, 0.05);
  float wave = 0.5 * cos(x * freq * TW_TAU);
  float offset = wave * 2.0 * uAmplitude;

  float spacing = 0.22 + 0.70 / max(uScale * max(uFrequency, 0.2), 0.25);
  float shape = 0.5 + 0.5 * sin((y + offset) * TW_PI / spacing);

  float aa = 0.0001 + fwidth(shape);
  float softness = clamp(uSoftness, 0.0, 1.0) * 0.35;
  float dc = 1.0 - clamp(uThickness, 0.08, 0.92);
  float e0 = dc - softness - aa;
  float e1 = dc + softness + aa;
  float mask = smoothstep(min(e0, e1), max(e0, e1), shape);

  EffectResult r;
  r.mask = mask;
  r.color = uOrbColor;
  return r;
}
`
