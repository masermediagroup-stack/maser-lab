import { BUBBLES_CHUNK } from "./bubbles.glsl";
import { LIGHTING_CHUNK } from "./lighting.glsl";
import { NOISE_CHUNK } from "./noise.glsl";
import { PAPER_CHUNK } from "./paper.glsl";

/**
 * Full-screen pass-through. `PlaneGeometry(2, 2)` already spans clip space, so
 * no matrices are involved and the quad can never be culled or mis-projected.
 */
export const TORN_VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const MAIN_CHUNK = /* glsl */ `
varying vec2 vUv;

uniform float uAspect;
uniform float uTime;

// ── Transition state ───────────────────────────────────────────────────────
uniform float uLead;        // 0..1 lead-edge travel
uniform float uTrail;       // 0..1 trail-edge travel
uniform int uDirMode;
uniform int uRevealMode;    // 0 sweep, 1 reverse, 2 iris
uniform vec2 uOrigin;       // uv space
uniform vec2 uPointer;      // uv space
uniform float uMargin;

// ── Shape ──────────────────────────────────────────────────────────────────
uniform float uBandWidth;
uniform float uTearAmp;
uniform float uTearFreq;
uniform float uEdgeRough;
uniform float uEdgeSharp;
uniform float uEdgeThickness;
uniform float uSecondaryOffset;
uniform float uFragment;
uniform float uHole;
uniform float uStretch;
uniform vec4 uProfileWeights;   // low, mid, fine, streak
uniform float uProfileFeather;
uniform float uDeckle;

// ── Bubbles ────────────────────────────────────────────────────────────────
uniform float uBubbleAmount;
uniform float uBubbleScale;
uniform float uBubbleVariation;
uniform float uBubbleInflation;
uniform float uBubbleMerge;
uniform float uBubbleSpeed;
uniform float uBubbleEdge;
uniform float uPointerInfluence;

// ── Depth ──────────────────────────────────────────────────────────────────
uniform float uSurfaceDepth;
uniform float uDisplacement;
uniform float uCastShadow;
uniform float uEdgeHighlight;
uniform float uUnderside;

// ── Gradient ───────────────────────────────────────────────────────────────
uniform float uGradAngle;
uniform float uGradScale;
uniform float uGradMotion;
uniform float uHueTravel;
uniform float uColorDistortion;
uniform float uIridescence;

// ── Finishing ──────────────────────────────────────────────────────────────
uniform float uGrain;
uniform float uDither;
uniform float uBlur;
uniform float uEdgeGlow;
uniform float uChroma;
uniform float uVignette;
uniform float uAlpha;
uniform float uTextureScale;

/**
 * Progress of the sweep at this pixel, 0 (not yet reached) → 1 (last to be
 * reached). \`sweep\` receives the rotation that aligns tear noise with travel.
 */
float directionField(vec2 uv, vec2 pa, out float sweep, out float radial) {
  vec2 originA = (uOrigin - 0.5) * vec2(uAspect, 1.0);
  vec2 pointerA = (uPointer - 0.5) * vec2(uAspect, 1.0);
  vec2 anchor = uDirMode == 7 ? pointerA : originA;

  // Longest corner distance keeps radial modes covering the whole viewport.
  vec2 half2 = vec2(uAspect, 1.0) * 0.5;
  float maxR = length(abs(anchor) + half2);
  radial = length(pa - anchor) / max(maxR, 1e-4);

  if (uDirMode == 0) { sweep = 0.0; return uv.x; }
  if (uDirMode == 1) { sweep = 3.14159265; return 1.0 - uv.x; }
  if (uDirMode == 2) { sweep = -1.57079633; return 1.0 - uv.y; }
  if (uDirMode == 3) { sweep = 1.57079633; return uv.y; }
  if (uDirMode == 4) { sweep = -0.78539816; return (uv.x + (1.0 - uv.y)) * 0.5; }
  if (uDirMode == 6) { sweep = 0.0; return 1.0 - radial; }
  sweep = 0.0;
  return radial;
}

/**
 * Layered tear displacement in field units.
 *
 * Four bands with deliberately different characters — broad shape, mid-scale
 * rips, ridged fibre breakup and a heavily stretched streak — so the edge has
 * hierarchy instead of one recognisable noise frequency.
 */
float tearDisplace(vec2 q, float phase) {
  float f = max(uTearFreq, 0.05);
  vec2 s = vec2(q.x / max(uStretch, 0.2), q.y);

  float low = fbm2(s * f * 0.5 + phase);
  float mid = fbm(s * f * 1.85 + phase * 1.7);
  float fine = (ridged(s * f * 6.2 + phase * 2.3) - 0.52) * 2.0;
  float streak = snoise(vec2(s.x * f * 0.28, s.y * f * 8.5) + phase * 3.1);

  float d =
    low * uProfileWeights.x +
    mid * uProfileWeights.y +
    fine * uProfileWeights.z * uEdgeRough +
    streak * uProfileWeights.w;

  return d * uTearAmp;
}

void main() {
  vec2 uv = vUv;
  vec2 pa = (uv - 0.5) * vec2(uAspect, 1.0);

  float sweep;
  float radial;
  float field = directionField(uv, pa, sweep, radial);

  mat2 toSweep = rot2(-sweep);
  vec2 q = uDirMode >= 5 ? pa : toSweep * pa;

  float dispLead = tearDisplace(q, 0.0);
  float dispTrail = tearDisplace(q, 37.4);

  float leadPos = mix(-uMargin, 1.0 + uMargin, uLead);
  float sLead;
  float sTrail;

  if (uRevealMode == 1) {
    // Reverse: the sheet retreats the way it arrived.
    float lp = mix(leadPos, -uMargin, uTrail);
    sLead = (lp + dispLead) - field;
    sTrail = 10.0;
  } else if (uRevealMode == 2) {
    // Iris: an expanding hole opens from the origin.
    sLead = (leadPos + dispLead) - field;
    float irisR = mix(-uMargin, 1.0 + uMargin, uTrail);
    sTrail = (radial + dispTrail) - irisR;
  } else {
    sLead = (leadPos + dispLead) - field;
    float tp = mix(-uMargin, 1.0 + uMargin, uTrail);
    sTrail = field - (tp + dispTrail);
  }

  float sdf = min(sLead, sTrail);
  float band = max(uBandWidth, 0.008);

  // Detached fragments ahead of the tear and holes just behind it. Both are
  // driven by the *unmodified* sdf so the perturbation cannot feed back.
  float nearEdge = exp(-abs(sdf) / (band * 0.9));
  if (uFragment > 0.001) {
    sdf += speckle(q * 6.4 + 3.3, 0.26) * uFragment * band * 1.9 * nearEdge;
  }
  if (uHole > 0.001) {
    sdf -= speckle(q * 8.7 + 21.7, 0.22) * uHole * band * 1.7 * nearEdge;
  }

  float shadowWidth = uCastShadow > 0.001 ? band * 1.15 : 0.0;

  // Light direction biases where the cast shadow falls relative to the tear.
  vec2 lightXY = normalize(uLightDir.xy + vec2(1e-4));
  vec2 sweepDir = uDirMode >= 5 ? normalize(pa + vec2(1e-4)) : toSweep[0];
  float shadowBias = dot(lightXY, sweepDir) * shadowWidth * 0.45;

  // Fully-transparent pixels leave before any texture work. During most of a
  // transition this is a large share of the screen, and it is the single
  // biggest win in the shader.
  if (sdf < -shadowWidth - abs(shadowBias) - 0.002) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float detail = clamp(1.0 - uBlur, 0.0, 1.0);
  float feather =
    mix(0.0016, 0.075, 1.0 - clamp(uEdgeSharp, 0.0, 1.0)) *
    uProfileFeather *
    mix(1.0, 3.2, uBlur);

  float alpha = smoothstep(0.0, feather, sdf);

  // Deckle: fibrous translucency in the outermost millimetres of the sheet.
  if (uDeckle > 0.001) {
    float fibre = ridged(q * max(uTearFreq, 0.05) * 9.0 + 61.2);
    float lip = 1.0 - smoothstep(0.0, band * 0.55, sdf);
    alpha *= 1.0 - uDeckle * lip * smoothstep(0.35, 0.85, fibre) * 0.85;
  }

  // Distance-into-the-sheet, 1 at the tear line falling to 0 inland.
  float edgeT = 1.0 - smoothstep(0.0, band, max(sdf, 0.0));
  edgeT *= edgeT;

  // ── Height field ─────────────────────────────────────────────────────────
  vec2 pt = pa * max(uTextureScale, 0.05) * 3.0;
  vec2 qt = toSweep * pt;

  float eps = 0.0035 / max(uTextureScale, 0.05);
  float h0 = microHeight(pt, qt);
  float hx = microHeight(pt + vec2(eps, 0.0), qt + toSweep * vec2(eps, 0.0));
  float hy = microHeight(pt + vec2(0.0, eps), qt + toSweep * vec2(0.0, eps));
  vec2 microGrad = vec2(hx - h0, hy - h0) / eps;

  float height = h0 * detail;
  vec2 grad = microGrad * detail;

  if (uBubbleAmount > 0.001) {
    vec2 pb = pa * max(uBubbleScale, 0.15);
    pb += vec2(uTime * uBubbleSpeed * 0.09, uTime * uBubbleSpeed * -0.05);

    // Bubbles inflate as the tear passes and relax behind it.
    float swell = mix(1.0, 0.35 + 1.5 * edgeT, clamp(uBubbleEdge, 0.0, 1.0));

    if (uPointerInfluence > 0.001) {
      vec2 pointerA = (uPointer - 0.5) * vec2(uAspect, 1.0);
      float near = exp(-dot(pa - pointerA, pa - pointerA) * 7.0);
      swell *= 1.0 + near * uPointerInfluence * 0.85;
    }

    vec4 bub = bubbleField(
      pb,
      uBubbleVariation,
      uBubbleMerge,
      0.62 * uBubbleInflation * swell
    );

    float amt = uBubbleAmount;
    height += bub.x * amt * 0.9;
    grad += bub.yz * amt * max(uBubbleScale, 0.15) * 0.55;
  }

  // Raised lip along the tear: material bunches up where it separates.
  float lipProfile = edgeT * (1.0 - edgeT) * 4.0;
  height += lipProfile * uEdgeThickness * 0.85;
  grad += sweepDir * lipProfile * uEdgeThickness * 6.0 * sign(0.5 - edgeT);

  // Secondary tear line running behind the main one.
  float secondary = 0.0;
  if (uSecondaryOffset > 0.001) {
    float s2 = sdf - uSecondaryOffset;
    secondary = exp(-abs(s2) / max(band * 0.22, 1e-3));
    height -= secondary * 0.18;
    grad += sweepDir * secondary * 2.4;
  }

  float depth = max(uSurfaceDepth, 0.0);
  vec3 n = normalize(vec3(-grad * depth * uDisplacement, 1.0));

  // ── Colour ───────────────────────────────────────────────────────────────
  vec2 gp = rot2(uGradAngle) * pa;
  float gt = gp.x * max(uGradScale, 0.02) + 0.5;
  gt += uTime * uGradMotion * 0.05;
  gt += uHueTravel * uTime * 0.03;
  gt += height * uColorDistortion * 0.9;

  vec3 base;
  if (uChroma > 0.001) {
    float o = uChroma * 0.05;
    base = vec3(
      paletteAt(gt - o).r,
      paletteAt(gt).g,
      paletteAt(gt + o).b
    );
  } else {
    base = paletteAt(gt);
  }
  base = gradeColor(base);

  if (uIridescence > 0.001) {
    float fres = pow(1.0 - clamp(n.z, 0.0, 1.0), 2.1);
    vec3 sheen = gradeColor(paletteAt(gt + 0.21 + fres * 0.55));
    base = mix(base, sheen, clamp(fres * uIridescence * 1.4, 0.0, 0.9));
  }

  float heightNorm = clamp(height * 1.35 + 0.5, 0.0, 1.0);
  vec3 color = shadeSurface(base, n, heightNorm);

  // Bright raised rim right at the tear.
  float rimBand = exp(-abs(sdf - band * 0.16) / max(band * 0.24, 1e-3));
  color += base * rimBand * uEdgeHighlight * 0.9;

  // Dark underside of the curling lip, in the outermost sliver only.
  float underside = 1.0 - smoothstep(0.0, band * 0.34, sdf);
  color *= mix(1.0, 1.0 - clamp(uUnderside, 0.0, 0.95), underside);

  // Secondary crease reads as a shadowed fold, not a drawn line.
  color *= 1.0 - secondary * 0.34;

  if (uEdgeGlow > 0.001) {
    float glow = exp(-abs(sdf) / max(band * 0.7, 1e-3));
    color += base * glow * uEdgeGlow * 0.7;
  }

  if (uVignette > 0.001) {
    float v = 1.0 - uVignette * smoothstep(0.35, 1.05, length(pa) / max(uAspect, 1.0) * 2.0);
    color *= clamp(v, 0.0, 1.0);
  }

  if (uGrain > 0.001) {
    float g = hash21(uv * 1024.0 + fract(uTime) * 91.7) - 0.5;
    color += g * uGrain * 0.16;
  }

  color = linearToSRGB(max(color, vec3(0.0)));

  if (uDither > 0.001) {
    float d = hash21(gl_FragCoord.xy * 0.37 + fract(uTime * 0.31) * 53.1) - 0.5;
    color += d * uDither * (2.0 / 255.0);
  }

  // ── Composite ────────────────────────────────────────────────────────────
  float sheetA = clamp(alpha, 0.0, 1.0) * clamp(uAlpha, 0.0, 1.0);

  float shadowA = 0.0;
  if (shadowWidth > 0.0) {
    float sh = smoothstep(-shadowWidth, 0.0, sdf + shadowBias);
    shadowA = sh * (1.0 - sheetA) * clamp(uCastShadow, 0.0, 1.0) * 0.55;
  }

  float outA = clamp(sheetA + shadowA, 0.0, 1.0);
  if (outA <= 0.0009) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // Shadow colour is black, so it only scales the sheet contribution.
  vec3 outC = color * (sheetA / outA);
  gl_FragColor = vec4(outC, outA);
}
`;

export const TORN_FRAGMENT_SHADER = [
  NOISE_CHUNK,
  BUBBLES_CHUNK,
  PAPER_CHUNK,
  LIGHTING_CHUNK,
  MAIN_CHUNK,
].join("\n");
