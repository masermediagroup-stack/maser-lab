import { render as renderShader, setup as setupShader } from "./moving-gradient-shader-source";

/** Figma `GrokBot-TV-Idle-Wallpaper` shader params (node `11:2`). */
export const DALLAS_MOVING_GRADIENT_PARAMS = {
  intensity: 5,
  morphSpeed: 0.27,
  detail: 0.4,
  zoom: 24,
  rotationSpeed: 42,
  material: 3,
  warp: 1.5,
  twist: 0,
  gradientBalance: 0,
  gradientMethod: 0,
  gradient: {
    stops: [
      {
        position: 0,
        color: { r: 0.024827223271131516, g: 0.024827223271131516, b: 0.024827223271131516, a: 1 },
      },
      {
        position: 0.5,
        color: { r: 0.30243390798568726, g: 0.30243390798568726, b: 0.30243390798568726, a: 1 },
      },
      {
        position: 1,
        color: { r: 0.9155836701393127, g: 0.9155836701393127, b: 0.9155836701393127, a: 1 },
      },
    ],
  },
} as const;

/** Looped shader clock in milliseconds for seamless export/preview. */
export function loopShaderTimeMs(elapsed: number, loopSeconds: number): number {
  const loop = Math.max(0.001, loopSeconds);
  const wrapped = ((elapsed % loop) + loop) % loop;
  return wrapped * 1000;
}

export function drawFallbackGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#060606");
  gradient.addColorStop(0.5, "#4d4d4d");
  gradient.addColorStop(1, "#e9e9e9");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

type ShaderFrame = {
  state: Record<string, unknown>;
  output: GPUTexture;
  time: number;
  params: typeof DALLAS_MOVING_GRADIENT_PARAMS;
};

export class MovingGradientBackground {
  private canvas: HTMLCanvasElement | null = null;
  private context: GPUCanvasContext | null = null;
  private device: GPUDevice | null = null;
  private format: GPUTextureFormat | null = null;
  private frame: ShaderFrame | null = null;
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

    const context = canvas.getContext("webgpu");
    if (!context) return false;

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return false;

    const device = await adapter.requestDevice();
    const format = navigator.gpu.getPreferredCanvasFormat();

    context.configure({ device, format, alphaMode: "opaque" });

    const frame: ShaderFrame = {
      state: {},
      output: context.getCurrentTexture(),
      time: 0,
      params: DALLAS_MOVING_GRADIENT_PARAMS,
    };

    setupShader(device, frame);

    this.context = context;
    this.device = device;
    this.format = format;
    this.frame = frame;
    this.ready = true;
    return true;
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

  render(timeMs: number) {
    if (!this.ready || !this.device || !this.context || !this.frame) return;
    this.frame.output = this.context.getCurrentTexture();
    this.frame.time = timeMs;
    renderShader(this.device, this.frame);
  }

  destroy() {
    this.ready = false;
    this.frame = null;
    this.context = null;
    this.device?.destroy();
    this.device = null;
    this.format = null;
    this.canvas = null;
    this.pixelWidth = 0;
    this.pixelHeight = 0;
  }
}
