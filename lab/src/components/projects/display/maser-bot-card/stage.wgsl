struct Stage {
  time: f32,
  pointer_x: f32,
  pointer_y: f32,
  tracking: f32,
  intensity: f32,
  reduced: f32,
  pad0: f32,
  pad1: f32,
  ground_r: f32,
  ground_g: f32,
  ground_b: f32,
  pad2: f32,
}

@group(0) @binding(0) var<uniform> stage: Stage;

const GREY = vec3f(0.42, 0.42, 0.42);

fn hash21(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
}

fn noise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  let a = hash21(i);
  let b = hash21(i + vec2f(1.0, 0.0));
  let c = hash21(i + vec2f(0.0, 1.0));
  let d = hash21(i + vec2f(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

fn fbm(p: vec2f) -> f32 {
  var v = 0.0;
  var a = 0.5;
  var q = p;
  for (var i = 0; i < 4; i++) {
    v += a * noise(q);
    q *= 2.03;
    a *= 0.5;
  }
  return v;
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let frozen = stage.reduced > 0.5;
  let t = select(stage.time, 0.0, frozen);
  let tl_dist = length(uv);
  let grad = exp(-tl_dist * 2.6) * 0.18 * mix(0.55, 1.0, clamp(stage.intensity, 0.0, 1.0));

  var cloud = 0.0;
  if (stage.tracking > 0.5 && !frozen) {
    let p = uv - vec2f(stage.pointer_x, stage.pointer_y);
    let n = fbm(p * 6.5 + vec2f(t * 0.11, t * 0.08));
    let fall = smoothstep(0.18, 0.0, length(p));
    cloud = fall * (0.16 + 0.22 * n) * clamp(stage.intensity, 0.0, 1.0);
  }

  let ground = vec3f(stage.ground_r, stage.ground_g, stage.ground_b);
  let col = ground + GREY * (grad + cloud);
  return vec4f(col, 1.0);
}
