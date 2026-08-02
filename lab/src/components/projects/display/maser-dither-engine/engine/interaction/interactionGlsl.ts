/**
 * GLSL interaction / multi-light / ripple / trail layer.
 * Inserted into FRAG before FRAG_BODY helpers that call these.
 */
export const INTERACTION_GLSL = `
uniform vec2 uIxPointer;
uniform vec2 uIxVelocity;
uniform float uIxState;
uniform float uIxMode;
uniform float uIxInfluence;
uniform float uIxHold;
uniform float uIxFalloffType;
uniform float uIxFalloffRadius;
uniform float uIxFalloffSoft;
uniform float uIxFalloffPower;
uniform float uIxTrailMode;
uniform float uIxTrailIntensity;
uniform float uIxTrailWidth;
uniform float uIxRippleStyle;
uniform float uIxRippleFreq;
uniform float uIxRippleThick;
uniform float uIxLightCount;
uniform float uIxDebug;
uniform float uIxReleasePulse;
uniform float uIxStateBright;
uniform float uIxStateBloom;
uniform float uIxStateContrast;
uniform float uIxStateRadiusMul;
uniform float uIxTrailCount;

uniform vec4 uIxLights0;
uniform vec4 uIxLights1;
uniform vec4 uIxLights2;
uniform vec4 uIxLights3;
uniform vec4 uIxLights4;
uniform vec4 uIxLights5;
uniform vec4 uIxLights6;
uniform vec4 uIxLights7;
// each: xy = pos, z = radius, w = intensity
uniform vec4 uIxLightCol; // packs first 4 colors in rgba — see lightColor(i)
uniform vec4 uIxLightColB;
uniform vec4 uIxRipples0;
uniform vec4 uIxRipples1;
uniform vec4 uIxRipples2;
uniform vec4 uIxRipples3;
uniform vec4 uIxTrail0;
uniform vec4 uIxTrail1;
uniform vec4 uIxTrail2;
uniform vec4 uIxTrail3;

vec2 ixLightPos(int i) {
  if (i == 0) return uIxLights0.xy;
  if (i == 1) return uIxLights1.xy;
  if (i == 2) return uIxLights2.xy;
  if (i == 3) return uIxLights3.xy;
  if (i == 4) return uIxLights4.xy;
  if (i == 5) return uIxLights5.xy;
  if (i == 6) return uIxLights6.xy;
  return uIxLights7.xy;
}

vec2 ixLightRadInt(int i) {
  if (i == 0) return uIxLights0.zw;
  if (i == 1) return uIxLights1.zw;
  if (i == 2) return uIxLights2.zw;
  if (i == 3) return uIxLights3.zw;
  if (i == 4) return uIxLights4.zw;
  if (i == 5) return uIxLights5.zw;
  if (i == 6) return uIxLights6.zw;
  return uIxLights7.zw;
}

float ixLightColor(int i) {
  if (i == 0) return uIxLightCol.x;
  if (i == 1) return uIxLightCol.y;
  if (i == 2) return uIxLightCol.z;
  if (i == 3) return uIxLightCol.w;
  if (i == 4) return uIxLightColB.x;
  if (i == 5) return uIxLightColB.y;
  if (i == 6) return uIxLightColB.z;
  return uIxLightColB.w;
}

float ixFalloff(float d, float radius) {
  float r = max(radius * uIxStateRadiusMul, 0.02);
  float soft = mix(0.15, 0.95, clamp(uIxFalloffSoft, 0.0, 1.0));
  float t = clamp(d / r, 0.0, 1.0);
  int kind = int(uIxFalloffType + 0.5);
  if (kind == 0) return 1.0 - t;
  if (kind == 1) return 1.0 - smoothstep(0.0, 1.0, t);
  if (kind == 2) {
    float s = r * (0.35 + soft * 0.65);
    return exp(-(d * d) / (2.0 * s * s));
  }
  if (kind == 3) return exp(-t * (1.5 + uIxFalloffPower));
  return pow(max(0.0, 1.0 - t), max(uIxFalloffPower, 0.5));
}

float ixRippleField(vec2 uv) {
  float sum = 0.0;
  float freq = max(uIxRippleFreq, 1.0);
  float thick = max(uIxRippleThick, 0.005);
  // style modulates waveform
  float style = uIxRippleStyle;
  vec4 slots[4];
  slots[0] = uIxRipples0;
  slots[1] = uIxRipples1;
  slots[2] = uIxRipples2;
  slots[3] = uIxRipples3;
  for (int i = 0; i < 4; i++) {
    vec4 r = slots[i];
    if (r.w < 0.01) continue;
    vec2 d = uv - r.xy;
    float dist = length(d);
    float wave = sin((dist - r.z) * freq);
    if (style > 2.5 && style < 3.5) {
      wave *= 0.6 + 0.4 * fract(sin(dot(uv, vec2(12.1, 78.2))) * 43758.5);
    }
    if (style > 3.5 && style < 4.5) {
      wave *= abs(dot(normalize(d + 1e-4), vec2(1.0, 0.2)));
    }
    float ring = exp(-abs(dist - r.z) / max(thick, 0.01));
    sum += wave * ring * r.w;
  }
  return sum * uIxInfluence;
}

float ixTrailField(vec2 uv) {
  if (uIxTrailMode < 0.5 || uIxTrailCount < 0.5) return 0.0;
  float sum = 0.0;
  float w = max(uIxTrailWidth, 0.01);
  vec2 pts[8];
  pts[0] = uIxTrail0.xy; pts[1] = uIxTrail0.zw;
  pts[2] = uIxTrail1.xy; pts[3] = uIxTrail1.zw;
  pts[4] = uIxTrail2.xy; pts[5] = uIxTrail2.zw;
  pts[6] = uIxTrail3.xy; pts[7] = uIxTrail3.zw;
  int n = int(uIxTrailCount + 0.5);
  for (int i = 0; i < 8; i++) {
    if (i >= n) break;
    float fade = 1.0 - float(i) / max(float(n), 1.0);
    float d = distance(uv, pts[i]);
    float core = exp(-(d * d) / (w * w * 2.0));
    // heat / density modes weight fade differently
    float weight = fade;
    if (uIxTrailMode > 2.5 && uIxTrailMode < 3.5) weight = fade * fade;
    if (uIxTrailMode > 4.5) weight = fade * 0.7;
    sum += core * weight;
  }
  return sum * uIxTrailIntensity;
}

float ixMultiLight(vec2 uv) {
  float sum = 0.0;
  int n = int(uIxLightCount + 0.5);
  for (int i = 0; i < 8; i++) {
    if (i >= n) break;
    vec2 pos = ixLightPos(i);
    vec2 ri = ixLightRadInt(i);
    float rad = ri.x;
    float intensity = ri.y;
    if (intensity < 0.001) continue;
    float d = distance(uv, pos);
    float f = ixFalloff(d, rad);
    float contrib = f * intensity * ixLightColor(i);
    // soft / screen-ish compress
    sum = sum + contrib * (1.0 - sum * 0.35);
  }
  return sum;
}

float ixDebugOverlay(vec2 uv) {
  if (uIxDebug < 0.5) return 0.0;
  float d = distance(uv, uIxPointer);
  float ring = smoothstep(0.01, 0.0, abs(d - uIxFalloffRadius));
  float core = smoothstep(0.02, 0.0, d);
  return (ring * 0.45 + core * 0.25) * 0.5;
}

// Combined interaction luminance contribution
float sampleInteraction(vec2 uv) {
  float lights = ixMultiLight(uv);
  float ripples = ixRippleField(uv);
  float trails = ixTrailField(uv);
  float pulse = uIxReleasePulse * exp(-distance(uv, uIxPointer) * 6.0);
  float hold = uIxHold * 0.08 * ixFalloff(distance(uv, uIxPointer), uIxFalloffRadius);
  float dbg = ixDebugOverlay(uv);
  return (lights * 0.55 + ripples * 0.35 + trails + pulse * 0.4 + hold + dbg + uIxStateBright) * max(uIxInfluence, 0.15);
}
`;
