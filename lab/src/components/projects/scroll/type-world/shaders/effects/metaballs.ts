/**
 * Spherical metaballs — Paper Metaballs power-curve merge, geodesic domain.
 *
 * Source: packages/shaders/src/shaders/metaballs.ts
 * https://github.com/paper-design/shaders (Apache-2.0)
 * Powered by Paper Shaders: https://shaders.paper.design
 *
 * Paper accumulates `pow(1 - clamp(0.5 * length(uv - c), 0, 1), p)` in 2D UV.
 * Chord length on the unit sphere is too small for that 2D radius, so TYPE WORLD
 * keeps the same power-curve / smoothstep merge and noise-driven motion, but
 * measures distance as geodesic angle. Iteration cap is 12 for mobile
 * (Paper allows 20). Procedural 1D value noise replaces Paper's noise texture.
 */

export const EFFECT_METABALLS_GLSL = /* glsl */ `
float twBallShape(float ang, float radius, float power) {
  float s = 1.0 - clamp(ang / max(radius, 0.08), 0.0, 1.0);
  return pow(max(s, 1.0e-5), power);
}

vec3 twMetaballCenter(float idx, float n, float t) {
  vec3 base = twFibonacciDir(idx + uSeed * 0.0013, n);
  float idxFract = idx / 12.0;
  float speed = 1.0 - 0.2 * idxFract;
  float seed = uSeed * 0.00017;
  float noiseA = twValueNoise(idx * 10.0 + t * speed + seed);
  float noiseB = twValueNoise(idx * 20.0 - t * speed + seed * 1.7);
  vec3 axis = twHashDir(idx + 19.0 + seed);
  float spin = t * (0.22 + 0.18 * speed) + (noiseA - 0.5) * 1.8;
  float nod = (noiseB - 0.5) * 1.15;
  vec3 dir = twRotateAxis(base, axis, spin);
  vec3 tilt = normalize(cross(axis, dir));
  return normalize(twRotateAxis(dir, tilt, nod));
}

EffectResult twEffect(vec3 sphereDir, float time) {
  vec3 p = normalize(sphereDir);
  float t = 0.2 * (time + 2503.4);
  float total = 0.0;
  float count = clamp(uDensity, 1.0, 12.0);
  int n = int(ceil(count));
  float size = clamp(uScale, 0.25, 2.2);
  for (int i = 0; i < 12; i++) {
    if (i >= n) break;
    float sizeFrac = 1.0;
    if (float(i) > floor(count - 1.0)) {
      sizeFrac *= fract(count);
      if (sizeFrac < 0.001) continue;
    }
    vec3 c = twMetaballCenter(float(i), count, t);
    float radius = (0.34 + 0.40 * sizeFrac) * size;
    float power = mix(2.8, 1.55, clamp(size * 0.45, 0.0, 1.0));
    float ang = acos(clamp(dot(p, c), -1.0, 1.0));
    float shape = twBallShape(ang, radius, power);
    shape *= pow(clamp(size * 0.55, 0.2, 1.0), 0.2);
    shape = smoothstep(0.0, 1.0, shape);
    total += shape;
  }
  float edge = max(fwidth(total), 1.0e-4) * mix(0.7, 3.4, clamp(uSoftness, 0.0, 1.0));
  float mask = smoothstep(uThreshold, uThreshold + edge, total);
  EffectResult r;
  r.mask = mask;
  r.color = uOrbColor;
  return r;
}
`
