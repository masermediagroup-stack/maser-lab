import { Color, Vector2, Vector4, type IUniform, type Texture } from "three";
import { MAX_SURFACE_ORBS } from "./constants";
import { assembleTypeWorldFragment } from "./shaders/assemble";

export const GLYPH_VERT = /* glsl */ `
varying vec2 vUv;
varying vec3 vSphereDir;

void main() {
  vUv = uv;
  vSphereDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/** Default fragment (Orbs) — other effects are assembled on selection. */
export const GLYPH_FRAG = assembleTypeWorldFragment("orbs");

export type GlyphGradientUniforms = {
  uGlyphs: IUniform<Texture | null>;
  uColorA: IUniform<Color>;
  uColorB: IUniform<Color>;
  uColorC: IUniform<Color>;
  uDir: IUniform<Vector2>;
  uSpread: IUniform<number>;
  uPhase: IUniform<number>;
  uOrbs: IUniform<Vector4[]>;
  uOrbCount: IUniform<number>;
  uOrbEdge: IUniform<number>;
  uOrbColor: IUniform<Color>;
  uOrbText: IUniform<Color>;
  uRenderOrbBody: IUniform<number>;
  uTime: IUniform<number>;
  uSeed: IUniform<number>;
  uScale: IUniform<number>;
  uSoftness: IUniform<number>;
  uThreshold: IUniform<number>;
  uDensity: IUniform<number>;
  uAmplitude: IUniform<number>;
  uDirection: IUniform<number>;
  uDistortion: IUniform<number>;
  uEdge: IUniform<number>;
  uContrast: IUniform<number>;
  uFrequency: IUniform<number>;
  uThickness: IUniform<number>;
};

export function createGlyphGradientUniforms(): GlyphGradientUniforms {
  return {
    uGlyphs: { value: null },
    uColorA: { value: new Color() },
    uColorB: { value: new Color() },
    uColorC: { value: new Color() },
    uDir: { value: new Vector2(1, 0) },
    uSpread: { value: 1 },
    uPhase: { value: 0 },
    uOrbs: {
      value: Array.from({ length: MAX_SURFACE_ORBS }, () => new Vector4()),
    },
    uOrbCount: { value: 0 },
    uOrbEdge: { value: 0.045 },
    uOrbColor: { value: new Color() },
    uOrbText: { value: new Color() },
    uRenderOrbBody: { value: 1 },
    uTime: { value: 0 },
    uSeed: { value: 1 },
    uScale: { value: 1 },
    uSoftness: { value: 1 },
    uThreshold: { value: 0.4 },
    uDensity: { value: 7 },
    uAmplitude: { value: 0.22 },
    uDirection: { value: 0.55 },
    uDistortion: { value: 0.32 },
    uEdge: { value: 1.1 },
    uContrast: { value: 0.14 },
    uFrequency: { value: 1.15 },
    uThickness: { value: 0.55 },
  };
}
