/**
 * Universal TYPE WORLD compositor.
 *
 * Every surface effect returns EffectResult { mask, color }.
 * Typography uses sphere UVs (glyph atlas + cosine gradient).
 * Effects use sphere-space direction (vSphereDir).
 *
 * Four fragment states:
 *   1. neither → discard (invisible sphere body)
 *   2. effect only → effect body
 *   3. text only → animated gradient
 *   4. text ∩ effect → solid inverted glyph (no stroke/fill mix)
 *
 * Gradient + overlap math is the existing TYPE WORLD compositor,
 * generalized from the orb mask to any effectMask.
 */

export const SURFACE_COMPOSITOR_GLSL = /* glsl */ `
struct EffectResult {
  float mask;
  vec3 color;
};

vec3 twTextGradient(vec2 uv) {
  float t = fract(dot(uv, uDir) * uSpread + uPhase);
  float a = t * PI2;
  float wA = pow(0.5 + 0.5 * cos(a), 1.35);
  float wB = pow(0.5 + 0.5 * cos(a - 2.09439510239), 1.35);
  float wC = pow(0.5 + 0.5 * cos(a + 2.09439510239), 1.35);
  float wSum = max(0.0001, wA + wB + wC);
  return (uColorA * wA + uColorB * wB + uColorC * wC) / wSum;
}

void twCompose(EffectResult fx, float glyph) {
  float effectMask = clamp(fx.mask, 0.0, 1.0);
  float body = effectMask * uRenderOrbBody;
  if (glyph < 0.001 && body < 0.001) discard;

  vec3 gradient = twTextGradient(vUv);
  float inEffect = step(0.04, effectMask);
  vec3 textRgb = mix(gradient, uOrbText, inEffect);

  float aText = glyph;
  float aUnder = body * (1.0 - aText);
  float alpha = min(1.0, aText + aUnder);
  vec3 color = (textRgb * aText + fx.color * aUnder) / max(alpha, 1.0e-5);
  gl_FragColor = vec4(color, alpha);
}
`
