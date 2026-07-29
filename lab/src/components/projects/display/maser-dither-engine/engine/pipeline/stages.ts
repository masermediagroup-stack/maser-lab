import { ANIM_GLSL } from "../animation/animGlsl";
import { INTERACTION_GLSL } from "../interaction/interactionGlsl";

/**
 * Pipeline stages — animation (0), material (1–7), damp (8), interaction lighting.
 */
export const PIPELINE_STAGES = [
  {
    id: 0,
    name: "Procedural animation",
    description:
      "Mode-blended UV offset + luminance/light modulation (timeline-driven)",
  },
  {
    id: 9,
    name: "Procedural interaction",
    description:
      "Multi-light field, pointer physics, ripples, trails, state modulation",
  },
  {
    id: 1,
    name: "Gradient",
    description:
      "Procedural grayscale gradient with angle, stops, soft edge, light falloff",
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
    description: "Bloom around pointer + material bloom radius",
  },
  {
    id: 7,
    name: "Animated grain",
    description: "Time-varying filmic grain",
  },
  {
    id: 8,
    name: "Motion interpolation",
    description: "CPU exponential damp of material targets → uniforms",
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

const FRAG_HEAD = `#version 300 es
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
`;

const FRAG_BODY = `
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

float gradientField(vec2 uv) {
  float angle = radians(uGradientAngle);
  vec2 dir = vec2(cos(angle), sin(angle));
  float g = dot(uv - 0.5, dir) * 0.5 + 0.5;

  // Accurate pointer light — UV space, no stacked mixes
  vec2 lightPos = mix(vec2(uLightX, uLightY), uIxPointer, uIxInfluence * 0.85);
  lightPos.y += uScroll * uScrollInfluence * 0.05;

  float dist = distance(uv, lightPos);
  float radial = ixFalloff(dist, uIxFalloffRadius) * (0.55 + uDepth * 0.35);
  float soft = mix(0.35, 1.0, uSoftEdge);

  float base = mix(uGradientColorA, uGradientColorB, clamp(g, 0.0, 1.0));
  base = mix(base, clamp(base + radial * 0.4 * soft, 0.0, 1.0), 0.75);
  return clamp(base, 0.0, 1.0);
}

float remapContrast(float v) {
  float contrast = uContrast + uIxStateContrast;
  v = (v - 0.5) * contrast + 0.5 + uBrightness;
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
  vec2 ptr = uIxPointer;
  float d = distance(uv, ptr);
  float r = max(uBloomRadius * uIxStateRadiusMul, 0.02);
  float core = exp(- (d * d) / (r * r * 2.0));
  float soft = 0.0;
  soft += exp(- (distance(uv, ptr + vec2(r, 0.0)) * distance(uv, ptr + vec2(r, 0.0))) / (r * r * 4.0));
  soft += exp(- (distance(uv, ptr + vec2(-r, 0.0)) * distance(uv, ptr + vec2(-r, 0.0))) / (r * r * 4.0));
  soft += exp(- (distance(uv, ptr + vec2(0.0, r)) * distance(uv, ptr + vec2(0.0, r))) / (r * r * 4.0));
  soft += exp(- (distance(uv, ptr + vec2(0.0, -r)) * distance(uv, ptr + vec2(0.0, -r))) / (r * r * 4.0));
  return (core + soft * 0.15) * (uBloom + uIxStateBloom);
}

void main() {
  vec2 uv = vUv;

  // Stage 0 — procedural animation (ambient + distortion)
  vec4 anim = sampleAnimation(uv, uTime);
  vec2 uvAnim = clamp(uv + anim.xy, 0.0, 1.0);

  // Interaction tug — velocity-aware, UV-correct pointer
  vec2 tug = (uIxPointer - 0.5) * uIxInfluence * 0.035;
  tug += uIxVelocity * 0.0008 * uIxInfluence;
  uvAnim = clamp(uvAnim + tug, 0.0, 1.0);

  vec2 pixel = uvAnim * uResolution * uPixelDensity;

  // Stage 1 — gradient (unified light)
  float lum = gradientField(uvAnim);

  // Animation luminance + interaction multi-light / ripples / trails
  lum = clamp(lum + anim.z * 0.45, 0.0, 1.0);
  lum = clamp(lum + sampleInteraction(uvAnim), 0.0, 1.0);

  // Stage 5 remap
  lum = remapContrast(lum);

  // Stage 6 bloom
  lum = clamp(lum + bloomField(uvAnim) * 0.55, 0.0, 1.0);

  // Stage 4 posterize
  lum = posterize(lum);

  // Stage 2–3 dither
  float threshold = sampleBayer(pixel);
  float bn = sampleBlue(pixel * uNoiseScale + vec2(uTime * uNoiseSpeed * 8.0, uScroll * 20.0));
  threshold = mix(threshold, bn, clamp(uBlueNoiseAmount, 0.0, 1.0));

  float dithered = step(threshold, lum);
  float ink = mix(lum, dithered, 0.82);

  // Stage 7 grain
  float g = hash21(pixel + floor(uTime * uNoiseSpeed * 60.0));
  ink = clamp(ink + (g - 0.5) * uGrainAmount, 0.0, 1.0);

  fragColor = vec4(vec3(ink), uOpacity);
}
`;

export const FRAG_SRC = FRAG_HEAD + ANIM_GLSL + INTERACTION_GLSL + FRAG_BODY;
