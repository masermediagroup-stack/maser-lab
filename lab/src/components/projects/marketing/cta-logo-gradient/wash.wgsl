struct Params {
  time: f32,
  speed: f32,
  highlight: f32,
  shade: f32,
  glow: f32,
  angle: f32,
}

@group(0) @binding(0) var<uniform> params: Params;

const BLUE = vec3f(0.062745, 0.643137, 1.0);
const WHITE = vec3f(0.960784, 0.984314, 1.0);
const DARK = vec3f(0.031373, 0.447059, 0.768627);
const CYAN = vec3f(0.12, 0.92, 1.0);
const MAGENTA = vec3f(1.0, 0.22, 0.78);
const TAU = 6.28318530718;
const LOOP = 9.0;
const COLS = 96.0;
const ROWS = 35.0;
const AMP = 0.012;
const SRC_A = vec2f(0.30, 0.44);
const SRC_B = vec2f(0.70, 0.56);
const SRC_C = vec2f(0.48, 0.30);
const FREQ_A = 26.0;
const FREQ_B = 19.0;
const FREQ_C = 31.0;

fn rotateAround(p: vec2f, pivot: vec2f, rad: f32) -> vec2f {
  let d = p - pivot;
  let c = cos(rad);
  let s = sin(rad);
  return pivot + vec2f(d.x * c - d.y * s, d.x * s + d.y * c);
}

fn ring(uv: vec2f, origin: vec2f, slide: f32, freq: f32, k: f32) -> f32 {
  return sin(length(uv - origin) * freq - k * slide * TAU);
}

fn sourcePush(uv: vec2f, origin: vec2f, slide: f32, freq: f32, k: f32, amp: f32) -> vec2f {
  let d = uv - origin;
  let dist = length(d);
  let dir = d / max(dist, 0.0008);
  return dir * ring(uv, origin, slide, freq, k) * amp;
}

fn pondHeight(uv: vec2f, slide: f32, a: vec2f, b: vec2f, c: vec2f) -> f32 {
  let h = ring(uv, a, slide, FREQ_A, 1.0) * 0.45
    + ring(uv, b, slide, FREQ_B, 1.0) * 0.35
    + ring(uv, c, slide, FREQ_C, 2.0) * 0.20;
  return clamp(h * 0.5 + 0.5, 0.0, 1.0);
}

fn pondOffset(uv: vec2f, slide: f32, a: vec2f, b: vec2f, c: vec2f) -> vec2f {
  return sourcePush(uv, a, slide, FREQ_A, 1.0, AMP)
    + sourcePush(uv, b, slide, FREQ_B, 1.0, AMP * 0.85)
    + sourcePush(uv, c, slide, FREQ_C, 2.0, AMP * 0.55);
}

fn washColor(wave: f32) -> vec3f {
  var color = mix(BLUE, DARK, params.shade * (1.0 - wave) * 0.12);
  let hi = smoothstep(0.52, 0.95, wave) * params.highlight;
  color = mix(color, WHITE, hi * 0.42);
  let inner = pow(smoothstep(0.62, 1.0, wave), 1.55) * params.glow;
  color = color + WHITE * inner * 0.18;
  return clamp(color, vec3f(0.0), vec3f(1.0));
}

fn hash21(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453123);
}

fn glyphBits(bits: u32, local: vec2f) -> f32 {
  let p = min(floor(vec2f(local.x * 5.0, local.y * 7.0)), vec2f(4.0, 6.0));
  let bit = u32(p.x) + u32(p.y) * 5u;
  return f32((bits >> bit) & 1u);
}

fn glyphForKind(kind: i32, local: vec2f) -> f32 {
  if (kind <= 0) {
    return glyphBits(0x08000000u, local);
  }
  if (kind == 1) {
    return glyphBits(0x00400080u, local);
  }
  if (kind == 2) {
    return glyphBits(0x084f9080u, local);
  }
  if (kind == 3) {
    return glyphBits(0x22a22a20u, local);
  }
  return glyphBits(0x2318d771u, local);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let slide = params.time * params.speed / LOOP;
  let spin = params.angle * 0.01745329252;
  let pivot = vec2f(0.5);
  let a = rotateAround(SRC_A, pivot, spin);
  let b = rotateAround(SRC_B, pivot, spin);
  let c = rotateAround(SRC_C, pivot, spin);
  let swimUv = uv + pondOffset(uv, slide, a, b, c);
  let cells = vec2f(COLS, ROWS);
  let grid = swimUv * cells;
  let cell = floor(grid);
  let local = fract(grid);
  let wave = pondHeight(swimUv, slide, a, b, c);
  var color = washColor(wave);
  let n = hash21(cell);
  let lit = smoothstep(0.58, 0.86, wave);
  let dust = step(0.93, n) * lit;
  let dustCol = select(CYAN, MAGENTA, n > 0.95);
  color = mix(color, dustCol, dust * 0.72);
  let kind = i32(min(floor(wave * 5.0), 4.0));
  let glyph = glyphForKind(kind, local);
  return vec4f(mix(BLUE, color, glyph), 1.0);
}
