/**
 * Shared fragment stages — single GLSL program for all surfaces.
 * Order: Animation → Interaction → Material UV → Light → Material field →
 * Contrast/Bloom/Posterize → Dither → Grain → Color → Material finish.
 */

import { ANIM_GLSL } from "../animation/animGlsl";
import { COLOR_GLSL } from "../color/colorGlsl";
import { DITHER_GLSL } from "../dither/ditherGlsl";
import { INTERACTION_GLSL } from "../interaction/interactionGlsl";
import { LIGHT_GLSL } from "../lighting/lightGlsl";
import { MATERIAL_GLSL } from "../material/materialGlsl";

export const VERT_SRC = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG_HEAD = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform float uTime;
uniform float uPixelDensity;
uniform float uContrast;
uniform float uPosterizeLevels;
uniform float uGrainAmount;
uniform float uNoiseSpeed;
uniform float uBloom;
uniform float uBloomRadius;
uniform float uOpacity;
`;

const SAMPLE_GLSL = `
float softClamp01(float x) {
  return clamp(x, 0.0, 1.0);
}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float remapContrast(float v) {
  float c = max(uContrast, 0.01);
  return softClamp01(pow(softClamp01(v), 1.0 / c));
}

float posterize(float v) {
  float levels = max(uPosterizeLevels, 2.0);
  return floor(v * (levels - 1.0) + 0.5) / (levels - 1.0);
}
`;

/**
 * Logical stage order for docs / inspector (matches fragment execution).
 */
export const PIPELINE_STAGES = [
  {
    id: "animation",
    label: "Animation",
    description: "Procedural UV / ambient modulation from active animation mode.",
  },
  {
    id: "interaction",
    label: "Interaction",
    description: "Pointer tug + multi-light influence on UV and illumination.",
  },
  {
    id: "material-uv",
    label: "Material UV",
    description: "Material-specific UV distortion (glass refraction, CRT curve, smoke drift).",
  },
  {
    id: "light",
    label: "Light shape",
    description: "Luminance geometry from lighting mode (radial, beam, strip, …).",
  },
  {
    id: "material-field",
    label: "Material structure",
    description: "Procedural material density / structure modulating luminance.",
  },
  {
    id: "contrast",
    label: "Contrast",
    description: "Global contrast remap.",
  },
  {
    id: "bloom",
    label: "Bloom",
    description: "Highlight bloom from light core + interaction state.",
  },
  {
    id: "posterize",
    label: "Posterize",
    description: "Global tone steps before dither.",
  },
  {
    id: "dither",
    label: "Dither",
    description: "Algorithm dither (Bayer, blue noise, hybrid, …).",
  },
  {
    id: "grain",
    label: "Grain",
    description: "Temporal film grain overlay.",
  },
  {
    id: "color",
    label: "Color",
    description: "Palette / gradient chroma mapped onto lighting luminance.",
  },
  {
    id: "material-finish",
    label: "Material finish",
    description: "Material-specific edge / CRT / chrome finish on final RGB.",
  },
] as const;

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

  // Material UV (glass / CRT / smoke / velvet)
  vec2 uvSample = applyMaterialUv(uvBase, uTime);

  // Stage — light shape supplies luminance (NOT the color gradient)
  float illum = lightShapeField(uvSample);

  // Subtle animation modulation — must not flatten center→edge contrast
  illum = clamp(illum + anim.z * 0.1, 0.0, 1.0);
  float ixMod = sampleInteraction(uvSample);
  illum = mix(illum, clamp(illum + ixMod * 0.35, 0.0, 1.0), 0.18);

  // Material structure field (.x = luminance multiplier, .y = sheen)
  vec2 matF = sampleMaterialField(uvSample, illum, uTime);
  float structAmt = uMatStructAmt;
  illum = mix(illum, clamp(illum * matF.x, 0.0, 1.0), structAmt);
  float sheen = matF.y;

  // Contrast remap
  float lum = remapContrast(illum);

  // Bloom — concentrated on bright core
  float bloomAmt = lightBloomMask(uvSample, lum) * (uBloom + uIxStateBloom) * 0.7;
  bloomAmt *= mix(0.6, 1.2, uBloomRadius / 0.2);
  float bloomLayer = step(0.5, float(mod(floor(uMatLayerBits / 256.0), 2.0)));
  if (uMatLayerBits < 0.5) bloomLayer = 1.0;
  lum = clamp(lum + bloomAmt * 0.35 * bloomLayer, 0.0, 1.0);

  // Posterize (global tone steps — also used by posterized dither)
  lum = posterize(lum);

  // Algorithm dither
  vec2 dit = applyDitherStage(pixel, lum, uTime);
  float ink = dit.x;
  float dithered = dit.y;

  // Grain
  float grainLayer = step(0.5, float(mod(floor(uMatLayerBits / 32.0), 2.0)));
  if (uMatLayerBits < 0.5) grainLayer = 1.0;
  float g = hash21(pixel + floor(uTime * uNoiseSpeed * 60.0));
  ink = clamp(ink + (g - 0.5) * uGrainAmount * grainLayer, 0.0, 1.0);

  // Color maps onto lighting luminance
  vec3 rgb = matComposeColor(uvSample, ink, dithered, bloomAmt, illum, uTime);

  // Material finish (CRT scanlines, chrome bands, glass vignette)
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
