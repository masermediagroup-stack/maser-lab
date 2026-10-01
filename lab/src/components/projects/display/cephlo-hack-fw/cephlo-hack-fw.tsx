"use client";

import { useEffect, useRef } from "react";
import {
  CEPHLO_DEFAULT_HEADLINE,
  CEPHLO_DEFAULT_UP_NEXT,
  CEPHLO_SANS_FAMILY,
} from "./fonts";
import {
  CEPHLO_LOCKUP_H,
  CEPHLO_LOCKUP_SRC,
  CEPHLO_LOCKUP_W,
  cephloLogoImage,
  loadCephloLogo,
  logoCenteredRect,
} from "./logo";
import { CEPHLO_WALLPAPER_FPS, DEFAULT_LOOP_SECONDS } from "./loop";
import { clampSilkLook, DEFAULT_SILK_LOOK, type SilkLook } from "./silk-look";
import { startMovingGradient } from "./start-moving-gradient";
import {
  CEPHLO_DISPLAY_FONT_PX,
  CEPHLO_SUBLINE_FONT_PX,
  publishCephloDisplayPx,
  runCephloTypeLock,
} from "./type-lock";

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;
const FPS = CEPHLO_WALLPAPER_FPS;
const STAGE_FALLBACK = "#2A10D6";

const TEXT_LEFT_PX = 72;
const TEXT_TOP_PX = 931;
const TEXT_ON_BLUE = "#ffffff";
const TYPE_LINE_GAP = CEPHLO_DISPLAY_FONT_PX * 0.12;

const lockupRect = logoCenteredRect(CEPHLO_LOCKUP_W, CEPHLO_LOCKUP_H);

type ExportResult = {
  blob: Blob;
  mimeType: string;
  extension: "mp4" | "webm";
  codec: string;
};

export type CephloHackFwWallpaperProps = {
  reducedMotion?: boolean;
  playing?: boolean;
  timeSeconds?: number;
  onFrameTime?: (seconds: number) => void;
  loopSeconds?: number;
  resetNonce?: number;
  headlineText?: string;
  upNextText?: string;
  /** Live silk uniforms. Mutating fields must not remount the GL canvas. */
  silkLook?: SilkLook;
  className?: string;
};

function resolveFontFamily(el: Element | null): string {
  if (el instanceof HTMLElement && el.isConnected) {
    const token = getComputedStyle(el).getPropertyValue("--cephlo-font").trim();
    if (token) return token;
  }
  return CEPHLO_SANS_FAMILY;
}

function snapshotGroundCanvas(root: ParentNode | null): HTMLCanvasElement | null {
  if (!root) return null;
  const canvas = root.querySelector(".cephlo-wallpaper-ground-canvas");
  return canvas instanceof HTMLCanvasElement ? canvas : null;
}

/** Export-only: composite gradient canvas + lockup + type at identity 1920×1080. */
export function renderForegroundFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fontFamily: string,
  headlineText: string,
  upNextText: string,
) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (width !== BASE_WIDTH || height !== BASE_HEIGHT) {
    ctx.clearRect(0, 0, width, height);
  }

  const image = cephloLogoImage();
  if (image) {
    ctx.drawImage(image, lockupRect.x, lockupRect.y, lockupRect.w, lockupRect.h);
  }

  ctx.fillStyle = TEXT_ON_BLUE;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  ctx.font = `400 ${CEPHLO_DISPLAY_FONT_PX}px ${fontFamily}`;
  ctx.fillText(headlineText, TEXT_LEFT_PX, TEXT_TOP_PX);

  const trimmedUpNext = upNextText.trim();
  if (trimmedUpNext) {
    ctx.font = `300 ${CEPHLO_SUBLINE_FONT_PX}px ${fontFamily}`;
    ctx.fillText(
      trimmedUpNext,
      TEXT_LEFT_PX,
      TEXT_TOP_PX + CEPHLO_DISPLAY_FONT_PX + TYPE_LINE_GAP,
    );
  }
}

export function CephloHackFwWallpaper({
  reducedMotion = false,
  playing = true,
  timeSeconds,
  onFrameTime,
  loopSeconds = DEFAULT_LOOP_SECONDS,
  resetNonce = 0,
  headlineText = CEPHLO_DEFAULT_HEADLINE,
  upNextText = CEPHLO_DEFAULT_UP_NEXT,
  silkLook,
  className,
}: CephloHackFwWallpaperProps) {
  const stackRef = useRef<HTMLDivElement | null>(null);
  const groundCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pausedRef = useRef(reducedMotion);
  const lookRef = useRef<SilkLook>(clampSilkLook(silkLook ?? DEFAULT_SILK_LOOK));
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const pausedAtRef = useRef(0);

  useEffect(() => {
    pausedRef.current = reducedMotion || !playing;
  }, [playing, reducedMotion]);

  useEffect(() => {
    lookRef.current = clampSilkLook(silkLook ?? DEFAULT_SILK_LOOK);
  }, [silkLook]);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    publishCephloDisplayPx(stack, BASE_WIDTH);
  }, []);

  useEffect(() => {
    if (document.fonts) {
      void document.fonts.load(`400 ${CEPHLO_DISPLAY_FONT_PX}px ${CEPHLO_SANS_FAMILY}`);
      void document.fonts.load(`300 ${CEPHLO_SUBLINE_FONT_PX}px ${CEPHLO_SANS_FAMILY}`);
    }
    void loadCephloLogo();
  }, []);

  useEffect(() => {
    const canvas = groundCanvasRef.current;
    if (!canvas) return;
    return startMovingGradient(canvas, pausedRef, lookRef);
  }, []);

  useEffect(() => {
    const root = stackRef.current?.closest(".cephlo-demo");
    if (root) runCephloTypeLock(root);
  });

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
  }, [loopSeconds, onFrameTime, playing, reducedMotion, resetNonce, timeSeconds]);

  return (
    <div
      ref={stackRef}
      className={`cephlo-wallpaper-stack ${className ?? ""}`.trim()}
      aria-label="Cephlo Hack FW wallpaper"
    >
      <div className="cephlo-wallpaper-stack__ground" aria-hidden>
        <canvas
          ref={groundCanvasRef}
          className="cephlo-wallpaper-ground-canvas"
          width={BASE_WIDTH}
          height={BASE_HEIGHT}
        />
      </div>
      <div className="cephlo-wallpaper-stack__lockup">
        {/* Native img keeps the lockup at its pixel size. Do not route it through Image. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="cephlo-wallpaper-mark"
          src={CEPHLO_LOCKUP_SRC}
          width={CEPHLO_LOCKUP_W}
          height={CEPHLO_LOCKUP_H}
          alt=""
          draggable={false}
          style={{
            left: lockupRect.x,
            top: lockupRect.y,
            width: lockupRect.w,
            height: lockupRect.h,
            opacity: 1,
          }}
        />
        <div className="cephlo-wallpaper-type" data-cephlo-display="universal-sans">
          <p className="cephlo-wallpaper-type__headline">{headlineText}</p>
          {upNextText.trim() ? (
            <p className="cephlo-wallpaper-type__subline">{upNextText}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export async function exportCephloHackFwWallpaperLoop({
  width = BASE_WIDTH,
  height = BASE_HEIGHT,
  loopSeconds = DEFAULT_LOOP_SECONDS,
  headlineText = CEPHLO_DEFAULT_HEADLINE,
  upNextText = CEPHLO_DEFAULT_UP_NEXT,
}: {
  width?: number;
  height?: number;
  loopSeconds?: number;
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
    await document.fonts.load(`400 ${CEPHLO_DISPLAY_FONT_PX}px ${CEPHLO_SANS_FAMILY}`);
    await document.fonts.load(`300 ${CEPHLO_SUBLINE_FONT_PX}px ${CEPHLO_SANS_FAMILY}`);
    await document.fonts.ready;
  }

  await loadCephloLogo();

  const outCanvas = document.createElement("canvas");
  outCanvas.width = BASE_WIDTH;
  outCanvas.height = BASE_HEIGHT;

  const outCtx = outCanvas.getContext("2d");
  if (!outCtx) throw new Error("Could not create a 2D canvas context.");

  const fontFamily = resolveFontFamily(document.querySelector(".cephlo-demo"));
  const ground = snapshotGroundCanvas(document.querySelector(".cephlo-wallpaper-stack"));

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
      outCtx.setTransform(1, 0, 0, 1, 0, 0);
      outCtx.fillStyle = STAGE_FALLBACK;
      outCtx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
      const liveGround =
        snapshotGroundCanvas(document.querySelector(".cephlo-wallpaper-stack")) ?? ground;
      if (liveGround) {
        outCtx.drawImage(liveGround, 0, 0, BASE_WIDTH, BASE_HEIGHT);
      }

      renderForegroundFrame(outCtx, width, height, fontFamily, headlineText, upNextText);
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

export { runCephloTypeLock, publishCephloDisplayPx };
