/**
 * Overlapping continuous filaments through Blue-HD glass.
 *
 * Electric wander: high-frequency jumps across the glyph — not parallel
 * worm lanes. Random perimeter entries. Paths miss more by phase-offset
 * wander and rest depth, not by flattening into tracks. RGB split on the
 * stroke. Soft traveling window — ease in/out, no flash. Volume warp is
 * always on (cloud belly + tilt), not hover-gated. Mask stays unwarped.
 *
 * `fwidth` of each line field runs before any early-return — derivatives
 * in non-uniform control flow reject the pipeline in Chrome WGSL.
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
  tilt_x: f32,
  tilt_y: f32,
  _pad0: f32,
  _pad1: f32,
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
const PERIOD = 2.7;
const SPAN = 0.58;
const EASE = 0.16;

fn hash11(n: f32) -> f32 {
  return fract(sin(n * 127.1) * 43758.5453123);
}

fn wander_a(s: f32) -> f32 {
  return sin(s * 25.13 + 0.40) * 0.34
    + sin(s * 12.2 + 1.70) * 0.12
    + sin(s * 41.0 + 0.22) * 0.045;
}

fn wander_b(s: f32) -> f32 {
  return sin(s * 22.4 + 1.10) * 0.36
    + sin(s * 9.6 + 0.40) * 0.11
    + sin(s * 37.2 + 1.80) * 0.04;
}

fn wander_c(s: f32) -> f32 {
  return sin(s * 24.0 + 2.20) * 0.33
    + sin(s * 11.1 + 2.40) * 0.12
    + sin(s * 39.5 + 0.70) * 0.042;
}

fn wander_d(s: f32) -> f32 {
  return sin(s * 23.6 + 0.85) * 0.35
    + sin(s * 10.4 + 2.10) * 0.115
    + sin(s * 38.8 + 1.40) * 0.042;
}

fn wander_e(s: f32) -> f32 {
  return sin(s * 26.0 + 1.55) * 0.34
    + sin(s * 13.0 + 0.60) * 0.12
    + sin(s * 40.2 + 2.60) * 0.044;
}

fn wander_off(s: f32, which: i32) -> f32 {
  if (which == 1) { return wander_b(s); }
  if (which == 2) { return wander_c(s); }
  if (which == 3) { return wander_d(s); }
  if (which == 4) { return wander_e(s); }
  return wander_a(s);
}

fn coverage(dist: f32, half_w: f32, aa: f32) -> f32 {
  return 1.0 - smoothstep(half_w * 0.45, half_w + aa, dist);
}

/** ox, oy, dx, dy — perimeter origin, inward travel. lat slides along the edge. */
fn spawn_frame(kind: i32, lat: f32) -> vec4f {
  let edge = 0.16 + lat * 0.68;
  if (kind == 0) { return vec4f(0.0, edge, 1.0, 0.0); }
  if (kind == 1) { return vec4f(1.0, edge, -1.0, 0.0); }
  if (kind == 2) { return vec4f(edge, 0.05, 0.0, 1.0); }
  if (kind == 3) { return vec4f(edge, 0.95, 0.0, -1.0); }
  if (kind == 4) {
    let d = normalize(vec2f(1.0, 0.62));
    return vec4f(0.0, 0.10, d.x, d.y);
  }
  if (kind == 5) {
    let d = normalize(vec2f(-1.0, 0.58));
    return vec4f(1.0, 0.12, d.x, d.y);
  }
  if (kind == 6) {
    let d = normalize(vec2f(1.0, -0.6));
    return vec4f(0.0, 0.90, d.x, d.y);
  }
  let d = normalize(vec2f(-1.0, -0.55));
  return vec4f(1.0, 0.88, d.x, d.y);
}

/** Cloud belly closer than the rim — always on, not hover-gated. */
fn rest_near(uv: vec2f) -> f32 {
  let d = length((uv - vec2f(0.50, 0.46)) * vec2f(1.15, 1.55));
  return (1.0 - clamp(d, 0.0, 1.0)) * 0.34;
}

fn volume_uv(uv: vec2f) -> vec2f {
  let nx = params.tilt_x / 14.0;
  let ny = params.tilt_y / 16.0;
  let near = rest_near(uv) + (0.5 - uv.y) * nx + (uv.x - 0.5) * ny;
  let persp = 1.0 / max(0.72, 1.0 - near * 0.28);
  return vec2f(0.5) + (uv - vec2f(0.5)) * persp;
}

fn depth_scale(uv: vec2f) -> f32 {
  let nx = params.tilt_x / 14.0;
  let ny = params.tilt_y / 16.0;
  let near = rest_near(uv) + (0.5 - uv.y) * nx + (uv.x - 0.5) * ny;
  return 1.0 / max(0.72, 1.0 - near * 0.28);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let texel = textureSampleLevel(logo, samp, uv, 0.0);
  let mask = texel.a;
  let uvw = volume_uv(uv);
  let dscale = depth_scale(uv);

  let travel = params.speed * mix(1.0, HOVER_BOOST, params.hover);
  let t = params.time * travel;
  let phases = array<f32, 5>(0.0, 0.52, 1.04, 1.56, 2.08);
  let clocks = array<f32, 5>(0.97, 1.0, 1.04, 0.99, 1.02);
  let wphase = array<f32, 5>(0.0, 0.31, 0.58, 0.17, 0.44);
  let layers = array<f32, 5>(1.12, 0.88, 1.06, 0.90, 1.00);

  var fields: array<f32, 5>;
  var alongs: array<f32, 5>;
  var aa_i: array<f32, 5>;

  for (var i = 0; i < 5; i++) {
    let tau = t * clocks[i] + phases[i];
    let gen = floor(tau / PERIOD);
    let kind = i32(fract(hash11(gen * 3.17 + f32(i) * 11.9) + f32(i) * 0.19) * 7.999);
    let lat = hash11(gen * 5.91 + f32(i) * 4.3);
    let frame = spawn_frame(kind, lat);
    let along = (uvw.x - frame.x) * frame.z + (uvw.y - frame.y) * frame.w;
    let perp = (uvw.x - frame.x) * (-frame.w) + (uvw.y - frame.y) * frame.z;
    let field = perp - wander_off(along + wphase[i], i);
    fields[i] = field;
    alongs[i] = along;
    aa_i[i] = fwidth(field);
  }

  let aa = max(
    max(max(aa_i[0], aa_i[1]), max(aa_i[2], aa_i[3])),
    max(aa_i[4], 1.4 / max(min(params.res_x, params.res_y), 1.0)),
  );

  if (mask < 0.004) {
    return vec4f(0.0);
  }

  let fringe = saturate(params.fringe);
  let ground = saturate(params.ground);
  let gcol = mix(DEEP_BLUE, PALE, ground);
  let rcol = mix(MAGENTA, MAGENTA_PALE, ground);
  let lead_span = max(0.10, EASE * 0.7);
  let split = max(params.band_width, aa * 1.5) * (0.42 + 0.7 * fringe) * dscale;
  let ca_s = 0.007 * fringe;
  let weights = array<f32, 5>(0.94, 1.0, 1.07, 0.97, 1.04);

  var acc = vec3f(0.0);
  var alpha = 0.0;

  for (var i = 0; i < 5; i++) {
    let tau = t * clocks[i] + phases[i];
    let local = fract(tau / PERIOD);
    let presence = smoothstep(0.0, 0.10, local) * (1.0 - smoothstep(0.88, 0.98, local));
    if (presence < 0.004) {
      continue;
    }

    let along = alongs[i];
    let field = fields[i];
    let head = local * (1.0 + SPAN + EASE);
    let tail = head - SPAN;
    let win = smoothstep(tail, tail + EASE, along)
      * (1.0 - smoothstep(head - EASE, head, along))
      * presence;
    if (win < 0.004) {
      continue;
    }

    let behind = head - along;
    let lead = (1.0 - smoothstep(0.0, lead_span, behind)) * step(0.0, behind) * win;

    let half_w = max(params.band_width * weights[i] * layers[i] * dscale, aa * 1.5);
    let field_r = field - split - wander_off(along + wphase[i] - ca_s, i) + wander_off(along + wphase[i], i);
    let field_b = field + split - wander_off(along + wphase[i] + ca_s, i) + wander_off(along + wphase[i], i);

    let c_r = coverage(abs(field_r), half_w, aa) * win * (1.0 - lead * 0.35 * fringe);
    let c_g = coverage(abs(field), half_w, aa) * win;
    let c_b = coverage(abs(field_b), half_w, aa) * win;
    let c_b_lead = min(1.0, c_b + lead * 0.45 * fringe);
    let halo = (1.0 - smoothstep(half_w, half_w * 2.3 + aa, abs(field))) * win;

    acc += rcol * c_r * 0.55 + gcol * c_g * 0.7 + CYAN * c_b_lead * (0.4 + 0.35 * fringe);
    acc += gcol * halo * 0.16;
    alpha = max(alpha, (c_g * 0.9 + (c_r + c_b_lead) * 0.22 + halo * 0.22) * mask);
  }

  acc = min(acc, vec3f(1.0)) * mask;
  return vec4f(acc, alpha);
}
`;
