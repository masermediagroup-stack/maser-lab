/**
 * Spherical metaballs — Paper power-curve merge on geodesic distance.
 *
 * Source: packages/shaders/src/shaders/metaballs.ts
 * https://github.com/paper-design/shaders (Apache-2.0)
 * Powered by Paper Shaders: https://shaders.paper.design
 *
 * Paper’s 2D `pow(1 - clamp(0.5 * length, 0, 1), p)` becomes a falloff
 * of geodesic angle so masses stay large, merge, and never seam at UV
 * wrap. Cap 12 balls (Paper allows 20). Value-noise replaces the noise
 * texture. No dynamic `break` / zero-length cross (ANGLE-safe).
 */

export const EFFECT_METABALLS_GLSL = /* glsl */ `
float twBallShape(float ang, float radius) {
  float r = clamp(ang / max(radius, 0.25), 0.0, 1.0);
  return pow(1.0 - r, 1.5);
}

vec3 twSafeTilt(vec3 axis, vec3 dir) {
  vec3 tilt = cross(axis, dir);
  if (dot(tilt, tilt) < 1.0e-6) {
    tilt = cross(dir, vec3(0.0, 1.0, 0.0));
  }
  if (dot(tilt, tilt) < 1.0e-6) {
    tilt = vec3(1.0, 0.0, 0.0);
  }
  return normalize(tilt);
}

vec3 twMetaballCenter(float idx, float n, float t) {
  vec3 base = twFibonacciDir(idx + uSeed * 0.0013, n);
  float idxFract = idx / 12.0;
  float speed = 1.0 - 0.2 * idxFract;
  float seed = uSeed * 0.00017;
  float noiseA = twValueNoise(idx * 10.0 + t * speed + seed);
  float noiseB = twValueNoise(idx * 20.0 - t * speed + seed * 1.7);
  vec3 axis = twHashDir(idx + 19.0 + seed);
  float spin = t * (0.18 + 0.16 * speed) + (noiseA - 0.5) * 1.35;
  float nod = (noiseB - 0.5) * 0.85;
  vec3 dir = twRotateAxis(base, axis, spin);
  return normalize(twRotateAxis(dir, twSafeTilt(axis, dir), nod));
}

EffectResult twEffect(vec3 sphereDir, float time) {
  vec3 p = normalize(sphereDir);
  float t = 0.2 * (time + 2503.4);
  float total = 0.0;
  float count = clamp(uDensity, 1.0, 12.0);
  float size = clamp(uScale, 0.35, 2.4);
  for (int i = 0; i < 12; i++) {
    if (float(i) < count) {
      float sizeFrac = 1.0;
      if (float(i) > floor(count - 1.0)) {
        sizeFrac = max(fract(count), 0.2);
      }
      vec3 c = twMetaballCenter(float(i), max(count, 1.0), t);
      float radius = (1.35 + 0.25 * sizeFrac) * size;
      float chord = length(p - c);
      float ang = 2.0 * asin(clamp(chord * 0.5, 0.0, 1.0));
      total += twBallShape(ang, radius) * sizeFrac;
    }
  }
  float w = min(0.08, max(fwidth(total), 0.004)) + 0.04 * clamp(uSoftness, 0.0, 1.0);
  float mask = smoothstep(uThreshold - w, uThreshold + w, total);
  EffectResult r;
  r.mask = mask;
  r.color = uOrbColor;
  return r;
}
`
