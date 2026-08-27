/**
 * Filament only — the Blue-HD mark is an <img> under this canvas.
 * Transparent (premultiplied zero) outside the line so the real glyph shows.
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
  let axis = uv.x * 0.9 + uv.y * 0.22;
  let aa = max(fwidth(axis), 0.0008);

  if (mask < 0.004) {
    return vec4f(0.0);
  }

  let travel = params.speed * mix(1.0, HOVER_BOOST, params.hover);

  // Incommensurate hashes along the travel UV — frequency in the line,
  // random as it crosses the mark. Spatial only (no whole-line flicker).
  let h1 = hash21(vec2f(axis * 97.0, uv.x * 41.0 + uv.y * 17.0));
  let h2 = hash21(vec2f(axis * 251.0, uv.y * 73.0 - uv.x * 11.0));
  let h3 = hash21(vec2f(floor(axis * 64.0), 5.0));
  let jitter = (h1 - 0.5) * 0.022 + (h2 - 0.5) * 0.009 + (h3 - 0.5) * 0.004;

  let phase = fract(axis - params.time * travel + jitter);
  let width = max(params.band_width, 0.006);

  let thick = 1.0 + (hash21(vec2f(axis * 149.0, 3.1)) - 0.5) * 0.85;
  let half_w = width * 0.5 * thick;
  let dist = abs(phase - half_w);

  // Hard core — no outer glow lobe, no neon tube.
  let filament = 1.0 - smoothstep(half_w, half_w + aa, dist);

  // Grain along the wire so it reads electric, still one band.
  let grain = 0.5 + 0.5 * hash21(vec2f(axis * 310.0, floor(uv.x * 180.0 + uv.y * 90.0)));
  let line = filament * grain * mask;

  var color = vec3f(1.0);
  let leading = 1.0 - smoothstep(0.0, half_w + aa, phase);
  color = mix(color, FRINGE_CYAN, leading * params.fringe * 0.18);

  return vec4f(color * line, line);
}
`;
