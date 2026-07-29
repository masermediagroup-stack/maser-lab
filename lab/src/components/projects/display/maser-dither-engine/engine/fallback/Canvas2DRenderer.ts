import { sampleBayer } from "../dither/bayer";
import { BLUE_NOISE_SIZE, generateBlueNoiseTexture, sampleBlueNoise } from "../dither/blueNoise";
import { grainHash } from "../noise/grain";
import type { AnimationUniformPayload } from "../animation/types";
import type { InteractionUniformPayload } from "../interaction/types";
import type { MonochromeUniformState } from "../../types";

/**
 * Software Bayer path when WebGL2 is unavailable.
 * Lower resolution for performance; same pipeline stages conceptually.
 */
export class Canvas2DRenderer {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private blueNoise: Uint8Array;
  private disposed = false;
  private lastSeed = 0.37;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("Canvas2D unavailable");
    this.ctx = ctx;
    this.blueNoise = generateBlueNoiseTexture(BLUE_NOISE_SIZE, 0.37);
  }

  resize(cssWidth: number, cssHeight: number, dpr: number): void {
    if (this.disposed) return;
    // Cap software path resolution for perf
    const scale = Math.min(dpr, 1.25);
    const w = Math.max(1, Math.floor(cssWidth * scale));
    const h = Math.max(1, Math.floor(cssHeight * scale));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  draw(
    state: MonochromeUniformState,
    anim?: AnimationUniformPayload,
    ix?: InteractionUniformPayload,
  ): void {
    if (this.disposed) return;
    if (Math.abs(state.randomSeed - this.lastSeed) > 0.001) {
      this.lastSeed = state.randomSeed;
      this.blueNoise = generateBlueNoiseTexture(BLUE_NOISE_SIZE, state.randomSeed);
    }

    const { width, height } = this.canvas;
    const img = this.ctx.createImageData(width, height);
    const data = img.data;
    const angle = (state.gradientAngle * Math.PI) / 180;
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);
    const t = anim?.time ?? state.time;
    const amp = anim ? 0.12 : 0.08;
    // UV-space pointer (y=0 bottom) — match WebGL
    const ptrX = ix?.pointerX ?? state.pointerX;
    const ptrY = ix?.pointerY ?? state.pointerY;
    const influence = ix?.influence ?? state.cursorInfluence;

    const lightX = state.lightX + (ptrX - state.lightX) * influence * 0.85;
    const lightY =
      state.lightY +
      (ptrY - state.lightY) * influence * 0.85 +
      state.scrollY * state.scrollInfluence * 0.05;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const uvx = x / width;
        const uvy = 1 - y / height;

        let g = (uvx - 0.5) * dirX + (uvy - 0.5) * dirY;
        g = g * 0.5 + 0.5;
        let lum =
          state.gradientColorA +
          (state.gradientColorB - state.gradientColorA) * Math.min(1, Math.max(0, g));

        lum +=
          Math.sin(uvx * 6.2 + t * 0.9) * amp * 0.55 +
          Math.sin(uvy * 4.1 - t * 0.65) * amp * 0.35;

        const dx = uvx - lightX;
        const dy = uvy - lightY;
        const dist = Math.hypot(dx, dy);
        const radial = 1 - Math.min(1, dist / (0.85 + state.depth * 0.5));
        lum = lum + radial * 0.25 * state.softEdge;
        if (ix) {
          lum += (ix.stateBrightness + ix.releasePulse * 0.15) * influence;
        }

        lum = (lum - 0.5) * state.contrast + 0.5 + state.brightness;
        lum = Math.min(1, Math.max(0, lum));

        const r = Math.max(state.bloomRadius, 0.02);
        const bloom = Math.exp(-(dist * dist) / (r * r * 2)) * state.bloom;
        lum = Math.min(1, lum + bloom * 0.55);

        if (state.posterization >= 0.5) {
          const levels = Math.max(state.posterization, 2);
          lum = Math.floor(lum * levels) / levels;
        }

        const px = x * state.pixelDensity;
        const py = y * state.pixelDensity;
        let thr = sampleBayer(state.ditherSize, px, py);
        const bn = sampleBlueNoise(
          this.blueNoise,
          BLUE_NOISE_SIZE,
          px * state.noiseScale + state.time * state.noiseSpeed * 8,
          py * state.noiseScale,
        );
        thr = thr + (bn - thr) * state.blueNoiseAmount;
        let ink = lum > thr ? 1 : 0;
        ink = lum * 0.18 + ink * 0.82;

        const grain = grainHash(px, py, state.time * state.noiseSpeed, state.randomSeed);
        ink = Math.min(1, Math.max(0, ink + (grain - 0.5) * state.grainAmount));

        const i = (y * width + x) * 4;
        const c = Math.round(ink * 255);
        data[i] = c;
        data[i + 1] = c;
        data[i + 2] = c;
        data[i + 3] = Math.round(state.opacity * 255);
      }
    }

    this.ctx.putImageData(img, 0, 0);
  }

  dispose(): void {
    this.disposed = true;
  }
}
