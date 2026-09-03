"use client";

import { useCallback, useEffect, useRef } from "react";
import { DALLAS_SANS_FAMILY } from "./dallas-fonts";
import {
  AXIS_TILT_DEG,
  DEFAULT_LOOP_SECONDS,
  DEFAULT_WHIP_SECONDS,
  kickProgress,
  kickWobbleRad,
  streamPhase,
  whipEnergy,
} from "./globe-motion";
import {
  bodyOutline,
  maxOutlineRadius,
  traceBodyPath,
} from "./grok-bodies";
import {
  DALLAS_EYE_WHITE,
  DALLAS_MARK_INK,
  DALLAS_PAPER,
  grokCyclePose,
} from "./grok-cycle";
import { eyeWhipAt } from "./grok-eyes";
import {
  DALLAS_DISPLAY_FONT_PX,
  DALLAS_DISPLAY_TRACKING_PX,
  displayRenderedPx,
  publishDallasDisplayPx,
  runDallasTypeLock,
} from "./type-lock";
import { drawWorkingOrbits } from "./working-orbits";

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;
const FPS = 30;
const CURSOR_PATH =
  "M457.43,125.94L244.42,2.96c-6.84-3.95-15.28-3.95-22.12,0L9.3,125.94c-5.75,3.32-9.3,9.46-9.3,16.11v247.99c0,6.65,3.55,12.79,9.3,16.11l213.01,122.98c6.84,3.95,15.28,3.95,22.12,0l213.01-122.98c5.75-3.32,9.3,9.46,9.3,16.11v-247.99c0-6.65-3.55-12.79-9.3-16.11h-.01ZM444.05,151.99l-205.63,356.16c-1.39,2.4-5.06,1.42-5.06-1.36v-233.21c0-4.66-2.49-8.97-6.53-11.31L24.87,145.67c-2.4-1.39-1.42-5.06,1.36-5.06h411.26c5.84,0,9.49,6.33,6.57,11.39h-.01Z";

const CURSOR_VB_W = 466.73;
const CURSOR_VB_H = 532.09;
const CURSOR_ASPECT = CURSOR_VB_W / CURSOR_VB_H;

const AXIS_TILT = (AXIS_TILT_DEG * Math.PI) / 180;
const CURSOR_H_PX = 280;
const GROK_FACE_PX = 300;
const MARK_GAP_PX = 120;
const PAIR_LIFT_PX = 70;

const EYE_W_FACE = 0.13;
const EYE_H_FACE = 0.3;
const EYE_GAP_FACE = 0.09;

const HORIZON_SRC = "/images/dallas-noun-3583788.png";

const BAYER8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
] as const;

type ExportResult = {
  blob: Blob;
  mimeType: string;
  extension: "mp4" | "webm";
  codec: string;
};

const DEFAULT_SANS = DALLAS_SANS_FAMILY;

export type DallasMeetupWallpaperProps = {
  reducedMotion?: boolean;
  playing?: boolean;
  timeSeconds?: number;
  onFrameTime?: (seconds: number) => void;
  loopSeconds?: number;
  whipSeconds?: number;
  linearSpin?: boolean;
  showSkyline?: boolean;
  /** Bump to restart the 8s clock (Replay while already playing). */
  resetNonce?: number;
  className?: string;
};

let horizonSource: HTMLImageElement | null = null;
let horizonPlate: HTMLCanvasElement | null = null;

function ensureHorizon(onReady?: () => void): HTMLCanvasElement | null {
  if (typeof Image === "undefined") return null;
  if (horizonPlate) return horizonPlate;
  if (!horizonSource) {
    horizonSource = new Image();
    horizonSource.decoding = "async";
    horizonSource.src = HORIZON_SRC;
    horizonSource.onload = () => {
      horizonPlate = stampHorizon(horizonSource!);
      onReady?.();
    };
  } else if (horizonSource.complete && horizonSource.naturalWidth > 0) {
    horizonPlate = stampHorizon(horizonSource);
  }
  return horizonPlate;
}

function stampHorizon(img: HTMLImageElement): HTMLCanvasElement {
  const src = document.createElement("canvas");
  src.width = img.naturalWidth;
  src.height = img.naturalHeight;
  const sctx = src.getContext("2d");
  if (!sctx) return src;
  sctx.drawImage(img, 0, 0);
  const pixels = sctx.getImageData(0, 0, src.width, src.height);
  const { data, width, height } = pixels;
  let minY = height;
  let maxY = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const a = data[i + 3]!;
      if (a < 8) continue;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      const threshold = BAYER8[y & 7]![x & 7]! / 64;
      if (a < 220 && a / 255 < threshold * 0.45 + 0.2) {
        data[i + 3] = 0;
        continue;
      }
      data[i] = 0x11;
      data[i + 1] = 0x11;
      data[i + 2] = 0x11;
      data[i + 3] = 255;
    }
  }
  sctx.putImageData(pixels, 0, 0);
  const cropTop = Math.max(0, minY - 4);
  const cropH = Math.max(1, maxY - cropTop + 5);
  const cropped = document.createElement("canvas");
  cropped.width = width;
  cropped.height = cropH;
  const cctx = cropped.getContext("2d");
  cctx?.drawImage(src, 0, cropTop, width, cropH, 0, 0, width, cropH);
  return cropped;
}

function resolveDallasFontFamily(el: Element | null): string {
  if (el instanceof HTMLElement && el.isConnected) {
    const token = getComputedStyle(el).getPropertyValue("--dallas-font").trim();
    if (token) return token;
  }
  return DEFAULT_SANS;
}

function drawTrackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
) {
  let cursor = x;
  for (const glyph of text) {
    ctx.fillText(glyph, cursor, y);
    cursor += ctx.measureText(glyph).width + tracking;
  }
}

function drawDallasHorizon(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const plate = ensureHorizon();
  if (!plate) return;
  const destW = width * 0.72;
  const destH = destW * (plate.height / plate.width);
  const dx = (width - destW) * 0.5;
  const dy = height - destH - height * 0.04;
  ctx.drawImage(plate, dx, dy, destW, destH);
}

function drawStadiumEyes(
  ctx: CanvasRenderingContext2D,
  faceD: number,
  pose: { tilt: number; cx: number; cy: number; squashX?: number },
) {
  const R = faceD * 0.5;
  const ew = faceD * EYE_W_FACE;
  const eh = faceD * EYE_H_FACE;
  const gap = faceD * EYE_GAP_FACE;
  const squashX = pose.squashX ?? 1;
  ctx.save();
  ctx.translate(pose.cx * R, pose.cy * R);
  ctx.scale(squashX, 1);
  ctx.rotate(pose.tilt);
  ctx.fillStyle = DALLAS_EYE_WHITE;
  const drawOne = (ox: number) => {
    ctx.save();
    ctx.translate(ox, 0);
    const r = Math.min(ew, eh) * 0.5;
    ctx.beginPath();
    ctx.roundRect(-ew * 0.5, -eh * 0.5, ew, eh, r);
    ctx.fill();
    ctx.restore();
  };
  drawOne(-gap * 0.5);
  drawOne(gap * 0.5);
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
  linearSpin: boolean,
  reducedMotion: boolean,
) {
  const pose = grokCyclePose(elapsed, loopSeconds, whipSeconds, reducedMotion);
  const radii = bodyOutline(pose.fromShape, pose.toShape, pose.morphT);
  const R = faceD * 0.5;
  const bodyR = maxOutlineRadius(radii) * R;
  const spin = streamPhase(elapsed, loopSeconds, whipSeconds, linearSpin, reducedMotion);
  const energy = whipEnergy(elapsed, loopSeconds, whipSeconds, linearSpin, reducedMotion);
  const progress = kickProgress(elapsed, loopSeconds, whipSeconds, linearSpin, reducedMotion);
  const eyes = eyeWhipAt(elapsed, loopSeconds, whipSeconds, linearSpin, reducedMotion);
  const wobble = kickWobbleRad(energy, progress);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(AXIS_TILT + wobble);

  // Back stream first — occluded by the planted fill, peeks past the silhouette.
  drawWorkingOrbits(ctx, bodyR, faceD, energy, spin, "back");

  ctx.fillStyle = pose.fill;
  traceBodyPath(ctx, radii, R);
  ctx.fill();

  ctx.save();
  traceBodyPath(ctx, radii, R);
  ctx.clip();
  if (eyes.visible) {
    drawStadiumEyes(ctx, faceD, eyes);
  }
  // Front stream clipped to the morphing body — crosses the face, then leaves.
  drawWorkingOrbits(ctx, bodyR, faceD, energy, spin, "front");
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
  linearSpin: boolean,
  showSkyline: boolean,
  fontFamily: string,
) {
  const scale = width / BASE_WIDTH;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = DALLAS_PAPER;
  ctx.fillRect(0, 0, width, height);

  if (showSkyline) {
    drawDallasHorizon(ctx, width, height);
  }

  const centerX = width * 0.5;
  const marksBaseY = height * 0.5 - PAIR_LIFT_PX * scale;
  const cursorH = CURSOR_H_PX * scale;
  const cursorW = cursorH * CURSOR_ASPECT;
  const grokSize = GROK_FACE_PX * scale;
  const markGap = MARK_GAP_PX * scale;
  const groupWidth = cursorW + grokSize + markGap;
  const cursorX = centerX - groupWidth * 0.5 + cursorW * 0.5;
  const grokX = centerX + groupWidth * 0.5 - grokSize * 0.5;

  ctx.save();
  ctx.translate(cursorX, marksBaseY);
  const cursorUniformScale = cursorH / CURSOR_VB_H;
  ctx.scale(cursorUniformScale, cursorUniformScale);
  ctx.translate(-CURSOR_VB_W * 0.5, -CURSOR_VB_H * 0.5);
  ctx.fillStyle = DALLAS_MARK_INK;
  ctx.fill(new Path2D(CURSOR_PATH));
  ctx.restore();

  drawGrokBody(
    ctx,
    grokX,
    marksBaseY,
    grokSize,
    elapsed,
    loopSeconds,
    whipSeconds,
    linearSpin,
    reducedMotion,
  );

  ctx.fillStyle = DALLAS_MARK_INK;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const fontSize = DALLAS_DISPLAY_FONT_PX * scale;
  ctx.font = `400 ${fontSize}px ${fontFamily}`;
  const label = "Dallas meetup";
  const tracking = DALLAS_DISPLAY_TRACKING_PX * scale;
  const labelWidth =
    ctx.measureText(label).width + tracking * Math.max(0, label.length - 1);
  drawTrackedText(
    ctx,
    label,
    centerX - labelWidth * 0.5,
    marksBaseY + grokSize * 0.72,
    tracking,
  );
}

export function DallasMeetupWallpaper({
  reducedMotion = false,
  playing = true,
  timeSeconds,
  onFrameTime,
  loopSeconds = DEFAULT_LOOP_SECONDS,
  whipSeconds = DEFAULT_WHIP_SECONDS,
  linearSpin = false,
  showSkyline = true,
  resetNonce = 0,
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
        linearSpin,
        showSkyline,
        resolveDallasFontFamily(canvas),
      );
    },
    [reducedMotion, loopSeconds, whipSeconds, linearSpin, showSkyline],
  );

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
    ensureHorizon(() => drawAtTime(timeSeconds ?? pausedAtRef.current));
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
  linearSpin = false,
  showSkyline = true,
}: {
  width?: number;
  height?: number;
  loopSeconds?: number;
  whipSeconds?: number;
  linearSpin?: boolean;
  showSkyline?: boolean;
} = {}): Promise<ExportResult> {
  if (typeof window === "undefined") {
    throw new Error("Export is only available in the browser.");
  }
  if (typeof MediaRecorder === "undefined") {
    throw new Error("MediaRecorder is not available in this browser.");
  }

  if (document.fonts) {
    await document.fonts.load(`400 ${DALLAS_DISPLAY_FONT_PX}px ${DEFAULT_SANS}`);
    await document.fonts.ready;
  }
  ensureHorizon();
  if (horizonSource && !horizonSource.complete) {
    await new Promise<void>((resolve) => {
      horizonSource!.onload = () => {
        horizonPlate = stampHorizon(horizonSource!);
        resolve();
      };
      horizonSource!.onerror = () => resolve();
    });
  } else if (horizonSource?.complete) {
    horizonPlate = stampHorizon(horizonSource);
  }

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
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 14_000_000 });
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
        linearSpin,
        showSkyline,
        resolveDallasFontFamily(document.querySelector(".dallas-demo")),
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
