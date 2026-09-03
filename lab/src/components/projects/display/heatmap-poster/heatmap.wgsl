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
  maskMix: f32,
  reducedMotion: f32,
  packWidth: f32,
  packHeight: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> fallbackPack: array<u32>;
@group(0) @binding(2) var<storage, read> depthPack: array<u32>;

fn unpackRgba(p: u32) -> vec4f {
  let r = f32(p & 0xffu) / 255.0;
  let g = f32((p >> 8u) & 0xffu) / 255.0;
  let b = f32((p >> 16u) & 0xffu) / 255.0;
  let a = f32((p >> 24u) & 0xffu) / 255.0;
  return vec4f(r, g, b, a);
}

fn samplePack(pack: ptr<storage, array<u32>, read>, uv: vec2f) -> vec4f {
  let w = max(u32(u.packWidth), 1u);
  let h = max(u32(u.packHeight), 1u);
  let x = min(u32(clamp(uv.x, 0.0, 0.9999) * f32(w)), w - 1u);
  let y = min(u32(clamp(uv.y, 0.0, 0.9999) * f32(h)), h - 1u);
  return unpackRgba(pack[y * w + x]);
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

fn fieldFromPack(packed: vec4f, t: f32) -> f32 {
  let wave1 = 0.5 + 0.5 * sin(t);
  let wave2 = 0.5 + 0.5 * sin(t * 1.3 + 1.0);
  let wave3 = 0.5 + 0.5 * sin(t * 0.7 + 2.0);
  let contour = packed.r * u.frequency * 0.35;
  let outerGlow = packed.g * 0.55;
  let innerGlow = packed.b;
  return innerGlow * (0.55 + 0.45 * wave1)
    + outerGlow * (0.25 + 0.2 * wave2)
    + contour * (0.4 + 0.6 * wave3);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let p = vec2f(uv.x, 1.0 - uv.y);
  let t = select(u.time * u.speed, 0.0, u.reducedMotion > 0.5);
  let fallback = samplePack(&fallbackPack, uv);
  let depth = samplePack(&depthPack, uv);
  let packed = mix(fallback, depth, clamp(u.maskMix, 0.0, 1.0));
  var heat = fieldFromPack(packed, t);
  heat = clamp(heat, 0.0, 1.4);
  var rgb = heatLut(heat);
  let grainTime = select(u.time, 0.0, u.reducedMotion > 0.5);
  let n = hash21(p * vec2f(u.packWidth, u.packHeight) + vec2f(grainTime * 0.15, 0.0));
  rgb += (n - 0.5) * u.grain * 0.045;
  return vec4f(clamp(rgb, vec3f(0.0), vec3f(1.0)), 1.0);
}
