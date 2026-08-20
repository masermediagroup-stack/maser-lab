/**
 * Spherical wave bands — Paper sine-band idea on sphere-space axes.
 *
 * Source: packages/shaders/src/shaders/waves.ts (sine shape + softness)
 * https://github.com/paper-design/shaders (Apache-2.0)
 * Powered by Paper Shaders: https://shaders.paper.design
 *
 * Paper’s 2D zigzag/sine mix is not used. Bands are a traveling sine of
 * `dot(sphereDir, axis)` so they wrap the globe without a longitude seam
 * or chevron aliasing. Amplitude only gently undulates the wavefront.
 */

export const EFFECT_WAVES_GLSL = /* glsl */ `
EffectResult twEffect(vec3 sphereDir, float time) {
  vec3 p = normalize(sphereDir);
  vec3 axis = normalize(vec3(cos(uDirection), 0.28, sin(uDirection)));
  vec3 up = abs(axis.y) > 0.92 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 ortho = normalize(cross(axis, up));
  float freq = max(uFrequency, 0.12) * max(uScale, 0.25) * 4.2;
  float travel = dot(p, axis) * freq - time;
  float undulate = uAmplitude * 0.45 * sin(dot(p, ortho) * freq * 0.32);
  float wave = 0.5 + 0.5 * sin(travel + undulate);
  float thickness = clamp(uThickness, 0.08, 0.92);
  float w = 0.02 + min(0.08, fwidth(wave)) + 0.12 * clamp(uSoftness, 0.0, 1.0);
  float mask = smoothstep(1.0 - thickness - w, 1.0 - thickness + w, wave);
  EffectResult r;
  r.mask = mask;
  r.color = uOrbColor;
  return r;
}
`
