/**
 * 2D prism vapor on the rasterized Blue-HD alpha.
 * uv is vgpu top-origin (0,0 top-left). No lighting, no depth, no hue sweep.
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

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let texel = textureSampleLevel(logo, samp, uv, 0.0);
  let mask = texel.a;
  if (mask < 0.004) {
    return vec4f(0.0);
  }

  let travel = params.speed * mix(1.0, HOVER_BOOST, params.hover);
  let axis = uv.x * 0.9 + uv.y * 0.22;
  let phase = fract(axis - params.time * travel);

  let width = max(params.band_width, 0.02);
  let fringe_w = max(0.01, width * 0.28);
  let leading = (1.0 - smoothstep(0.0, fringe_w, phase))
    * smoothstep(-0.002, 0.0, phase);
  let band_core = smoothstep(fringe_w, fringe_w + width * 0.35, phase)
    * (1.0 - smoothstep(width * 0.55, width, phase));

  var color = MASER_BLUE;
  color = mix(color, vec3f(1.0), band_core * 0.96);
  color = mix(color, FRINGE_CYAN, leading * params.fringe * 0.62);

  return vec4f(color * mask, mask);
}
`;
