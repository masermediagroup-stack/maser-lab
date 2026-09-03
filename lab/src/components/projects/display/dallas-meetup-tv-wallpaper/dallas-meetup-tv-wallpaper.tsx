"use client";

import { useCallback, useEffect, useRef } from "react";

const DEFAULT_LOOP_SECONDS = 12;
const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;
const FPS = 30;
const INK_HEX = "#26251e";
const PAPER_HEX = "#FFFFFF";
const CURSOR_PATH =
  "M457.43,125.94L244.42,2.96c-6.84-3.95-15.28-3.95-22.12,0L9.3,125.94c-5.75,3.32-9.3,9.46-9.3,16.11v247.99c0,6.65,3.55,12.79,9.3,16.11l213.01,122.98c6.84,3.95,15.28,3.95,22.12,0l213.01-122.98c5.75-3.32,9.3-9.46,9.3-16.11v-247.99c0-6.65-3.55-12.79-9.3-16.11h-.01ZM444.05,151.99l-205.63,356.16c-1.39,2.4-5.06,1.42-5.06-1.36v-233.21c0-4.66-2.49-8.97-6.53-11.31L24.87,145.67c-2.4-1.39-1.42-5.06,1.36-5.06h411.26c5.84,0,9.49,6.33,6.57,11.39h-.01Z";

const CURSOR_VB_W = 466.73;
const CURSOR_VB_H = 532.09;
const CURSOR_ASPECT = CURSOR_VB_W / CURSOR_VB_H;

const AXIS_TILT_DEG = 18;
const AXIS_TILT = (AXIS_TILT_DEG * Math.PI) / 180;
const COS_TILT = Math.cos(AXIS_TILT);
const SIN_TILT = Math.sin(AXIS_TILT);

const MERIDIAN_COUNT = 12;
const PARALLEL_COUNT = 5;
const MERIDIAN_LINE_WIDTH_FRAC = 0.012;
const PARALLEL_LINE_WIDTH_FRAC = 0.007;

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
  faceForward?: boolean;
  className?: string;
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
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
  loopLen: number,
) {
  const s = (start / 8) * loopLen;
  const hs = (holdStart / 8) * loopLen;
  const he = (holdEnd / 8) * loopLen;
  const e = (end / 8) * loopLen;
  if (time <= s || time >= e) return 0;
  if (time < hs) return easeInOutCubic((time - s) / (hs - s));
  if (time <= he) return 1;
  return 1 - easeInOutCubic((time - he) / (e - he));
}

function blinkScale(
  time: number,
  start: number,
  end: number,
  loopLen: number,
  minScale = 0.08,
  closeFraction = 0.36,
) {
  const s = (start / 8) * loopLen;
  const e = (end / 8) * loopLen;
  if (time < s || time > e) return 1;
  const duration = e - s;
  const closeEnd = s + duration * closeFraction;
  if (time <= closeEnd) {
    const t = (time - s) / (closeEnd - s);
    return lerp(1, minScale, easeInOutCubic(t));
  }
  const t = (time - closeEnd) / (e - closeEnd);
  return lerp(minScale, 1, easeInOutCubic(t));
}

function pingPongScaleY(time: number, start: number, end: number, loopLen: number) {
  const s = (start / 8) * loopLen;
  const e = (end / 8) * loopLen;
  if (time < s || time > e) return 1;
  const t = (time - s) / (e - s);
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
  for (const glyph of text) {
    ctx.fillText(glyph, cursor, y);
    cursor += ctx.measureText(glyph).width + tracking;
  }
}

/**
 * Project a point on the unit sphere through the tilted-axis orthographic
 * projection. Returns screen-space [sx, sy, z] where z>0 is front hemisphere.
 */
function sphereProject(
  phi: number,
  lambda: number,
  theta: number,
  R: number,
): [number, number, number] {
  const cosP = Math.cos(phi);
  const sinP = Math.sin(phi);
  const lam = lambda + theta;
  const cosL = Math.cos(lam);
  const sinL = Math.sin(lam);

  const xWorld = cosP * sinL;
  const yWorld = sinP;
  const zWorld = cosP * cosL;

  const yTilted = yWorld * COS_TILT - zWorld * SIN_TILT;
  const zTilted = yWorld * SIN_TILT + zWorld * COS_TILT;

  return [R * xWorld, -R * yTilted, zTilted];
}

function drawGrokGlobe(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  R: number,
  theta: number,
  faceForward: boolean,
  eyeOffsetX: number,
  eyeOffsetY: number,
  leftEyeScale: number,
  rightEyeScale: number,
  grokScaleY: number,
  galaxyColors: string[],
  ink: string,
  paper: string,
  scale: number,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, grokScaleY);

  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.clip();

  const meridianLW = R * MERIDIAN_LINE_WIDTH_FRAC * 2;
  const parallelLW = R * PARALLEL_LINE_WIDTH_FRAC * 2;

  for (let i = 0; i < MERIDIAN_COUNT; i++) {
    const lam = (i / MERIDIAN_COUNT) * Math.PI * 2;
    const effLam = lam + theta;
    const sinEff = Math.sin(effLam);
    const cosEff = Math.cos(effLam);

    const semiMinor = R * Math.abs(sinEff);

    const ellipseCx = R * sinEff * COS_TILT * 0;
    const tiltAngle = -AXIS_TILT;

    const colorIdx = i % galaxyColors.length;

    const behindLimb = cosEff < 0;
    const opacity = behindLimb ? 0 : Math.min(1, Math.abs(cosEff) * 3);
    if (opacity <= 0.01) continue;

    ctx.save();
    ctx.globalAlpha = opacity * 0.7;
    ctx.strokeStyle = galaxyColors[colorIdx];
    ctx.lineWidth = meridianLW;
    ctx.beginPath();
    ctx.ellipse(ellipseCx, 0, semiMinor, R, tiltAngle, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  for (let i = 1; i <= PARALLEL_COUNT; i++) {
    const phi = ((i / (PARALLEL_COUNT + 1)) * Math.PI) - Math.PI / 2;
    const cosP = Math.cos(phi);
    const sinP = Math.sin(phi);
    const parallelR = R * cosP;
    const parallelY = -R * (sinP * COS_TILT);
    const parallelZ = sinP * SIN_TILT;

    const opacity = parallelZ > -0.3 ? Math.min(1, (parallelZ + 0.3) * 2.5) : 0;
    if (opacity <= 0.01) continue;

    ctx.save();
    ctx.globalAlpha = opacity * 0.4;
    ctx.strokeStyle = galaxyColors[i % galaxyColors.length];
    ctx.lineWidth = parallelLW;
    ctx.beginPath();
    ctx.ellipse(0, parallelY, parallelR, parallelR * Math.abs(SIN_TILT), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();

  const faceTheta = faceForward ? 0 : theta;

  const eyeW_base = R * 0.26;
  const eyeH_base = R * 0.60;
  const eyeGap = R * 0.18;
  const eyeRotDeg = 28;
  const eyeRot = (eyeRotDeg * Math.PI) / 180;
  const eyePairLat = 0.15;
  const eyePairLon = 0;

  const leftLon = eyePairLon - (eyeGap / R) * 0.5;
  const rightLon = eyePairLon + (eyeGap / R) * 0.5;

  const drawSphereEye = (
    lon: number,
    lat: number,
    yScale: number,
    offX: number,
    offY: number,
  ) => {
    const effLon = lon + offX / R;
    const effLat = lat + offY / R;
    const [sx, sy, z] = sphereProject(effLat, effLon, faceTheta, R);

    if (z < -0.1) return;

    const foreshorten = Math.max(0, z);
    const fadeAlpha = Math.min(1, Math.max(0, (z + 0.1) * 5));
    if (fadeAlpha <= 0.01) return;

    const drawW = eyeW_base * foreshorten;
    const drawH = eyeH_base * yScale;
    if (drawW < 0.5) return;

    ctx.save();
    ctx.globalAlpha = fadeAlpha;
    ctx.translate(sx, sy);
    ctx.rotate(eyeRot);
    ctx.fillStyle = paper;
    ctx.beginPath();
    ctx.roundRect(-drawW * 0.5, -drawH * 0.5, drawW, drawH, drawW * 0.5);
    ctx.fill();
    ctx.restore();
  };

  drawSphereEye(leftLon, eyePairLat, leftEyeScale, eyeOffsetX / scale, eyeOffsetY / scale);
  drawSphereEye(rightLon, eyePairLat, rightEyeScale, eyeOffsetX / scale, eyeOffsetY / scale);

  ctx.restore();
}

function renderFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  reducedMotion: boolean,
  loopSeconds: number,
  faceForward: boolean,
  galaxyColors: string[],
) {
  const scale = width / BASE_WIDTH;
  const ink = INK_HEX;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = PAPER_HEX;
  ctx.fillRect(0, 0, width, height);

  const centerX = width * 0.5;
  const centerY = height * 0.47;
  const cursorH = 280 * scale;
  const cursorW = cursorH * CURSOR_ASPECT;
  const grokSize = 300 * scale;
  const markGap = cursorH * 0.45;
  const groupWidth = cursorW + grokSize + markGap;
  const cursorX = centerX - groupWidth * 0.5 + cursorW * 0.5;
  const grokX = centerX + groupWidth * 0.5 - grokSize * 0.5;

  const cycle = (time / loopSeconds) * Math.PI * 2;
  const floatAmp = reducedMotion ? 0 : 8 * scale;
  const cursorFloatY = reducedMotion ? 0 : -Math.sin(cycle) * floatAmp;
  const grokFloatY = reducedMotion ? 0 : Math.sin(cycle) * floatAmp;
  const baseCursorTilt = reducedMotion ? 0 : Math.sin(cycle) * 1.2;

  const glanceLeftWeight = reducedMotion
    ? 0
    : segmentEnvelope(time, 2.0, 3.4, 4.6, 5.6, loopSeconds);
  const eyeOffsetX = reducedMotion ? 0 : lerp(0, -12 * scale, glanceLeftWeight);
  const eyeOffsetY = reducedMotion ? 0 : lerp(0, 2 * scale, glanceLeftWeight);

  const cursorAnswerTilt = reducedMotion ? 0 : -2 * glanceLeftWeight;
  const cursorTiltDeg = baseCursorTilt + cursorAnswerTilt;

  const grokScaleY = reducedMotion ? 1 : pingPongScaleY(time, 7.4, 7.92, loopSeconds);

  const rightEyeScale = reducedMotion
    ? 1
    : (() => {
        const a = blinkScale(time, 1.15, 1.32, loopSeconds);
        const b = blinkScale(time, 3.55, 3.72, loopSeconds);
        const c = blinkScale(time, 6.05, 6.19, loopSeconds);
        const d = blinkScale(time, 6.22, 6.42, loopSeconds);
        return Math.min(a, b, c, d);
      })();

  const leftEyeScale = reducedMotion
    ? 1
    : (() => {
        const a = blinkScale(time, 1.15, 1.32, loopSeconds);
        const b = blinkScale(time, 3.55, 3.72, loopSeconds);
        const c = blinkScale(time, 6.05, 6.19, loopSeconds);
        const d = blinkScale(time, 6.22, 6.42, loopSeconds);
        const right = Math.min(a, b, c, d);
        const wink = blinkScale(time, 7.15, 7.38, loopSeconds);
        return Math.min(right, wink);
      })();

  const marksBaseY = centerY;

  ctx.save();
  ctx.translate(cursorX, marksBaseY + cursorFloatY);
  ctx.rotate((cursorTiltDeg * Math.PI) / 180);
  const cursorUniformScale = cursorH / CURSOR_VB_H;
  ctx.scale(cursorUniformScale, cursorUniformScale);
  ctx.translate(-CURSOR_VB_W * 0.5, -CURSOR_VB_H * 0.5);
  ctx.fillStyle = ink;
  ctx.fill(new Path2D(CURSOR_PATH));
  ctx.restore();

  const globeTheta = reducedMotion ? 0 : cycle;
  const globeR = grokSize * 0.5 - grokSize * 0.02;

  drawGrokGlobe(
    ctx,
    grokX,
    marksBaseY + grokFloatY,
    globeR,
    globeTheta,
    faceForward,
    eyeOffsetX,
    eyeOffsetY,
    leftEyeScale,
    rightEyeScale,
    grokScaleY,
    galaxyColors,
    ink,
    PAPER_HEX,
    scale,
  );

  ctx.fillStyle = ink;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const fontSize = 56 * scale;
  ctx.font = `500 ${fontSize}px "IBM Plex Sans Condensed", "Arial Narrow", "Nimbus Sans Narrow", "Helvetica Neue", sans-serif`;
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

function resolveGalaxyColors(element: HTMLElement | null): string[] {
  if (!element) return FALLBACK_GALAXY_COLORS;
  const style = getComputedStyle(element);
  const colors: string[] = [];
  for (let i = 1; i <= 6; i++) {
    const val = style.getPropertyValue(`--dallas-galaxy-${i}`).trim();
    if (val) colors.push(val);
  }
  return colors.length > 0 ? colors : FALLBACK_GALAXY_COLORS;
}

const FALLBACK_GALAXY_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#c084fc",
  "#818cf8",
  "#7c3aed",
];

export function DallasMeetupWallpaper({
  reducedMotion = false,
  playing = true,
  timeSeconds,
  onFrameTime,
  loopSeconds = DEFAULT_LOOP_SECONDS,
  faceForward = false,
  className,
}: DallasMeetupWallpaperProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const pausedAtRef = useRef(0);
  const galaxyColorsRef = useRef<string[]>(FALLBACK_GALAXY_COLORS);

  const drawAtTime = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      renderFrame(ctx, canvas.width, canvas.height, time, reducedMotion, loopSeconds, faceForward, galaxyColorsRef.current);
    },
    [reducedMotion, loopSeconds, faceForward],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    galaxyColorsRef.current = resolveGalaxyColors(canvas.closest(".dallas-demo") as HTMLElement);
  });

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
      drawAtTime(timeSeconds ?? pausedAtRef.current);
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
      const normalized = ((timeSeconds % loopSeconds) + loopSeconds) % loopSeconds;
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
      const time = reducedMotion ? 0 : elapsed % loopSeconds;
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
  }, [drawAtTime, onFrameTime, playing, reducedMotion, timeSeconds, loopSeconds]);

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
  loopSeconds = DEFAULT_LOOP_SECONDS,
  faceForward = false,
}: {
  width?: number;
  height?: number;
  loopSeconds?: number;
  faceForward?: boolean;
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

  const totalFrames = loopSeconds * FPS;

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
      if (frame >= totalFrames) {
        recorder.stop();
        return;
      }
      const t = frame / FPS;
      renderFrame(ctx, width, height, t, false, loopSeconds, faceForward, FALLBACK_GALAXY_COLORS);
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
