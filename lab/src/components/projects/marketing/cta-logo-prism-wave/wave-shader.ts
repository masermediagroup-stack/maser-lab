/**
 * 2D dry electric filament on the rasterized Blue-HD alpha.
 * uv is vgpu top-origin (0,0 top-left). No lighting, no depth, no hue sweep,
 * no bloom / additive halo. Body is a flat Maser-blue glass fill.
 */
export const WAVE_WGSL = /* wgsl */ `
struct Params {
  time: f32,
  speed: f32,
  band_width: f32,
  fringe: f32,
  hover: f32,
}

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var logo: texture_2d<f32>;
@group(0) @binding(2) var samp: sampler;

const MASER_BLUE = vec3f(0.062745098, 0.643137255, 1.0);
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
  if (mask < 0.004) {
    return vec4f(0.0);
  }

  let travel = params.speed * mix(1.0, HOVER_BOOST, params.hover);
  let axis = uv.x * 0.9 + uv.y * 0.22;

  // Incommensurate hashes along the travel UV — jitter as it crosses,
  // not a periodic sine tube. Spatial only (no whole-line flicker).
  let h1 = hash21(vec2f(axis * 47.0, uv.x * 19.0 + uv.y * 31.0));
  let h2 = hash21(vec2f(axis * 113.0, uv.y * 43.0 - uv.x * 8.0));
  let h3 = hash21(vec2f(axis * 251.0, 11.0));
  let jitter = (h1 - 0.5) * 0.016 + (h2 - 0.5) * 0.007 + (h3 - 0.5) * 0.0028;

  let phase = fract(axis - params.time * travel + jitter);
  let width = max(params.band_width, 0.006);
  let aa = max(fwidth(axis), 0.001);

  let thick = 1.0 + (hash21(vec2f(axis * 89.0, 3.1)) - 0.5) * 0.7;
  let half_w = width * 0.5 * thick;
  let dist = abs(phase - half_w);

  // Hard core — no outer glow lobe.
  let filament = 1.0 - smoothstep(half_w, half_w + aa, dist);

  // Grain along the wire so it reads electric, still one band.
  let grain = 0.42 + 0.58 * hash21(vec2f(axis * 173.0, floor(axis * 96.0)));
  let line = filament * grain;

  var color = MASER_BLUE;
  color = mix(color, vec3f(1.0), line);

  // Cool tint only on the leading skin of the filament — not a halo ahead.
  let leading = 1.0 - smoothstep(0.0, half_w + aa, phase);
  color = mix(color, FRINGE_CYAN, line * leading * params.fringe * 0.22);

  return vec4f(color * mask, mask);
}
`;
