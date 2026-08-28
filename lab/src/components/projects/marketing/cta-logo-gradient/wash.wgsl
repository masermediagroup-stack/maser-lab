import { hash2 } from "@vgpu/wgsl-std/hash";

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
const TAU = 6.28318530718;
const LOOP = 9.0;
const CELLS = 138.0;
const CELL_ASPECT = 1.28;
const BANDS = 2.6;

fn washAt(uv: vec2f, dir: vec2f, slide: f32) -> vec3f {
  let travel = dot(uv - vec2f(0.5), dir) * BANDS - slide;
  let wave = sin(travel * TAU) * 0.5 + 0.5;
  var color = mix(BLUE, DARK, params.shade * (1.0 - wave) * 0.82);
  let hi = smoothstep(0.5, 0.94, wave) * params.highlight;
  color = mix(color, WHITE, hi * 0.48);
  let inner = pow(smoothstep(0.64, 1.0, wave), 1.55) * params.glow;
  color = color + WHITE * inner * 0.26;
  return clamp(color, vec3f(0.0), vec3f(1.0));
}

fn blot(local: vec2f, center: vec2f, radius: f32) -> f32 {
  return 1.0 - smoothstep(radius * 0.55, radius, length(local - center));
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let rad = params.angle * 0.01745329252;
  let dir = vec2f(cos(rad), sin(rad));
  let slide = params.time * params.speed / LOOP;

  let cells = vec2f(CELLS, CELLS * CELL_ASPECT);
  let grid = uv * cells;
  let cell = floor(grid);
  let local = fract(grid);
  let rnd = hash2(cell);
  let rndB = hash2(cell + vec2f(13.0, 5.0));

  if (rnd.x > 0.2) {
    return vec4f(0.0);
  }

  let jitter = (rndB - vec2f(0.5)) * 0.18;
  var glyph = 0.0;
  let kind = rnd.y;
  if (kind < 0.58) {
    glyph = blot(local, vec2f(0.5, 0.7) + jitter, 0.11);
  } else if (kind < 0.86) {
    let c = vec2f(0.5, 0.5) + jitter * 0.5;
    glyph = max(
      blot(local, c + vec2f(0.0, -0.18), 0.085),
      blot(local, c + vec2f(0.0, 0.2), 0.085),
    );
  } else {
    glyph = blot(local, vec2f(0.5, 0.52) + jitter, 0.07);
  }

  if (glyph <= 0.001) {
    return vec4f(0.0);
  }

  let centerUv = (cell + vec2f(0.5)) / cells;
  let color = washAt(centerUv, dir, slide);
  let wave = sin((dot(centerUv - vec2f(0.5), dir) * BANDS - slide) * TAU) * 0.5 + 0.5;
  let ride = mix(0.42, 1.0, wave);
  let alpha = glyph * ride;
  return vec4f(color * alpha, alpha);
}
