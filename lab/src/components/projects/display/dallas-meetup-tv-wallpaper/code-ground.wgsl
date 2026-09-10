import { hash2 } from "@vgpu/wgsl-std/hash";

struct Params {
  time: f32,
}

@group(0) @binding(0) var<uniform> params: Params;

const STAGE = vec2f(1920.0, 1080.0);
const FLOOR = 0.023529; /* #060606 */
const PEAK = 0.52;

fn circleGlyph(local: vec2f, radius: f32) -> f32 {
  let d = length(local);
  let fill = 1.0 - smoothstep(radius - 0.045, radius, d);
  let ring = 1.0 - smoothstep(0.0, 0.055, abs(d - radius * 0.7));
  return max(fill * 0.7, ring * 0.95);
}

fn layer(
  px: vec2f,
  cell: f32,
  time: f32,
  salt: f32,
  density: f32,
) -> f32 {
  let shifted = px + vec2f(0.0, time);
  let col = floor(shifted.x / cell);
  let row = floor(shifted.y / cell);
  let local = vec2f(
    fract(shifted.x / cell) - 0.5,
    fract(shifted.y / cell) - 0.5,
  );

  /* Byte-column gutters — reads as code, not a dot wash. */
  let byteSlot = col - 8.0 * floor(col / 8.0);
  if (byteSlot > 6.5) {
    return 0.0;
  }

  let live = hash2(vec2f(col + salt, row - salt * 0.37));
  let line = hash2(vec2f(floor(row / 4.0), salt + 9.0)).x;
  let gate = step(1.0 - density * (0.55 + 0.45 * line), live.x);
  let radius = mix(0.16, 0.36, live.y);
  return circleGlyph(local, radius) * gate * mix(0.28, 1.0, live.x);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let px = uv * STAGE;
  let t = params.time;

  /* Quiet column drift — each lattice has its own slow rate. */
  let deep = layer(px, 6.25, t * 9.0, 11.0, 0.72);
  let mid = layer(px, 10.5, t * 14.5, 23.0, 0.58);
  let near = layer(px, 17.0, t * 6.0, 41.0, 0.34);

  var g = FLOOR + deep * 0.32 + mid * 0.48 + near * 0.22;

  /* Keep the lockup zone quieter so marks stay on top visually. */
  let centered = (uv - vec2f(0.5, 0.5)) * vec2f(1.0, STAGE.x / STAGE.y);
  let quiet = mix(0.38, 1.0, smoothstep(0.1, 0.52, length(centered)));
  g *= quiet;
  g = clamp(g, FLOOR, PEAK);

  return vec4f(vec3f(g), 1.0);
}
