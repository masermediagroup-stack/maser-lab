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
  blitGpuToDisplay,
  coverViewportWithCanvas,
  displayHasFilamentPixels,
  readViewportBackingStore,
  sizeGpuSourceCanvas,
  type ViewportBackingStore,
} from "./canvas-size";
import { CTA_LOGO_PRISM_WAVE_DEFAULTS } from "./constants";
import { rasterizeLogo } from "./rasterize-logo";
import type { PrismWaveMode, WaveRuntimeParams } from "./types";
import { WAVE_WGSL } from "./wave-shader";

type StartWaveOptions = {
  /** WebGPU target — must not be a descendant of the CSS 3D viewport. */
  gpuCanvas: HTMLCanvasElement;
  /** 2D canvas inside the tilted viewport; receives a blit of gpuCanvas. */
  displayCanvas: HTMLCanvasElement;
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

function readGround(viewport: HTMLElement): number {
  return viewport.closest("[data-ground]")?.getAttribute("data-ground") ===
    "dark"
    ? 1
    : 0;
}

function readTilt(viewport: HTMLElement): { tilt_x: number; tilt_y: number } {
  const style = getComputedStyle(viewport);
  return {
    tilt_x: Number.parseFloat(style.getPropertyValue("--cta-logo-tilt-x")) || 0,
    tilt_y: Number.parseFloat(style.getPropertyValue("--cta-logo-tilt-y")) || 0,
  };
}

function gpuWaveParams(
  look: WaveRuntimeParams,
  canvas: HTMLCanvasElement,
  viewport: HTMLElement,
  time = 0,
) {
  const tilt = readTilt(viewport);
  return {
    time,
    speed: look.speed,
    band_width: look.bandWidth,
    fringe: look.fringe,
    hover: look.hover,
    res_x: canvas.width,
    res_y: canvas.height,
    ground: readGround(viewport),
    tilt_x: tilt.tilt_x,
    tilt_y: tilt.tilt_y,
    _pad0: 0,
    _pad1: 0,
  };
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
 * CSS fallback starts on first screen and stays until blit copies a real
 * filament frame. Compile/off-tree/empty blit must not hide the CSS path.
 * Adapter missing or device lost: stay on (or return to) CSS. Compile
 * errors are logged — they do not dump a machine that has an adapter onto
 * CSS *unless* the GPU never paints.
 *
 * Canvas backing store comes from the tilt viewport's layout box
 * × DPR. autoResize is off so a 300×150 intrinsic box cannot lock in.
 *
 * The WebGPU canvas is *not* a child of the CSS 3D viewport. A GPU
 * (or accelerated 2D) canvas inside preserve-3d flattens parent
 * perspective in Chromium — 14°/16° then reads as a slight squash.
 * We render off-tree and blit onto a 2D canvas in the tilted plane.
 */
export function startPrismWave(options: StartWaveOptions): () => void {
  const { gpuCanvas, displayCanvas, viewport, logoUrl, paramsRef, onMode } =
    options;
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
  let gpuPainting = false;

  const failToCss = () => {
    if (disposed) return;
    gpuPainting = false;
    stopLoop();
    onMode("css");
  };

  const promoteGpuIfPainting = () => {
    if (disposed || gpuPainting) return;
    if (!displayHasFilamentPixels(displayCanvas)) return;
    gpuPainting = true;
    onMode("vgpu");
    console.info("[cta-logo-prism-wave] wave mode: vgpu");
  };

  const stopLoop = () => {
    loop?.stop();
    loop = undefined;
    running = false;
  };

  const syncBackingStore = (): ViewportBackingStore | null => {
    const size = readViewportBackingStore(viewport);
    if (!size) return null;
    const gpuChanged = backingStoreChanged(gpuCanvas, size);
    sizeGpuSourceCanvas(gpuCanvas, size);
    coverViewportWithCanvas(displayCanvas, size);
    if (gpuChanged && canvasSurface && !canvasSurface.disposed) {
      canvasSurface.resize([size.bufW, size.bufH]);
      sizeGpuSourceCanvas(gpuCanvas, size);
      coverViewportWithCanvas(displayCanvas, size);
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
    const deviceGpu = gpu;
    loop = frameLoop(deviceGpu, (frame) => {
      try {
        syncBackingStore();
        const look = readParams(paramsRef);
        waveEffect.set({
          params: gpuWaveParams(look, gpuCanvas, viewport, clockState.time),
        });
        frame.pass({ target: surf, clear: [0, 0, 0, 0] }, waveEffect);
        blitGpuToDisplay(gpuCanvas, displayCanvas);
        if (!gpuPainting) {
          const queue = deviceGpu.gpu.queue;
          if (typeof queue.onSubmittedWorkDone === "function") {
            void queue.onSubmittedWorkDone().then(() => {
              if (disposed || gpuPainting) return;
              blitGpuToDisplay(gpuCanvas, displayCanvas);
              promoteGpuIfPainting();
            });
          } else {
            promoteGpuIfPainting();
          }
        }
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
      onMode("css");
      const size = await waitForViewportSize(viewport, () => disposed);
      if (disposed) return;
      sizeGpuSourceCanvas(gpuCanvas, size);
      coverViewportWithCanvas(displayCanvas, size);

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
      canvasSurface = surface(gpu, gpuCanvas, {
        dpr: [1, 2],
        autoResize: false,
        size: [sized.bufW, sized.bufH],
        alphaMode: "premultiplied",
        clearColor: [0, 0, 0, 0],
        label: "clpw-surface",
      });
      sizeGpuSourceCanvas(gpuCanvas, sized);
      coverViewportWithCanvas(displayCanvas, sized);

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
          params: gpuWaveParams(look, gpuCanvas, viewport, 0),
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
      // Stay on CSS until blit copies filament pixels. Compile is not paint.

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
