import { Color, Vector2, Vector4, type IUniform, type Texture } from "three";
import { MAX_SURFACE_ORBS } from "./constants";

export const GLYPH_VERT = /* glsl */ `
varying vec2 vUv;
varying vec3 vSphereDir;

void main() {
  vUv = uv;
  vSphereDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * Glyph alpha × 3-stop cosine palette, plus geodesic orb discs.
 *
 * Orbs are unit-sphere centers (local space). Angular distance makes them
 * read as flat decals on the implied globe — not screen-space dots.
 *
 * Compositing:
 *   neither → discard
 *   orb only → orb body color
 *   text only → gradient
 *   both → alternate in-orb text color (optional invert of the gradient)
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
uniform vec4 uOrbs[${MAX_SURFACE_ORBS}];
uniform float uOrbCount;
uniform float uOrbEdge;
uniform vec3 uOrbColor;
uniform vec3 uOrbTextA;
uniform vec3 uOrbTextB;
uniform float uInvertText;
uniform float uRenderOrbBody;
varying vec2 vUv;
varying vec3 vSphereDir;

void main() {
  float glyph = texture2D(uGlyphs, vUv).a;
  vec3 dir = normalize(vSphereDir);

  float orbMask = 0.0;
  for (int i = 0; i < ${MAX_SURFACE_ORBS}; i++) {
    if (float(i) >= uOrbCount) {
      continue;
    }
    vec4 orb = uOrbs[i];
    float radius = orb.w;
    if (radius <= 0.0001) {
      continue;
    }
    vec3 center = normalize(orb.xyz);
    float ang = acos(clamp(dot(dir, center), -1.0, 1.0));
    float edge = clamp(uOrbEdge, 0.02, 0.9);
    float inner = radius * (1.0 - edge);
    orbMask = max(orbMask, 1.0 - smoothstep(inner, radius, ang));
  }

  float body = orbMask * uRenderOrbBody;
  if (glyph < 0.02 && body < 0.02) discard;

  float t = fract(dot(vUv, uDir) * uSpread + uPhase);
  float a = t * PI2;
  float wA = pow(0.5 + 0.5 * cos(a), 1.35);
  float wB = pow(0.5 + 0.5 * cos(a - 2.09439510239), 1.35);
  float wC = pow(0.5 + 0.5 * cos(a + 2.09439510239), 1.35);
  float wSum = max(0.0001, wA + wB + wC);
  vec3 gradient = (uColorA * wA + uColorB * wB + uColorC * wC) / wSum;

  vec3 inOrbText = mix(uOrbTextA, uOrbTextB, t);
  if (uInvertText > 0.5) {
    inOrbText = vec3(1.0) - gradient;
  }

  vec3 color;
  float alpha;
  if (glyph >= 0.02) {
    color = mix(gradient, inOrbText, orbMask);
    alpha = glyph;
  } else {
    color = uOrbColor;
    alpha = body;
  }

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
  uOrbs: IUniform<Vector4[]>;
  uOrbCount: IUniform<number>;
  uOrbEdge: IUniform<number>;
  uOrbColor: IUniform<Color>;
  uOrbTextA: IUniform<Color>;
  uOrbTextB: IUniform<Color>;
  uInvertText: IUniform<number>;
  uRenderOrbBody: IUniform<number>;
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
    uOrbEdge: { value: 0.14 },
    uOrbColor: { value: new Color() },
    uOrbTextA: { value: new Color() },
    uOrbTextB: { value: new Color() },
    uInvertText: { value: 0 },
    uRenderOrbBody: { value: 1 },
  };
}
