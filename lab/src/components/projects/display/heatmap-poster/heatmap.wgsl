struct Uniforms {
  heat: vec3f,
  pad0: f32,
  mid: vec3f,
  pad1: f32,
  ground: vec3f,
  pad2: f32,
  grain: f32,
  frequency: f32,
  speed: f32,
  time: f32,
  contour: f32,
  innerGlow: f32,
  outerGlow: f32,
  reducedMotion: f32,
  packWidth: f32,
  packHeight: f32,
  canvasWidth: f32,
  canvasHeight: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var fieldTex: texture_2d<f32>;
@group(0) @binding(2) var fieldSamp: sampler;

fn samplePack(uv: vec2f) -> vec4f {
  return textureSampleLevel(fieldTex, fieldSamp, uv, 0.0);
}

fn contain_uv(uv: vec2f) -> vec2f {
  let canvas_aspect = max(u.canvasWidth, 1.0) / max(u.canvasHeight, 1.0);
  let pack_aspect = max(u.packWidth, 1.0) / max(u.packHeight, 1.0);
  var mapped = uv;
  if (canvas_aspect > pack_aspect) {
    let scale = pack_aspect / canvas_aspect;
    mapped.x = (uv.x - 0.5) / scale + 0.5;
  } else {
    let scale = canvas_aspect / pack_aspect;
    mapped.y = (uv.y - 0.5) / scale + 0.5;
  }
  return mapped;
}

fn heatLut(t: f32) -> vec3f {
  let x = clamp(t, 0.0, 1.0);
  if (x < 0.55) {
    return mix(u.ground, u.mid, x / 0.55);
  }
  return mix(u.mid, u.heat, (x - 0.55) / 0.45);
}

fn hash21(p: vec2f) -> f32 {
  let p3 = fract(vec3f(p.xyx) * 0.1031);
  let n = p3.x + p3.y * p3.z;
  return fract((p3.x + p3.y) * n);
}

fn heatFromPaper(packed: vec4f) -> f32 {
  let shape = packed.r;
  let outerBlur = 1.0 - mix(1.0, packed.g, shape);
  let innerBlur = mix(packed.g, 0.0, shape);
  let contourS = mix(packed.b, 0.0, shape);
  var inner = 0.8 + 0.8 * innerBlur;
  inner *= mix(0.0, 2.0, u.innerGlow);
  inner += (u.contour * 2.0) * contourS;
  inner *= (1.0 - shape);
  var outer = 0.9 * pow(max(outerBlur, 0.0), 0.8);
  outer *= mix(0.0, 5.0, u.outerGlow * u.outerGlow);
  return clamp(inner + outer, 0.0, 1.0);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let mapped = contain_uv(uv);
  if (mapped.x < 0.0 || mapped.x > 1.0 || mapped.y < 0.0 || mapped.y > 1.0) {
    return vec4f(u.ground, 1.0);
  }

  let packed = samplePack(mapped);
  var heat = heatFromPaper(packed);

  let t = select(u.time * (0.12 + u.speed * 0.55), 0.0, u.reducedMotion > 0.5);
  let freq = 0.35 + u.frequency * 1.25;
  let band = 0.5 + 0.5 * sin((uv.y - t) * 6.28318530718 * freq);
  if (heat > 0.0) {
    heat = clamp(heat * mix(0.5, 1.12, band), 0.0, 1.0);
  }

  var rgb = heatLut(heat);
  let grainTime = select(u.time, 0.0, u.reducedMotion > 0.5);
  let n = hash21(uv * vec2f(u.canvasWidth, u.canvasHeight) + vec2f(grainTime * 0.15, 0.0));
  rgb += (n - 0.5) * u.grain * 0.045;
  return vec4f(clamp(rgb, vec3f(0.0), vec3f(1.0)), 1.0);
}
