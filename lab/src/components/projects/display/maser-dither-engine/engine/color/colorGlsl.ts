/**
 * Color / gradient / blend GLSL — color only.
 * Luminance comes from lightShapeField(); this module maps color onto it.
 */
export const COLOR_GLSL = `
uniform float uMatColorEnabled;
uniform float uMatGradMode;
uniform float uMatGradBehavior;
uniform float uMatGradSpeed;
uniform float uMatGradOffset;
uniform float uMatBlendMode;
uniform float uMatBehavior;
uniform float uMatExposure;
uniform float uMatGamma;
uniform float uMatThreshold;
uniform float uMatDensity;
uniform float uMatSharpness;
uniform float uMatSmoothness;
uniform float uMatBlur;
uniform float uMatWeight;
uniform float uMatScatter;

// Packed color slots (14 × rgb) as vec4 groups
uniform vec4 uMatC0; // background.rgb + highlight.r
uniform vec4 uMatC1; // highlight.gb + shadow.rg
uniform vec4 uMatC2; // shadow.b + dither.rgb
uniform vec4 uMatC3; // bloom.rgb + ambient.r
uniform vec4 uMatC4; // ambient.gb + accent.rg
uniform vec4 uMatC5; // accent.b + gradStart.rgb
uniform vec4 uMatC6; // gradEnd.rgb + gradMid.r
uniform vec4 uMatC7; // gradMid.gb + gradFourth.rg
uniform vec4 uMatC8; // gradFourth.b + glow.rgb
uniform vec4 uMatC9; // edge.rgb + noise.r
uniform vec2 uMatC10; // noise.gb

vec3 matBg() { return uMatC0.rgb; }
vec3 matHighlight() { return vec3(uMatC0.a, uMatC1.rg); }
vec3 matShadow() { return vec3(uMatC1.ba, uMatC2.r); }
vec3 matDither() { return uMatC2.gba; }
vec3 matBloom() { return uMatC3.rgb; }
vec3 matAmbient() { return vec3(uMatC3.a, uMatC4.rg); }
vec3 matAccent() { return vec3(uMatC4.ba, uMatC5.r); }
vec3 matGradA() { return uMatC5.gba; }
vec3 matGradB() { return uMatC6.rgb; }
vec3 matGradC() { return vec3(uMatC6.a, uMatC7.rg); }
vec3 matGradD() { return vec3(uMatC7.ba, uMatC8.r); }
vec3 matGlow() { return uMatC8.gba; }
vec3 matEdge() { return uMatC9.rgb; }
vec3 matNoise() { return vec3(uMatC9.a, uMatC10.rg); }

float matLuma(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

vec3 matHueShift(vec3 c, float h) {
  float angle = h * 6.2831853;
  float s = sin(angle);
  float ct = cos(angle);
  vec3 k = vec3(0.57735);
  return c * ct + cross(k, c) * s + k * dot(k, c) * (1.0 - ct);
}

float matGradCoord(vec2 uv, float t) {
  float mode = uMatGradMode;
  float beh = uMatGradBehavior;
  float speed = uMatGradSpeed;
  float off = uMatGradOffset;
  vec2 p = uv - 0.5;

  if (beh > 0.5 && beh < 1.5) {
    float a = radians(uGradientAngle) + t * speed + off;
    float cs = cos(a);
    float sn = sin(a);
    p = mat2(cs, -sn, sn, cs) * p;
  } else if (beh > 3.5 && beh < 4.5) {
    p.x += sin(t * speed + uv.y * 4.0 + off) * 0.08;
    p.y += cos(t * speed * 0.8 + uv.x * 3.0) * 0.06;
  } else if (beh > 5.5 && beh < 6.5) {
    p += vec2(cos(t * speed + off), sin(t * speed + off)) * 0.12;
  } else if (beh > 6.5 && beh < 7.5) {
    p += vec2(
      fract(sin(dot(uv, vec2(12.1, 4.7)) + t * speed) * 43758.5),
      fract(sin(dot(uv, vec2(7.3, 19.2)) + t * speed * 0.9) * 23421.1)
    ) * 0.08 - 0.04;
  }

  float g;
  if (mode > 3.5 && mode < 4.5) {
    g = length(p) * 1.4;
  } else if (mode > 4.5 && mode < 5.5) {
    g = atan(p.y, p.x) / 6.2831853 + 0.5;
  } else {
    float angle = radians(uGradientAngle);
    if (beh > 0.5 && beh < 1.5) angle = 0.0;
    vec2 dir = vec2(cos(angle), sin(angle));
    g = dot(p, dir) * 0.5 + 0.5;
  }

  if (beh > 1.5 && beh < 2.5) g *= 1.0 + 0.25 * sin(t * speed);
  if (beh > 2.5 && beh < 3.5) g = mix(0.5, g, 0.75 + 0.25 * cos(t * speed));
  if (beh > 4.5 && beh < 5.5) g += 0.08 * sin(t * speed * 2.0);
  if (beh > 9.5) g = 1.0 - abs(2.0 * fract(g + off) - 1.0);
  if (beh > 8.5 && beh < 9.5) g = mix(g, 1.0 - g, 0.5 + 0.5 * sin(t * speed));

  return clamp(g + off * 0.15, 0.0, 1.0);
}

vec3 matSampleGradientStops(float g) {
  float mode = uMatGradMode;
  vec3 a = matGradA();
  vec3 b = matGradB();
  vec3 c = matGradC();
  vec3 d = matGradD();
  g = clamp(g, 0.0, 1.0);

  if (mode < 0.5) return a;
  if (mode < 1.5 || (mode > 5.5 && mode < 7.5)) return mix(a, b, g);
  if (mode < 2.5) {
    return g < 0.5 ? mix(a, c, g * 2.0) : mix(c, b, (g - 0.5) * 2.0);
  }
  if (mode < 3.5) {
    if (g < 0.33) return mix(a, c, g / 0.33);
    if (g < 0.66) return mix(c, d, (g - 0.33) / 0.33);
    return mix(d, b, (g - 0.66) / 0.34);
  }
  return mix(a, b, g);
}

vec3 matSampleGradient(vec2 uv, float t) {
  float g = matGradCoord(uv, t);
  float mode = uMatGradMode;
  if (mode > 7.5) {
    float n = fract(sin(dot(uv * 8.0 + t * uMatGradSpeed, vec2(12.1, 78.2))) * 43758.5);
    return mix(matGradA(), matGradB(), mix(g, n, 0.45));
  }
  return matSampleGradientStops(g);
}

vec3 matBlend(vec3 base, vec3 blend, float mode) {
  if (mode < 0.5) return blend;
  if (mode < 1.5) return base * blend;
  if (mode < 2.5) return 1.0 - (1.0 - base) * (1.0 - blend);
  if (mode < 3.5) {
    return mix(
      2.0 * base * blend,
      1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
      step(0.5, base)
    );
  }
  if (mode < 4.5) {
    return mix(
      2.0 * base * blend + base * base * (1.0 - 2.0 * blend),
      sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend),
      step(0.5, blend)
    );
  }
  if (mode < 5.5) {
    return mix(
      2.0 * base * blend,
      1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
      step(0.5, blend)
    );
  }
  if (mode < 6.5) return abs(base - blend);
  if (mode < 7.5) return base + blend - 2.0 * base * blend;
  if (mode < 8.5) return clamp(base / max(1.0 - blend, 1e-3), 0.0, 1.0);
  float l = matLuma(blend);
  return base * (l / max(matLuma(base), 1e-3));
}

/**
 * Compose final RGB.
 * - illum / ink: lighting luminance (bright core → dark edge)
 * - gradient: color only (never used as a luminance wash)
 * - bloomAmt: separate additive bloom mask
 */
vec3 matComposeColor(vec2 uv, float ink, float dithered, float bloomAmt, float illum, float t) {
  if (uMatColorEnabled < 0.5) {
    return vec3(ink);
  }

  // Core vs outer palette colors — lighting drives the mix
  vec3 coreCol = matHighlight();
  vec3 outerCol = matShadow();
  float lit = pow(clamp(ink * uMatExposure, 0.0, 1.2), max(uMatGamma, 0.35));
  lit = clamp((lit - 0.5) * mix(0.85, 1.35, uMatSharpness) + 0.5, 0.0, 1.0);

  vec3 tone = mix(outerCol, coreCol, lit);

  // Gradient supplies chroma. When follows-light: sample along illumination.
  vec3 grad;
  if (uLsGradFollows > 0.5) {
    // illum 1 (core) → gradStart, illum 0 (edge) → gradEnd
    grad = matSampleGradientStops(1.0 - clamp(illum, 0.0, 1.0));
  } else {
    grad = matSampleGradient(uv, t);
  }
  if (uMatGradBehavior > 7.5 && uMatGradBehavior < 8.5) {
    grad = matHueShift(grad, t * uMatGradSpeed * 0.08 + uMatGradOffset);
  }

  // Preserve lighting luminance; borrow gradient chrominance
  float toneL = max(matLuma(tone), 1e-3);
  float gradL = max(matLuma(grad), 1e-3);
  vec3 tinted = grad * (toneL / gradL);
  tone = mix(tone, tinted, mix(0.35, 0.7, uMatWeight));

  // Dense dither toward dark outer — ink dots, not a flat wash
  float dens = mix(0.2, 1.0, uMatDensity);
  float outerAmt = (1.0 - lit) * dens;
  tone = mix(tone, mix(tone, matDither(), 0.55), outerAmt * dithered * 0.45);
  tone = mix(matBg(), tone, mix(0.82, 1.0, uMatWeight));

  // Bloom — additive on core only
  tone += bloomAmt * matGlow() * 0.75;
  tone += bloomAmt * matBloom() * 0.3;

  if (uMatBehavior > 5.5 && uMatBehavior < 8.5) {
    tone = mix(tone, matAmbient(), 0.08 + uMatBlur * 0.15);
  }

  // Soft blend mode against outer plate (does not flatten core)
  vec3 plate = mix(matBg(), outerCol, 0.55);
  tone = matBlend(plate, tone, uMatBlendMode);

  return clamp(tone, 0.0, 1.0);
}
`;
