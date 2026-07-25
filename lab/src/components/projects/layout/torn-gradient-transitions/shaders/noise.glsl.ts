/**
 * Shared noise primitives.
 *
 * Authored as a typed template literal rather than a `.glsl` file: the lab has
 * no raw-loader / glslify rule in `next.config.ts`, and the existing
 * `pixel-wormhole-scene` precedent is inline `/* glsl *\/` strings. Keeping the
 * chunks in separate modules preserves the file structure without adding a
 * bundler dependency.
 *
 * `FBM_OCTAVES` is injected through `ShaderMaterial.defines` so the octave
 * count stays a compile-time constant across quality modes.
 */
export const NOISE_CHUNK = /* glsl */ `
#ifndef FBM_OCTAVES
  #define FBM_OCTAVES 4
#endif

const float TAU = 6.28318530718;

float hash11(float n) {
  return fract(sin(n) * 43758.5453123);
}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

vec2 hash22(vec2 p) {
  vec3 a = fract(p.xyx * vec3(123.34, 234.34, 345.65));
  a += dot(a, a + 34.45);
  return fract(vec2(a.x * a.y, a.y * a.z));
}

mat2 rot2(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

// --- 2D simplex noise (Ashima / Gustavson formulation), range ~[-1, 1] -------
vec3 mod289v3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289v2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute3(vec3 x) { return mod289v3(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
    -0.577350269189626,
    0.024390243902439
  );
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289v2(i);
  vec3 p = permute3(
    permute3(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0)
  );
  vec3 m = max(
    0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)),
    0.0
  );
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Fractal Brownian motion, normalised to ~[-1, 1].
float fbm(vec2 p) {
  float amp = 0.5;
  float sum = 0.0;
  float norm = 0.0;
  mat2 turn = rot2(0.5);
  for (int i = 0; i < FBM_OCTAVES; i++) {
    sum += amp * snoise(p);
    norm += amp;
    p = turn * p * 2.02;
    amp *= 0.52;
  }
  return sum / max(norm, 1e-4);
}

// Cheap two-octave variant for hot paths that only need a soft field.
float fbm2(vec2 p) {
  return snoise(p) * 0.66 + snoise(p * 2.07 + 11.3) * 0.34;
}

// Ridged noise: sharp positive creases, range [0, 1].
float ridged(vec2 p) {
  float amp = 0.5;
  float sum = 0.0;
  float norm = 0.0;
  mat2 turn = rot2(0.9);
  for (int i = 0; i < FBM_OCTAVES; i++) {
    sum += amp * (1.0 - abs(snoise(p)));
    norm += amp;
    p = turn * p * 2.11;
    amp *= 0.5;
  }
  return sum / max(norm, 1e-4);
}

// Sparse speckle: mostly zero with occasional bright grains.
float speckle(vec2 p, float density) {
  float n = hash21(floor(p));
  float local = hash21(floor(p) + 17.13);
  vec2 f = fract(p) - 0.5 - (vec2(local, hash21(floor(p) + 3.7)) - 0.5) * 0.7;
  float dot0 = 1.0 - smoothstep(0.0, 0.34, length(f));
  return dot0 * step(1.0 - density, n);
}
`;
