/**
 * Spherical Perlin field — Paper 3D Perlin on sphereDir, then threshold.
 *
 * Source: packages/shaders/src/shaders/perlin-noise.ts
 * https://github.com/paper-design/shaders (Apache-2.0)
 * Powered by Paper Shaders: https://shaders.paper.design
 *
 * Evaluated in object-space sphere coordinates (not UV) so the field is
 * continuous across the longitude seam. Three octaves (Paper allows 8)
 * keep organic ink masses without TV-static cost on mobile.
 */

export const EFFECT_PERLIN_GLSL = /* glsl */ `
float twHash31(vec3 p) {
  p = fract(p * 0.3183099) + 0.1;
  p += dot(p, p.yzx + 19.19);
  return fract(p.x * (p.y + p.z));
}

vec3 twGrad12(float hash) {
  float h = hash * 12.0;
  int idx = int(h - 12.0 * floor(h / 12.0));
  if (idx == 0) return vec3(1.0, 1.0, 0.0);
  if (idx == 1) return vec3(-1.0, 1.0, 0.0);
  if (idx == 2) return vec3(1.0, -1.0, 0.0);
  if (idx == 3) return vec3(-1.0, -1.0, 0.0);
  if (idx == 4) return vec3(1.0, 0.0, 1.0);
  if (idx == 5) return vec3(-1.0, 0.0, 1.0);
  if (idx == 6) return vec3(1.0, 0.0, -1.0);
  if (idx == 7) return vec3(-1.0, 0.0, -1.0);
  if (idx == 8) return vec3(0.0, 1.0, 1.0);
  if (idx == 9) return vec3(0.0, -1.0, 1.0);
  if (idx == 10) return vec3(0.0, 1.0, -1.0);
  return vec3(0.0, -1.0, -1.0);
}

vec3 twFade3(vec3 t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float twPerlin3(vec3 position, float seed) {
  position += vec3(seed * 127.1, seed * 311.7, seed * 74.7);
  vec3 i = floor(position);
  vec3 f = fract(position);
  float n000 = dot(twGrad12(twHash31(i)), f);
  float n001 = dot(twGrad12(twHash31(i + vec3(0.0, 0.0, 1.0))), f - vec3(0.0, 0.0, 1.0));
  float n010 = dot(twGrad12(twHash31(i + vec3(0.0, 1.0, 0.0))), f - vec3(0.0, 1.0, 0.0));
  float n011 = dot(twGrad12(twHash31(i + vec3(0.0, 1.0, 1.0))), f - vec3(0.0, 1.0, 1.0));
  float n100 = dot(twGrad12(twHash31(i + vec3(1.0, 0.0, 0.0))), f - vec3(1.0, 0.0, 0.0));
  float n101 = dot(twGrad12(twHash31(i + vec3(1.0, 0.0, 1.0))), f - vec3(1.0, 0.0, 1.0));
  float n110 = dot(twGrad12(twHash31(i + vec3(1.0, 1.0, 0.0))), f - vec3(1.0, 1.0, 0.0));
  float n111 = dot(twGrad12(twHash31(i + vec3(1.0, 1.0, 1.0))), f - vec3(1.0, 1.0, 1.0));
  vec3 u = twFade3(f);
  float nx00 = mix(n000, n100, u.x);
  float nx10 = mix(n010, n110, u.x);
  float nx01 = mix(n001, n101, u.x);
  float nx11 = mix(n011, n111, u.x);
  return mix(mix(nx00, nx10, u.y), mix(nx01, nx11, u.y), u.z);
}

float twFbm3(vec3 position) {
  float value = 0.0;
  float amplitude = 1.0;
  float frequency = 2.4;
  float persistence = 0.55;
  for (int i = 0; i < 3; i++) {
    float seed = float(i) * 0.7319 + uSeed * 0.00017;
    value += twPerlin3(position * frequency, seed) * amplitude;
    amplitude *= persistence;
    frequency *= 2.0;
  }
  return value;
}

EffectResult twEffect(vec3 sphereDir, float time) {
  vec3 p = normalize(sphereDir) * max(uScale, 0.2);
  p += vec3(0.0, 0.0, time * 0.2);
  float noise = twFbm3(p);
  float maxAmp = (1.0 - pow(0.55, 3.0)) / 0.45;
  float n = clamp((noise + maxAmp) / max(1.0e-4, 2.0 * maxAmp), 0.0, 1.0);
  float sharpness = clamp(uSoftness, 0.0, 1.0);
  float contrast = max(uContrast, 0.02);
  float w = 0.5 * max(fwidth(n), 0.001) + contrast * 0.15;
  float lo = uThreshold - 0.5 * sharpness - w;
  float hi = uThreshold + 0.5 * sharpness + w;
  float mask = smoothstep(min(lo, hi), max(lo, hi), n);
  EffectResult r;
  r.mask = mask;
  r.color = uOrbColor;
  return r;
}
`
