import { Color, Vector2, type IUniform, type Texture } from "three";

export const GLYPH_VERT = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * Glyph alpha × a 3-stop cosine palette that wraps in UV space.
 * Phase is independent of mesh rotation so pigment keeps traveling while
 * the visitor turns the world. fract() + overlapping cosine lobes avoid
 * a hard seam at u = 0/1.
 */
export const GLYPH_FRAG = /* glsl */ `
#include <common>
uniform sampler2D uGlyphs;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uDir;
uniform float uSpread;
uniform float uPhase;
varying vec2 vUv;

void main() {
  float alpha = texture2D(uGlyphs, vUv).a;
  if (alpha < 0.02) discard;

  float t = fract(dot(vUv, uDir) * uSpread + uPhase);
  float a = t * PI2;
  float wA = pow(0.5 + 0.5 * cos(a), 1.35);
  float wB = pow(0.5 + 0.5 * cos(a - 2.09439510239), 1.35);
  float wC = pow(0.5 + 0.5 * cos(a + 2.09439510239), 1.35);
  float wSum = max(0.0001, wA + wB + wC);
  vec3 color = (uColorA * wA + uColorB * wB + uColorC * wC) / wSum;

  gl_FragColor = vec4(color, alpha);
  #include <colorspace_fragment>
}
`;

export type GlyphGradientUniforms = {
  uGlyphs: IUniform<Texture | null>;
  uColorA: IUniform<Color>;
  uColorB: IUniform<Color>;
  uColorC: IUniform<Color>;
  uDir: IUniform<Vector2>;
  uSpread: IUniform<number>;
  uPhase: IUniform<number>;
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
  };
}
