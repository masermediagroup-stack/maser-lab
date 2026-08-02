/**
 * Shared fragment stages — single GLSL program for all surfaces.
 * Order: Animation → Interaction → Material UV → Light → Material field →
 * Contrast/Bloom/Posterize → Dither → Grain → Color → Material finish.
 *
 * CRITICAL: Vertex uses gl_VertexID fullscreen triangle (no attribute buffer).
 * Do not switch to aPos without binding a VBO in SurfaceRenderer.
 */

import { ANIM_GLSL } from "../animation/animGlsl";
import { COLOR_GLSL } from "../color/colorGlsl";
import { DITHER_GLSL } from "../dither/ditherGlsl";
import { INTERACTION_GLSL } from "../interaction/interactionGlsl";
import { LIGHT_GLSL } from "../lighting/lightGlsl";
import { MATERIAL_GLSL } from "../material/materialGlsl";

/**
 * Pipeline stages — animation → interaction → material → light → tone → dither → color.
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
    id: 12,
    name: "Material UV",
    description:
      "Material-specific UV warp (glass refraction, CRT curve, smoke drift)",
  },
  {
    id: 11,
    name: "Light shape",
    description:
      "Radial / ellipse / linear / cone / organic illumination field (luminance)",
  },
  {
    id: 13,
    name: "Material structure",
    description:
      "Procedural material density / structure modulating luminance",
  },
  {
    id: 5,
    name: "Contrast remapping",
    description: "Brightness, contrast, shadow/highlight strength",
  },
  {
    id: 6,
    name: "Highlight bloom",
    description: "Bloom concentrated on the bright light core",
  },
  {
    id: 4,
    name: "Posterization",
    description: "Quantize luminance levels (0 = off)",
  },
  {
    id: 2,
    name: "Dither quantization",
    description:
      "Algorithm family (Bayer, blue-noise, halftone, …) with pattern scale",
  },
  {
    id: 7,
    name: "Animated grain",
    description: "Time-varying filmic grain",
  },
  {
    id: 1,
    name: "Color gradient",
    description:
      "Palette chroma only — does not flatten lighting luminance",
  },
  {
    id: 10,
    name: "Color material",
    description:
      "Maps core/outer colors onto illumination; blend + behavior",
  },
  {
    id: 14,
    name: "Material finish",
    description: "Material-specific edge / CRT / chrome finish on final RGB",
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

/** Optional photo / bitmap luminance source (unit 6). */
uniform sampler2D uSource;
uniform float uSourceEnabled;
uniform vec2 uSourceSize;
/** 0 = pure image luminance; 1 = image × light field. */
uniform float uSourceLightMix;
`;

/** Shared sampling helpers — must appear before DITHER_GLSL. */
const SAMPLE_GLSL = `
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
  // Soft edge = how hard UV warps clamp (advanced finish). Unused depth kept as noop.
  float soft = mix(0.35, 0.95, clamp(uSoftEdge, 0.0, 1.0));
  return mix(v, clamp(v, 0.0, 1.0), soft);
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
`;

const FRAG_MAIN = `
void main() {
  vec2 uv = vUv;

  // Stage 0 — procedural animation
  vec4 anim = sampleAnimation(uv, uTime);
  vec2 uvAnim = uv + anim.xy;

  // Soft interaction tug (does not replace light shape)
  vec2 tug = (uIxPointer - 0.5) * uIxInfluence * 0.025;
  tug += uIxVelocity * 0.0006 * uIxInfluence;
  uvAnim += tug;

  vec2 pixel = gl_FragCoord.xy * max(uPixelDensity, 0.01);
  vec2 uvBase = vec2(softClamp01(uvAnim.x), softClamp01(uvAnim.y));

  // Material UV (glass / CRT / smoke) — no-op when uMatId == 0
  vec2 uvSample = applyMaterialUv(uvBase, uTime);

  // Stage 11 — light shape supplies luminance (NOT the color gradient)
  float lightIllum = lightShapeField(uvSample);
  float illum = lightIllum;

  // Optional uploaded image — dither operates on photo luminance
  if (uSourceEnabled > 0.5) {
    float canvasAspect = uResolution.x / max(uResolution.y, 1.0);
    float imageAspect = uSourceSize.x / max(uSourceSize.y, 1.0);
    vec2 scale = canvasAspect > imageAspect
      ? vec2(1.0, imageAspect / canvasAspect)
      : vec2(canvasAspect / imageAspect, 1.0);
    vec2 suv = (uvSample - 0.5) * scale + 0.5;
    float inBounds = step(0.0, suv.x) * step(suv.x, 1.0) * step(0.0, suv.y) * step(suv.y, 1.0);
    vec3 srcRgb = texture(uSource, clamp(suv, 0.0, 1.0)).rgb;
    float srcLum = dot(srcRgb, vec3(0.299, 0.587, 0.114));
    srcLum *= inBounds;
    float lit = clamp(srcLum * (0.22 + lightIllum * 1.55), 0.0, 1.0);
    illum = mix(srcLum, lit, clamp(uSourceLightMix, 0.0, 1.0));
  }

  // Subtle modulation only — must not flatten center→edge contrast
  illum = clamp(illum + anim.z * 0.1, 0.0, 1.0);
  float ixMod = sampleInteraction(uvSample);
  illum = mix(illum, clamp(illum + ixMod * 0.35, 0.0, 1.0), 0.18);

  // Material structure (.x = luminance multiplier, .y = sheen)
  vec2 matF = sampleMaterialField(uvSample, illum, uTime);
  illum = mix(illum, clamp(illum * matF.x, 0.0, 1.0), uMatStructAmt);
  float sheen = matF.y;

  // Stage 5 remap
  float lum = remapContrast(illum);

  // Stage 6 bloom — concentrated on bright core
  float bloomAmt = lightBloomMask(uvSample, lum) * (uBloom + uIxStateBloom) * 0.7;
  bloomAmt *= mix(0.6, 1.2, uBloomRadius / 0.2);
  lum = clamp(lum + bloomAmt * 0.35, 0.0, 1.0);

  // Stage 4 posterize (global tone steps — also used by posterized dither)
  lum = posterize(lum);

  // Stage 2 — algorithm dither (pattern scale ≠ matrix size ≠ render density)
  vec2 dit = applyDitherStage(pixel, lum, uTime);
  float ink = dit.x;
  float dithered = dit.y;

  // Stage 7 grain
  float g = hash21(pixel + floor(uTime * uNoiseSpeed * 60.0));
  ink = clamp(ink + (g - 0.5) * uGrainAmount, 0.0, 1.0);

  // Stage 10 — color maps onto lighting luminance
  vec3 rgb = matComposeColor(uvSample, ink, dithered, bloomAmt, illum, uTime);

  // Material finish (CRT fringe, chrome edge, paper warmth)
  rgb = applyMaterialFinish(rgb, uvSample, ink, sheen, uTime);

  fragColor = vec4(rgb, uOpacity);
}
`;

export const FRAG_SRC =
  FRAG_HEAD +
  ANIM_GLSL +
  INTERACTION_GLSL +
  LIGHT_GLSL +
  MATERIAL_GLSL +
  COLOR_GLSL +
  SAMPLE_GLSL +
  DITHER_GLSL +
  FRAG_MAIN;
