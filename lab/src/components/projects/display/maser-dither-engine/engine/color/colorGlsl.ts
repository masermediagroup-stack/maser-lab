/**
 * Color / gradient / blend GLSL — inserted into shared FRAG after interaction.
 * Does not replace the renderer; extends luminance into RGB materials.
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
  // Approximate hue rotation around luma axis
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
    // rotate
    float a = radians(uGradientAngle) + t * speed + off;
    float cs = cos(a);
    float sn = sin(a);
    p = mat2(cs, -sn, sn, cs) * p;
  } else if (beh > 3.5 && beh < 4.5) {
    // flow
    p.x += sin(t * speed + uv.y * 4.0 + off) * 0.08;
    p.y += cos(t * speed * 0.8 + uv.x * 3.0) * 0.06;
  } else if (beh > 5.5 && beh < 6.5) {
    // orbit
    p += vec2(cos(t * speed + off), sin(t * speed + off)) * 0.12;
  } else if (beh > 6.5 && beh < 7.5) {
    // noise-drift
    p += vec2(
      fract(sin(dot(uv, vec2(12.1, 4.7)) + t * speed) * 43758.5),
      fract(sin(dot(uv, vec2(7.3, 19.2)) + t * speed * 0.9) * 23421.1)
    ) * 0.08 - 0.04;
  }

  float g;
  if (mode > 3.5 && mode < 4.5) {
    // radial
    g = length(p) * 1.4;
  } else if (mode > 4.5 && mode < 5.5) {
    // angular
    g = atan(p.y, p.x) / 6.2831853 + 0.5;
  } else {
    float angle = radians(uGradientAngle);
    if (beh > 0.5 && beh < 1.5) angle = 0.0; // already rotated domain
    vec2 dir = vec2(cos(angle), sin(angle));
    g = dot(p, dir) * 0.5 + 0.5;
  }

  if (beh > 1.5 && beh < 2.5) g *= 1.0 + 0.25 * sin(t * speed); // expand
  if (beh > 2.5 && beh < 3.5) g = mix(0.5, g, 0.75 + 0.25 * cos(t * speed)); // contract
  if (beh > 4.5 && beh < 5.5) g += 0.08 * sin(t * speed * 2.0); // pulse
  if (beh > 9.5) g = 1.0 - abs(2.0 * fract(g + off) - 1.0); // mirror
  if (beh > 8.5 && beh < 9.5) g = mix(g, 1.0 - g, 0.5 + 0.5 * sin(t * speed)); // blend

  return clamp(g + off * 0.15, 0.0, 1.0);
}

vec3 matSampleGradient(vec2 uv, float t) {
  float g = matGradCoord(uv, t);
  float mode = uMatGradMode;
  vec3 a = matGradA();
  vec3 b = matGradB();
  vec3 c = matGradC();
  vec3 d = matGradD();

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
  if (mode > 7.5) {
    float n = fract(sin(dot(uv * 8.0 + t * uMatGradSpeed, vec2(12.1, 78.2))) * 43758.5);
    return mix(a, b, mix(g, n, 0.45));
  }
  return mix(a, b, g);
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
  // luminosity
  float l = matLuma(blend);
  return base * (l / max(matLuma(base), 1e-3));
}

vec3 matComposeColor(vec2 uv, float ink, float dithered, float bloomAmt, float t) {
  if (uMatColorEnabled < 0.5) {
    return vec3(ink);
  }

  vec3 grad = matSampleGradient(uv, t);
  if (uMatGradBehavior > 7.5 && uMatGradBehavior < 8.5) {
    grad = matHueShift(grad, t * uMatGradSpeed * 0.08 + uMatGradOffset);
  }

  float dens = mix(0.35, 1.0, uMatDensity);
  float sharp = mix(0.65, 1.35, uMatSharpness);
  float inkAdj = pow(clamp(ink * uMatExposure, 0.0, 1.5), max(uMatGamma, 0.3));
  inkAdj = mix(inkAdj, step(uMatThreshold + 0.35, inkAdj), uMatThreshold);
  inkAdj = clamp((inkAdj - 0.5) * sharp + 0.5, 0.0, 1.0);

  vec3 shadow = matShadow() * mix(vec3(1.0), grad, 0.35);
  vec3 highlight = matHighlight() * mix(vec3(1.0), grad, 0.55);
  vec3 tone = mix(shadow, highlight, inkAdj);
  tone = mix(tone, matDither(), dithered * dens * 0.25);
  tone = mix(matBg(), tone, mix(0.75, 1.0, uMatWeight));

  vec3 lit = mix(tone, grad, 0.2 * uMatScatter);
  lit += bloomAmt * matGlow() * 0.65;
  lit += bloomAmt * matBloom() * 0.25;
  lit = mix(lit, matAccent(), 0.04 * uMatScatter);

  // Soft behavior haze
  if (uMatBehavior > 5.5 && uMatBehavior < 8.5) {
    lit = mix(lit, matAmbient(), 0.12 + uMatBlur * 0.2);
  }

  lit = matBlend(grad * 0.35 + matBg() * 0.65, lit, uMatBlendMode);
  return clamp(lit, 0.0, 1.0);
}
`;
