/**
 * Sequential continuous filaments through Blue-HD glass.
 *
 * One wander finishes the full L→R trip (draw on, then clear) before the
 * next variant enters. Thin core + in-glyph halo. Cool/cyan skin on the
 * leading edge only (`fringe`) — not a hue sweep. Color comes from
 * `ground` (0 = deeper blue on light, 1 = pale on dark).
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
  ground: f32,
}

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var logo: texture_2d<f32>;
@group(0) @binding(2) var samp: sampler;

const DEEP_BLUE = vec3f(0.039215686, 0.352941176, 0.611764706);
const PALE = vec3f(0.905882353, 0.956862745, 1.0);
const CYAN = vec3f(0.450980392, 0.905882353, 1.0);
const HOVER_BOOST = 1.45;

fn wander_a(u: f32) -> f32 {
  return 0.50
    + sin(u * 25.13 + 0.40) * 0.34
    + sin(u * 12.2 + 1.70) * 0.12
    + sin(u * 41.0 + 0.22) * 0.045;
}

fn wander_b(u: f32) -> f32 {
  return 0.48
    + sin(u * 22.4 + 1.10) * 0.36
    + sin(u * 9.6 + 0.40) * 0.11
    + sin(u * 37.2 + 1.80) * 0.04;
}

fn wander_c(u: f32) -> f32 {
  return 0.52
    + sin(u * 24.0 + 2.20) * 0.33
    + sin(u * 11.1 + 2.40) * 0.12
    + sin(u * 39.5 + 0.70) * 0.042;
}

fn wander_y(u: f32, which: i32) -> f32 {
  if (which == 1) { return wander_b(u); }
  if (which == 2) { return wander_c(u); }
  return wander_a(u);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let texel = textureSampleLevel(logo, samp, uv, 0.0);
  let mask = texel.a;

  let u = uv.x;
  let y_a = wander_a(u);
  let y_b = wander_b(u);
  let y_c = wander_c(u);
  let aa = max(
    max(fwidth(uv.y - y_a), fwidth(uv.y - y_b)),
    max(fwidth(uv.y - y_c), 1.4 / max(min(params.res_x, params.res_y), 1.0)),
  );

  if (mask < 0.004) {
    return vec4f(0.0);
  }

  let travel = params.speed * mix(1.0, HOVER_BOOST, params.hover);
  // Two units per line (draw-on + clear). Three lines, sequential.
  let t = params.time * travel;
  let which = i32(floor(t / 2.0)) % 3;
  let local = fract(t / 2.0) * 2.0;
  let y0 = wander_y(u, which);

  var win: f32;
  var head: f32 = 0.0;
  let lead_span = max(0.042, aa * 12.0);
  if (local < 1.0) {
    win = 1.0 - smoothstep(local, local + aa * 8.0, u);
    // Cool skin just behind the advancing front. Zero ahead of it.
    let behind = local - u;
    head = (1.0 - smoothstep(0.0, lead_span, behind)) * step(0.0, behind);
  } else {
    let e = local - 1.0;
    win = smoothstep(e, e + aa * 8.0, u);
  }

  let half_w = max(params.band_width, aa * 1.5);
  let dist = abs(uv.y - y0);
  let core = 1.0 - smoothstep(half_w * 0.45, half_w + aa, dist);
  let halo = 1.0 - smoothstep(half_w, half_w * 2.4 + aa, dist);
  // In-glyph volume glow — not a lamp off the mark (mask already clipped).
  let line = (core + halo * 0.26) * win * mask;

  let base = mix(DEEP_BLUE, PALE, saturate(params.ground));
  let color = mix(base, CYAN, head * saturate(params.fringe));
  return vec4f(color * line, line);
}
`;
