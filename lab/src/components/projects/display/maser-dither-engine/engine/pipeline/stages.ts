/**
 * Pipeline stage documentation + default ranges (shader implements stages 1–7;
 * stage 8 is CPU damp in AnimationLoop).
 */
export const PIPELINE_STAGES = [
  {
    id: 1,
    name: "Gradient",
    description: "Procedural grayscale gradient with angle, stops, soft edge, light falloff",
  },
  {
    id: 2,
    name: "Bayer dither",
    description: "Ordered dither 2×2 / 4×4 / 8×8 / 16×16",
  },
  {
    id: 3,
    name: "Blue-noise overlay",
    description: "Optional blue-noise mix for softer tonal grain",
  },
  {
    id: 4,
    name: "Posterization",
    description: "Quantize luminance levels (0 = off)",
  },
  {
    id: 5,
    name: "Contrast remapping",
    description: "Brightness, contrast, shadow/highlight strength",
  },
  {
    id: 6,
    name: "Highlight bloom",
    description: "Fixed-tap soft bloom around light + cursor",
  },
  {
    id: 7,
    name: "Animated grain",
    description: "Time-varying filmic grain",
  },
  {
    id: 8,
    name: "Motion interpolation",
    description: "CPU exponential damp of all targets → uniforms",
  },
] as const;

export const VERT_SRC = `#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](
  vec2(-1.0, -1.0),
  vec2( 3.0, -1.0),
  vec2(-1.0,  3.0)
);
out vec2 vUv;
void main() {
  vec2 p = POS[gl_VertexID];
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

export const FRAG_SRC = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform float uDpr;
uniform float uTime;

uniform float uDitherSize;
uniform float uPosterization;
uniform float uNoiseScale;
uniform float uNoiseSpeed;
uniform float uContrast;
uniform float uBrightness;
uniform float uGradientAngle;
uniform float uGradientColorA;
uniform float uGradientColorB;
uniform float uBloom;
uniform float uBloomRadius;
uniform float uGrainAmount;
uniform float uPixelDensity;
uniform float uShadowStrength;
uniform float uHighlightStrength;
uniform float uSoftEdge;
uniform float uRandomSeed;
uniform float uCursorInfluence;
uniform float uScrollInfluence;
uniform float uDepth;
uniform float uLightX;
uniform float uLightY;
uniform float uOpacity;
uniform float uBlueNoiseAmount;
uniform vec2 uPointer;
uniform float uScroll;

uniform sampler2D uBayer2;
uniform sampler2D uBayer4;
uniform sampler2D uBayer8;
uniform sampler2D uBayer16;
uniform sampler2D uBlueNoise;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32 + uRandomSeed * 17.0);
  return fract(p.x * p.y);
}

float sampleBayer(vec2 pixel) {
  float size = uDitherSize;
  vec2 uv = fract(pixel / size);
  if (size < 3.0) return texture(uBayer2, uv).r;
  if (size < 5.0) return texture(uBayer4, uv).r;
  if (size < 9.0) return texture(uBayer8, uv).r;
  return texture(uBayer16, uv).r;
}

float sampleBlue(vec2 pixel) {
  return texture(uBlueNoise, fract(pixel / 64.0)).r;
}

float gradientField(vec2 uv, vec2 light) {
  float angle = radians(uGradientAngle);
  vec2 dir = vec2(cos(angle), sin(angle));
  float g = dot(uv - 0.5, dir) * 0.5 + 0.5;

  vec2 ptr = mix(vec2(0.5), uPointer, uCursorInfluence);
  vec2 lightPos = mix(vec2(uLightX, uLightY), ptr, uCursorInfluence * 0.65);
  lightPos += (ptr - 0.5) * uCursorInfluence * 0.12;
  lightPos.y += uScroll * uScrollInfluence * 0.08;

  float dist = distance(uv, lightPos);
  float radial = 1.0 - smoothstep(0.0, 0.85 + uDepth * 0.5, dist);
  float soft = mix(0.35, 1.0, uSoftEdge);

  float base = mix(uGradientColorA, uGradientColorB, clamp(g, 0.0, 1.0));
  base = mix(base, clamp(base + radial * 0.35 * soft, 0.0, 1.0), 0.7);
  base += (light.x - lightPos.x) * 0.02;
  return clamp(base, 0.0, 1.0);
}

float remapContrast(float v) {
  v = (v - 0.5) * uContrast + 0.5 + uBrightness;
  float shadows = mix(v, v * v, uShadowStrength);
  float highlights = mix(shadows, 1.0 - (1.0 - shadows) * (1.0 - shadows), uHighlightStrength * 0.5);
  return clamp(highlights, 0.0, 1.0);
}

float posterize(float v) {
  if (uPosterization < 0.5) return v;
  float levels = max(uPosterization, 2.0);
  return floor(v * levels) / levels;
}

float bloomField(vec2 uv) {
  vec2 ptr = mix(vec2(uLightX, uLightY), uPointer, uCursorInfluence);
  float d = distance(uv, ptr);
  float r = max(uBloomRadius, 0.02);
  float core = exp(- (d * d) / (r * r * 2.0));
  // Cheap multi-tap soft ring
  float soft = 0.0;
  soft += exp(- (distance(uv, ptr + vec2(r, 0.0)) * distance(uv, ptr + vec2(r, 0.0))) / (r * r * 4.0));
  soft += exp(- (distance(uv, ptr + vec2(-r, 0.0)) * distance(uv, ptr + vec2(-r, 0.0))) / (r * r * 4.0));
  soft += exp(- (distance(uv, ptr + vec2(0.0, r)) * distance(uv, ptr + vec2(0.0, r))) / (r * r * 4.0));
  soft += exp(- (distance(uv, ptr + vec2(0.0, -r)) * distance(uv, ptr + vec2(0.0, -r))) / (r * r * 4.0));
  return (core + soft * 0.15) * uBloom;
}

void main() {
  vec2 uv = vUv;
  // Flip Y so vUv.y=0 is bottom in GL but we treat top-left for UI feel
  vec2 pixel = uv * uResolution * uPixelDensity;

  // Stage 1 — gradient
  float lum = gradientField(uv, vec2(uLightX, uLightY));

  // Stage 5 early remap before dither for better print density
  lum = remapContrast(lum);

  // Stage 6 — bloom add
  lum = clamp(lum + bloomField(uv) * 0.55, 0.0, 1.0);

  // Stage 4 — posterize (pre-dither)
  lum = posterize(lum);

  // Stage 2 — Bayer
  float threshold = sampleBayer(pixel);
  // Stage 3 — blue noise overlay
  float bn = sampleBlue(pixel * uNoiseScale + vec2(uTime * uNoiseSpeed * 8.0, uScroll * 20.0));
  threshold = mix(threshold, bn, clamp(uBlueNoiseAmount, 0.0, 1.0));

  float dithered = step(threshold, lum);

  // Soft blend: keep a hint of continuous tone so it never reads as chunky 1-bit
  float ink = mix(lum, dithered, 0.82);

  // Stage 7 — grain
  float g = hash21(pixel + floor(uTime * uNoiseSpeed * 60.0));
  ink = clamp(ink + (g - 0.5) * uGrainAmount, 0.0, 1.0);

  fragColor = vec4(vec3(ink), uOpacity);
}
`;
