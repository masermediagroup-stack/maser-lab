"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import { MAX_DPR } from "../constants";
import { AnimationLoop } from "../engine/core/AnimationLoop";
import { tryCreateSurfaceRenderer, type SurfaceRenderer } from "../engine/core/SurfaceRenderer";
import { UniformStore } from "../engine/core/UniformStore";
import { Canvas2DRenderer } from "../engine/fallback/Canvas2DRenderer";
import { PointerField } from "../engine/interaction/PointerField";
import { ScrollField } from "../engine/interaction/ScrollField";
import type { MonochromeParams, SurfaceCanvasProps } from "../types";
import { cn } from "@/lib/utils";

type EngineHandle = {
  store: UniformStore;
  loop: AnimationLoop;
  renderer: SurfaceRenderer | Canvas2DRenderer;
  pointer: PointerField;
  scroll: ScrollField;
  kind: "webgl2" | "canvas2d";
  dispose: () => void;
};

function getDpr(): number {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio || 1, MAX_DPR);
}

function mountEngine(
  canvas: HTMLCanvasElement,
  getReducedMotion: () => boolean,
): EngineHandle {
  const store = new UniformStore();
  const pointer = new PointerField();
  const scroll = new ScrollField();

  let renderer: SurfaceRenderer | Canvas2DRenderer;
  let kind: "webgl2" | "canvas2d";

  const webgl = tryCreateSurfaceRenderer(canvas);
  if (webgl) {
    renderer = webgl;
    kind = "webgl2";
  } else {
    renderer = new Canvas2DRenderer(canvas);
    kind = "canvas2d";
  }

  const loop = new AnimationLoop({
    store,
    getReducedMotion,
    onFrame: (current) => {
      renderer.draw(current);
    },
  });

  return {
    store,
    loop,
    renderer,
    pointer,
    scroll,
    kind,
    dispose: () => {
      loop.stop();
      renderer.dispose();
    },
  };
}

/**
 * React bridge to the Surface Engine.
 * Props update UniformStore targets; rAF damps and draws without setState.
 */
export function SurfaceCanvas({
  params,
  className,
  style,
  reducedMotion = false,
  pointer = null,
  scrollProgress,
  "aria-label": ariaLabel = "Procedural surface material",
}: SurfaceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<EngineHandle | null>(null);
  const reducedRef = useRef(reducedMotion);
  const scrollProgressRef = useRef(scrollProgress);

  const onParams = useEffectEvent((p?: Partial<MonochromeParams>) => {
    if (p) engineRef.current?.store.setParams(p);
  });

  const onPointerProp = useEffectEvent(
    (ptr: { x: number; y: number } | null) => {
      const engine = engineRef.current;
      if (!engine) return;
      if (reducedRef.current || !ptr) {
        engine.pointer.release();
        engine.store.setPointer(0.5, 0.5);
        return;
      }
      engine.pointer.setNormalized(ptr.x, ptr.y);
      engine.store.setPointer(ptr.x, ptr.y);
    },
  );

  const onScrollProp = useEffectEvent((value?: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    if (typeof value === "number") {
      engine.scroll.setProgress(value);
      engine.store.setScroll(engine.scroll.progress);
    }
  });

  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const engine = mountEngine(canvas, () => reducedRef.current);
    engineRef.current = engine;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = getDpr();
      engine.renderer.resize(rect.width, rect.height, dpr);
      engine.store.setResolution(rect.width, rect.height, dpr);
    };

    resize();
    engine.loop.start();

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const onScroll = () => {
      if (typeof scrollProgressRef.current === "number") return;
      engine.scroll.fromWindow();
      engine.store.setScroll(engine.scroll.progress);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    onParams(params);
  }, [params]);

  useEffect(() => {
    onPointerProp(pointer);
  }, [pointer]);

  useEffect(() => {
    onScrollProp(scrollProgress);
  }, [scrollProgress]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (reducedMotion) {
      engine.pointer.release();
      engine.store.setPointer(0.5, 0.5);
    }
  }, [reducedMotion]);

  return (
    <div
      ref={wrapRef}
      className={cn("mse-surface-canvas", className)}
      style={style}
    >
      <canvas
        ref={canvasRef}
        className="mse-surface-canvas__gl"
        aria-label={ariaLabel}
        role="img"
      />
    </div>
  );
}
