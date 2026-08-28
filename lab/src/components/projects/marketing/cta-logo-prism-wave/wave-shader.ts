/**
 * Overlapping continuous filaments through Blue-HD glass.
 *
 * Lanes miss each other (not a knot through one band). Each trip still
 * enters from a hashed place on its home edge. RGB split on the stroke.
 * Soft traveling window — ease in/out, no spawn pop, no live-skip strobe.
 * Stroke width / path UV foreshorten with the CSS 3D tilt (volume on the
 * plane, not an extrusion, not a lamp). Mask stays in unwarped UV.
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
  return sin(s * 16.4 + 0.40) * 0.08
    + sin(s * 8.1 + 1.70) * 0.03;
}

fn wander_b(s: f32) -> f32 {
  return sin(s * 15.2 + 1.10) * 0.085
    + sin(s * 7.6 + 0.40) * 0.028;
}

fn wander_c(s: f32) -> f32 {
  return sin(s * 17.0 + 2.20) * 0.075
    + sin(s * 8.8 + 2.40) * 0.03;
}

fn wander_d(s: f32) -> f32 {
  return sin(s * 15.8 + 0.85) * 0.082
    + sin(s * 7.9 + 2.10) * 0.029;
}

fn wander_e(s: f32) -> f32 {
  return sin(s * 16.8 + 1.55) * 0.078
    + sin(s * 9.0 + 0.60) * 0.031;
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

/** Home-lane spawn: hashed position on that edge, not a shared center band. */
fn spawn_for(which: i32, lat: f32) -> vec4f {
  if (which == 0) {
    return vec4f(0.0, 0.16 + lat * 0.12, 1.0, 0.0);
  }
  if (which == 1) {
    return vec4f(1.0, 0.66 + lat * 0.14, -1.0, 0.0);
  }
  if (which == 2) {
    let d = normalize(vec2f(0.05, 1.0));
    return vec4f(0.10 + lat * 0.12, 0.03, d.x, d.y);
  }
  if (which == 3) {
    let d = normalize(vec2f(-0.06, -1.0));
    return vec4f(0.78 + lat * 0.12, 0.97, d.x, d.y);
  }
  let d = normalize(vec2f(1.0, 0.07));
  return vec4f(0.0, 0.42 + lat * 0.12, d.x, d.y);
}

fn volume_uv(uv: vec2f) -> vec2f {
  let nx = params.tilt_x / 14.0;
  let ny = params.tilt_y / 16.0;
  let near = (0.5 - uv.y) * nx + (uv.x - 0.5) * ny;
  let persp = 1.0 / max(0.74, 1.0 - near * 0.24);
  return vec2f(0.5) + (uv - vec2f(0.5)) * persp;
}

fn depth_scale(uv: vec2f) -> f32 {
  let nx = params.tilt_x / 14.0;
  let ny = params.tilt_y / 16.0;
  let near = (0.5 - uv.y) * nx + (uv.x - 0.5) * ny;
  return 1.0 / max(0.74, 1.0 - near * 0.24);
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

  var fields: array<f32, 5>;
  var alongs: array<f32, 5>;
  var aa_i: array<f32, 5>;

  for (var i = 0; i < 5; i++) {
    let tau = t * clocks[i] + phases[i];
    let gen = floor(tau / PERIOD);
    let lat = hash11(gen * 5.91 + f32(i) * 4.3);
    let frame = spawn_for(i, lat);
    let along = (uvw.x - frame.x) * frame.z + (uvw.y - frame.y) * frame.w;
    let perp = (uvw.x - frame.x) * (-frame.w) + (uvw.y - frame.y) * frame.z;
    let field = perp - wander_off(along, i);
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

    let half_w = max(params.band_width * weights[i] * dscale, aa * 1.5);
    let field_r = field - split - wander_off(along - ca_s, i) + wander_off(along, i);
    let field_b = field + split - wander_off(along + ca_s, i) + wander_off(along, i);

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
