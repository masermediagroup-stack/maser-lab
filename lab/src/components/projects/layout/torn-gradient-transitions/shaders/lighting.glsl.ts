/**
 * Surface response and palette evaluation.
 *
 * Lighting runs in linear space; the caller converts to sRGB at the very end.
 * The renderer uses `NoBlending` on a cleared transparent buffer, so nothing
 * downstream re-encodes the result.
 */
export const LIGHTING_CHUNK = /* glsl */ `
uniform vec3 uLightDir;
uniform float uDiffuse;
uniform float uRim;
uniform float uSpecular;
uniform float uRoughness;
uniform float uCavity;

uniform int uPaletteMode;
uniform int uStopCount;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec3 uCosA;
uniform vec3 uCosB;
uniform vec3 uCosC;
uniform vec3 uCosD;
uniform float uSaturation;
uniform float uBrightness;
uniform float uContrast;

vec3 cosPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(TAU * (c * t + d));
}

vec3 stopColor(int i) {
  if (i <= 0) return uColor1;
  if (i == 1) return uColor2;
  if (i == 2) return uColor3;
  return uColor4;
}

/**
 * Ping-pongs through the stops so a looping gradient never shows a seam where
 * the last colour meets the first.
 */
vec3 stopsAt(float t) {
  float w = abs(fract(t * 0.5) * 2.0 - 1.0);
  float n = float(max(uStopCount - 1, 1));
  float x = w * n;
  float fi = floor(x);
  int i = int(fi);
  float f = smoothstep(0.0, 1.0, x - fi);
  return mix(stopColor(i), stopColor(i + 1), f);
}

/** Wide, controlled spectrum — no saturated rainbow banding. */
vec3 spectralAt(float t) {
  return cosPalette(
    t,
    vec3(0.52, 0.48, 0.54),
    vec3(0.44, 0.40, 0.46),
    vec3(1.0, 0.96, 0.92),
    vec3(0.00, 0.22, 0.46)
  );
}

vec3 paletteAt(float t) {
  if (uPaletteMode == 1) return clamp(cosPalette(t, uCosA, uCosB, uCosC, uCosD), 0.0, 1.0);
  if (uPaletteMode == 2) return clamp(spectralAt(t), 0.0, 1.0);
  if (uPaletteMode == 3) {
    float w = abs(fract(t * 0.5) * 2.0 - 1.0);
    return mix(uColor1, uColor2, smoothstep(0.0, 1.0, w));
  }
  return stopsAt(t);
}

vec3 gradeColor(vec3 c) {
  float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(luma), c, uSaturation);
  c = (c - 0.5) * uContrast + 0.5;
  c *= uBrightness;
  return max(c, vec3(0.0));
}

/** Per-channel lighting response for one shading point. */
vec3 shadeSurface(vec3 base, vec3 n, float heightNorm) {
  vec3 l = normalize(uLightDir);
  vec3 v = vec3(0.0, 0.0, 1.0);
  vec3 hv = normalize(l + v);

  // Wrapped diffuse: paper scatters, so the terminator should not be hard.
  float ndl = dot(n, l);
  float wrapped = clamp((ndl + 0.42) / 1.42, 0.0, 1.0);
  float diffuse = mix(0.30, 1.18, wrapped) * uDiffuse;

  float shininess = mix(6.0, 190.0, 1.0 - clamp(uRoughness, 0.0, 1.0));
  float spec =
    pow(max(dot(n, hv), 0.0), shininess) *
    uSpecular *
    (1.0 - clamp(uRoughness, 0.0, 1.0) * 0.55);

  float rim = pow(1.0 - clamp(n.z, 0.0, 1.0), 2.3) * uRim;

  // Cavity approximation: low-lying pixels lose ambient light.
  float ao = 1.0 - uCavity * (1.0 - smoothstep(-0.15, 0.85, heightNorm));
  ao = clamp(ao, 0.0, 1.0);

  vec3 lit = base * diffuse * ao;
  lit += base * rim * 0.9;
  lit += vec3(spec) * mix(vec3(1.0), base * 1.6 + 0.35, 0.32);
  return lit;
}

vec3 linearToSRGB(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(
    c * 12.92,
    1.055 * pow(max(c, vec3(1e-5)), vec3(1.0 / 2.4)) - 0.055,
    step(vec3(0.0031308), c)
  );
}
`;
