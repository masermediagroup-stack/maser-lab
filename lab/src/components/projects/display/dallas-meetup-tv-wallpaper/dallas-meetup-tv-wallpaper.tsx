"use client";

import { useCallback, useEffect, useRef } from "react";

const LOOP_SECONDS = 8;
const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;
const FPS = 30;
const TOTAL_FRAMES = LOOP_SECONDS * FPS;
// Single normalized ink for Cursor, Grok face, and the type.
// Matches Cursor brand-kit light mark ink.
const INK_HEX = "#26251e";
const PAPER_HEX = "#FFFFFF";
const CURSOR_PATH =
  "M457.43,125.94L244.42,2.96c-6.84-3.95-15.28-3.95-22.12,0L9.3,125.94c-5.75,3.32-9.3,9.46-9.3,16.11v247.99c0,6.65,3.55,12.79,9.3,16.11l213.01,122.98c6.84,3.95,15.28,3.95,22.12,0l213.01-122.98c5.75-3.32,9.3-9.46,9.3-16.11v-247.99c0-6.65-3.55-12.79-9.3-16.11h-.01ZM444.05,151.99l-205.63,356.16c-1.39,2.4-5.06,1.42-5.06-1.36v-233.21c0-4.66-2.49-8.97-6.53-11.31L24.87,145.67c-2.4-1.39-1.42-5.06,1.36-5.06h411.26c5.84,0,9.49,6.33,6.57,11.39h-.01Z";

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
  className?: string;
};

function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

function easeInOutCubic(t: number) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function segmentEnvelope(
  time: number,
  start: number,
  holdStart: number,
  holdEnd: number,
  end: number,
) {
  if (time <= start || time >= end) return 0;
  if (time < holdStart) {
    return easeInOutCubic((time - start) / (holdStart - start));
  }
  if (time <= holdEnd) return 1;
  return 1 - easeInOutCubic((time - holdEnd) / (end - holdEnd));
}

function blinkScale(
  time: number,
  start: number,
  end: number,
  minScale = 0.08,
  closeFraction = 0.36,
) {
  if (time < start || time > end) return 1;
  const duration = end - start;
  const closeEnd = start + duration * closeFraction;
  if (time <= closeEnd) {
    const t = (time - start) / (closeEnd - start);
    return lerp(1, minScale, easeInOutCubic(t));
  }
  const t = (time - closeEnd) / (end - closeEnd);
  return lerp(minScale, 1, easeInOutCubic(t));
}

function pingPongScaleY(time: number, start: number, end: number) {
  if (time < start || time > end) return 1;
  const t = (time - start) / (end - start);
  if (t < 0.4) return lerp(1, 0.97, easeInOutCubic(t / 0.4));
  if (t < 0.75) return lerp(0.97, 1.02, easeInOutCubic((t - 0.4) / 0.35));
  return lerp(1.02, 1, easeInOutCubic((t - 0.75) / 0.25));
}

function drawTrackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
) {
  let cursor = x;
  const glyphs = text.split("");
  for (const glyph of glyphs) {
    ctx.fillText(glyph, cursor, y);
    cursor += ctx.measureText(glyph).width + tracking;
  }
}

function renderFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  reducedMotion: boolean,
) {
  const scale = width / BASE_WIDTH;
  const ink = INK_HEX;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = PAPER_HEX;
  ctx.fillRect(0, 0, width, height);

  const centerX = width * 0.5;
  const centerY = height * 0.47;
  const cursorSize = 280 * scale;
  const grokSize = 300 * scale;
  const markGap = cursorSize * 0.45;
  const groupWidth = cursorSize + grokSize + markGap;
  const cursorX = centerX - groupWidth * 0.5 + cursorSize * 0.5;
  const grokX = centerX + groupWidth * 0.5 - grokSize * 0.5;

  const cycle = (time / LOOP_SECONDS) * Math.PI * 2;
  const floatAmp = reducedMotion ? 0 : 8 * scale;
  const cursorFloatY = reducedMotion ? 0 : -Math.sin(cycle) * floatAmp;
  const grokFloatY = reducedMotion ? 0 : Math.sin(cycle) * floatAmp;
  const baseCursorTilt = reducedMotion ? 0 : Math.sin(cycle) * 1.2;

  const glanceLeftWeight = reducedMotion
    ? 0
    : segmentEnvelope(time, 2.0, 3.4, 4.6, 5.6);
  const eyeOffsetX = reducedMotion ? 0 : lerp(0, -12 * scale, glanceLeftWeight);
  const eyeOffsetY = reducedMotion ? 0 : lerp(0, 2 * scale, glanceLeftWeight);

  const cursorAnswerTilt = reducedMotion ? 0 : -2 * glanceLeftWeight;
  const cursorTiltDeg = baseCursorTilt + cursorAnswerTilt;

  // Tiny squash/stretch right after the wink; must settle by t=8.
  const grokScaleY = reducedMotion ? 1 : pingPongScaleY(time, 7.4, 7.92);

  const rightEyeScale = reducedMotion
    ? 1
    : (() => {
        const singleA = blinkScale(time, 1.15, 1.32);
        const singleB = blinkScale(time, 3.55, 3.72);
        const doubleA = blinkScale(time, 6.05, 6.19);
        const doubleB = blinkScale(time, 6.22, 6.42);
        return Math.min(singleA, singleB, doubleA, doubleB);
      })();

  const leftEyeScale = reducedMotion
    ? 1
    : (() => {
        const singleA = blinkScale(time, 1.15, 1.32);
        const singleB = blinkScale(time, 3.55, 3.72);
        const doubleA = blinkScale(time, 6.05, 6.19);
        const doubleB = blinkScale(time, 6.22, 6.42);
        const right = Math.min(singleA, singleB, doubleA, doubleB);
        const leftWink = blinkScale(time, 7.15, 7.38);
        return Math.min(right, leftWink);
      })();

  const marksBaseY = centerY;

  ctx.save();
  ctx.translate(cursorX, marksBaseY + cursorFloatY);
  ctx.rotate((cursorTiltDeg * Math.PI) / 180);
  ctx.scale(cursorSize / 466.73, cursorSize / 532.09);
  ctx.translate(-233.365, -266.045);
  ctx.fillStyle = ink;
  ctx.fill(new Path2D(CURSOR_PATH));
  ctx.restore();

  ctx.save();
  ctx.translate(grokX, marksBaseY + grokFloatY);
  ctx.scale(1, grokScaleY);

  ctx.fillStyle = ink;
  const inset = grokSize * 0.02;
  const r = grokSize * 0.5 - inset;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  const eyeW = grokSize * 0.13;
  const eyeH = grokSize * 0.3;
  const eyeGap = grokSize * 0.09;
  const eyePairCenterX = 0;
  const eyePairCenterY = -grokSize * 0.08;
  const leftCenterX = eyePairCenterX - (eyeGap + eyeW) * 0.5;
  const rightCenterX = eyePairCenterX + (eyeGap + eyeW) * 0.5;
  const eyeCenterY = eyePairCenterY;

  const rot = (28 * Math.PI) / 180;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);

  const pairCenterWithOffsetX = eyePairCenterX + eyeOffsetX;
  const pairCenterWithOffsetY = eyePairCenterY + eyeOffsetY;

  const drawEye = (x: number, y: number, yScale: number) => {
    const localX = x + eyeOffsetX;
    const localY = y + eyeOffsetY;
    const dx = localX - pairCenterWithOffsetX;
    const dy = localY - pairCenterWithOffsetY;
    const rx = pairCenterWithOffsetX + dx * cos - dy * sin;
    const ry = pairCenterWithOffsetY + dx * sin + dy * cos;

    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(rot);
    ctx.scale(1, yScale);
    ctx.fillStyle = PAPER_HEX;
    ctx.beginPath();
    ctx.roundRect(-eyeW * 0.5, -eyeH * 0.5, eyeW, eyeH, eyeW * 0.5);
    ctx.fill();
    ctx.restore();
  };

  drawEye(leftCenterX, eyeCenterY, leftEyeScale);
  drawEye(rightCenterX, eyeCenterY, rightEyeScale);

  ctx.restore();

  ctx.fillStyle = ink;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const fontSize = 56 * scale;
  ctx.font = `500 ${fontSize}px \"IBM Plex Sans Condensed\", \"Arial Narrow\", \"Nimbus Sans Narrow\", \"Helvetica Neue\", sans-serif`;
  const label = "Dallas meetup";
  const tracking = 1.3 * scale;
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

      const width = canvas.width;
      const height = canvas.height;
      renderFrame(ctx, width, height, time, reducedMotion);
    },
    [reducedMotion],
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

      const activeTime = timeSeconds ?? pausedAtRef.current;
      drawAtTime(activeTime);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement ?? canvas);
    window.addEventListener("resize", resize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [drawAtTime, timeSeconds]);

  useEffect(() => {
    if (typeof timeSeconds === "number") {
      const normalized = ((timeSeconds % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS;
      pausedAtRef.current = normalized;
      drawAtTime(normalized);
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
      const time = reducedMotion ? 0 : elapsed % LOOP_SECONDS;
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
  }, [drawAtTime, onFrameTime, playing, reducedMotion, timeSeconds]);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        className="dallas-wallpaper-canvas"
        aria-label="Dallas meetup wallpaper"
      />
    </div>
  );
}

export async function exportDallasMeetupWallpaperLoop({
  width = BASE_WIDTH,
  height = BASE_HEIGHT,
}: {
  width?: number;
  height?: number;
} = {}): Promise<ExportResult> {
  if (typeof window === "undefined") {
    throw new Error("Export is only available in the browser.");
  }
  if (typeof MediaRecorder === "undefined") {
    throw new Error("MediaRecorder is not available in this browser.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create a 2D canvas context.");
  }

  const mp4Mime = "video/mp4;codecs=avc1.42E01E";
  const webmMime = "video/webm;codecs=vp9";
  const fallbackWebm = "video/webm";

  const mimeType = MediaRecorder.isTypeSupported(mp4Mime)
    ? mp4Mime
    : MediaRecorder.isTypeSupported(webmMime)
      ? webmMime
      : fallbackWebm;

  const extension: "mp4" | "webm" = mimeType.startsWith("video/mp4")
    ? "mp4"
    : "webm";

  const stream = canvas.captureStream(0);
  const [videoTrack] = stream.getVideoTracks();
  if (!videoTrack) {
    throw new Error("Could not capture canvas stream track.");
  }
  const controlledTrack = videoTrack as CanvasCaptureMediaStreamTrack;

  const chunks: BlobPart[] = [];

  await new Promise<void>((resolve, reject) => {
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 14_000_000,
    });

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onerror = () => reject(new Error("Recording failed."));
    recorder.onstop = () => resolve();

    recorder.start();

    let frame = 0;
    const recordFrame = () => {
      if (frame >= TOTAL_FRAMES) {
        recorder.stop();
        return;
      }
      const t = frame / FPS;
      renderFrame(ctx, width, height, t, false);
      controlledTrack.requestFrame();
      frame += 1;
      window.setTimeout(recordFrame, 1000 / FPS);
    };

    recordFrame();
  });

  videoTrack.stop();

  return {
    blob: new Blob(chunks, { type: mimeType }),
    mimeType,
    extension,
    codec: mimeType,
  };
}
