import { ANIM_GLSL } from "../animation/animGlsl";
import { COLOR_GLSL } from "../color/colorGlsl";
import { INTERACTION_GLSL } from "../interaction/interactionGlsl";

/**
 * Pipeline stages — animation (0), material (1–7), damp (8), interaction, color.
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
      "Procedural luminance gradient with angle, stops, soft edge, light falloff",
  },
  {
    id: 10,
    name: "Color material",
    description:
      "Palette gradients, blend modes, material behaviors, exposure/gamma",
  },
  {
    id: 2,
    name: "Bayer dither",
    description: "Ordered dither 2×2 / 4×4 / 8×8 / 32×32 / 64×64",
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
uniform sampler2D uBayer32;
uniform sampler2D uBayer64;
uniform sampler2D uBlueNoise;
`;

const FRAG_BODY = `
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32 + uRandomSeed * 17.0);
  return fract(p.x * p.y);
}

float sampleBayer(vec2 pixel) {
  // Integer lattice + texel centers — matches CPU sampleBayer and avoids
  // fract/edge smearing that collapses into streaks at canvas borders.
  float size = max(uDitherSize, 2.0);
  vec2 cell = floor(pixel);
  vec2 uv = (mod(cell, size) + 0.5) / size;
  if (size < 3.0) return texture(uBayer2, uv).r;
  if (size < 5.0) return texture(uBayer4, uv).r;
  if (size < 9.0) return texture(uBayer8, uv).r;
  if (size < 40.0) return texture(uBayer32, uv).r;
  return texture(uBayer64, uv).r;
}

float sampleBlue(vec2 pixel) {
  vec2 cell = floor(pixel);
  return texture(uBlueNoise, (mod(cell, 64.0) + 0.5) / 64.0).r;
}

float softClamp01(float v) {
  // Soft edge — lets procedural lights travel past canvas bounds without clipping
  return mix(v, clamp(v, 0.0, 1.0), 0.68);
}

float gradientField(vec2 uv) {
  float angle = radians(uGradientAngle);
  vec2 dir = vec2(cos(angle), sin(angle));
  float g = dot(uv - 0.5, dir) * 0.5 + 0.5;

  // Accurate pointer light — UV space; soft-bound so travel feels physical
  vec2 lightPos = mix(vec2(uLightX, uLightY), uIxPointer, uIxInfluence * 0.92);
  lightPos.y += uScroll * uScrollInfluence * 0.05;
  lightPos.x = softClamp01(lightPos.x);
  lightPos.y = softClamp01(lightPos.y);

  float dist = distance(uv, lightPos);
  float radial = ixFalloff(dist, uIxFalloffRadius * 1.15) * (0.55 + uDepth * 0.4);
  float soft = mix(0.35, 1.0, uSoftEdge);

  float base = mix(uGradientColorA, uGradientColorB, clamp(g, 0.0, 1.0));
  base = mix(base, clamp(base + radial * 0.48 * soft, 0.0, 1.0), 0.78);
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
  // Soft UV warp for material fields only — hard clamp collapses edge
  // fragments onto identical coords and streaks the dither matrix.
  vec2 uvAnim = uv + anim.xy;

  // Interaction tug — velocity-aware, UV-correct pointer
  vec2 tug = (uIxPointer - 0.5) * uIxInfluence * 0.035;
  tug += uIxVelocity * 0.0008 * uIxInfluence;
  uvAnim += tug;

  // Screen-space dither lattice (stable). Never derive Bayer coords from
  // warped/clamped UV — that produced horizontal/vertical edge streaks.
  vec2 pixel = gl_FragCoord.xy * max(uPixelDensity, 0.01);

  // Stage 1 — gradient (unified light); soft-clamp for edge travel
  vec2 uvSample = vec2(softClamp01(uvAnim.x), softClamp01(uvAnim.y));
  float lum = gradientField(uvSample);

  // Animation luminance + interaction multi-light / ripples / trails
  lum = clamp(lum + anim.z * 0.85, 0.0, 1.0);
  lum = clamp(lum + sampleInteraction(uvSample), 0.0, 1.0);

  // Stage 5 remap
  lum = remapContrast(lum);

  // Stage 6 bloom
  float bloomAmt = bloomField(uvSample) * 0.55;
  lum = clamp(lum + bloomAmt, 0.0, 1.0);

  // Stage 4 posterize
  lum = posterize(lum);

  // Stage 2–3 dither — locked to fragment pixels
  float threshold = sampleBayer(pixel);
  float bn = sampleBlue(pixel * uNoiseScale + vec2(uTime * uNoiseSpeed * 8.0, uScroll * 20.0));
  threshold = mix(threshold, bn, clamp(uBlueNoiseAmount, 0.0, 1.0));

  float dithered = step(threshold, lum);
  float ink = mix(lum, dithered, 0.82);

  // Stage 7 grain
  float g = hash21(pixel + floor(uTime * uNoiseSpeed * 60.0));
  ink = clamp(ink + (g - 0.5) * uGrainAmount, 0.0, 1.0);

  // Stage 10 — procedural color material (palette / gradient / blend)
  vec3 rgb = matComposeColor(uvSample, ink, dithered, bloomAmt, uTime);
  fragColor = vec4(rgb, uOpacity);
}
`;

export const FRAG_SRC =
  FRAG_HEAD + ANIM_GLSL + INTERACTION_GLSL + COLOR_GLSL + FRAG_BODY;
