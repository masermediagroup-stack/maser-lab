/**
 * Overlapping continuous filaments through Blue-HD glass.
 *
 * 2–5 similar-weight wanders live in the volume at once (optional lines
 * skip some trips). RGB split on the stroke, cyan-leaning at the lead.
 * In-glyph halo only — not a lamp off the mark.
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
const MAGENTA = vec3f(0.768627451, 0.274509804, 0.415686275);
const MAGENTA_PALE = vec3f(1.0, 0.58, 0.66);
const HOVER_BOOST = 1.45;
const TRIP = 2.0;

fn hash11(n: f32) -> f32 {
  return fract(sin(n * 127.1) * 43758.5453123);
}

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

fn wander_d(u: f32) -> f32 {
  return 0.49
    + sin(u * 23.6 + 0.85) * 0.35
    + sin(u * 10.4 + 2.10) * 0.115
    + sin(u * 38.8 + 1.40) * 0.042;
}

fn wander_e(u: f32) -> f32 {
  return 0.51
    + sin(u * 26.0 + 1.55) * 0.34
    + sin(u * 13.0 + 0.60) * 0.12
    + sin(u * 40.2 + 2.60) * 0.044;
}

fn wander_y(u: f32, which: i32) -> f32 {
  if (which == 1) { return wander_b(u); }
  if (which == 2) { return wander_c(u); }
  if (which == 3) { return wander_d(u); }
  if (which == 4) { return wander_e(u); }
  return wander_a(u);
}

fn coverage(dist: f32, half_w: f32, aa: f32) -> f32 {
  return 1.0 - smoothstep(half_w * 0.45, half_w + aa, dist);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let texel = textureSampleLevel(logo, samp, uv, 0.0);
  let mask = texel.a;

  let u = uv.x;
  let y_a = wander_a(u);
  let y_b = wander_b(u);
  let y_c = wander_c(u);
  let y_d = wander_d(u);
  let y_e = wander_e(u);
  let aa = max(
    max(
      max(fwidth(uv.y - y_a), fwidth(uv.y - y_b)),
      max(fwidth(uv.y - y_c), fwidth(uv.y - y_d)),
    ),
    max(fwidth(uv.y - y_e), 1.4 / max(min(params.res_x, params.res_y), 1.0)),
  );

  if (mask < 0.004) {
    return vec4f(0.0);
  }

  let travel = params.speed * mix(1.0, HOVER_BOOST, params.hover);
  let t = params.time * travel;
  let fringe = saturate(params.fringe);
  let ground = saturate(params.ground);
  let gcol = mix(DEEP_BLUE, PALE, ground);
  let rcol = mix(MAGENTA, MAGENTA_PALE, ground);
  let lead_span = max(0.042, aa * 12.0);
  let split = max(params.band_width, aa * 1.5) * (0.42 + 0.7 * fringe);
  let ca_u = 0.007 * fringe;

  let phases = array<f32, 5>(0.0, 0.58, 1.12, 1.49, 0.27);
  let weights = array<f32, 5>(0.94, 1.0, 1.07, 0.97, 1.04);
  let clocks = array<f32, 5>(0.96, 1.0, 1.06, 0.98, 1.03);

  var acc = vec3f(0.0);
  var alpha = 0.0;

  for (var i = 0; i < 5; i++) {
    let tau = t * clocks[i] + phases[i];
    let gen = floor(tau / TRIP);
    var live = true;
    if (i >= 2) {
      live = hash11(gen * 13.17 + f32(i) * 7.13) > 0.34;
    }
    if (!live) {
      continue;
    }

    let local = fract(tau / TRIP) * TRIP;
    var win: f32;
    var head: f32 = 0.0;
    if (local < 1.0) {
      win = 1.0 - smoothstep(local, local + aa * 8.0, u);
      let behind = local - u;
      head = (1.0 - smoothstep(0.0, lead_span, behind)) * step(0.0, behind);
    } else {
      let e = local - 1.0;
      win = smoothstep(e, e + aa * 8.0, u);
    }
    if (win < 0.004) {
      continue;
    }

    let half_w = max(params.band_width * weights[i], aa * 1.5);
    let y0 = wander_y(u, i);
    let y_r = wander_y(u - ca_u, i) - split;
    let y_bch = wander_y(u + ca_u, i) + split;

    let c_r = coverage(abs(uv.y - y_r), half_w, aa) * win * (1.0 - head * 0.35 * fringe);
    let c_g = coverage(abs(uv.y - y0), half_w, aa) * win;
    let c_b = coverage(abs(uv.y - y_bch), half_w, aa) * win;
    let c_b_lead = min(1.0, c_b + head * 0.45 * fringe);
    let halo = (1.0 - smoothstep(half_w, half_w * 2.3 + aa, abs(uv.y - y0))) * win;

    acc += rcol * c_r * 0.55 + gcol * c_g * 0.7 + CYAN * c_b_lead * (0.4 + 0.35 * fringe);
    acc += gcol * halo * 0.16;
    alpha = max(alpha, (c_g * 0.9 + (c_r + c_b_lead) * 0.22 + halo * 0.22) * mask);
  }

  acc = min(acc, vec3f(1.0)) * mask;
  return vec4f(acc, alpha);
}
`;
