/**
 * GLSL procedural animation layer — inserted into FRAG_SRC.
 * Each mode index is mathematically distinct (not a rotated vector).
 * Returns vec4(uvOffset.xy, lumMod, lightMod).
 */
export const ANIM_GLSL = `
uniform float uAnimModeA;
uniform float uAnimModeB;
uniform float uAnimBlend;
uniform vec4 uAnimParamsA0;
uniform vec4 uAnimParamsA1;
uniform vec4 uAnimParamsB0;
uniform vec4 uAnimParamsB1;

vec2 aspectUv(vec2 uv) {
  float a = uResolution.x / max(uResolution.y, 1.0);
  return vec2((uv.x - 0.5) * a, uv.y - 0.5);
}

float animHash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float animNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = animHash(i);
  float b = animHash(i + vec2(1.0, 0.0));
  float c = animHash(i + vec2(0.0, 1.0));
  float d = animHash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float animFbm(vec2 p, float octaves) {
  float v = 0.0;
  float a = 0.5;
  float n = clamp(octaves, 1.0, 4.0);
  for (int i = 0; i < 4; i++) {
    if (float(i) >= n) break;
    v += a * animNoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

// Mode evaluators — p0.xyzw = first four controls, p1.xyzw = next four (may be 0)

vec4 modeLinearH(vec2 uv, float t, vec4 p0, vec4 p1) {
  float speed = p0.x;
  float amp = p0.y;
  float soft = p0.z;
  float phase = p0.w;
  vec2 a = aspectUv(uv);
  float band = sin(a.x * (2.2 / soft) - t * speed + phase);
  float env = exp(-abs(a.y) * (1.4 + soft));
  float lum = band * amp * env;
  vec2 off = vec2(sin(t * speed * 0.35 + phase) * amp * 0.08, 0.0);
  return vec4(off, lum, lum * 0.25);
}

vec4 modeLinearV(vec2 uv, float t, vec4 p0, vec4 p1) {
  float speed = p0.x;
  float amp = p0.y;
  float bias = p0.z;
  float shear = p0.w;
  vec2 a = aspectUv(uv);
  float curtain = sin((a.y + a.x * shear) * 3.1 - t * speed) + bias;
  float fall = smoothstep(0.9, 0.05, abs(a.x));
  float lum = curtain * amp * fall;
  vec2 off = vec2(a.x * shear * amp * 0.1, sin(t * speed * 0.5) * amp * 0.06);
  return vec4(off, lum, lum * 0.2);
}

vec4 modeDiagonal(vec2 uv, float t, vec4 p0, vec4 p1) {
  float speed = p0.x;
  float amp = p0.y;
  float skew = p0.z;
  float sharp = p0.w;
  vec2 a = aspectUv(uv);
  float front = a.x * skew + a.y * (2.0 - skew * 0.35);
  float stroke = pow(abs(sin(front * 2.4 - t * speed)), sharp);
  float lum = (0.55 - stroke) * amp * 2.0;
  vec2 off = vec2(cos(front - t * speed) , sin(front * 0.7)) * amp * 0.07;
  return vec4(off, lum, lum * 0.3);
}

vec4 modeRadialPulse(vec2 uv, float t, vec4 p0, vec4 p1) {
  // Discrete expanding pulse fronts (≠ continuous ripple, ≠ soft bloom core)
  float speed = p0.x;
  float radius = p0.y;
  float width = max(p0.z, 0.02);
  float strength = p0.w;
  float falloff = p1.x;
  float repeat = clamp(p1.y, 1.0, 4.0);
  vec2 a = aspectUv(uv);
  float r = length(a);
  float waveTrain = 0.0;
  for (int i = 0; i < 4; i++) {
    if (float(i) >= repeat) break;
    float phase = fract(t * speed * 0.28 - float(i) / repeat);
    float front = phase * radius;
    float ring = exp(-pow(abs(r - front) / width, 2.0) * 2.4);
    ring *= (1.0 - phase);
    ring *= exp(-r * falloff);
    waveTrain += ring;
  }
  float lum = waveTrain * strength * 1.35;
  vec2 off = normalize(a + 1e-4) * waveTrain * strength * 0.16;
  return vec4(off, lum, lum * 0.55);
}

vec4 modeRipple(vec2 uv, float t, vec4 p0, vec4 p1) {
  float speed = p0.x;
  float freq = p0.y;
  float amp = p0.z;
  float damp = p0.w;
  vec2 a = aspectUv(uv);
  float r = length(a);
  float wave = sin(r * freq - t * speed) / (1.0 + r * damp * 3.2);
  float lum = wave * amp * 1.35;
  vec2 off = normalize(a + 1e-4) * wave * amp * 0.55;
  return vec4(off, lum, lum * 0.35);
}

vec4 modeWave(vec2 uv, float t, vec4 p0, vec4 p1) {
  float speed = p0.x;
  float amp = p0.y;
  float freq = p0.z;
  float phase = p0.w;
  float dirMix = p1.x;
  vec2 a = aspectUv(uv);
  float w1 = sin(a.x * freq + t * speed + phase);
  float w2 = sin(a.y * (freq * 0.73) - t * speed * 1.17 + phase * 1.3);
  float w3 = sin((a.x * 0.61 + a.y * 1.1) * freq * 0.55 + t * speed * 0.41);
  float field = mix(w1, w2, dirMix) * 0.55 + w3 * 0.45;
  float lum = field * amp * 1.25;
  vec2 off = vec2(w2, w1) * amp * 0.22;
  return vec4(off, lum, lum * 0.28);
}

vec4 modeSpiral(vec2 uv, float t, vec4 p0, vec4 p1) {
  // Visible arm rotation around an offset center (Archimedean + angular advection)
  float speed = p0.x;
  float arms = max(floor(p0.y + 0.5), 1.0);
  float tight = p0.z;
  float amp = p0.w;
  float cx = p1.x;
  float cy = p1.y;
  float direction = p1.z >= 0.0 ? 1.0 : -1.0;
  // p1.w = pattern scale (zoom). Higher = arms fill more of the surface.
  float scale = clamp(p1.w, 0.25, 3.0);
  float twist = 1.1;
  vec2 a = (aspectUv(uv) - vec2(cx, cy)) * scale;
  float r = length(a);
  float theta = atan(a.y, a.x) + t * speed * 0.7 * direction;
  float spiral = sin(theta * arms + log(r * tight + 0.08) * tight * 3.2 - t * speed * direction);
  // Sharper arm ridges so spiral reads immediately vs orbit/noise
  float ridges = pow(abs(spiral), 0.65) * sign(spiral + 1e-4);
  float envelope = exp(-r * 0.95) * (0.55 + 0.45 * smoothstep(0.55, 0.0, r));
  float lum = ridges * amp * envelope * 1.35;
  vec2 tangential = vec2(-a.y, a.x) * (1.0 / max(r, 0.08));
  vec2 off = tangential * ridges * amp * 0.18 * twist;
  off += a * ridges * amp * 0.05 * twist;
  return vec4(off, lum, lum * 0.4);
}

vec4 modeOrbit(vec2 uv, float t, vec4 p0, vec4 p1) {
  float radius = p0.x;
  float ang = p0.y;
  float offset = p0.z;
  float strength = p0.w;
  vec2 a = aspectUv(uv);
  vec2 c1 = vec2(cos(t * ang), sin(t * ang)) * radius;
  vec2 c2 = vec2(cos(t * ang * 0.73 + offset), sin(t * ang * 1.11 + offset)) * radius * 0.72;
  float g1 = exp(-dot(a - c1, a - c1) * 18.0);
  float g2 = exp(-dot(a - c2, a - c2) * 22.0);
  float lum = (g1 + g2 * 0.7) * strength;
  vec2 off = (c1 - a) * g1 * 0.05 + (c2 - a) * g2 * 0.04;
  return vec4(off * strength, lum, lum * 0.5);
}

vec4 modeBreathing(vec2 uv, float t, vec4 p0, vec4 p1) {
  float speed = p0.x;
  float depth = p0.y;
  float center = p0.z;
  float hold = p0.w;
  vec2 a = aspectUv(uv);
  float cycle = fract(t * speed * 0.2);
  float inhale = smoothstep(0.0, 0.35 + hold * 0.2, cycle);
  float exhale = 1.0 - smoothstep(0.55, 0.95, cycle);
  float breath = inhale * exhale;
  breath = breath * breath * (3.0 - 2.0 * breath);
  float r = length(a);
  float soft = exp(-r * r / max(center * center, 0.02));
  float lum = breath * depth * soft;
  vec2 off = a * (breath - 0.5) * depth * 0.25;
  return vec4(off, lum, lum * 0.35);
}

vec4 modeBloomAnim(vec2 uv, float t, vec4 p0, vec4 p1) {
  float speed = p0.x;
  float amount = p0.y;
  float radius = p0.z;
  float delay = p0.w;
  vec2 a = aspectUv(uv);
  float r = length(a);
  float p = fract(t * speed * 0.18);
  float primary = exp(-abs(r - p * radius) * 10.0) * (1.0 - p);
  float p2 = fract(t * speed * 0.18 - delay * 0.2);
  float secondary = exp(-abs(r - p2 * radius * 1.15) * 8.0) * (1.0 - p2) * 0.55;
  float lum = (primary + secondary) * amount;
  vec2 off = normalize(a + 1e-4) * lum * 0.2;
  return vec4(off, lum, lum * 0.6);
}

vec4 modeNoiseDrift(vec2 uv, float t, vec4 p0, vec4 p1) {
  float scale = p0.x;
  float strength = p0.y;
  float evo = p0.z;
  float oct = p0.w;
  vec2 a = aspectUv(uv);
  vec2 q = a * scale + vec2(t * evo * 0.15, t * evo * 0.11);
  float n1 = animFbm(q, oct);
  float n2 = animFbm(q + vec2(19.2, 7.1), oct);
  vec2 off = (vec2(n1, n2) - 0.5) * strength * 0.55;
  float lum = (n1 - 0.5) * strength * 1.2;
  return vec4(off, lum, lum * 0.2);
}

vec4 modeFlowField(vec2 uv, float t, vec4 p0, vec4 p1) {
  float strength = p0.x;
  float scale = p0.y;
  float rot = p0.z;
  float vel = p0.w;
  vec2 a = aspectUv(uv);
  vec2 p = a * scale + vec2(t * vel * 0.12, -t * vel * 0.08);
  float e = 0.02;
  float n = animNoise(p);
  float dx = animNoise(p + vec2(e, 0.0)) - n;
  float dy = animNoise(p + vec2(0.0, e)) - n;
  // curl-ish: perpendicular to gradient
  vec2 flow = vec2(dy, -dx) / e;
  float cs = cos(rot);
  float sn = sin(rot);
  flow = mat2(cs, -sn, sn, cs) * flow;
  vec2 off = flow * strength * 0.14;
  // Streak luminance along flow direction (≠ isotropic noise drift)
  float streak = abs(dot(normalize(flow + 1e-4), vec2(0.707, 0.707)));
  float lum = length(flow) * strength * (0.18 + streak * 0.2);
  return vec4(off, lum, lum * 0.3);
}

vec4 modeMagnetic(vec2 uv, float t, vec4 p0, vec4 p1) {
  float strength = p0.x;
  float sep = p0.y;
  float spin = p0.z;
  float falloff = p0.w;
  vec2 a = aspectUv(uv);
  float ang = t * spin;
  vec2 poleN = vec2(cos(ang), sin(ang)) * sep;
  vec2 poleS = -poleN;
  vec2 dN = a - poleN;
  vec2 dS = a - poleS;
  float rN = length(dN) + 0.05;
  float rS = length(dS) + 0.05;
  vec2 field = dN / pow(rN, falloff) - dS / pow(rS, falloff);
  vec2 off = field * strength * 0.14;
  float lum = (1.0 / rN - 1.0 / rS) * strength * 0.35;
  return vec4(off, lum, lum * 0.5);
}

vec4 modeAurora(vec2 uv, float t, vec4 p0, vec4 p1) {
  float speed = p0.x;
  float warp = p0.y;
  float bands = p0.z;
  float drift = p0.w;
  vec2 a = aspectUv(uv);
  float n = animFbm(vec2(a.x * bands + t * drift * 0.2, a.y * 1.4 + t * speed * 0.08), 3.0);
  float sheet = sin((a.x + n * warp) * bands * 1.7 + t * speed);
  float curtain = pow(abs(sheet), 1.15) * smoothstep(0.95, -0.25, a.y);
  // Vertical curtain sheets — distinct from noise drift / flow curl
  float veil = curtain * (0.55 + 0.45 * smoothstep(-0.2, 0.6, a.y + n * 0.2));
  float lum = veil * warp * 1.85;
  vec2 off = vec2(n - 0.5, sheet * 0.28) * warp * 0.5;
  return vec4(off, lum, lum * 0.6);
}

vec4 modeTurbulence(vec2 uv, float t, vec4 p0, vec4 p1) {
  float scale = p0.x;
  float strength = p0.y;
  float speed = p0.z;
  float rough = p0.w;
  vec2 a = aspectUv(uv);
  vec2 p = a * scale;
  vec2 q = vec2(
    animFbm(p + vec2(t * speed * 0.1, 0.0), 3.0),
    animFbm(p + vec2(5.2, t * speed * 0.13), 3.0)
  );
  float n = animFbm(p + q * rough * 2.0, 3.5);
  vec2 off = (q - 0.5) * strength * 0.45;
  float lum = (n - 0.5) * strength * 1.4;
  return vec4(off, lum, lum * 0.25);
}

vec4 modeLavaLamp(vec2 uv, float t, vec4 p0, vec4 p1) {
  // Soft metaball blobs with viscosity + field-gradient UV (not FBM noise)
  // Soft clamps keep high merge/size/speed from blowing the field into NaN flicker
  float speed = clamp(p0.x, 0.05, 2.0);
  float count = floor(clamp(p0.y, 2.0, 7.0) + 0.5);
  float size = clamp(p0.z, 0.12, 0.55);
  float merge = clamp(p0.w, 0.4, 1.45);
  float viscosity = clamp(p1.x, 0.25, 2.2);
  float tension = clamp(p1.y, 0.35, 2.0);
  float distort = clamp(p1.z, 0.0, 1.35);
  float speedEff = speed / (0.55 + viscosity);
  vec2 a = aspectUv(uv);
  float field = 0.0;
  float n = count;
  for (int i = 0; i < 7; i++) {
    if (float(i) >= n) break;
    float fi = float(i);
    float seed = fi * 1.7 + 0.3;
    float wobble = sin(t * speedEff * 0.41 + seed * 3.1) * distort * 0.1;
    float bx = sin(t * speedEff * (0.22 + fi * 0.05) + seed * 2.1) * 0.48 + wobble;
    float by = fract(t * speedEff * (0.07 + fi * 0.02) + seed) * 1.45 - 0.72;
    by += sin(t * speedEff * 0.33 + seed) * 0.07 * (1.0 / viscosity);
    vec2 b = vec2(bx, by);
    float d = length(a - b);
    field += size / (d + 0.1 * merge + 0.04);
  }
  field = min(field, 10.0);
  float lo = (0.95 / merge) * tension;
  float hi = (2.35 / merge) * tension;
  hi = max(hi, lo + 0.15);
  float metaball = smoothstep(lo, hi, field);
  float mid = mix(lo, hi, 0.55);
  float surface = smoothstep(lo, mid, field) - smoothstep(mid, hi, field);
  float lum = clamp(metaball * (0.45 + size * 0.85) + surface * 0.2, 0.0, 1.75);
  // Blob-local UV from numerical gradient of the field
  float e = 0.025;
  float fx1 = 0.0;
  float fx0 = 0.0;
  float fy1 = 0.0;
  float fy0 = 0.0;
  for (int i = 0; i < 7; i++) {
    if (float(i) >= n) break;
    float fi = float(i);
    float seed = fi * 1.7 + 0.3;
    float wobble = sin(t * speedEff * 0.41 + seed * 3.1) * distort * 0.1;
    float bx = sin(t * speedEff * (0.22 + fi * 0.05) + seed * 2.1) * 0.48 + wobble;
    float by = fract(t * speedEff * (0.07 + fi * 0.02) + seed) * 1.45 - 0.72;
    by += sin(t * speedEff * 0.33 + seed) * 0.07 * (1.0 / viscosity);
    vec2 b = vec2(bx, by);
    float soft = 0.1 * merge + 0.04;
    fx1 += size / (length(a + vec2(e, 0.0) - b) + soft);
    fx0 += size / (length(a - vec2(e, 0.0) - b) + soft);
    fy1 += size / (length(a + vec2(0.0, e) - b) + soft);
    fy0 += size / (length(a - vec2(0.0, e) - b) + soft);
  }
  vec2 grad = clamp(vec2(fx1 - fx0, fy1 - fy0), -8.0, 8.0);
  vec2 off = clamp(grad * metaball * size * 0.07, vec2(-0.35), vec2(0.35));
  return vec4(off, lum, lum * 0.45);
}

vec4 evalAnimMode(float modeId, vec2 uv, float t, vec4 p0, vec4 p1) {
  int m = int(modeId + 0.5);
  if (m == 0) return modeLinearH(uv, t, p0, p1);
  if (m == 1) return modeLinearV(uv, t, p0, p1);
  if (m == 2) return modeDiagonal(uv, t, p0, p1);
  if (m == 3) return modeRadialPulse(uv, t, p0, p1);
  if (m == 4) return modeRipple(uv, t, p0, p1);
  if (m == 5) return modeWave(uv, t, p0, p1);
  if (m == 6) return modeSpiral(uv, t, p0, p1);
  if (m == 7) return modeOrbit(uv, t, p0, p1);
  if (m == 8) return modeBreathing(uv, t, p0, p1);
  if (m == 9) return modeBloomAnim(uv, t, p0, p1);
  if (m == 10) return modeNoiseDrift(uv, t, p0, p1);
  if (m == 11) return modeFlowField(uv, t, p0, p1);
  if (m == 12) return modeMagnetic(uv, t, p0, p1);
  if (m == 13) return modeAurora(uv, t, p0, p1);
  if (m == 14) return modeTurbulence(uv, t, p0, p1);
  return modeLavaLamp(uv, t, p0, p1);
}

// Layers: ambient + distortion already in sample; interaction + lighting applied in main
vec4 sampleAnimation(vec2 uv, float t) {
  vec4 a = evalAnimMode(uAnimModeA, uv, t, uAnimParamsA0, uAnimParamsA1);
  vec4 b = evalAnimMode(uAnimModeB, uv, t, uAnimParamsB0, uAnimParamsB1);
  return mix(a, b, clamp(uAnimBlend, 0.0, 1.0));
}
`;
