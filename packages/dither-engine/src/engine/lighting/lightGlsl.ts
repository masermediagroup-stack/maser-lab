/**
 * Light-shape GLSL — luminance field independent of color gradients.
 * Inserted into shared FRAG after interaction uniforms.
 */
export const LIGHT_GLSL = `
uniform float uLsShape;
uniform float uLsCenterX;
uniform float uLsCenterY;
uniform float uLsRadius;
uniform float uLsStretchX;
uniform float uLsStretchY;
uniform float uLsRotation;
uniform float uLsCore;
uniform float uLsEdge;
uniform float uLsFalloff;
uniform float uLsFalloffCurve;
uniform float uLsContrast;
uniform float uLsDitherResponse;
uniform float uLsGradFollows;
uniform float uLsPointerFollow;

float lsApplyCurve(float t, float curve) {
  t = clamp(t, 0.0, 1.0);
  if (curve < 0.5) return t; // linear
  if (curve < 1.5) return t * t * (3.0 - 2.0 * t); // smooth
  if (curve < 2.5) return pow(t, mix(1.2, 2.8, uLsFalloff)); // power
  // gaussian-ish
  float x = t * 2.4;
  return 1.0 - exp(-x * x);
}

float lightShapeField(vec2 uv) {
  // Soft pointer follow — does not replace the authored light center
  vec2 center = mix(
    vec2(uLsCenterX, uLsCenterY),
    uIxPointer,
    clamp(uLsPointerFollow * uIxInfluence, 0.0, 0.85)
  );
  center.y += uScroll * uScrollInfluence * 0.03;

  vec2 p = uv - center;
  float rot = radians(uLsRotation);
  float cs = cos(rot);
  float sn = sin(rot);
  p = mat2(cs, -sn, sn, cs) * p;
  p.x /= max(uLsStretchX, 0.08);
  p.y /= max(uLsStretchY, 0.08);

  float shape = uLsShape;
  float d;
  if (shape < 0.5) {
    // radial
    d = length(p);
  } else if (shape < 1.5) {
    // ellipse (stretch already applied)
    d = length(p);
  } else if (shape < 2.5) {
    // linear band
    d = abs(p.x);
  } else if (shape < 3.5) {
    // cone — distance weighted by angle from +Y
    float ang = abs(atan(p.x, p.y));
    float cone = 1.0 + ang * 1.35;
    d = length(p) * cone;
  } else {
    // organic — noise-warped radius
    float n = fract(sin(dot(uv * 6.0 + center, vec2(12.9898, 78.233))) * 43758.5453);
    d = length(p) * mix(0.82, 1.22, n);
  }

  float r = max(uLsRadius, 0.04);
  float t = clamp(d / r, 0.0, 1.0);
  float f = lsApplyCurve(t, uLsFalloffCurve);
  // Extra falloff shaping
  f = pow(clamp(f, 0.0, 1.0), mix(0.65, 2.2, uLsFalloff));

  // Center = core brightness, outer = edge darkness
  float illum = mix(uLsCore, uLsEdge, f);
  illum = clamp((illum - 0.5) * uLsContrast + 0.5, 0.0, 1.0);
  return illum;
}

float lightBloomMask(vec2 uv, float illum) {
  // Bloom concentrates on the bright core — not the whole field
  float core = smoothstep(0.45, 0.92, illum);
  return core * core;
}
`;
