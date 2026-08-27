/**
 * Filament only — the Blue-HD mark is an <img> under this canvas.
 * Transparent (premultiplied zero) outside the line so the real glyph shows.
 *
 * Dry hashed wire: frequency along the filament, jitter as it travels.
 * Not a neon tube, not a clean bar, not a glow sweep.
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

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let texel = textureSampleLevel(logo, samp, uv, 0.0);
  let mask = texel.a;

  // Travel axis (diagonal through the cloud) and along-filament axis.
  let t_axis = vec2f(0.970, 0.243);
  let s_axis = vec2f(-0.243, 0.970);
  let t = dot(uv, t_axis);
  let s = dot(uv, s_axis);

  let aa = max(fwidth(t), 1.6 / max(min(params.res_x, params.res_y), 1.0));

  if (mask < 0.004) {
    return vec4f(0.0);
  }

  let travel = params.speed * mix(1.0, HOVER_BOOST, params.hover);
  let head = fract(params.time * travel);
  let head_t = mix(-0.10, 1.18, head);

  // Spatial cells along the wire. Travel cell shifts the hash as it moves —
  // jitter as it travels, not a whole-line flicker.
  let s_cell = floor(s * 96.0);
  let t_cell = floor(head_t * 48.0);
  let h1 = hash21(vec2f(s_cell, 3.1));
  let h2 = hash21(vec2f(s * 154.0, s_cell));
  let h3 = hash21(vec2f(s_cell, t_cell));
  let h4 = hash21(vec2f(floor(s * 37.0), t_cell + 9.0));

  let snake = (h1 - 0.5) * 0.052
    + (h2 - 0.5) * 0.024
    + (h3 - 0.5) * 0.018
    + sin(s * 71.0 + h4 * 6.2832) * 0.011;

  let thick_mul = 0.32 + h1 * 1.55 + h3 * 0.35;
  let half_w = max(params.band_width * 0.5 * thick_mul, aa * 1.15);

  // Dry breaks in the filament (~12% gaps).
  let gap = step(0.12, hash21(vec2f(s_cell, t_cell + 19.0)));

  let dist = abs(t - head_t - snake);
  let filament = (1.0 - smoothstep(half_w, half_w + aa, dist)) * gap;

  // Speckle along the wire so it reads electric, still one band.
  let grain = 0.42 + 0.58 * hash21(vec2f(s * 240.0, t * 90.0 + t_cell));
  let line = filament * grain * mask;

  var color = vec3f(1.0);
  let leading = 1.0 - smoothstep(0.0, half_w + aa, t - head_t - snake);
  color = mix(color, FRINGE_CYAN, leading * params.fringe * 0.16);

  return vec4f(color * line, line);
}
`;
