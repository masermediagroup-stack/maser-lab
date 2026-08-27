/**
 * Filament only — Blue-HD is an <img> under this canvas.
 *
 * Centerline is a low-frequency snake through the mark (t = wander(u)),
 * not a straight UV band with grain on it. Pinches + a fork break the path.
 *
 * `fwidth` runs before the mask early-return — derivatives in non-uniform
 * control flow reject the pipeline in Chrome WGSL.
 */
export const WAVE_WGSL = /* wgsl */ `
struct Params {
  time: f32,
  speed: f32,
  band_width: f32,
  fringe: f32,
  hover: f32,
  res_x: f32,
  res_y: f32,
}

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var logo: texture_2d<f32>;
@group(0) @binding(2) var samp: sampler;

const FRINGE_CYAN = vec3f(0.450980392, 0.905882353, 1.0);
const HOVER_BOOST = 1.45;

fn hash21(p: vec2f) -> f32 {
  var p3 = fract(vec3f(p.x, p.y, p.x) * vec3f(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// Low-frequency centerline in Y vs X — amplitude is large enough to leave
// a straight cut and thread both lines of the wordmark.
fn wander_y(u: f32) -> f32 {
  return 0.50
    + sin(u * 6.6 + 0.28) * 0.20
    + sin(u * 3.15 + 1.62) * 0.145
    + sin(u * 11.4 + 0.9) * 0.045;
}

fn fork_y(u: f32) -> f32 {
  return wander_y(u) - 0.16 - sin(u * 5.1 + 2.05) * 0.09;
}

fn spur_y(u: f32) -> f32 {
  return wander_y(u) + 0.14 + sin(u * 4.4 + 0.7) * 0.07;
}

fn window_behind(u: f32, head: f32, len: f32) -> f32 {
  let d = fract(head - u + 1.0);
  return 1.0 - smoothstep(len * 0.72, len, d);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let texel = textureSampleLevel(logo, samp, uv, 0.0);
  let mask = texel.a;

  let u = uv.x;
  let y0 = wander_y(u);
  let y1 = fork_y(u);
  let y2 = spur_y(u);
  let aa = max(
    max(fwidth(uv.y - y0), fwidth(uv.y - y1)),
    max(fwidth(uv.y - y2), 1.4 / max(min(params.res_x, params.res_y), 1.0)),
  );

  if (mask < 0.004) {
    return vec4f(0.0);
  }

  let travel = params.speed * mix(1.0, HOVER_BOOST, params.hover);
  let head = fract(params.time * travel);

  let cell = floor(u * 16.0);
  let pinch_h = hash21(vec2f(cell, 4.2));
  let pinch = mix(0.10, 1.45, pow(pinch_h, 0.65));
  let half_w = max(params.band_width * 0.55 * pinch, aa * 1.2);

  let main_win = window_behind(u, head, 0.42);
  let fork_win = window_behind(u, head - 0.08, 0.22)
    * step(0.22, u) * (1.0 - step(0.78, u));
  let spur_win = window_behind(u, head - 0.14, 0.16)
    * step(0.40, u) * (1.0 - step(0.88, u));

  let main_line = (1.0 - smoothstep(half_w, half_w + aa, abs(uv.y - y0))) * main_win;
  let fork_line = (1.0 - smoothstep(half_w * 0.72, half_w * 0.72 + aa, abs(uv.y - y1))) * fork_win;
  let spur_line = (1.0 - smoothstep(half_w * 0.62, half_w * 0.62 + aa, abs(uv.y - y2))) * spur_win;

  let line = max(main_line, max(fork_line, spur_line)) * mask;

  var color = vec3f(1.0);
  let leading = 1.0 - smoothstep(0.0, 0.10, fract(head - u + 1.0));
  color = mix(color, FRINGE_CYAN, leading * params.fringe * 0.16);

  return vec4f(color * line, line);
}
`;
