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
const LOOP = 9.0;

fn paletteAt(t: f32) -> vec3f {
  let u = fract(t);
  let seg = u * 4.0;
  let i = floor(seg);
  let f = fract(seg);
  let hi = mix(BLUE, WHITE, params.highlight * 0.48) + WHITE * params.glow * 0.18;
  let lo = mix(BLUE, DARK, params.shade * 0.82);
  var a = BLUE;
  var b = BLUE;
  if (i < 0.5) {
    a = BLUE;
    b = hi;
  } else if (i < 1.5) {
    a = hi;
    b = BLUE;
  } else if (i < 2.5) {
    a = BLUE;
    b = lo;
  } else {
    a = lo;
    b = BLUE;
  }
  return clamp(mix(a, b, f), vec3f(0.0), vec3f(1.0));
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let phase = fract(params.time * params.speed / LOOP + params.angle / 360.0);
  let tl = paletteAt(phase);
  let tr = paletteAt(phase + 0.25);
  let bl = paletteAt(phase + 0.5);
  let br = paletteAt(phase + 0.75);
  let top = mix(tl, tr, uv.x);
  let bot = mix(bl, br, uv.x);
  return vec4f(mix(top, bot, uv.y), 1.0);
}
