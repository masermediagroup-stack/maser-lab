import type { RefObject } from "react";
import {
  clock,
  effect,
  frameLoop,
  init,
  sampler,
  surface,
  type FrameLoopHandle,
  type Gpu,
  type Surface,
  type Texture,
} from "vgpu";
import { CTA_LOGO_PRISM_WAVE_DEFAULTS } from "./constants";
import { rasterizeLogo } from "./rasterize-logo";
import type { PrismWaveMode, WaveRuntimeParams } from "./types";
import { WAVE_WGSL } from "./wave-shader";

type StartWaveOptions = {
  canvas: HTMLCanvasElement;
  logoUrl: string;
  paramsRef: RefObject<WaveRuntimeParams | null>;
  onMode: (mode: PrismWaveMode) => void;
};

function readParams(
  paramsRef: RefObject<WaveRuntimeParams | null>,
): WaveRuntimeParams {
  return (
    paramsRef.current ?? {
      ...CTA_LOGO_PRISM_WAVE_DEFAULTS,
      hover: 0,
    }
  );
}

async function uploadLogoTexture(
  gpu: Gpu,
  logoUrl: string,
): Promise<Texture> {
  const { bitmap, width, height } = await rasterizeLogo(logoUrl);
  const texture = gpu.device.createTexture({
    size: [width, height],
    format: "rgba8unorm",
    usage: ["copy_dst", "texture_binding", "copy_src"],
    label: "clpw-logo",
  });
  gpu.gpu.queue.copyExternalImageToTexture(
    { source: bitmap },
    { texture: texture.gpu },
    [width, height],
  );
  bitmap.close();
  return texture;
}

/**
 * Starts one Gpu + one rAF for the canvas lifetime.
 * Pause off-screen / hidden tab. Compile once. Dispose on the returned cleanup.
 *
 * Flattening is not auto-detected: a CSS 3D identity still reports `matrix3d`,
 * so a transform-string probe false-positives at rest. Fall back only when
 * `init()` / compile / the device error. If a compositor overlay is observed
 * on a live preview (`data-wave-mode="gpu"` but the mark stays screen-aligned
 * while the box tilts), force CSS — documented in LOCAL.md.
 */
export function startPrismWave(options: StartWaveOptions): () => void {
  const { canvas, logoUrl, paramsRef, onMode } = options;
  let disposed = false;
  let gpu: Gpu | undefined;
  let loop: FrameLoopHandle | undefined;
  let canvasSurface: Surface | undefined;
  let observer: IntersectionObserver | undefined;
  let unsubError: (() => void) | undefined;
  let isVisible = true;
  let pageHidden = false;
  let running = false;
  let wave: ReturnType<typeof effect> | undefined;
  let time: ReturnType<typeof clock> | undefined;

  const failToCss = () => {
    if (disposed) return;
    stopLoop();
    onMode("css");
  };

  const stopLoop = () => {
    loop?.stop();
    loop = undefined;
    running = false;
  };

  const startLoop = () => {
    if (disposed || !gpu || !wave || !canvasSurface || !time) return;
    if (running) return;
    if (!isVisible || pageHidden) return;
    running = true;
    const waveEffect = wave;
    const surf = canvasSurface;
    const clockState = time;
    loop = frameLoop(gpu, (frame) => {
      const look = readParams(paramsRef);
      waveEffect.set({
        params: {
          time: clockState.time,
          speed: look.speed,
          band_width: look.bandWidth,
          fringe: look.fringe,
          hover: look.hover,
        },
      });
      frame.pass({ target: surf, clear: [0, 0, 0, 0] }, waveEffect);
    });
  };

  const syncLoop = () => {
    if (isVisible && !pageHidden) startLoop();
    else stopLoop();
  };

  const onVisibility = () => {
    pageHidden = document.visibilityState === "hidden";
    syncLoop();
  };

  void (async () => {
    try {
      gpu = await init();
      if (disposed) {
        gpu.dispose();
        return;
      }

      unsubError = gpu.onError(() => {
        failToCss();
      });

      const logo = await uploadLogoTexture(gpu, logoUrl);
      if (disposed) {
        gpu.dispose();
        return;
      }

      canvasSurface = surface(gpu, canvas, {
        dpr: [1, 2],
        alphaMode: "premultiplied",
        clearColor: [0, 0, 0, 0],
        label: "clpw-surface",
      });

      const samp = sampler(gpu, {
        minFilter: "linear",
        magFilter: "linear",
        addressModeU: "clamp-to-edge",
        addressModeV: "clamp-to-edge",
      });

      const look = readParams(paramsRef);
      wave = effect(gpu, WAVE_WGSL, {
        label: "clpw-wave",
        blend: "premultiplied",
        set: {
          params: {
            time: 0,
            speed: look.speed,
            band_width: look.bandWidth,
            fringe: look.fringe,
            hover: look.hover,
          },
          logo,
          samp,
        },
      });

      await wave.compile(canvasSurface);
      if (disposed) {
        gpu.dispose();
        return;
      }

      time = clock(gpu);
      onMode("gpu");

      observer = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry?.isIntersecting ?? true;
          syncLoop();
        },
        { threshold: 0.01 },
      );
      observer.observe(canvas);
      document.addEventListener("visibilitychange", onVisibility);
      syncLoop();
    } catch {
      failToCss();
      gpu?.dispose();
      gpu = undefined;
    }
  })();

  return () => {
    disposed = true;
    stopLoop();
    observer?.disconnect();
    unsubError?.();
    document.removeEventListener("visibilitychange", onVisibility);
    canvasSurface?.dispose();
    gpu?.dispose();
  };
}
