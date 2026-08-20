/**
 * Spherical metaballs — Paper Metaballs falloff, evaluated on the unit sphere.
 *
 * Source: packages/shaders/src/shaders/metaballs.ts
 * https://github.com/paper-design/shaders (Apache-2.0)
 * Powered by Paper Shaders: https://shaders.paper.design
 *
 * Paper accumulates `pow(1 - clamp(0.5 * length(uv - c), 0, 1), p)` in 2D UV.
 * TYPE WORLD uses the same falloff on unit-sphere positions so the field
 * has no longitude seam. Iteration cap is 12 for mobile (Paper allows 20).
 * Procedural 1D value noise replaces Paper's noise texture.
 */

export const EFFECT_METABALLS_GLSL = /* glsl */ `
float twBallShape(vec3 p, vec3 c, float power) {
  float s = 0.5 * length(p - c);
  s = 1.0 - clamp(s, 0.0, 1.0);
  return pow(max(s, 1.0e-5), power);
}

vec3 twMetaballCenter(float idx, float t) {
  float idxFract = idx / 12.0;
  float angle = TW_TAU * idxFract;
  float speed = 1.0 - 0.2 * idxFract;
  float seed = uSeed * 0.00017;
  float noiseX = twValueNoise(angle * 10.0 + idx + t * speed + seed);
  float noiseY = twValueNoise(angle * 20.0 + idx - t * speed + seed * 1.7);
  float theta = TW_TAU * noiseX;
  float cy = clamp(2.0 * noiseY - 1.0, -1.0, 1.0);
  float phi = acos(cy);
  float sp = sin(phi);
  return vec3(sp * cos(theta), cy, sp * sin(theta));
}

EffectResult twEffect(vec3 sphereDir, float time) {
  vec3 p = normalize(sphereDir);
  float total = 0.0;
  float count = clamp(uDensity, 1.0, 12.0);
  int n = int(ceil(count));
  float size = clamp(uScale * 0.5, 0.08, 1.0);
  for (int i = 0; i < 12; i++) {
    if (i >= n) break;
    float sizeFrac = 1.0;
    if (float(i) > floor(count - 1.0)) {
      sizeFrac *= fract(count);
      if (sizeFrac < 0.001) continue;
    }
    vec3 c = twMetaballCenter(float(i), time);
    float power = 45.0 - 30.0 * size * sizeFrac;
    float shape = twBallShape(p, c, power);
    shape *= pow(size, 0.2);
    shape = smoothstep(0.0, 1.0, shape);
    total += shape;
  }
  float edge = max(fwidth(total), 1.0e-4) * max(uSoftness, 0.04);
  float mask = smoothstep(uThreshold, uThreshold + edge, total);
  EffectResult r;
  r.mask = mask;
  r.color = uOrbColor;
  return r;
}
`
