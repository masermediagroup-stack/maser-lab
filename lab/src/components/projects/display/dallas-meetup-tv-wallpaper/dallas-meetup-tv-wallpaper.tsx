"use client";

import dynamic from "next/dynamic";
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
  CURSOR_LOCKUP_H,
  CURSOR_LOCKUP_SRC,
  CURSOR_LOCKUP_W,
  GROK_LOCKUP_H,
  GROK_LOCKUP_SRC,
  GROK_LOCKUP_W,
  SPACEX_LOCKUP_H,
  SPACEX_LOCKUP_SRC,
  SPACEX_LOCKUP_W,
  drawLogoCarousel,
  logoCarouselImages,
  logoCenteredRect,
  logoOpacities,
  preloadLogoCarousel,
} from "./logo-carousel";
import {
  DALLAS_DISPLAY_FONT_PX,
  DALLAS_SUBLINE_FONT_PX,
  publishDallasDisplayPx,
  runDallasTypeLock,
} from "./type-lock";

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;
const FPS = DALLAS_WALLPAPER_FPS;
const STAGE_FALLBACK = "#060606";

const TEXT_LEFT_PX = 72;
const TEXT_TOP_PX = 931;
const DALLAS_TEXT_ON_DARK = "#ffffff";
const TYPE_LINE_GAP = DALLAS_DISPLAY_FONT_PX * 0.12;

const grokRect = logoCenteredRect(GROK_LOCKUP_W, GROK_LOCKUP_H);
const spacexRect = logoCenteredRect(SPACEX_LOCKUP_W, SPACEX_LOCKUP_H);
const cursorRect = logoCenteredRect(CURSOR_LOCKUP_W, CURSOR_LOCKUP_H);

const UnicornGround = dynamic(
  () => import("./unicorn-ground").then((mod) => mod.UnicornGround),
  { ssr: false },
);

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

function applyMarkOpacities(
  grok: HTMLElement | null,
  spacex: HTMLElement | null,
  cursor: HTMLElement | null,
  elapsed: number,
  loopSeconds: number,
  reducedMotion: boolean,
) {
  const [grokOp, spacexOp, cursorOp] = logoOpacities(
    elapsed,
    loopSeconds,
    reducedMotion,
  );
  if (grok) grok.style.opacity = String(grokOp);
  if (spacex) spacex.style.opacity = String(spacexOp);
  if (cursor) cursor.style.opacity = String(cursorOp);
}

function snapshotUnicornCanvas(root: ParentNode | null): HTMLCanvasElement | null {
  if (!root) return null;
  const canvas = root.querySelector(".dallas-wallpaper-stack__ground canvas");
  return canvas instanceof HTMLCanvasElement ? canvas : null;
}

/** Export-only: composite Unicorn snapshot + logos + type at identity 1920×1080. */
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
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (width !== BASE_WIDTH || height !== BASE_HEIGHT) {
    ctx.clearRect(0, 0, width, height);
  }

  const images = logoCarouselImages();
  if (images) {
    drawLogoCarousel(
      ctx,
      BASE_WIDTH,
      BASE_HEIGHT,
      elapsed,
      loopSeconds,
      reducedMotion,
      images,
    );
  }

  ctx.fillStyle = DALLAS_TEXT_ON_DARK;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  ctx.font = `400 ${DALLAS_DISPLAY_FONT_PX}px ${fontFamily}`;
  ctx.fillText(headlineText, TEXT_LEFT_PX, TEXT_TOP_PX);

  const trimmedUpNext = upNextText.trim();
  if (trimmedUpNext) {
    ctx.font = `300 ${DALLAS_SUBLINE_FONT_PX}px ${fontFamily}`;
    ctx.fillText(
      trimmedUpNext,
      TEXT_LEFT_PX,
      TEXT_TOP_PX + DALLAS_DISPLAY_FONT_PX + TYPE_LINE_GAP,
    );
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
  const grokRef = useRef<HTMLImageElement | null>(null);
  const spacexRef = useRef<HTMLImageElement | null>(null);
  const cursorRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const pausedAtRef = useRef(0);

  const paintMarks = useCallback(
    (time: number) => {
      applyMarkOpacities(
        grokRef.current,
        spacexRef.current,
        cursorRef.current,
        time,
        loopSeconds,
        reducedMotion,
      );
    },
    [loopSeconds, reducedMotion],
  );

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    publishDallasDisplayPx(stack, BASE_WIDTH);
  }, []);

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
    paintMarks(timeSeconds ?? pausedAtRef.current);
  }, [paintMarks, timeSeconds]);

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
      paintMarks(timeSeconds ?? pausedAtRef.current);
      return;
    }

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = ((now - startRef.current) / 1000) % loopSeconds;
      pausedAtRef.current = elapsed;
      paintMarks(elapsed);
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
  }, [loopSeconds, onFrameTime, paintMarks, playing, reducedMotion, resetNonce, timeSeconds]);

  return (
    <div
      ref={stackRef}
      className={`dallas-wallpaper-stack ${className ?? ""}`.trim()}
      aria-label="Dallas meetup wallpaper"
    >
      <div className="dallas-wallpaper-stack__ground" aria-hidden>
        <UnicornGround paused={reducedMotion} />
      </div>
      <div className="dallas-wallpaper-stack__lockup">
        {/* Native <img> keeps SVG 1:1 at display size; next/image can resample. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={grokRef}
          className="dallas-wallpaper-mark dallas-wallpaper-mark--grok"
          src={GROK_LOCKUP_SRC}
          width={GROK_LOCKUP_W}
          height={GROK_LOCKUP_H}
          alt=""
          draggable={false}
          style={{
            left: grokRect.x,
            top: grokRect.y,
            width: grokRect.w,
            height: grokRect.h,
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={spacexRef}
          className="dallas-wallpaper-mark dallas-wallpaper-mark--spacex"
          src={SPACEX_LOCKUP_SRC}
          width={SPACEX_LOCKUP_W}
          height={SPACEX_LOCKUP_H}
          alt=""
          draggable={false}
          style={{
            left: spacexRect.x,
            top: spacexRect.y,
            width: spacexRect.w,
            height: spacexRect.h,
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={cursorRef}
          className="dallas-wallpaper-mark dallas-wallpaper-mark--cursor"
          src={CURSOR_LOCKUP_SRC}
          width={CURSOR_LOCKUP_W}
          height={CURSOR_LOCKUP_H}
          alt=""
          draggable={false}
          style={{
            left: cursorRect.x,
            top: cursorRect.y,
            width: cursorRect.w,
            height: cursorRect.h,
          }}
        />
        <div
          className="dallas-wallpaper-type"
          data-dallas-display="universal-sans"
        >
          <p className="dallas-wallpaper-type__headline">{headlineText}</p>
          {upNextText.trim() ? (
            <p className="dallas-wallpaper-type__subline">{upNextText}</p>
          ) : null}
        </div>
      </div>
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

  const outCanvas = document.createElement("canvas");
  outCanvas.width = BASE_WIDTH;
  outCanvas.height = BASE_HEIGHT;

  const outCtx = outCanvas.getContext("2d");
  if (!outCtx) throw new Error("Could not create a 2D canvas context.");

  const fontFamily = resolveDallasFontFamily(document.querySelector(".dallas-demo"));
  const unicorn = snapshotUnicornCanvas(document.querySelector(".dallas-wallpaper-stack"));

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
        return;
      }
      const elapsed = frame / FPS;

      outCtx.setTransform(1, 0, 0, 1, 0, 0);
      outCtx.fillStyle = STAGE_FALLBACK;
      outCtx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
      const liveUnicorn =
        snapshotUnicornCanvas(document.querySelector(".dallas-wallpaper-stack")) ??
        unicorn;
      if (liveUnicorn) {
        outCtx.drawImage(liveUnicorn, 0, 0, BASE_WIDTH, BASE_HEIGHT);
      }

      renderForegroundFrame(
        outCtx,
        width,
        height,
        elapsed,
        false,
        loopSeconds,
        fontFamily,
        headlineText,
        upNextText,
      );
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
