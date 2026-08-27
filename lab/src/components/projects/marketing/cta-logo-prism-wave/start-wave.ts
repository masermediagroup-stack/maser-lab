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
import {
  backingStoreChanged,
  coverViewportWithCanvas,
  readViewportBackingStore,
  type ViewportBackingStore,
} from "./canvas-size";
import { CTA_LOGO_PRISM_WAVE_DEFAULTS } from "./constants";
import { rasterizeLogo } from "./rasterize-logo";
import type { PrismWaveMode, WaveRuntimeParams } from "./types";
import { WAVE_WGSL } from "./wave-shader";

type StartWaveOptions = {
  canvas: HTMLCanvasElement;
  viewport: HTMLElement;
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

function waitAnimationFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

type BrowserWebGpu = {
  requestAdapter: () => Promise<unknown>;
  getPreferredCanvasFormat: () => "bgra8unorm" | "rgba8unorm" | string;
};

function browserWebGpu(): BrowserWebGpu | undefined {
  if (typeof navigator === "undefined") return undefined;
  const gpu = (navigator as Navigator & { gpu?: BrowserWebGpu }).gpu;
  if (!gpu || typeof gpu.requestAdapter !== "function") return undefined;
  return gpu;
}

function isMissingAdapterError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? error.code : undefined;
  const message = "message" in error ? String(error.message) : String(error);
  return (
    code === "VGPU-UNSUPPORTED" ||
    message.includes("requestAdapter() returned null") ||
    message.includes("navigator.gpu")
  );
}

async function waitForViewportSize(
  viewport: HTMLElement,
  isDisposed: () => boolean,
): Promise<ViewportBackingStore> {
  for (let i = 0; i < 90; i += 1) {
    if (isDisposed()) {
      throw new Error("cta-logo-prism-wave disposed");
    }
    const size = readViewportBackingStore(viewport);
    if (size) return size;
    await waitAnimationFrame();
  }
  const fallback = readViewportBackingStore(viewport);
  if (fallback) return fallback;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  return {
    cssW: 512,
    cssH: 260,
    dpr,
    bufW: Math.max(1, Math.round(512 * dpr)),
    bufH: Math.max(1, Math.round(260 * dpr)),
  };
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

function isDeviceGone(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? error.code : undefined;
  return code === "VGPU-DEVICE-LOST" || code === "VGPU-SURFACE-CONTEXT";
}

/**
 * Starts one Gpu + one rAF for the canvas lifetime.
 * Pause off-screen / hidden tab. Compile once against a target *signature*
 * (not the canvas surface). Dispose on the returned cleanup.
 *
 * CSS fallback only when the WebGPU adapter is actually missing (or the
 * device is later lost). Compile/upload/frame errors are logged — they do
 * not dump a machine that has an adapter onto the CSS path.
 *
 * Canvas backing store comes from the tilt viewport's getBoundingClientRect
 * × DPR. autoResize is off so a 300×150 intrinsic box cannot lock in.
 */
export function startPrismWave(options: StartWaveOptions): () => void {
  const { canvas, viewport, logoUrl, paramsRef, onMode } = options;
  let disposed = false;
  let gpu: Gpu | undefined;
  let loop: FrameLoopHandle | undefined;
  let canvasSurface: Surface | undefined;
  let observer: IntersectionObserver | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let unsubError: (() => void) | undefined;
  let isVisible = true;
  let pageHidden = false;
  let running = false;
  let wave: ReturnType<typeof effect> | undefined;
  let time: ReturnType<typeof clock> | undefined;
  let hasAdapter = false;

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

  const syncBackingStore = (): ViewportBackingStore | null => {
    const size = readViewportBackingStore(viewport);
    if (!size) return null;
    const changed = backingStoreChanged(canvas, size);
    coverViewportWithCanvas(canvas, size);
    if (changed && canvasSurface && !canvasSurface.disposed) {
      canvasSurface.resize([size.bufW, size.bufH]);
      coverViewportWithCanvas(canvas, size);
    }
    return size;
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
      try {
        syncBackingStore();
        const look = readParams(paramsRef);
        waveEffect.set({
          params: {
            time: clockState.time,
            speed: look.speed,
            band_width: look.bandWidth,
            fringe: look.fringe,
            hover: look.hover,
            res_x: canvas.width,
            res_y: canvas.height,
          },
        });
        frame.pass({ target: surf, clear: [0, 0, 0, 0] }, waveEffect);
      } catch (error) {
        console.error("[cta-logo-prism-wave] frame failed", error);
        if (isDeviceGone(error) || !hasAdapter) failToCss();
      }
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
      const size = await waitForViewportSize(viewport, () => disposed);
      if (disposed) return;
      coverViewportWithCanvas(canvas, size);

      resizeObserver = new ResizeObserver(() => {
        syncBackingStore();
      });
      resizeObserver.observe(viewport);

      const webgpu = browserWebGpu();
      if (!webgpu) {
        failToCss();
        return;
      }

      const adapter = await webgpu.requestAdapter();
      if (!adapter) {
        failToCss();
        return;
      }
      hasAdapter = true;

      gpu = await init();
      if (disposed) {
        gpu.dispose();
        return;
      }

      unsubError = gpu.onError((error) => {
        console.error(
          "[cta-logo-prism-wave]",
          error.code,
          error.message,
          error,
        );
        if (isDeviceGone(error)) failToCss();
      });

      void gpu.gpu.lost.then((info: unknown) => {
        if (disposed) return;
        console.error("[cta-logo-prism-wave] device lost", info);
        failToCss();
      });

      const logo = await uploadLogoTexture(gpu, logoUrl);
      if (disposed) {
        gpu.dispose();
        return;
      }

      const sized = syncBackingStore() ?? size;
      canvasSurface = surface(gpu, canvas, {
        dpr: [1, 2],
        autoResize: false,
        size: [sized.bufW, sized.bufH],
        alphaMode: "premultiplied",
        clearColor: [0, 0, 0, 0],
        label: "clpw-surface",
      });
      coverViewportWithCanvas(canvas, sized);

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
            res_x: sized.bufW,
            res_y: sized.bufH,
          },
          logo,
          samp,
        },
      });

      const canvasFormat =
        webgpu.getPreferredCanvasFormat() === "rgba8unorm"
          ? "rgba8unorm"
          : "bgra8unorm";
      await wave.compile({
        colors: [canvasFormat],
        sampleCount: 1,
      });
      if (disposed) {
        gpu.dispose();
        return;
      }

      time = clock(gpu);
      onMode("vgpu");
      console.info("[cta-logo-prism-wave] wave mode: vgpu");

      observer = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry?.isIntersecting ?? true;
          syncLoop();
        },
        { threshold: 0.01 },
      );
      observer.observe(viewport);

      document.addEventListener("visibilitychange", onVisibility);
      syncLoop();
    } catch (error) {
      console.error("[cta-logo-prism-wave] vgpu path failed", error);
      if (!hasAdapter || isMissingAdapterError(error)) {
        failToCss();
      }
      if (!hasAdapter) {
        gpu?.dispose();
        gpu = undefined;
      }
    }
  })();

  return () => {
    disposed = true;
    stopLoop();
    observer?.disconnect();
    resizeObserver?.disconnect();
    unsubError?.();
    document.removeEventListener("visibilitychange", onVisibility);
    canvasSurface?.dispose();
    gpu?.dispose();
  };
}
