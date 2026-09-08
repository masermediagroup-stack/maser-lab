struct Stage {
  time: f32,
  intensity: f32,
  speed: f32,
  reduced: f32,
}

@group(0) @binding(0) var<uniform> stage: Stage;

const BLACK = vec3f(0.0, 0.0, 0.0);
const GREY = vec3f(0.38, 0.38, 0.38);

fn bayer4(p: vec2u) -> f32 {
  let x = p.x & 3u;
  let y = p.y & 3u;
  let idx = y * 4u + x;
  var n = 0u;
  if (idx == 0u) { n = 0u; }
  else if (idx == 1u) { n = 8u; }
  else if (idx == 2u) { n = 2u; }
  else if (idx == 3u) { n = 10u; }
  else if (idx == 4u) { n = 12u; }
  else if (idx == 5u) { n = 4u; }
  else if (idx == 6u) { n = 14u; }
  else if (idx == 7u) { n = 6u; }
  else if (idx == 8u) { n = 3u; }
  else if (idx == 9u) { n = 11u; }
  else if (idx == 10u) { n = 1u; }
  else if (idx == 11u) { n = 9u; }
  else if (idx == 12u) { n = 13u; }
  else if (idx == 13u) { n = 5u; }
  else if (idx == 14u) { n = 15u; }
  else { n = 7u; }
  return f32(n) / 16.0;
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let frozen = stage.reduced > 0.5;
  let t = select(stage.time * stage.speed, 0.0, frozen);
  let travel = vec2f(t, t) * 0.028;
  let q = uv + travel;
  let freq = 9.4 * mix(0.72, 1.15, clamp(stage.intensity, 0.0, 1.0));
  let wave = 0.5 + 0.5 * sin((q.x + q.y) * freq);
  let level = 0.11 + wave * 0.16 * mix(0.35, 1.0, clamp(stage.intensity, 0.0, 1.0));
  let cell = vec2u(uv * 420.0);
  let mark = step(bayer4(cell), level);
  let col = mix(BLACK, GREY, mark);
  return vec4f(col, 1.0);
}
