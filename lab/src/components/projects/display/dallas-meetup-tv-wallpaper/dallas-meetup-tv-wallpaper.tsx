"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  DALLAS_DEFAULT_HEADLINE,
  DALLAS_DEFAULT_UP_NEXT,
  DALLAS_SANS_FAMILY,
} from "./dallas-fonts";
import {
  DEFAULT_LOOP_SECONDS,
  DALLAS_WALLPAPER_FPS,
} from "./globe-motion";
import {
  drawLogoCarousel,
  logoCarouselImages,
  preloadLogoCarousel,
} from "./logo-carousel";
import {
  drawFallbackGradient,
  loopShaderTimeMs,
  MovingGradientBackground,
} from "./moving-gradient-background";
import {
  DALLAS_DISPLAY_FONT_PX,
  DALLAS_SUBLINE_FONT_PX,
  publishDallasDisplayPx,
  runDallasTypeLock,
} from "./type-lock";

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;
const FPS = DALLAS_WALLPAPER_FPS;

const TEXT_LEFT_PX = 72;
const TEXT_TOP_PX = 931;
const DALLAS_TEXT_ON_DARK = "#ffffff";

type ExportResult = {
  blob: Blob;
  mimeType: string;
  extension: "mp4" | "webm";
  codec: string;
};

export type DallasMeetupWallpaperProps = {
  reducedMotion?: boolean;
  playing?: boolean;
  timeSeconds?: number;
  onFrameTime?: (seconds: number) => void;
  loopSeconds?: number;
  /** Legacy prop — ignored by idle wallpaper (no whip beat). */
  whipSeconds?: number;
  resetNonce?: number;
  headlineText?: string;
  upNextText?: string;
  className?: string;
};

function resolveDallasFontFamily(el: Element | null): string {
  if (el instanceof HTMLElement && el.isConnected) {
    const token = getComputedStyle(el).getPropertyValue("--dallas-font").trim();
    if (token) return token;
  }
  return DALLAS_SANS_FAMILY;
}

export function renderForegroundFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
  reducedMotion: boolean,
  loopSeconds: number,
  fontFamily: string,
  headlineText: string,
  upNextText: string,
) {
  const scale = width / BASE_WIDTH;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const images = logoCarouselImages();
  if (images) {
    drawLogoCarousel(
      ctx,
      width,
      height,
      elapsed,
      loopSeconds,
      reducedMotion,
      images,
    );
  }

  ctx.fillStyle = DALLAS_TEXT_ON_DARK;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const headlineSize = DALLAS_DISPLAY_FONT_PX * scale;
  const sublineSize = DALLAS_SUBLINE_FONT_PX * scale;
  const textX = TEXT_LEFT_PX * scale;
  const textY = TEXT_TOP_PX * scale;

  ctx.font = `400 ${headlineSize}px ${fontFamily}`;
  ctx.fillText(headlineText, textX, textY);

  const trimmedUpNext = upNextText.trim();
  if (trimmedUpNext) {
    const lineGap = headlineSize * 0.12;
    ctx.font = `300 ${sublineSize}px ${fontFamily}`;
    ctx.fillText(trimmedUpNext, textX, textY + headlineSize + lineGap);
  }
}

export function DallasMeetupWallpaper({
  reducedMotion = false,
  playing = true,
  timeSeconds,
  onFrameTime,
  loopSeconds = DEFAULT_LOOP_SECONDS,
  resetNonce = 0,
  headlineText = DALLAS_DEFAULT_HEADLINE,
  upNextText = DALLAS_DEFAULT_UP_NEXT,
  className,
}: DallasMeetupWallpaperProps) {
  const stackRef = useRef<HTMLDivElement | null>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const gradientRef = useRef<MovingGradientBackground | null>(null);
  const useWebGpuRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const pausedAtRef = useRef(0);
  const drawAtTimeRef = useRef<(time: number) => void>(() => {});

  const resizeCanvases = useCallback(() => {
    const stack = stackRef.current;
    const bgCanvas = bgCanvasRef.current;
    const fgCanvas = fgCanvasRef.current;
    if (!stack || !bgCanvas || !fgCanvas) return;

    const rect = stack.getBoundingClientRect();
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const clampedDpr = Math.min(2, Math.max(1, dpr));
    const width = Math.max(1, Math.round(rect.width * clampedDpr));
    const height = Math.max(1, Math.round(rect.height * clampedDpr));

    bgCanvas.width = width;
    bgCanvas.height = height;
    fgCanvas.width = width;
    fgCanvas.height = height;

    gradientRef.current?.resize(rect.width, rect.height, clampedDpr);
    publishDallasDisplayPx(stack, rect.width);
  }, []);

  const drawAtTime = useCallback(
    (time: number) => {
      const bgCanvas = bgCanvasRef.current;
      const fgCanvas = fgCanvasRef.current;
      if (!bgCanvas || !fgCanvas) return;

      const width = fgCanvas.width;
      const height = fgCanvas.height;
      if (width <= 0 || height <= 0) return;

      const shaderTimeMs = reducedMotion ? 0 : loopShaderTimeMs(time, loopSeconds);
      const gradient = gradientRef.current;

      if (useWebGpuRef.current && gradient?.isReady) {
        gradient.render(shaderTimeMs, loopSeconds);
      } else {
        const bgCtx = bgCanvas.getContext("2d");
        if (bgCtx) {
          drawFallbackGradient(bgCtx, width, height, shaderTimeMs, loopSeconds);
        }
      }

      const fgCtx = fgCanvas.getContext("2d");
      if (!fgCtx) return;
      renderForegroundFrame(
        fgCtx,
        width,
        height,
        time,
        reducedMotion,
        loopSeconds,
        resolveDallasFontFamily(fgCanvas),
        headlineText,
        upNextText,
      );
    },
    [headlineText, loopSeconds, reducedMotion, upNextText],
  );

  useEffect(() => {
    drawAtTimeRef.current = drawAtTime;
  }, [drawAtTime]);

  useEffect(() => {
    let cancelled = false;
    const gradient = new MovingGradientBackground();
    gradientRef.current = gradient;

    void (async () => {
      await preloadLogoCarousel();
      if (cancelled) return;
      const bgCanvas = bgCanvasRef.current;
      if (bgCanvas) {
        const ok = await gradient.init(bgCanvas);
        if (cancelled) {
          gradient.destroy();
          return;
        }
        useWebGpuRef.current = ok;
      }
      resizeCanvases();
      if (!cancelled) {
        drawAtTimeRef.current(pausedAtRef.current);
      }
    })();

    return () => {
      cancelled = true;
      useWebGpuRef.current = false;
      gradient.destroy();
      if (gradientRef.current === gradient) {
        gradientRef.current = null;
      }
    };
  }, [resizeCanvases]);

  useEffect(() => {
    resizeCanvases();
    const stack = stackRef.current;
    if (!stack || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      resizeCanvases();
      drawAtTime(timeSeconds ?? pausedAtRef.current);
    });
    observer.observe(stack);
    return () => observer.disconnect();
  }, [drawAtTime, resizeCanvases, timeSeconds]);

  useEffect(() => {
    if (document.fonts) {
      void document.fonts.load(`400 ${DALLAS_DISPLAY_FONT_PX}px ${DALLAS_SANS_FAMILY}`);
      void document.fonts.load(`300 ${DALLAS_SUBLINE_FONT_PX}px ${DALLAS_SANS_FAMILY}`);
    }
  }, []);

  useEffect(() => {
    const root = stackRef.current?.closest(".dallas-demo");
    if (root) runDallasTypeLock(root);
  });

  useEffect(() => {
    drawAtTime(timeSeconds ?? pausedAtRef.current);
  }, [drawAtTime, timeSeconds]);

  useEffect(() => {
    if (timeSeconds !== undefined) {
      pausedAtRef.current = timeSeconds;
    }
  }, [timeSeconds]);

  useEffect(() => {
    if (!playing || reducedMotion || timeSeconds !== undefined) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      startRef.current = null;
      return;
    }

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = ((now - startRef.current) / 1000) % loopSeconds;
      pausedAtRef.current = elapsed;
      drawAtTime(elapsed);
      onFrameTime?.(elapsed);
      rafRef.current = requestAnimationFrame(tick);
    };

    startRef.current = null;
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = null;
    };
  }, [drawAtTime, loopSeconds, onFrameTime, playing, reducedMotion, resetNonce, timeSeconds]);

  return (
    <div ref={stackRef} className={`dallas-wallpaper-stack ${className ?? ""}`.trim()}>
      <canvas
        ref={bgCanvasRef}
        className="dallas-wallpaper-stack__bg"
        aria-hidden
      />
      <canvas
        ref={fgCanvasRef}
        className="dallas-wallpaper-stack__fg"
        data-dallas-display="universal-sans"
        aria-label="Dallas meetup wallpaper"
      />
    </div>
  );
}

export async function exportDallasMeetupWallpaperLoop({
  width = BASE_WIDTH,
  height = BASE_HEIGHT,
  loopSeconds = DEFAULT_LOOP_SECONDS,
  headlineText = DALLAS_DEFAULT_HEADLINE,
  upNextText = DALLAS_DEFAULT_UP_NEXT,
}: {
  width?: number;
  height?: number;
  loopSeconds?: number;
  whipSeconds?: number;
  headlineText?: string;
  upNextText?: string;
} = {}): Promise<ExportResult> {
  if (typeof window === "undefined") {
    throw new Error("Export is only available in the browser.");
  }
  if (typeof MediaRecorder === "undefined") {
    throw new Error("MediaRecorder is not available in this browser.");
  }

  if (document.fonts) {
    await document.fonts.load(`400 ${DALLAS_DISPLAY_FONT_PX}px ${DALLAS_SANS_FAMILY}`);
    await document.fonts.load(`300 ${DALLAS_SUBLINE_FONT_PX}px ${DALLAS_SANS_FAMILY}`);
    await document.fonts.ready;
  }

  await preloadLogoCarousel();

  const bgCanvas = document.createElement("canvas");
  bgCanvas.width = width;
  bgCanvas.height = height;
  const fgCanvas = document.createElement("canvas");
  fgCanvas.width = width;
  fgCanvas.height = height;
  const outCanvas = document.createElement("canvas");
  outCanvas.width = width;
  outCanvas.height = height;

  const outCtx = outCanvas.getContext("2d");
  if (!outCtx) throw new Error("Could not create a 2D canvas context.");

  const gradient = new MovingGradientBackground();
  const webgpuOk = await gradient.init(bgCanvas);
  if (webgpuOk) {
    gradient.resize(width, height, 1);
  } else {
    const bgCtx = bgCanvas.getContext("2d");
    if (!bgCtx) throw new Error("Could not create fallback background context.");
  }

  const fontFamily = resolveDallasFontFamily(document.querySelector(".dallas-demo"));

  const totalFrames = loopSeconds * FPS;
  const mp4Mime = "video/mp4;codecs=avc1.42E01E";
  const webmMime = "video/webm;codecs=vp9";
  const fallbackWebm = "video/webm";

  const mimeType = MediaRecorder.isTypeSupported(mp4Mime)
    ? mp4Mime
    : MediaRecorder.isTypeSupported(webmMime)
      ? webmMime
      : fallbackWebm;

  const extension: "mp4" | "webm" = mimeType.startsWith("video/mp4") ? "mp4" : "webm";

  const stream = outCanvas.captureStream(0);
  const [videoTrack] = stream.getVideoTracks();
  if (!videoTrack) throw new Error("Could not capture canvas stream track.");
  const controlledTrack = videoTrack as CanvasCaptureMediaStreamTrack;
  const chunks: BlobPart[] = [];

  await new Promise<void>((resolve, reject) => {
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 14_000_000 * (FPS / 30),
    });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onerror = () => reject(new Error("Recording failed."));
    recorder.onstop = () => resolve();
    recorder.start();

    let frame = 0;
    const tick = () => {
      if (frame >= totalFrames) {
        recorder.stop();
        gradient.destroy();
        return;
      }
      const elapsed = frame / FPS;
      const shaderTimeMs = loopShaderTimeMs(elapsed, loopSeconds);

      if (webgpuOk) {
        gradient.render(shaderTimeMs, loopSeconds);
      } else {
        const bgCtx = bgCanvas.getContext("2d");
        if (bgCtx) {
          drawFallbackGradient(bgCtx, width, height, shaderTimeMs, loopSeconds);
        }
      }

      const fgCtx = fgCanvas.getContext("2d");
      if (fgCtx) {
        renderForegroundFrame(
          fgCtx,
          width,
          height,
          elapsed,
          false,
          loopSeconds,
          fontFamily,
          headlineText,
          upNextText,
        );
      }

      outCtx.clearRect(0, 0, width, height);
      outCtx.drawImage(bgCanvas, 0, 0);
      outCtx.drawImage(fgCanvas, 0, 0);
      controlledTrack.requestFrame();
      frame += 1;
      requestAnimationFrame(tick);
    };
    tick();
  });

  return {
    blob: new Blob(chunks, { type: mimeType }),
    mimeType,
    extension,
    codec: mimeType.includes("mp4") ? "h264" : "vp9",
  };
}

export { runDallasTypeLock, publishDallasDisplayPx };
