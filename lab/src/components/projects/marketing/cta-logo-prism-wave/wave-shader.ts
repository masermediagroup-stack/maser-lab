/**
 * One heavy dry filament — Blue-HD is an <img> under this canvas.
 *
 * Centerline is y = wander(x): ~4 S-humps through both word lines.
 * A single traveling packet, clipped to the glyph. No forks, no dashed
 * scratches, no glow bloom.
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

// ~4 S-humps through MASER (upper) and MEDIA (lower). Same snake as CSS.
fn wander_y(u: f32) -> f32 {
  return 0.50
    + sin(u * 25.13 + 0.40) * 0.34
    + sin(u * 12.2 + 1.70) * 0.12
    + sin(u * 41.0 + 0.22) * 0.045;
}

fn window_behind(u: f32, head: f32, len: f32) -> f32 {
  let d = fract(head - u + 1.0);
  return 1.0 - smoothstep(len * 0.82, len, d);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let texel = textureSampleLevel(logo, samp, uv, 0.0);
  let mask = texel.a;

  let u = uv.x;
  let y0 = wander_y(u);
  let aa = max(fwidth(uv.y - y0), 1.4 / max(min(params.res_x, params.res_y), 1.0));

  if (mask < 0.004) {
    return vec4f(0.0);
  }

  let travel = params.speed * mix(1.0, HOVER_BOOST, params.hover);
  let head = fract(params.time * travel);

  let cell = floor(u * 14.0);
  let pinch = mix(0.88, 1.12, hash21(vec2f(cell, 4.2)));
  let half_w = max(params.band_width * pinch, aa * 1.8);

  let win = window_behind(u, head, 0.50);
  let core = 1.0 - smoothstep(half_w * 0.72, half_w + aa, abs(uv.y - y0));
  let line = core * win * mask;

  var color = vec3f(1.0);
  let leading = 1.0 - smoothstep(0.0, 0.10, fract(head - u + 1.0));
  color = mix(color, FRINGE_CYAN, leading * params.fringe * 0.12);

  return vec4f(color * line, line);
}
`;
