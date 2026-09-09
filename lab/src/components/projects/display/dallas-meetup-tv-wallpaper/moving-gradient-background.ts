/**
 * Fullscreen-triangle moving gradient (WebGPU) + animated Canvas2D fallback.
 * Figma `11:2` color stops and motion amounts; not the Figma cube-sphere mesh.
 */

export const DALLAS_MOVING_GRADIENT_PARAMS = {
  intensity: 5,
  morphSpeed: 0.27,
  detail: 0.4,
  warp: 1.5,
  stops: [
    { r: 0.024827223271131516, g: 0.024827223271131516, b: 0.024827223271131516 },
    { r: 0.30243390798568726, g: 0.30243390798568726, b: 0.30243390798568726 },
    { r: 0.9155836701393127, g: 0.9155836701393127, b: 0.9155836701393127 },
  ],
} as const;

const WGSL = /* wgsl */ `
struct Uniforms {
  time: f32,
  loopSeconds: f32,
  aspect: f32,
  warp: f32,
  intensity: f32,
  morphSpeed: f32,
  detail: f32,
  width: f32,
  height: f32,
  _pad0: f32,
  _pad1: f32,
  _pad2: f32,
  c0: vec4f,
  c1: vec4f,
  c2: vec4f,
}

@group(0) @binding(0) var<uniform> u: Uniforms;

struct VsOut {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
}

@vertex
fn vs_main(@builtin(vertex_index) vid: u32) -> VsOut {
  var pos = array<vec2f, 3>(
    vec2f(-1.0, -1.0),
    vec2f(3.0, -1.0),
    vec2f(-1.0, 3.0),
  );
  var out: VsOut;
  out.position = vec4f(pos[vid], 0.0, 1.0);
  out.uv = pos[vid] * 0.5 + vec2f(0.5);
  return out;
}

fn hash21(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
}

fn noise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let s = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2f(1.0, 0.0)), s.x),
    mix(hash21(i + vec2f(0.0, 1.0)), hash21(i + vec2f(1.0, 1.0)), s.x),
    s.y
  );
}

fn fbm(p: vec2f) -> f32 {
  var q = p;
  var a = 0.5;
  var t = 0.0;
  for (var i = 0; i < 5; i = i + 1) {
    t = t + a * noise(q);
    q = q * 2.03 + vec2f(17.2, 9.1);
    a = a * 0.5;
  }
  return t;
}

@fragment
fn fs_main(input: VsOut) -> @location(0) vec4f {
  let loop = max(u.loopSeconds, 0.001);
  let phase = u.time / loop;
  let tau = 6.28318530718;
  let ang = phase * tau;
  let orbit = vec2f(cos(ang), sin(ang));
  let orbit2 = vec2f(cos(ang * 2.0 + 1.7), sin(ang + 2.4));

  var p = (input.uv - vec2f(0.5)) * vec2f(u.aspect, 1.0);
  p = p * (1.35 + u.detail);
  p = p + orbit * u.warp * 0.28;
  let warped = p + vec2f(
    fbm(p + orbit * u.morphSpeed * 2.4),
    fbm(p + vec2f(3.1, 1.7) - orbit2 * u.morphSpeed * 2.4)
  ) * (0.22 + u.intensity * 0.05);

  let n = fbm(warped * 1.35);
  let m = fbm(warped * 2.15 + orbit2 * 0.35);
  let g = clamp(n * 0.62 + m * 0.38, 0.0, 1.0);

  var col = mix(u.c0.rgb, u.c1.rgb, smoothstep(0.12, 0.52, g));
  col = mix(col, u.c2.rgb, smoothstep(0.48, 0.94, g));
  let sheen = pow(max(g, 0.0), 3.4) * 0.18;
  col = col + vec3f(sheen);
  return vec4f(col, 1.0);
}
`;

const UNIFORM_FLOATS = 24;

/** Looped shader clock in milliseconds for seamless export/preview. */
export function loopShaderTimeMs(elapsed: number, loopSeconds: number): number {
  const loop = Math.max(0.001, loopSeconds);
  const wrapped = ((elapsed % loop) + loop) % loop;
  return wrapped * 1000;
}

/** Animated Canvas2D fallback — orbiting metallic gray washes, seamless on loop. */
export function drawFallbackGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeMs = 0,
  loopSeconds = 120,
) {
  const loop = Math.max(0.001, loopSeconds);
  const t = ((timeMs * 0.001) % loop + loop) % loop;
  const ang = (t / loop) * Math.PI * 2;
  const cx = width * (0.42 + 0.22 * Math.cos(ang));
  const cy = height * (0.48 + 0.2 * Math.sin(ang));
  const cx2 = width * (0.62 + 0.24 * Math.cos(ang + 2.1));
  const cy2 = height * (0.55 + 0.18 * Math.sin(ang + 1.3));
  const radius = Math.max(width, height);

  const base = ctx.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, "#060606");
  base.addColorStop(0.5, "#4d4d4d");
  base.addColorStop(1, "#cfcfcf");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  const wash = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.72);
  wash.addColorStop(0, "rgba(233,233,233,0.42)");
  wash.addColorStop(0.45, "rgba(77,77,77,0.28)");
  wash.addColorStop(1, "rgba(6,6,6,0)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, width, height);

  const wash2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, radius * 0.55);
  wash2.addColorStop(0, "rgba(180,180,180,0.22)");
  wash2.addColorStop(1, "rgba(6,6,6,0)");
  ctx.fillStyle = wash2;
  ctx.fillRect(0, 0, width, height);
}

export class MovingGradientBackground {
  private canvas: HTMLCanvasElement | null = null;
  private context: GPUCanvasContext | null = null;
  private device: GPUDevice | null = null;
  private pipeline: GPURenderPipeline | null = null;
  private uniformBuffer: GPUBuffer | null = null;
  private bindGroup: GPUBindGroup | null = null;
  private uniformData = new Float32Array(UNIFORM_FLOATS);
  private ready = false;
  private pixelWidth = 0;
  private pixelHeight = 0;

  get isReady(): boolean {
    return this.ready;
  }

  async init(canvas: HTMLCanvasElement): Promise<boolean> {
    this.destroy();
    this.canvas = canvas;

    if (typeof navigator === "undefined" || !navigator.gpu) {
      return false;
    }

    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) return false;

      const device = await adapter.requestDevice();
      const format = navigator.gpu.getPreferredCanvasFormat();
      const context = canvas.getContext("webgpu");
      if (!context) {
        device.destroy();
        return false;
      }

      context.configure({
        device,
        format,
        alphaMode: "opaque",
      });

      const shaderModule = device.createShaderModule({ code: WGSL });
      const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: { module: shaderModule, entryPoint: "vs_main" },
        fragment: {
          module: shaderModule,
          entryPoint: "fs_main",
          targets: [{ format }],
        },
        primitive: { topology: "triangle-list" },
      });

      const uniformBuffer = device.createBuffer({
        size: UNIFORM_FLOATS * 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
      });

      this.context = context;
      this.device = device;
      this.pipeline = pipeline;
      this.uniformBuffer = uniformBuffer;
      this.bindGroup = bindGroup;
      this.ready = true;
      return true;
    } catch {
      this.destroy();
      return false;
    }
  }

  resize(cssWidth: number, cssHeight: number, dpr: number) {
    if (!this.canvas) return;
    const clampedDpr = Math.min(2, Math.max(1, dpr));
    const width = Math.max(1, Math.round(cssWidth * clampedDpr));
    const height = Math.max(1, Math.round(cssHeight * clampedDpr));
    if (width === this.pixelWidth && height === this.pixelHeight) return;
    this.canvas.width = width;
    this.canvas.height = height;
    this.pixelWidth = width;
    this.pixelHeight = height;
  }

  render(timeMs: number, loopSeconds: number) {
    if (
      !this.ready ||
      !this.device ||
      !this.context ||
      !this.pipeline ||
      !this.uniformBuffer ||
      !this.bindGroup
    ) {
      return;
    }

    const texture = this.context.getCurrentTexture();
    const width = texture.width;
    const height = Math.max(1, texture.height);
    const params = DALLAS_MOVING_GRADIENT_PARAMS;
    const data = this.uniformData;

    data[0] = timeMs * 0.001;
    data[1] = Math.max(0.001, loopSeconds);
    data[2] = width / height;
    data[3] = params.warp;
    data[4] = params.intensity;
    data[5] = params.morphSpeed;
    data[6] = params.detail;
    data[7] = width;
    data[8] = height;
    data[12] = params.stops[0].r;
    data[13] = params.stops[0].g;
    data[14] = params.stops[0].b;
    data[15] = 1;
    data[16] = params.stops[1].r;
    data[17] = params.stops[1].g;
    data[18] = params.stops[1].b;
    data[19] = 1;
    data[20] = params.stops[2].r;
    data[21] = params.stops[2].g;
    data[22] = params.stops[2].b;
    data[23] = 1;

    this.device.queue.writeBuffer(this.uniformBuffer, 0, data);

    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: texture.createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0.024, g: 0.024, b: 0.024, a: 1 },
        },
      ],
    });
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    pass.draw(3);
    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }

  destroy() {
    this.ready = false;
    this.pipeline = null;
    this.bindGroup = null;
    this.uniformBuffer = null;
    this.context = null;
    this.device?.destroy();
    this.device = null;
    this.canvas = null;
    this.pixelWidth = 0;
    this.pixelHeight = 0;
  }
}
