/**
 * Dither algorithm GLSL — distinct threshold generators.
 * Pattern scale changes on-screen period; matrix size selects Bayer LUT.
 */
export const DITHER_GLSL = `
uniform float uDitAlgo;
uniform float uDitPatternScale;
uniform float uDitThresholdBias;
uniform float uDitInvert;
uniform float uDitTemporal;
uniform float uDitDistribution;
uniform float uDitClusterSize;
uniform float uDitRoundness;
uniform float uDitAngle;
uniform float uDitCoverage;
uniform float uDitCellSize;
uniform float uDitLineWidth;
uniform float uDitSpacing;
uniform float uDitWave;
uniform float uDitLineCount;
uniform float uDitAngleSep;
uniform float uDitRoughness;
uniform float uDitSecondary;
uniform float uDitBlend;

vec2 ditScaledPixel(vec2 pixel) {
  return pixel / max(uDitPatternScale, 0.08);
}

float ditHash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32 + uRandomSeed * 17.0);
  return fract(p.x * p.y);
}

float ditBayer(vec2 pixel) {
  return sampleBayer(ditScaledPixel(pixel));
}

float ditBlue(vec2 pixel, float t) {
  vec2 p = ditScaledPixel(pixel) * max(uNoiseScale, 0.2);
  p += vec2(t * uDitTemporal * 6.0, uScroll * 12.0);
  float bn = sampleBlue(p);
  return mix(0.5, bn, clamp(uDitDistribution, 0.0, 1.0));
}

float ditRandom(vec2 pixel, float t) {
  vec2 p = floor(ditScaledPixel(pixel));
  return ditHash(p + floor(t * uDitTemporal * 40.0));
}

float ditClustered(vec2 pixel, float lum) {
  float cell = mix(4.0, 28.0, clamp(uDitClusterSize, 0.0, 1.0));
  vec2 p = ditScaledPixel(pixel) / cell;
  vec2 gv = fract(p) - 0.5;
  float ang = radians(uDitAngle);
  float cs = cos(ang);
  float sn = sin(ang);
  gv = mat2(cs, -sn, sn, cs) * gv;
  float d = mix(max(abs(gv.x), abs(gv.y)), length(gv), uDitRoundness);
  float cover = mix(0.15, 0.95, clamp(lum + (uDitCoverage - 0.5) * 0.4, 0.0, 1.0));
  return clamp(d / max(cover, 0.05), 0.0, 1.0);
}

float ditHalftone(vec2 pixel, float lum) {
  float cell = mix(3.0, 24.0, clamp(uDitCellSize, 0.0, 1.0));
  vec2 p = ditScaledPixel(pixel) / cell;
  float ang = radians(uDitAngle);
  float cs = cos(ang);
  float sn = sin(ang);
  p = mat2(cs, -sn, sn, cs) * p;
  vec2 gv = fract(p) - 0.5;
  float d = length(gv) * 1.414;
  float r = sqrt(clamp(1.0 - lum, 0.0, 1.0));
  return clamp(d - r + 0.5, 0.0, 1.0);
}

float ditLineScreen(vec2 pixel, float lum) {
  float sp = mix(2.0, 18.0, clamp(uDitSpacing, 0.0, 1.0));
  float ang = radians(uDitAngle);
  vec2 dir = vec2(cos(ang), sin(ang));
  vec2 p = ditScaledPixel(pixel);
  float wave = sin(dot(p, vec2(-dir.y, dir.x)) * 0.08) * uDitWave * 4.0;
  float phase = dot(p, dir) / sp + wave;
  float line = abs(fract(phase) - 0.5) * 2.0;
  float w = mix(0.15, 0.85, clamp(uDitLineWidth, 0.0, 1.0));
  float open = mix(0.95, 0.05, clamp(lum, 0.0, 1.0));
  return clamp(line - w + open, 0.0, 1.0);
}

float ditCrosshatch(vec2 pixel, float lum) {
  float layers = clamp(floor(uDitLineCount + 0.5), 1.0, 4.0);
  float acc = 0.0;
  for (int i = 0; i < 4; i++) {
    if (float(i) >= layers) break;
    float ang = radians(uDitAngle + float(i) * uDitAngleSep);
    vec2 dir = vec2(cos(ang), sin(ang));
    vec2 p = ditScaledPixel(pixel);
    float n = ditHash(floor(p * 0.15)) * uDitRoughness;
    float sp = mix(3.0, 16.0, clamp(uDitSpacing, 0.0, 1.0));
    float phase = dot(p, dir) / sp + n;
    float line = abs(fract(phase) - 0.5) * 2.0;
    float band = smoothstep(0.55, 0.2, line);
    float gate = step(float(i) / layers, 1.0 - lum);
    acc = max(acc, band * gate);
  }
  return clamp(1.0 - acc, 0.0, 1.0);
}

/** Flat secondary picker — never recurses into hybrid. */
float ditSecondarySample(float id, vec2 pixel, float lum, float t) {
  if (id < 0.5) return ditBayer(pixel);
  if (id < 1.5) return ditBlue(pixel, t);
  if (id < 2.5) return ditRandom(pixel, t);
  if (id < 3.5) return ditLineScreen(pixel, lum);
  return ditHalftone(pixel, lum);
}

float ditAlgoThreshold(float id, vec2 pixel, float lum, float t) {
  if (id < 0.5) return ditBayer(pixel);
  if (id < 1.5) return ditBlue(pixel, t);
  if (id < 2.5) return ditRandom(pixel, t);
  if (id < 3.5) return ditClustered(pixel, lum);
  if (id < 4.5) return ditHalftone(pixel, lum);
  if (id < 5.5) {
    // Posterized dither — quantize then Bayer
    float levels = max(uPosterization, 4.0);
    float q = floor(lum * levels) / levels;
    return ditBayer(pixel) + (lum - q) * 0.15;
  }
  if (id < 6.5) {
    float a = ditBayer(pixel);
    float b = ditSecondarySample(uDitSecondary, pixel, lum, t);
    return mix(a, b, clamp(uDitBlend, 0.0, 1.0));
  }
  if (id < 7.5) {
    // Animated — drifting Bayer + noise
    vec2 drift = vec2(t * uDitTemporal * 12.0, t * uDitTemporal * 7.0);
    return mix(ditBayer(pixel + drift), ditBlue(pixel, t), 0.35);
  }
  if (id < 8.5) return ditLineScreen(pixel, lum);
  return ditCrosshatch(pixel, lum);
}

/**
 * Full dither stage — returns ink in .x and binary dithered in .y
 */
vec2 applyDitherStage(vec2 pixel, float lum, float t) {
  float threshold = ditAlgoThreshold(uDitAlgo, pixel, lum, t);
  threshold = clamp(threshold + uDitThresholdBias * 0.35, 0.0, 1.0);

  // Lighting response — denser ink in dark outer by default
  float dark = mix(1.0 - lum, lum, step(0.5, uDitInvert));
  threshold = clamp(threshold + dark * uLsDitherResponse * 0.38, 0.0, 1.0);

  // Optional blue-noise mix only for Bayer family when amount > 0
  if (uDitAlgo < 0.5 || (uDitAlgo > 4.5 && uDitAlgo < 5.5) || (uDitAlgo > 6.5 && uDitAlgo < 7.5)) {
    float bn = sampleBlue(ditScaledPixel(pixel) * uNoiseScale + vec2(t * uNoiseSpeed * 8.0, uScroll * 20.0));
    threshold = mix(threshold, bn, clamp(uBlueNoiseAmount, 0.0, 1.0) * 0.85);
  }

  float dithered = step(threshold, lum);
  float ditherMix = mix(0.55, 0.92, dark * uLsDitherResponse);
  float ink = mix(lum, dithered, ditherMix);
  return vec2(ink, dithered);
}
`;
