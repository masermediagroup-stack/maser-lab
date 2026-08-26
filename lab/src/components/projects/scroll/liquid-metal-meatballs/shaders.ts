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
 * Color AFTER merge: Paper MeshGradient Shepard/IDW in object UV
 * (mesh-gradient.ts) — shared wash, independent of ball identity.
 * Contour sheen from the combined field, never per-ball N = p - c_i.
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

vec3 idwWash(vec2 uv) {
  vec3 stops[PAL_COUNT];
  /* Mercury, not mid-blue plastic: every stop carries spec so the
     puddle reads on white. No stop is a per-ball facing pole. */
  stops[0] = mix(uSpec, uAlbedo, 0.18);
  stops[1] = mix(uAlbedo, uSpec, 0.58);
  stops[2] = mix(uAlbedo, uSpec, 0.34);
  stops[3] = mix(uAlbedo, uCrease, 0.38);
  stops[4] = mix(uAlbedo, uSpec, 0.22);

  vec3 color = vec3(0.0);
  float totalWeight = 0.0;
  for (int i = 0; i < PAL_COUNT; i++) {
    float dist = length(uv - PAL_POS[i]);
    dist = pow(max(dist, 1e-4), 3.5);
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

  float aa = max(fwidth(d), 0.75);
  float mask = smoothstep(aa, -aa, d);
  if (mask < 0.004) {
    fragColor = vec4(0.0);
    return;
  }

  float fieldDepth = max(-d, 0.0);

  /* Ride the merged surface without per-ball radial poles. */
  vec2 gd = vec2(dFdx(d), dFdy(d));
  vec2 uv = vUv + gd / max(uResolution.x, 1.0) * 14.0;

  vec3 color = idwWash(uv);
  color = mix(color, uCrease, clamp(crease * 0.16, 0.0, 1.0));
  /* Combined-SDF interior (not N.z): slightly richer core, bright edge. */
  float interior = 1.0 - exp(-fieldDepth * 0.04);
  color = mix(color, mix(uAlbedo, uCrease, 0.32), interior * 0.2);

  /* Contour rim from the combined field — not facing spec, not ndotH. */
  float rim = mask * (1.0 - smoothstep(0.0, 11.0 * aa, fieldDepth));
  color = mix(color, uSpec, rim * 0.58);

  color += (1.0 / 256.0) * (
    fract(sin(dot(0.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - 0.5
  );

  fragColor = vec4(color * mask, mask);
}
`;
