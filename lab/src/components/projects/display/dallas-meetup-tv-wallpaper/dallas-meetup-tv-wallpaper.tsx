"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  DALLAS_DEFAULT_HEADLINE,
  DALLAS_DEFAULT_UP_NEXT,
  DALLAS_PLEX_FAMILY,
  DALLAS_SANS_FAMILY,
} from "./dallas-fonts";
import {
  DEFAULT_LOOP_SECONDS,
  DEFAULT_WHIP_SECONDS,
  DALLAS_WALLPAPER_FPS,
} from "./globe-motion";
import { bodyOutline, outlineFitScale, traceBodyPath } from "./grok-bodies";
import {
  DALLAS_EYE_WHITE,
  DALLAS_MARK_INK,
  DALLAS_PAPER,
  grokCyclePose,
  pickRedBody,
  type GrokShapeId,
} from "./grok-cycle";
import {
  EYE_H_FACE,
  EYE_W_FACE,
  FACE_DISC_R,
  eyesAt,
  type EyePose,
} from "./grok-eyes";
import {
  GROK_Y_NUDGE_PX,
  SPACEXAI_ASPECT,
  drawSpacexaiMark,
  preloadSpacexaiLogo,
  spacexaiLogoImage,
} from "./spacexai-mark";
import {
  drawTextRandomFade,
  DALLAS_SUBHEADING_FADE_PLAY_KEY,
  DEFAULT_RANDOM_LETTER_FADE,
  headlineTextAnchorX,
} from "./dallas-text-animation";
import {
  DALLAS_BODY_FONT_PX,
  DALLAS_BODY_FONT_WEIGHT,
  DALLAS_DISPLAY_FONT_PX,
  DALLAS_DISPLAY_TRACKING_PX,
  displayRenderedPx,
  publishDallasDisplayPx,
  runDallasTypeLock,
} from "./type-lock";

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;
const FPS = DALLAS_WALLPAPER_FPS;

const CURSOR_H_PX = 280;
/** Shared mark box. Grok fits inside this — same height as the Cursor cube. */
const MARK_BOX_PX = CURSOR_H_PX;
const MARK_GAP_PX = 120;
const PAIR_LIFT_PX = 70;

type ExportResult = {
  blob: Blob;
  mimeType: string;
  extension: "mp4" | "webm";
  codec: string;
};

const DEFAULT_SANS = DALLAS_SANS_FAMILY;

/**
 * One of the four remaining morph bodies draws Red `#FF263C` this boot.
 * Picked once at seed. Does not bring the Pill shape back.
 */
const SEEDED_RED_BODY: GrokShapeId = pickRedBody();

export type DallasMeetupWallpaperProps = {
  reducedMotion?: boolean;
  playing?: boolean;
  timeSeconds?: number;
  onFrameTime?: (seconds: number) => void;
  loopSeconds?: number;
  whipSeconds?: number;
  /** Bump to restart the loop clock (Replay while already playing). */
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
  return DEFAULT_SANS;
}

function resolvePlexFontFamily(el: Element | null): string {
  if (el instanceof HTMLElement && el.isConnected) {
    const token = getComputedStyle(el).getPropertyValue("--dallas-font-ui").trim();
    if (token) return token;
  }
  return DALLAS_PLEX_FAMILY;
}

function drawOneStadium(
  ctx: CanvasRenderingContext2D,
  faceD: number,
  pose: EyePose,
) {
  const R = faceD * 0.5;
  const ew = faceD * EYE_W_FACE;
  const eh = faceD * EYE_H_FACE;
  ctx.save();
  ctx.translate(pose.cx * R, pose.cy * R);
  ctx.rotate(pose.tilt);
  ctx.scale(1, pose.scaleY);
  ctx.fillStyle = DALLAS_EYE_WHITE;
  const r = Math.min(ew, eh) * 0.5;
  ctx.beginPath();
  ctx.roundRect(-ew * 0.5, -eh * 0.5, ew, eh, r);
  ctx.fill();
  ctx.restore();
}

function drawGrokBody(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  faceD: number,
  elapsed: number,
  loopSeconds: number,
  whipSeconds: number,
  reducedMotion: boolean,
) {
  const pose = grokCyclePose(
    elapsed,
    loopSeconds,
    whipSeconds,
    reducedMotion,
    SEEDED_RED_BODY,
  );
  const radii = bodyOutline(pose.fromShape, pose.toShape, pose.morphT);
  const fit = outlineFitScale(radii);
  const R = faceD * 0.5 * fit;
  const pair = eyesAt(elapsed, loopSeconds, whipSeconds, reducedMotion);

  ctx.save();
  ctx.translate(cx, cy);

  ctx.fillStyle = pose.fill;
  traceBodyPath(ctx, radii, R);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, R * FACE_DISC_R, 0, Math.PI * 2);
  ctx.clip();
  const fittedD = faceD * fit;
  drawOneStadium(ctx, fittedD, pair.left);
  drawOneStadium(ctx, fittedD, pair.right);
  ctx.restore();

  ctx.restore();
}

function renderFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
  reducedMotion: boolean,
  loopSeconds: number,
  whipSeconds: number,
  fontFamily: string,
  plexFontFamily: string,
  headlineText: string,
  upNextText: string,
) {
  const scale = width / BASE_WIDTH;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = DALLAS_PAPER;
  ctx.fillRect(0, 0, width, height);

  const centerX = width * 0.5;
  const marksBaseY = height * 0.5 - PAIR_LIFT_PX * scale;
  const logoH = CURSOR_H_PX * scale;
  const logoW = logoH * SPACEXAI_ASPECT;
  const grokSize = MARK_BOX_PX * scale;
  const markGap = MARK_GAP_PX * scale;
  const groupWidth = logoW + grokSize + markGap;
  const logoX = centerX - groupWidth * 0.5 + logoW * 0.5;
  const cursorLeftX = headlineTextAnchorX(logoX, logoW);
  const grokX = centerX + groupWidth * 0.5 - grokSize * 0.5;
  const grokY = marksBaseY + GROK_Y_NUDGE_PX * scale;

  const logo = spacexaiLogoImage();
  if (logo) {
    drawSpacexaiMark(
      ctx,
      logo,
      logoX,
      marksBaseY,
      logoW,
      logoH,
      elapsed,
      loopSeconds,
      whipSeconds,
      reducedMotion,
    );
  }

  drawGrokBody(
    ctx,
    grokX,
    grokY,
    grokSize,
    elapsed,
    loopSeconds,
    whipSeconds,
    reducedMotion,
  );

  ctx.fillStyle = DALLAS_MARK_INK;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const fontSize = DALLAS_DISPLAY_FONT_PX * scale;
  const headlineY = marksBaseY + grokSize * 0.72;
  ctx.font = `400 ${fontSize}px ${fontFamily}`;
  const tracking = DALLAS_DISPLAY_TRACKING_PX * scale;
  drawTextRandomFade(
    ctx,
    headlineText,
    cursorLeftX,
    headlineY,
    tracking,
    elapsed,
    loopSeconds,
    whipSeconds,
    reducedMotion,
  );

  const trimmedUpNext = upNextText.trim();
  if (trimmedUpNext) {
    const bodySize = DALLAS_BODY_FONT_PX * scale;
    const bodyGap = fontSize * 0.22;
    ctx.font = `${DALLAS_BODY_FONT_WEIGHT} ${bodySize}px ${plexFontFamily}`;
    drawTextRandomFade(
      ctx,
      trimmedUpNext,
      cursorLeftX,
      headlineY + fontSize + bodyGap,
      0,
      elapsed,
      loopSeconds,
      whipSeconds,
      reducedMotion,
      { ...DEFAULT_RANDOM_LETTER_FADE, playKey: DALLAS_SUBHEADING_FADE_PLAY_KEY },
    );
  }
}

export function DallasMeetupWallpaper({
  reducedMotion = false,
  playing = true,
  timeSeconds,
  onFrameTime,
  loopSeconds = DEFAULT_LOOP_SECONDS,
  whipSeconds = DEFAULT_WHIP_SECONDS,
  resetNonce = 0,
  headlineText = DALLAS_DEFAULT_HEADLINE,
  upNextText = DALLAS_DEFAULT_UP_NEXT,
  className,
}: DallasMeetupWallpaperProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const pausedAtRef = useRef(0);

  const drawAtTime = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      renderFrame(
        ctx,
        canvas.width,
        canvas.height,
        time,
        reducedMotion,
        loopSeconds,
        whipSeconds,
        resolveDallasFontFamily(canvas),
        resolvePlexFontFamily(canvas),
        headlineText,
        upNextText,
      );
    },
    [headlineText, reducedMotion, loopSeconds, upNextText, whipSeconds],
  );

  useEffect(() => {
    let cancelled = false;
    void preloadSpacexaiLogo().then(() => {
      if (!cancelled) drawAtTime(timeSeconds ?? pausedAtRef.current);
    });
    return () => {
      cancelled = true;
    };
  }, [drawAtTime, timeSeconds]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const bounds = parent.getBoundingClientRect();
      const ratio = BASE_WIDTH / BASE_HEIGHT;
      const fitW = bounds.width;
      const fitH = bounds.height;
      let drawW = fitW;
      let drawH = fitW / ratio;
      if (drawH > fitH) {
        drawH = fitH;
        drawW = fitH * ratio;
      }
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(drawW * dpr));
      canvas.height = Math.max(1, Math.round(drawH * dpr));
      canvas.style.width = `${drawW}px`;
      canvas.style.height = `${drawH}px`;
      const host =
        canvas.closest<HTMLElement>(".dallas-demo") ?? canvas.parentElement ?? canvas;
      const displayPx = displayRenderedPx(drawW);
      publishDallasDisplayPx(host, displayPx);
      if (host.classList.contains("dallas-demo")) {
        runDallasTypeLock(host);
      }
      drawAtTime(timeSeconds ?? pausedAtRef.current);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement ?? canvas);
    window.addEventListener("resize", resize);
    const redrawOnFonts = () => drawAtTime(timeSeconds ?? pausedAtRef.current);
    if (document.fonts.status !== "loaded") {
      void document.fonts.ready.then(redrawOnFonts);
    }
    document.fonts.addEventListener("loadingdone", redrawOnFonts);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
      document.fonts.removeEventListener("loadingdone", redrawOnFonts);
    };
  }, [drawAtTime, timeSeconds]);

  useEffect(() => {
    pausedAtRef.current = 0;
    startRef.current = null;
  }, [resetNonce]);

  useEffect(() => {
    if (typeof timeSeconds === "number") {
      pausedAtRef.current = Math.max(0, timeSeconds);
      drawAtTime(pausedAtRef.current);
      return;
    }

    if (!playing) {
      drawAtTime(pausedAtRef.current);
      return;
    }

    const step = (now: number) => {
      if (startRef.current === null) {
        startRef.current = now - pausedAtRef.current * 1000;
      }
      const elapsed = (now - startRef.current) / 1000;
      const time = reducedMotion ? 0 : elapsed;
      pausedAtRef.current = time;
      drawAtTime(time);
      onFrameTime?.(time);
      rafRef.current = window.requestAnimationFrame(step);
    };

    rafRef.current = window.requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = null;
    };
  }, [drawAtTime, onFrameTime, playing, reducedMotion, timeSeconds, loopSeconds, resetNonce]);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        className="dallas-wallpaper-canvas"
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
  whipSeconds = DEFAULT_WHIP_SECONDS,
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
    await document.fonts.load(`400 ${DALLAS_DISPLAY_FONT_PX}px ${DEFAULT_SANS}`);
    await document.fonts.load(
      `${DALLAS_BODY_FONT_WEIGHT} ${DALLAS_BODY_FONT_PX}px ${DALLAS_PLEX_FAMILY}`,
    );
    await document.fonts.ready;
  }

  await preloadSpacexaiLogo();

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create a 2D canvas context.");

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

  const stream = canvas.captureStream(0);
  const [videoTrack] = stream.getVideoTracks();
  if (!videoTrack) throw new Error("Could not capture canvas stream track.");
  const controlledTrack = videoTrack as CanvasCaptureMediaStreamTrack;
  const chunks: BlobPart[] = [];

  await new Promise<void>((resolve, reject) => {
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 14_000_000 * (FPS / 30),
    });
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onerror = () => reject(new Error("Recording failed."));
    recorder.onstop = () => resolve();
    recorder.start();

    let frame = 0;
    const tick = () => {
      if (frame >= totalFrames) { recorder.stop(); return; }
      renderFrame(
        ctx,
        width,
        height,
        frame / FPS,
        false,
        loopSeconds,
        whipSeconds,
        resolveDallasFontFamily(document.querySelector(".dallas-demo")),
        resolvePlexFontFamily(document.querySelector(".dallas-demo")),
        headlineText,
        upNextText,
      );
      controlledTrack.requestFrame();
      frame += 1;
      window.setTimeout(tick, 1000 / FPS);
    };
    tick();
  });

  videoTrack.stop();
  return { blob: new Blob(chunks, { type: mimeType }), mimeType, extension, codec: mimeType };
}
