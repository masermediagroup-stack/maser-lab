import { MAX_SURFACE_ORBS } from "../constants";
import { SURFACE_COMMON_GLSL } from "./common";
import { SURFACE_COMPOSITOR_GLSL } from "./compositor";
import { EFFECT_METABALLS_GLSL } from "./effects/metaballs";
import { EFFECT_ORBS_GLSL } from "./effects/orbs";
import { EFFECT_PERLIN_GLSL } from "./effects/perlin";
import { EFFECT_VORONOI_GLSL } from "./effects/voronoi";
import { EFFECT_WAVES_GLSL } from "./effects/waves";
import type { SurfaceEffectId } from "./registry";

const EFFECT_GLSL: Record<Exclude<SurfaceEffectId, "none">, string> = {
  orbs: EFFECT_ORBS_GLSL,
  metaballs: EFFECT_METABALLS_GLSL,
  waves: EFFECT_WAVES_GLSL,
  voronoi: EFFECT_VORONOI_GLSL,
  perlin: EFFECT_PERLIN_GLSL,
};

const NEEDS_COMMON: Record<SurfaceEffectId, boolean> = {
  none: false,
  orbs: false,
  metaballs: true,
  waves: true,
  voronoi: true,
  perlin: true,
};

const FRAG_HEAD = /* glsl */ `
#include <common>
uniform sampler2D uGlyphs;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uDir;
uniform float uSpread;
uniform float uPhase;
uniform vec4 uOrbs[${MAX_SURFACE_ORBS}];
uniform float uOrbCount;
uniform float uOrbEdge;
uniform vec3 uOrbColor;
uniform vec3 uOrbText;
uniform float uRenderOrbBody;
uniform float uTime;
uniform float uSeed;
uniform float uScale;
uniform float uSoftness;
uniform float uThreshold;
uniform float uDensity;
uniform float uAmplitude;
uniform float uDirection;
uniform float uDistortion;
uniform float uEdge;
uniform float uContrast;
uniform float uFrequency;
uniform float uThickness;
varying vec2 vUv;
varying vec3 vSphereDir;
`;

const FRAG_MAIN_NONE = /* glsl */ `
void main() {
  float glyph = texture2D(uGlyphs, vUv).a;
  EffectResult fx;
  fx.mask = 0.0;
  fx.color = vec3(0.0);
  twCompose(fx, glyph);
  #include <colorspace_fragment>
  gl_FragColor.rgb *= gl_FragColor.a;
}
`;

const FRAG_MAIN_EFFECT = /* glsl */ `
void main() {
  float glyph = texture2D(uGlyphs, vUv).a;
  EffectResult fx = twEffect(normalize(vSphereDir), uTime);
  twCompose(fx, glyph);
  #include <colorspace_fragment>
  gl_FragColor.rgb *= gl_FragColor.a;
}
`;

export function assembleTypeWorldFragment(effect: SurfaceEffectId): string {
  if (effect === "none") {
    return `${FRAG_HEAD}
${SURFACE_COMPOSITOR_GLSL}
${FRAG_MAIN_NONE}
`;
  }
  const common = NEEDS_COMMON[effect] ? SURFACE_COMMON_GLSL : "";
  return `${FRAG_HEAD}
${common}
${SURFACE_COMPOSITOR_GLSL}
${EFFECT_GLSL[effect]}
${FRAG_MAIN_EFFECT}
`;
}
