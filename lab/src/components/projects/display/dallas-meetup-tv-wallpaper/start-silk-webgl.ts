import {
  GRADIENT_FALLBACK,
  GRADIENT_FLOOR,
  GRADIENT_STAGE_H,
  GRADIENT_STAGE_W,
  type GradientPausedRef,
} from "./moving-gradient-config";
import { DEFAULT_SILK_LOOK, type SilkLookRef } from "./silk-look";

export const SILK_VERT_GLSL = `#version 300 es
const vec2 POS[3] = vec2[3](
  vec2(-1.0, -1.0),
  vec2(3.0, -1.0),
  vec2(-1.0, 3.0)
);
out vec2 vUv;
void main() {
  vec2 p = POS[gl_VertexID];
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

/**
 * Silk/fold moving gradient — GLSL port of moving-gradient.wgsl.
 * Same domain-warped greyscale field; runs when WebGPU is unavailable.
 */
export const SILK_FRAG_GLSL = `#version 300 es
precision highp float;

in vec2 vUv;
uniform float uTime;
uniform vec2 uScale;
uniform float uWarp;
uniform float uGrey;
uniform float uWhite;
uniform float uRidge;
uniform float uRotate;
uniform float uDrift;
uniform float uGrain;
out vec4 fragColor;

const float ASPECT = 1920.0 / 1080.0;
const float FLOOR = 0.039216;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
    -0.577350269189626,
    0.024390243902439
  );
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(
    0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)),
    0.0
  );
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.52;
  float freq = 1.0;
  for (int i = 0; i < 3; i++) {
    sum += amp * snoise(p * freq);
    freq *= 2.02;
    amp *= 0.52;
  }
  return sum;
}

vec2 warp(vec2 p, float t, float amount) {
  vec2 q = vec2(
    fbm(p + vec2(0.0, t * 0.18)),
    fbm(p + vec2(37.2, 11.7) - vec2(t * 0.14, 0.0))
  );
  return vec2(
    fbm(p + amount * q + vec2(1.7, 9.2) + vec2(t * 0.1, t * 0.07)),
    fbm(p + amount * q + vec2(19.4, -42.1) - vec2(0.0, t * 0.11))
  );
}

float remap(float a, float b, float c, float d, float x) {
  return mix(c, d, clamp((x - a) / (b - a), 0.0, 1.0));
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  float t = uTime - 48.0 * floor(uTime / 48.0);
  float ang = t * uRotate;
  float cs = cos(ang);
  float sn = sin(ang);
  vec2 centered = (vUv - vec2(0.5)) * vec2(ASPECT, 1.0);
  vec2 rotated = vec2(
    centered.x * cs - centered.y * sn,
    centered.x * sn + centered.y * cs
  );
  vec2 p = rotated * uScale + vec2(t * uDrift, t * -uDrift * (0.06 / 0.09));

  vec2 r = warp(p, t, uWarp);
  float field = fbm(p + uWarp * r);
  float n = clamp(remap(-0.55, 0.55, 0.0, 1.0, field), 0.0, 1.0);
  float crease = pow(smoothstep(0.08, 0.62, length(r)), 1.15);

  float g = mix(FLOOR, uGrey, n);
  g = mix(g, FLOOR * 0.5, crease * 0.88);
  float ridge = smoothstep(0.58, 0.94, n) * (1.0 - crease);
  g = mix(g, uWhite, ridge * uRidge);
  float grain = hash12(gl_FragCoord.xy + vec2(t * 61.0, t * 37.0));
  g += (grain - 0.5) * uGrain * 0.18;
  g = clamp(g, FLOOR * 0.45, 0.92);

  fragColor = vec4(vec3(g), 1.0);
}
`;

function compileShader(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Fullscreen WebGL2 silk field. Returns a disposer, or null if GL cannot compile.
 */
export function startSilkWebgl(
  canvas: HTMLCanvasElement,
  pausedRef: GradientPausedRef,
  lookRef: SilkLookRef = { current: DEFAULT_SILK_LOOK },
): (() => void) | null {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance",
  });
  if (!gl || gl.isContextLost()) return null;

  const vert = compileShader(gl, gl.VERTEX_SHADER, SILK_VERT_GLSL);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, SILK_FRAG_GLSL);
  if (!vert || !frag) {
    if (vert) gl.deleteShader(vert);
    if (frag) gl.deleteShader(frag);
    return null;
  }

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  gl.deleteShader(vert);
  gl.deleteShader(frag);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  const uTime = gl.getUniformLocation(program, "uTime");
  const uScale = gl.getUniformLocation(program, "uScale");
  const uWarp = gl.getUniformLocation(program, "uWarp");
  const uGrey = gl.getUniformLocation(program, "uGrey");
  const uWhite = gl.getUniformLocation(program, "uWhite");
  const uRidge = gl.getUniformLocation(program, "uRidge");
  const uRotate = gl.getUniformLocation(program, "uRotate");
  const uDrift = gl.getUniformLocation(program, "uDrift");
  const uGrain = gl.getUniformLocation(program, "uGrain");
  const vao = gl.createVertexArray();
  if (!vao) {
    gl.deleteProgram(program);
    return null;
  }

  canvas.width = GRADIENT_STAGE_W;
  canvas.height = GRADIENT_STAGE_H;
  canvas.style.width = `${GRADIENT_STAGE_W}px`;
  canvas.style.height = `${GRADIENT_STAGE_H}px`;
  canvas.dataset.dallasGround = "webgl2";

  gl.bindVertexArray(vao);
  gl.useProgram(program);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.BLEND);

  let raf = 0;
  let hold = 0;
  let last = performance.now();
  let alive = true;

  const tick = (now: number) => {
    if (!alive) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const look = lookRef.current;
    if (!pausedRef.current) hold += dt * look.speed;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.uniform1f(uTime, hold);
    gl.uniform2f(uScale, 0.58 * look.scale, 0.46 * look.scale);
    gl.uniform1f(uWarp, look.warp);
    gl.uniform1f(uGrey, look.grey);
    gl.uniform1f(uWhite, look.white);
    gl.uniform1f(uRidge, look.ridge);
    gl.uniform1f(uRotate, look.rotate);
    gl.uniform1f(uDrift, look.drift);
    gl.uniform1f(uGrain, look.grain);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    gl.deleteVertexArray(vao);
    gl.deleteProgram(program);
  };
}

function hash21(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash21(ix, iy);
  const b = hash21(ix + 1, iy);
  const c = hash21(ix, iy + 1);
  const d = hash21(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbmCpu(x: number, y: number): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 2; i += 1) {
    sum += amp * (valueNoise(x * freq, y * freq) * 2 - 1);
    freq *= 2.17;
    amp *= 0.5;
  }
  return sum;
}

/**
 * CPU ImageData silk — last-resort moving shader when WebGL cannot start.
 * Low-res buffer; CSS keeps the canvas at 1920×1080 (no layout stretch).
 */
export function startSilkCpu(
  canvas: HTMLCanvasElement,
  pausedRef: GradientPausedRef,
  lookRef: SilkLookRef = { current: DEFAULT_SILK_LOOK },
): () => void {
  const w = 160;
  const h = 90;
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = `${GRADIENT_STAGE_W}px`;
  canvas.style.height = `${GRADIENT_STAGE_H}px`;
  canvas.dataset.dallasGround = "cpu-shader";

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    canvas.style.background = GRADIENT_FALLBACK;
    return () => undefined;
  }

  const image = ctx.createImageData(w, h);
  const data = image.data;
  const aspect = GRADIENT_STAGE_W / GRADIENT_STAGE_H;
  const floor = GRADIENT_FLOOR;

  let raf = 0;
  let hold = 0;
  let last = performance.now();
  let alive = true;

  const tick = (now: number) => {
    if (!alive) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const look = lookRef.current;
    if (!pausedRef.current) hold += dt * look.speed;
    const t = hold - 48 * Math.floor(hold / 48);
    const ang = t * look.rotate;
    const cs = Math.cos(ang);
    const sn = Math.sin(ang);
    const warpAmt = look.warp * (4 / 2.15);

    for (let y = 0; y < h; y += 1) {
      const v = (y + 0.5) / h;
      for (let x = 0; x < w; x += 1) {
        const u = (x + 0.5) / w;
        const cx = (u - 0.5) * aspect;
        const cy = v - 0.5;
        const rx = cx * cs - cy * sn;
        const ry = cx * sn + cy * cs;
        const px = rx * 1.28 * 1.55 * look.scale + t * look.drift;
        const py = ry * 1.55 * look.scale + t * -look.drift * (0.06 / 0.09);
        const qx = fbmCpu(px, py + t * 0.32);
        const qy = fbmCpu(px + 37.2 - t * 0.26, py + 11.7);
        const r0 = fbmCpu(px + warpAmt * qx + 1.7 + t * 0.18, py + warpAmt * qy + 9.2 + t * 0.12);
        const r1 = fbmCpu(px + warpAmt * qx + 19.4, py + warpAmt * qy - 42.1 - t * 0.2);
        const field = fbmCpu(px + warpAmt * r0, py + warpAmt * r1);
        let n = (field + 0.62) / 1.24;
        n = Math.min(1, Math.max(0, n));
        const crease = Math.pow(
          Math.min(1, Math.max(0, (Math.hypot(r0, r1) - 0.12) / 0.6)),
          1.4,
        );
        let g = floor + (look.grey - floor) * n;
        g = g + (floor * 0.5 - g) * crease * 0.88;
        const ridge = Math.min(1, Math.max(0, (n - 0.58) / 0.36)) * (1 - crease);
        g = g + (look.white - g) * ridge * look.ridge;
        const grain = hash21(x + t * 61, y + t * 37) - 0.5;
        g += grain * look.grain * 0.18;
        g = Math.min(0.92, Math.max(floor * 0.45, g));
        const byte = Math.round(g * 255);
        const i = (y * w + x) * 4;
        data[i] = byte;
        data[i + 1] = byte;
        data[i + 2] = byte;
        data[i + 3] = 255;
      }
    }

    ctx.putImageData(image, 0, 0);
    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
  };
}
