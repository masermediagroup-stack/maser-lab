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
 * Overlap RGB is a hard membership pick (gradient vs one solid invert).
 * Glyph coverage still antialiases via alpha, but those two RGBs never mix.
 * Letter coverage composites over the disc so fringes AA against the orb
 * instead of punching a second color ring (the old stroke/fill outline).
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
uniform vec3 uOrbText;
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
    float aa = fwidth(ang);
    float art = radius * clamp(uOrbEdge, 0.0, 0.35);
    float halfW = max(art, aa);
    float inner = max(radius - halfW, 0.0);
    float outer = radius + aa * 0.35;
    if (outer <= inner) {
      outer = inner + max(aa, 1e-5);
    }
    orbMask = max(orbMask, 1.0 - smoothstep(inner, outer, ang));
  }

  float body = orbMask * uRenderOrbBody;
  if (glyph < 0.001 && body < 0.001) discard;

  float t = fract(dot(vUv, uDir) * uSpread + uPhase);
  float a = t * PI2;
  float wA = pow(0.5 + 0.5 * cos(a), 1.35);
  float wB = pow(0.5 + 0.5 * cos(a - 2.09439510239), 1.35);
  float wC = pow(0.5 + 0.5 * cos(a + 2.09439510239), 1.35);
  float wSum = max(0.0001, wA + wB + wC);
  vec3 gradient = (uColorA * wA + uColorB * wB + uColorC * wC) / wSum;

  // Any disc coverage inverts the glyph to one solid. Soft orb edges still
  // fade the body; they must not fade glyph RGB toward the gradient.
  float inOrb = step(0.02, orbMask);
  vec3 textRgb = mix(gradient, uOrbText, inOrb);

  float aText = glyph;
  float aUnder = body * (1.0 - aText);
  float alpha = min(1.0, aText + aUnder);
  vec3 color = (textRgb * aText + uOrbColor * aUnder) / max(alpha, 1e-5);

  gl_FragColor = vec4(color, alpha);
  #include <colorspace_fragment>
  gl_FragColor.rgb *= gl_FragColor.a;
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
  uOrbText: IUniform<Color>;
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
    uOrbEdge: { value: 0.045 },
    uOrbColor: { value: new Color() },
    uOrbText: { value: new Color() },
    uRenderOrbBody: { value: 1 },
  };
}
