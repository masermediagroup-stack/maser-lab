"use client";

import { useCallback, useEffect, useRef } from "react";
import { DALLAS_SANS_FAMILY } from "./dallas-fonts";
import {
  DEFAULT_LOOP_SECONDS,
  DEFAULT_WHIP_SECONDS,
  cursorWhipRad,
  streamPhase,
  whipEnergy,
} from "./globe-motion";
import {
  DALLAS_EYE_WHITE,
  DALLAS_GROK_BLACK,
  DALLAS_MARK_INK,
  DALLAS_PAPER,
  kickRibbonPlan,
} from "./grok-cycle";
import { eyesAt, type EyePose } from "./grok-eyes";
import {
  CURSOR_ASPECT,
  CURSOR_FILL_RULE,
  CURSOR_PATH,
  CURSOR_VB_H,
  CURSOR_VB_W,
} from "./official-marks";
import {
  DALLAS_DISPLAY_FONT_PX,
  DALLAS_DISPLAY_TRACKING_PX,
  displayRenderedPx,
  publishDallasDisplayPx,
  runDallasTypeLock,
} from "./type-lock";
import { WORKING_ORBIT_COUNT, drawWorkingOrbits } from "./working-orbits";

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;
const FPS = 30;

const CURSOR_H_PX = 280;
const GROK_FACE_PX = 300;
const MARK_GAP_PX = 120;
const PAIR_LIFT_PX = 70;

/** Stadium size as a fraction of face diameter — article Idle/Working. */
const EYE_W_FACE = 0.12;
const EYE_H_FACE = 0.3;

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
  /** Bump to restart the 8s clock (Replay while already playing). */
  resetNonce?: number;
  className?: string;
};

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

function drawOneStadium(ctx: CanvasRenderingContext2D, faceD: number, pose: EyePose) {
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

function traceDisc(ctx: CanvasRenderingContext2D, radius: number) {
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
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
  const R = faceD * 0.5;
  const ribbonPhase = streamPhase(elapsed, loopSeconds, whipSeconds, reducedMotion);
  const energy = whipEnergy(elapsed, loopSeconds, whipSeconds, reducedMotion);
  const plan = kickRibbonPlan(elapsed, loopSeconds, WORKING_ORBIT_COUNT);
  const pair = eyesAt(elapsed, loopSeconds, whipSeconds, reducedMotion);

  ctx.save();
  ctx.translate(cx, cy);

  const gazeCy = (pair.left.cy + pair.right.cy) * 0.5;
  drawWorkingOrbits(ctx, R, faceD, energy, ribbonPhase, "back", plan, gazeCy);

  ctx.fillStyle = DALLAS_GROK_BLACK;
  traceDisc(ctx, R);
  ctx.fill();

  ctx.save();
  traceDisc(ctx, R);
  ctx.clip();
  drawOneStadium(ctx, faceD, pair.left);
  drawOneStadium(ctx, faceD, pair.right);
  drawWorkingOrbits(ctx, R, faceD, energy, ribbonPhase, "front", plan, gazeCy);
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
) {
  const scale = width / BASE_WIDTH;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = DALLAS_PAPER;
  ctx.fillRect(0, 0, width, height);

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
  ctx.rotate(cursorWhipRad(elapsed, loopSeconds, whipSeconds, reducedMotion));
  const cursorUniformScale = cursorH / CURSOR_VB_H;
  ctx.scale(cursorUniformScale, cursorUniformScale);
  ctx.translate(-CURSOR_VB_W * 0.5, -CURSOR_VB_H * 0.5);
  ctx.fillStyle = DALLAS_MARK_INK;
  ctx.fill(new Path2D(CURSOR_PATH), CURSOR_FILL_RULE);
  ctx.restore();

  drawGrokBody(
    ctx,
    grokX,
    marksBaseY,
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
        resolveDallasFontFamily(canvas),
      );
    },
    [reducedMotion, loopSeconds, whipSeconds],
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
}: {
  width?: number;
  height?: number;
  loopSeconds?: number;
  whipSeconds?: number;
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
