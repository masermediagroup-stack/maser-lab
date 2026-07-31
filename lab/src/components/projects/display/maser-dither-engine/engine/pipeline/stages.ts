import { ANIM_GLSL } from "../animation/animGlsl";
import { COLOR_GLSL } from "../color/colorGlsl";
import { INTERACTION_GLSL } from "../interaction/interactionGlsl";
import { LIGHT_GLSL } from "../lighting/lightGlsl";

/**
 * Pipeline stages — animation, interaction, light shape, color, dither.
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
    id: 11,
    name: "Light shape",
    description:
      "Radial / ellipse / linear / cone / organic illumination field (luminance)",
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
    id: 2,
    name: "Bayer dither",
    description:
      "Ordered dither 2×2 / 4×4 / 8×8 / 32×32 / 64×64 — denser in dark outer",
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
    description: "Bloom concentrated on the bright light core",
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
  return mix(v, clamp(v, 0.0, 1.0), 0.68);
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
  vec2 uvSample = vec2(softClamp01(uvAnim.x), softClamp01(uvAnim.y));

  // Stage 11 — light shape supplies luminance (NOT the color gradient)
  float illum = lightShapeField(uvSample);

  // Subtle modulation only — must not flatten center→edge contrast
  // or reintroduce asymmetric interaction wash (old ambient sat top-left).
  illum = clamp(illum + anim.z * 0.1, 0.0, 1.0);
  float ixMod = sampleInteraction(uvSample);
  illum = mix(illum, clamp(illum + ixMod * 0.35, 0.0, 1.0), 0.18);

  // Stage 5 remap
  float lum = remapContrast(illum);

  // Stage 6 bloom — concentrated on bright core
  float bloomAmt = lightBloomMask(uvSample, lum) * (uBloom + uIxStateBloom) * 0.7;
  bloomAmt *= mix(0.6, 1.2, uBloomRadius / 0.2);
  lum = clamp(lum + bloomAmt * 0.35, 0.0, 1.0);

  // Stage 4 posterize
  lum = posterize(lum);

  // Stage 2–3 dither — denser in the dark outer ring
  float threshold = sampleBayer(pixel);
  float bn = sampleBlue(pixel * uNoiseScale + vec2(uTime * uNoiseSpeed * 8.0, uScroll * 20.0));
  threshold = mix(threshold, bn, clamp(uBlueNoiseAmount, 0.0, 1.0));
  // Raise threshold in dark areas → more ink dots (denser dither)
  float dark = 1.0 - lum;
  threshold = clamp(threshold + dark * uLsDitherResponse * 0.38, 0.0, 1.0);

  float dithered = step(threshold, lum);
  // Outside the core, lean harder into ordered dither
  float ditherMix = mix(0.55, 0.92, dark * uLsDitherResponse);
  float ink = mix(lum, dithered, ditherMix);

  // Stage 7 grain
  float g = hash21(pixel + floor(uTime * uNoiseSpeed * 60.0));
  ink = clamp(ink + (g - 0.5) * uGrainAmount, 0.0, 1.0);

  // Stage 10 — color maps onto lighting luminance
  vec3 rgb = matComposeColor(uvSample, ink, dithered, bloomAmt, illum, uTime);
  fragColor = vec4(rgb, uOpacity);
}
`;

export const FRAG_SRC =
  FRAG_HEAD + ANIM_GLSL + INTERACTION_GLSL + LIGHT_GLSL + COLOR_GLSL + FRAG_BODY;
