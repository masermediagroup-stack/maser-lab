import { sampleBayer } from "../dither/bayer";
import { BLUE_NOISE_SIZE, generateBlueNoiseTexture, sampleBlueNoise } from "../dither/blueNoise";
import { grainHash } from "../noise/grain";
import type { AnimationUniformPayload } from "../animation/types";
import type { InteractionUniformPayload } from "../interaction/types";
import type { ColorUniformPayload } from "../color/types";
import { idleColorPayload } from "../color/types";
import type { LightUniformPayload } from "../lighting/types";
import { idleLightPayload } from "../lighting/types";
import type { MonochromeUniformState } from "../../types";

function applyFalloffCurve(t: number, curve: number, falloff: number): number {
  const x = Math.min(1, Math.max(0, t));
  let f: number;
  if (curve < 0.5) f = x;
  else if (curve < 1.5) f = x * x * (3 - 2 * x);
  else if (curve < 2.5) f = Math.pow(x, 1.2 + falloff * 1.6);
  else {
    const g = x * 2.4;
    f = 1 - Math.exp(-g * g);
  }
  return Math.pow(Math.min(1, Math.max(0, f)), 0.65 + falloff * 1.55);
}

/**
 * Approximate lightShapeField for the Canvas2D fallback path.
 * Gradient supplies color only; this owns luminance.
 */
function lightShapeIllum(
  uvx: number,
  uvy: number,
  light: LightUniformPayload,
  ptrX: number,
  ptrY: number,
  influence: number,
  scrollY: number,
  scrollInfluence: number,
): number {
  const follow = Math.min(0.85, light.pointerFollow * influence);
  const cx = light.centerX + (ptrX - light.centerX) * follow;
  const cy =
    light.centerY +
    (ptrY - light.centerY) * follow +
    scrollY * scrollInfluence * 0.03;

  let px = uvx - cx;
  let py = uvy - cy;
  const rot = (light.rotation * Math.PI) / 180;
  const cs = Math.cos(rot);
  const sn = Math.sin(rot);
  const rx = px * cs + py * sn;
  const ry = -px * sn + py * cs;
  px = rx / Math.max(light.stretchX, 0.08);
  py = ry / Math.max(light.stretchY, 0.08);

  let d: number;
  if (light.shape < 1.5) {
    // radial + ellipse (stretch already applied)
    d = Math.hypot(px, py);
  } else if (light.shape < 2.5) {
    d = Math.abs(px);
  } else if (light.shape < 3.5) {
    const ang = Math.abs(Math.atan2(px, py));
    d = Math.hypot(px, py) * (1 + ang * 1.35);
  } else {
    const n =
      Math.abs(Math.sin((uvx * 12.9898 + uvy * 78.233 + cx) * 43758.5453)) % 1;
    d = Math.hypot(px, py) * (0.82 + n * 0.4);
  }

  const t = Math.min(1, Math.max(0, d / Math.max(light.radius, 0.04)));
  const f = applyFalloffCurve(t, light.falloffCurve, light.falloff);
  let illum = light.coreBrightness + (light.edgeDarkness - light.coreBrightness) * f;
  illum = (illum - 0.5) * light.lightContrast + 0.5;
  return Math.min(1, Math.max(0, illum));
}

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
    color: ColorUniformPayload = idleColorPayload(),
    light: LightUniformPayload = idleLightPayload(),
  ): void {
    if (this.disposed) return;
    if (Math.abs(state.randomSeed - this.lastSeed) > 0.001) {
      this.lastSeed = state.randomSeed;
      this.blueNoise = generateBlueNoiseTexture(BLUE_NOISE_SIZE, state.randomSeed);
    }

    const { width, height } = this.canvas;
    const img = this.ctx.createImageData(width, height);
    const data = img.data;
    const t = anim?.time ?? state.time;
    const amp = anim ? 0.05 : 0.03;
    const ptrX = ix?.pointerX ?? state.pointerX;
    const ptrY = ix?.pointerY ?? state.pointerY;
    const influence = ix?.influence ?? state.cursorInfluence;

    const shadowR = color.colors[6] ?? 0.06;
    const shadowG = color.colors[7] ?? 0.06;
    const shadowB = color.colors[8] ?? 0.07;
    const highR = color.colors[3] ?? 0.96;
    const highG = color.colors[4] ?? 0.96;
    const highB = color.colors[5] ?? 0.94;
    const useColor = color.colorEnabled > 0.5;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const uvx = x / width;
        const uvy = 1 - y / height;

        // Light shape = luminance; color gradient is not used as a wash
        let lum = lightShapeIllum(
          uvx,
          uvy,
          light,
          ptrX,
          ptrY,
          influence,
          state.scrollY,
          state.scrollInfluence,
        );
        lum +=
          Math.sin(uvx * 6.2 + t * 0.9) * amp * 0.35 +
          Math.sin(uvy * 4.1 - t * 0.65) * amp * 0.2;

        lum = (lum - 0.5) * state.contrast + 0.5 + state.brightness;
        lum = Math.min(1, Math.max(0, lum));

        const dx = uvx - light.centerX;
        const dy = uvy - light.centerY;
        const dist = Math.hypot(dx, dy);
        const r = Math.max(state.bloomRadius, 0.02);
        const core = Math.min(1, Math.max(0, (lum - 0.45) / 0.47));
        const bloom = Math.exp(-(dist * dist) / (r * r * 2)) * state.bloom * core * core;
        lum = Math.min(1, lum + bloom * 0.45);

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
        // Denser dither in dark outer ring
        const dark = 1 - lum;
        thr = Math.min(1, Math.max(0, thr + dark * light.ditherResponse * 0.38));
        const dithered = lum > thr ? 1 : 0;
        const ditherMix = 0.55 + dark * light.ditherResponse * 0.37;
        let ink = lum * (1 - ditherMix) + dithered * ditherMix;

        const grain = grainHash(px, py, state.time * state.noiseSpeed, state.randomSeed);
        ink = Math.min(1, Math.max(0, ink + (grain - 0.5) * state.grainAmount));

        const i = (y * width + x) * 4;
        if (useColor) {
          data[i] = Math.round((shadowR + (highR - shadowR) * ink) * 255);
          data[i + 1] = Math.round((shadowG + (highG - shadowG) * ink) * 255);
          data[i + 2] = Math.round((shadowB + (highB - shadowB) * ink) * 255);
        } else {
          const c = Math.round(ink * 255);
          data[i] = c;
          data[i + 1] = c;
          data[i + 2] = c;
        }
        data[i + 3] = Math.round(state.opacity * 255);
      }
    }

    this.ctx.putImageData(img, 0, 0);
  }

  dispose(): void {
    this.disposed = true;
  }
}
