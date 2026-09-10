import { remap, saturate } from "@vgpu/wgsl-std/math";
import { fbmSimplex2d } from "@vgpu/wgsl-std/noise/simplex";

struct Params {
  time: f32,
}

@group(0) @binding(0) var<uniform> params: Params;

const ASPECT = 1920.0 / 1080.0;
const FLOOR = 0.039216; /* #0a0a0a */
const GREY = 0.48;
const WHITE_HINT = 0.82;

fn fbm(p: vec2f) -> f32 {
  return fbmSimplex2d(p, 3, 2.02, 0.52);
}

fn warp(p: vec2f, t: f32) -> vec2f {
  let q = vec2f(
    fbm(p + vec2f(0.0, t * 0.18)),
    fbm(p + vec2f(37.2, 11.7) - vec2f(t * 0.14, 0.0)),
  );
  return vec2f(
    fbm(p + 2.15 * q + vec2f(1.7, 9.2) + vec2f(t * 0.1, t * 0.07)),
    fbm(p + 2.15 * q + vec2f(19.4, -42.1) - vec2f(0.0, t * 0.11)),
  );
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  /* Wrap so long TV dwell does not degrade the f32 noise lattice. */
  let t = params.time - 48.0 * floor(params.time / 48.0);
  let ang = t * 0.045;
  let cs = cos(ang);
  let sn = sin(ang);
  let centered = (uv - vec2f(0.5)) * vec2f(ASPECT, 1.0);
  let rotated = vec2f(
    centered.x * cs - centered.y * sn,
    centered.x * sn + centered.y * cs,
  );
  let p = rotated * vec2f(0.58, 0.46) + vec2f(t * 0.09, t * -0.06);

  let r = warp(p, t);
  let field = fbm(p + 2.15 * r);
  let n = saturate(remap(-0.55, 0.55, 0.0, 1.0, field));
  let crease = pow(smoothstep(0.08, 0.62, length(r)), 1.15);

  var g = mix(FLOOR, GREY, n);
  g = mix(g, FLOOR * 0.5, crease * 0.88);
  let ridge = smoothstep(0.58, 0.94, n) * (1.0 - crease);
  g = mix(g, WHITE_HINT, ridge * 0.42);
  g = clamp(g, FLOOR * 0.45, 0.92);

  return vec4f(vec3f(g), 1.0);
}
