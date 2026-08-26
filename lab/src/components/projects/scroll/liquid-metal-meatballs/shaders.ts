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
 * 2D mercury field: circle SDFs merged with IQ quadratic smin.
 * Fake sphere normals from the 2D gradient. One key light.
 */
export const FRAG_SRC = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

const int MAX_CHARGES = ${MAX_CHARGES};

uniform vec4 uBalls[MAX_CHARGES];
uniform vec2 uResolution;
uniform float uMergeK;
uniform vec3 uAlbedo;
uniform vec3 uCrease;
uniform vec3 uSpec;
uniform vec3 uLightDir;

// IQ quadratic polynomial smin + mix factor (neck then swallow).
// https://iquilezles.org/articles/smin/
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

void main() {
  vec2 p = vUv * uResolution;
  float crease = 0.0;
  float d = field(p, crease);

  float aa = max(fwidth(d), 0.75);
  float alpha = 1.0 - smoothstep(0.0, aa, d);
  if (alpha < 0.004) {
    fragColor = vec4(0.0);
    return;
  }

  float unused = 0.0;
  float e = 1.35;
  vec2 g = vec2(
    field(p + vec2(e, 0.0), unused) - field(p - vec2(e, 0.0), unused),
    field(p + vec2(0.0, e), unused) - field(p - vec2(0.0, e), unused)
  ) / (2.0 * e);
  float z = sqrt(max(0.001, 1.0 - dot(g, g)));
  vec3 N = normalize(vec3(g, z));

  vec3 L = normalize(uLightDir);
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 H = normalize(L + V);
  float ndl = max(dot(N, L), 0.0);
  /* Half-Lambert wrap: holds mercury on white without a facing-center boost. */
  float wrap = ndl * 0.52 + 0.48;
  float spec = pow(max(dot(N, H), 0.0), 64.0);
  float fres = pow(clamp(1.0 - max(N.z, 0.0), 0.0, 1.0), 2.4);

  vec3 albedo = mix(uAlbedo, uCrease, clamp(crease * 1.05, 0.0, 1.0));

  /* No N.z belly lift. Spec is grazing-only so the center stays skin. */
  vec3 color = albedo * wrap;
  color += uSpec * spec * fres * 0.9;
  /* Faint rim so the silhouette holds on black — same metal, not a second key. */
  color += mix(uAlbedo, uSpec, 0.42) * fres * 0.32;

  fragColor = vec4(color * alpha, alpha);
}
`;
