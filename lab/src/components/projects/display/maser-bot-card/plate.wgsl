struct Plate {
  pointer_x: f32,
  pointer_y: f32,
  yaw: f32,
  pitch: f32,
  shine: f32,
  band: f32,
  face: f32,
  reduced: f32,
}

@group(0) @binding(0) var<uniform> plate: Plate;

const GRAY = vec3f(0.141176, 0.141176, 0.160784);
const WHITE = vec3f(1.0, 1.0, 1.0);
const MASER = vec3f(0.062745, 0.643137, 1.0);

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  var px = plate.pointer_x;
  var py = plate.pointer_y;
  if (plate.reduced > 0.5) {
    px = 0.5;
    py = 0.42;
  }

  let shine = select(0.0, plate.shine, plate.reduced < 0.5);
  let to_light = uv - vec2f(px, py);
  let wash = exp(-dot(to_light, to_light) * 4.2) * shine;
  let rim_vec = uv - vec2f(1.0 - px, 1.0 - py);
  let rim = exp(-dot(rim_vec, rim_vec) * 5.4) * shine * 0.5;

  var col = GRAY;
  col += WHITE * wash * 0.24;
  col += WHITE * rim * 0.18;

  let n = uv - vec2f(0.5);
  let band_axis = n.x * 0.82 + n.y * 0.5 + plate.yaw * 0.04 - plate.pitch * 0.03;
  let stripe = smoothstep(0.09, 0.0, abs(band_axis)) * plate.band * shine;
  col += WHITE * stripe * 0.16;

  if (plate.face > 0.5) {
    let mark_c = vec2f(0.5, 0.36);
    let d = length((uv - mark_c) * vec2f(1.0, 1.333333));
    let disc = smoothstep(0.2, 0.168, d);
    col = mix(col, MASER, disc);
  }

  return vec4f(clamp(col, vec3f(0.0), vec3f(1.0)), 1.0);
}
