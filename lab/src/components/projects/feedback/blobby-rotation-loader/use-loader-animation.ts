"use client";

import { useEffect, useRef } from "react";
import {
  LOADER_COLOR_DEFAULTS,
  type BlobbyLoaderColors,
  type DrawLoaderOptions,
} from "./constants";
import {
  buildRibbonPolygon,
  computeCanvasLayout,
  getStrokeWidth,
  sampleSuperellipseArc,
  traceArcPath,
  tracePolygonPath,
} from "./shape-path";

function resolveColors(colors?: BlobbyLoaderColors) {
  return {
    core: colors?.core ?? LOADER_COLOR_DEFAULTS.core,
    warm: colors?.aberrationWarm ?? LOADER_COLOR_DEFAULTS.aberrationWarm,
    cool: colors?.aberrationCool ?? LOADER_COLOR_DEFAULTS.aberrationCool,
  };
}

function drawShapeLayer(
  ctx: CanvasRenderingContext2D,
  options: DrawLoaderOptions,
  layout: ReturnType<typeof computeCanvasLayout>,
  offsetX: number,
  offsetY: number,
  color: string,
  alpha: number,
  mode: "fill" | "stroke",
) {
  const { power, corner, tail, drawSize, rotation } = options;
  const shapeParams = { power, corner, tail, drawSize };
  const points = sampleSuperellipseArc(shapeParams);
  const strokeWidth = getStrokeWidth(shapeParams);

  ctx.save();
  ctx.translate(layout.center + offsetX, layout.center + offsetY);
  ctx.rotate(rotation);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;

  if (tail > 0 || mode === "fill") {
    const polygon = buildRibbonPolygon(points, strokeWidth, tail);
    tracePolygonPath(ctx, polygon);
    ctx.fill();
  } else {
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    traceArcPath(ctx, points);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawBlobbyLoader(
  ctx: CanvasRenderingContext2D,
  options: DrawLoaderOptions,
) {
  const { blur, chromaticAberration } = options;
  const colors = resolveColors(options.colors);
  const layout = computeCanvasLayout(options);
  const dpr = window.devicePixelRatio || 1;
  const { canvasSize } = layout;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, canvasSize, canvasSize);

  const aberration = chromaticAberration * 0.85;
  const blurPx = blur;
  const drawMode = options.tail > 0 ? "fill" : "stroke";

  ctx.save();
  if (blurPx > 0) {
    ctx.filter = `blur(${blurPx}px)`;
  }

  if (aberration > 0) {
    drawShapeLayer(ctx, options, layout, -aberration, aberration * 0.35, colors.warm, 0.85, drawMode);
    drawShapeLayer(ctx, options, layout, aberration, -aberration * 0.35, colors.cool, 0.85, drawMode);
    drawShapeLayer(ctx, options, layout, 0, 0, colors.core, 1, drawMode);
  } else {
    drawShapeLayer(ctx, options, layout, 0, 0, colors.core, 1, drawMode);
  }

  ctx.restore();

  return layout;
}

export function useLoaderAnimationLoop(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: DrawLoaderOptions,
  speed: number,
  paused: boolean,
) {
  const rotationRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tick = (time: number) => {
      if (paused) {
        const currentOptions: DrawLoaderOptions = {
          ...optionsRef.current,
          rotation: rotationRef.current,
        };
        const layout = computeCanvasLayout(currentOptions);
        const dpr = window.devicePixelRatio || 1;
        const nextSize = layout.canvasSize * dpr;
        if (canvas.width !== nextSize) canvas.width = nextSize;
        if (canvas.height !== nextSize) canvas.height = nextSize;
        drawBlobbyLoader(ctx, currentOptions);
        lastTimeRef.current = null;
        rafRef.current = null;
        return;
      }

      if (lastTimeRef.current !== null) {
        const delta = (time - lastTimeRef.current) / 1000;
        rotationRef.current += delta * speed * Math.PI * 2;
      }
      lastTimeRef.current = time;

      const currentOptions: DrawLoaderOptions = {
        ...optionsRef.current,
        rotation: rotationRef.current,
      };

      const layout = computeCanvasLayout(currentOptions);
      const dpr = window.devicePixelRatio || 1;
      const nextSize = layout.canvasSize * dpr;
      if (canvas.width !== nextSize) canvas.width = nextSize;
      if (canvas.height !== nextSize) canvas.height = nextSize;

      drawBlobbyLoader(ctx, currentOptions);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      lastTimeRef.current = null;
    };
  }, [canvasRef, speed, paused]);
}
