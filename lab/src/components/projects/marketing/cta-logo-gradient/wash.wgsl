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
const BANDS = 2.6;

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
  return clamp(color, vec3f(0.0), vec3f(1.0));
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let rad = params.angle * 0.01745329252;
  let dir = vec2f(cos(rad), sin(rad));
  let slide = params.time * params.speed / LOOP;
  let wave = washWave(uv, dir, slide);
  return vec4f(washColor(wave), 1.0);
}
