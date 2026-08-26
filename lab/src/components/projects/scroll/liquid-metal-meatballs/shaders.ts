import { MAX_CHARGES } from "./constants";

/**
 * Fullscreen triangle via gl_VertexID (same contract as the dither engine VERT).
 * No attribute buffer.
 */
export const VERT_SRC = `#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](
  vec2(-1.0, -1.0),
  vec2( 3.0, -1.0),
  vec2(-1.0,  3.0)
);
out vec2 vUv;
void main() {
  vec2 p = POS[gl_VertexID];
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

/**
 * Geometry: IQ quadratic smin on circle SDFs (unchanged).
 * Color: shared UV/IDW Maser-blue wash (Paper mesh-gradient Shepard).
 * Isolated disc = wet mercury: IDW spec wash + combined-field isocontour
 * limb graze (crescent on the silhouette). No radial fieldDepth, no
 * length(p - c) sheen, no N = p - c_i, no per-ball lamp, no center pin.
 * Merge: deep crease from smin + fwidth-aware neck-wall spec (no posterize).
 * Combined-field n2 is direction only; sheen is limb-gated and killed
 * where |grad| collapses so the SDF origin cannot sparkle.
 */
export const FRAG_SRC = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

const int MAX_CHARGES = ${MAX_CHARGES};
const int PAL_COUNT = 5;

uniform vec4 uBalls[MAX_CHARGES];
uniform vec2 uResolution;
uniform float uMergeK;
uniform vec3 uAlbedo;
uniform vec3 uCrease;
uniform vec3 uSpec;

const vec2 PAL_POS[PAL_COUNT] = vec2[PAL_COUNT](
  vec2(0.16, 0.20),
  vec2(0.82, 0.16),
  vec2(0.48, 0.58),
  vec2(0.18, 0.84),
  vec2(0.86, 0.78)
);

vec2 sminQuadratic(float a, float b, float k) {
  float h = 1.0 - min(abs(a - b) / (4.0 * k), 1.0);
  float w = h * h;
  float m = w * 0.5;
  float s = w * k;
  return (a < b) ? vec2(a - s, m) : vec2(b - s, 1.0 - m);
}

float field(vec2 p, out float crease) {
  float d = 1e6;
  crease = 0.0;
  for (int i = 0; i < MAX_CHARGES; i++) {
    vec4 ball = uBalls[i];
    if (ball.w < 0.5) continue;
    float di = length(p - ball.xy) - ball.z;
    vec2 sm = sminQuadratic(d, di, uMergeK);
    crease = max(crease, 4.0 * sm.y * (1.0 - sm.y));
    d = sm.x;
  }
  return d;
}

/* Shared wet mercury. Equal spec lift on every stop so a solo disc is a
   continuous wash — never a UV spec cone, never a facing hotspot. */
vec3 metalWash(vec2 uv) {
  float wet = 0.62;
  vec3 stops[PAL_COUNT];
  stops[0] = mix(uAlbedo, uSpec, wet);
  stops[1] = mix(mix(uAlbedo, uCrease, 0.12), uSpec, wet);
  stops[2] = mix(mix(uAlbedo, uCrease, 0.20), uSpec, wet);
  stops[3] = mix(mix(uAlbedo, uCrease, 0.28), uSpec, wet);
  stops[4] = mix(mix(uAlbedo, uCrease, 0.08), uSpec, wet);

  vec3 color = vec3(0.0);
  float totalWeight = 0.0;
  for (int i = 0; i < PAL_COUNT; i++) {
    float dist = length(uv - PAL_POS[i]);
    dist = pow(max(dist, 1e-4), 2.0);
    float w = 1.0 / (dist + 1e-3);
    color += stops[i] * w;
    totalWeight += w;
  }
  return color / max(totalWeight, 1e-4);
}

void main() {
  vec2 p = vUv * uResolution;
  float crease = 0.0;
  float d = field(p, crease);

  /* Derivatives must run for the whole 2x2 quad — before any discard.
     After an early-out, dFdx at the silhouette is undefined and solos
     lose their rim graze (merge necks stay inside the mask, so they lit). */
  vec2 fd = vec2(dFdx(d), dFdy(d));
  float dPx = max(fwidth(d), 1e-4);
  float cSlope = length(vec2(dFdx(crease), dFdy(crease)));
  float cPx = max(fwidth(crease), 1e-4);

  float aa = max(dPx, 0.75);
  float mask = smoothstep(aa, -aa, d);
  if (mask < 0.004) {
    fragColor = vec4(0.0);
    return;
  }

  vec3 color = metalWash(vUv);
  /* Deep valley on the smin blend. Peak crease is the neck floor. */
  color = mix(color, uCrease, clamp(pow(clamp(crease, 0.0, 1.0), 0.65) * 0.84, 0.0, 1.0));

  /* Combined-field isocontour only (merged d). High at the silhouette,
     zero inside RADIUS_MIN so a solo core cannot pin. No length(p-c). */
  float rim = smoothstep(-10.0, -1.5, d);
  float limb = smoothstep(-12.0, -1.8, d);

  float gLen = length(fd);
  float alive = smoothstep(0.16, 0.58, gLen / dPx);

  vec2 n2 = vec2(0.0);
  if (gLen > 1e-5) n2 = fd / gLen;
  vec2 L = normalize(vec2(-0.42, 0.78));
  float ndl = max(dot(n2, L), 0.0);

  /* Isotropic wet rim — field isocontour only, no n2. Then a tight crescent. */
  color = mix(color, mix(uAlbedo, uSpec, 0.70), rim * 0.42);
  float graze = pow(ndl, 4.2) * limb * alive;
  float specK = pow(ndl, 9.0) * pow(limb, 1.15) * alive;
  color = mix(color, mix(uAlbedo, uSpec, 0.86), graze * 0.78);
  color = mix(color, uSpec, specK * 0.70);

  /* Neck-wall spec from crease slope. Wide fwidth falloff, no pow-posterize. */
  float c = clamp(crease, 0.0, 1.0);
  float wall = smoothstep(cPx * 0.12, cPx * 8.0, cSlope);
  wall *= smoothstep(0.16, 0.48, c);
  color = mix(color, mix(uAlbedo, uSpec, 0.90), wall * 0.40);
  color = mix(color, uSpec, wall * wall * 0.18);

  float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  color += (ign - 0.5) * (3.4 / 255.0);

  fragColor = vec4(color * mask, mask);
}
`;
