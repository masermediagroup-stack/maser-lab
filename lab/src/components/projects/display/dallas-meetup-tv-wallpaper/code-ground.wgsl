import { hash2 } from "@vgpu/wgsl-std/hash";

/* Dallas meetup TV ground.
   Dense B/W circular neo-code modules. Not a ramp, not noise, not CSS.
   Fine lattice = packed circular glyphs. Coarse lattice = larger packets.
   Quiet vertical drift + per-cell tick/pulse. Reduced motion freezes `params.time`. */

struct Params {
  time: f32,
}

@group(0) @binding(0) var<uniform> params: Params;

const STAGE = vec2f(1920.0, 1080.0);
const FLOOR = 0.023529; /* #060606 */
const TAU = 6.283185307179586;
const AA = 0.07;

fn ring(r: f32, radius: f32, halfW: f32) -> f32 {
  return 1.0 - smoothstep(0.0, AA, abs(r - radius) - halfW);
}

fn disc(r: f32, radius: f32) -> f32 {
  return 1.0 - smoothstep(radius - AA, radius + AA, r);
}

/* Circular neo glyphs — only circles / rings / radial ticks. Thick enough to read on a TV. */
fn circleGlyph(p: vec2f, kind: f32, bits: vec2f) -> f32 {
  let r = length(p);
  let ang = atan2(p.y, p.x);
  let outer = 0.84;
  let thick = ring(r, outer, 0.12);
  let fill = disc(r, outer * mix(0.70, 0.90, bits.y));
  let core = disc(r, 0.26);
  let mid = ring(r, 0.48, 0.08);
  let spokes = 3.0 + floor(bits.x * 5.0);
  let spoke = (1.0 - smoothstep(0.0, 0.10, abs(fract(ang / TAU * spokes + bits.y) - 0.5) - 0.07))
    * step(0.22, r) * step(r, outer + 0.02);
  let nDots = 6.0 + floor(bits.y * 5.0);
  let dots = ring(r, 0.56, 0.09)
    * (1.0 - smoothstep(0.0, 0.12, abs(fract(ang / TAU * nDots) - 0.5)));

  var g = 0.0;
  if (kind < 1.0) {
    g = fill;
  } else if (kind < 2.0) {
    g = thick;
  } else if (kind < 3.0) {
    g = max(thick, mid);
  } else if (kind < 4.0) {
    g = max(thick, core);
  } else if (kind < 5.0) {
    g = max(thick, spoke);
  } else if (kind < 6.0) {
    g = max(fill * 0.55, thick);
  } else if (kind < 7.0) {
    g = max(thick, dots);
  } else {
    g = max(max(thick, mid), core);
  }
  return g;
}

fn lattice(
  px: vec2f,
  cell: f32,
  time: f32,
  salt: f32,
  density: f32,
  gutterEvery: f32,
) -> f32 {
  let col = floor(px.x / cell);
  let row = floor(px.y / cell);
  let local = (vec2f(fract(px.x / cell), fract(px.y / cell)) - vec2f(0.5)) * 2.0;

  /* Byte-column gutters — reads as code, not a polka wash. */
  if (gutterEvery > 0.5 && (col - gutterEvery * floor(col / gutterEvery)) > (gutterEvery - 1.05)) {
    return 0.0;
  }
  /* Occasional line-break rows. */
  if ((row - 11.0 * floor(row / 11.0)) > 9.6) {
    return 0.0;
  }

  let seed = vec2f(col + salt, row - salt * 0.31);
  let period = mix(1.8, 5.2, hash2(seed + vec2f(2.7, salt)).x);
  let tick = floor((time + hash2(seed + vec2f(4.1, 9.0)).y * period) / period);
  let live = hash2(seed + vec2f(tick * 0.17, -tick * 0.11));
  let gate = step(1.0 - density, live.x);
  let kind = floor(live.y * 8.0);
  let bits = hash2(seed + vec2f(11.0, tick));
  let ink = mix(0.72, 1.0, live.x);
  let pulse = 0.88 + 0.12 * sin(TAU * (time / period) + live.y * TAU);
  return circleGlyph(local, kind, bits) * gate * ink * pulse;
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let px = uv * STAGE;
  let t = params.time;

  /* Two scales of circular modules. max() keeps contrast — adding washed to a ramp. */
  let fine = lattice(px + vec2f(0.0, t * 11.0), 18.0, t, 11.0, 0.90, 8.0);
  let pack = lattice(px + vec2f(t * 2.4, -t * 5.5), 36.0, t, 41.0, 0.38, 0.0);

  /* Active-buffer columns: hashed, not a spatial ramp. */
  let colId = floor((px.x + 0.001) / 18.0);
  let colGain = mix(0.82, 1.0, step(0.38, hash2(vec2f(colId, 19.0)).x));

  let g = max(fine, pack) * colGain;
  let luma = mix(FLOOR, 0.94, clamp(g, 0.0, 1.0));
  return vec4f(vec3f(luma), 1.0);
}
