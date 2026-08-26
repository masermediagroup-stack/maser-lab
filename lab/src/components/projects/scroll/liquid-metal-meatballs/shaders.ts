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
 * Isolated disc = continuous wet mercury wash — spec mixed into every
 * IDW stop equally (no UV spec cone). No radial fieldDepth, no
 * length(p - c) sheen, no N = p - c_i. Deep crease from smin. Grazing
 * spec from dFdx/dFdy of the *combined* field, crease-gated and killed
 * where the gradient collapses (SDF origin cannot pin).
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

/* Grazing key on the combined 2D field — not a per-ball lamp. */
const vec2 LIGHT_DIR = vec2(-0.62, 0.784);

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
  float wet = 0.28;
  vec3 stops[PAL_COUNT];
  stops[0] = mix(uAlbedo, uSpec, wet);
  stops[1] = mix(mix(uAlbedo, uCrease, 0.34), uSpec, wet);
  stops[2] = mix(mix(uAlbedo, uCrease, 0.52), uSpec, wet);
  stops[3] = mix(mix(uAlbedo, uCrease, 0.70), uSpec, wet);
  stops[4] = mix(mix(uAlbedo, uCrease, 0.16), uSpec, wet);

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

  vec3 color = metalWash(vUv);
  /* Deep valley on the smin blend. Peak crease is the neck floor. */
  color = mix(color, uCrease, clamp(pow(clamp(crease, 0.0, 1.0), 0.65) * 0.84, 0.0, 1.0));

  /* Combined-field sheen only. Un-normalized crease slope lights the
     WALLS of the neck (grazing), not the valley floor and not a solo
     disc. Hard spec uses one dFdx/dFdy of d, crease-gated. Kill
     |grad| collapse so the SDF origin cannot pin. Never length(p-c). */
  vec2 gd = vec2(dFdx(d), dFdy(d));
  float gLen = length(gd);
  float alive = smoothstep(0.08, 0.42, gLen / max(fwidth(d), 1e-6));
  float wall = alive * smoothstep(0.006, 0.022, length(vec2(dFdx(crease), dFdy(crease))));
  vec2 n2 = gd / max(gLen, 1e-8);
  float ndl = max(dot(n2, LIGHT_DIR), 0.0);
  float spec = pow(ndl, 8.0) * pow(clamp(crease, 0.0, 1.0), 1.35) * alive;
  color = mix(color, mix(uAlbedo, uSpec, 0.88), wall * 0.72);
  color = mix(color, uSpec, spec * 0.95);

  color += (1.0 / 256.0) * (
    fract(sin(dot(0.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - 0.5
  );

  fragColor = vec4(color * mask, mask);
}
`;
