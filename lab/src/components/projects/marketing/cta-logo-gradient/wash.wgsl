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
const BANDS = 2.6;
const COLS = 96.0;
const ROWS = 35.0;

fn washWave(uv: vec2f, dir: vec2f, slide: f32) -> f32 {
  let travel = dot(uv - vec2f(0.5), dir) * BANDS - slide;
  return sin(travel * TAU) * 0.5 + 0.5;
}

fn washColor(wave: f32) -> vec3f {
  var color = mix(BLUE, DARK, params.shade * (1.0 - wave) * 0.82);
  let hi = smoothstep(0.5, 0.94, wave) * params.highlight;
  color = mix(color, WHITE, hi * 0.48);
  let inner = pow(smoothstep(0.64, 1.0, wave), 1.55) * params.glow;
  color = color + WHITE * inner * 0.26;
  color = color * mix(0.22, 1.0, wave);
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
  let rad = params.angle * 0.01745329252;
  let dir = vec2f(cos(rad), sin(rad));
  let slide = params.time * params.speed / LOOP;
  let cells = vec2f(COLS, ROWS);
  let grid = uv * cells;
  let cell = floor(grid);
  let local = fract(grid);
  let centerUv = (cell + vec2f(0.5)) / cells;
  let wave = washWave(centerUv, dir, slide);
  var color = washColor(wave);
  let n = hash21(cell);
  let lit = smoothstep(0.58, 0.86, wave);
  let dust = step(0.93, n) * lit;
  let dustCol = select(CYAN, MAGENTA, n > 0.95);
  color = mix(color, dustCol, dust * 0.72);
  let kind = i32(min(floor(wave * 5.0), 4.0));
  let glyph = glyphForKind(kind, local);
  let ink = vec3f(0.019608, 0.027451, 0.039216);
  return vec4f(mix(ink, color, glyph), 1.0);
}
