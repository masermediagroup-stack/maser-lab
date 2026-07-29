"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import { MAX_DPR } from "../constants";
import { ProceduralAnimationController } from "../engine/animation/ProceduralAnimationController";
import type { AnimationEngineConfig } from "../engine/animation/types";
import { AnimationLoop } from "../engine/core/AnimationLoop";
import {
  tryCreateSurfaceRenderer,
  type SurfaceRenderer,
} from "../engine/core/SurfaceRenderer";
import { UniformStore } from "../engine/core/UniformStore";
import { Canvas2DRenderer } from "../engine/fallback/Canvas2DRenderer";
import { InteractionController } from "../engine/interaction/InteractionController";
import type { InteractionEngineConfig } from "../engine/interaction/types";
import { ScrollField } from "../engine/interaction/ScrollField";
import type { MonochromeParams, SurfaceCanvasProps } from "../types";
import { cn } from "@/lib/utils";

type EngineHandle = {
  store: UniformStore;
  loop: AnimationLoop;
  renderer: SurfaceRenderer | Canvas2DRenderer;
  scroll: ScrollField;
  anim: ProceduralAnimationController;
  ix: InteractionController;
  kind: "webgl2" | "canvas2d";
  externalPointer: boolean;
  dispose: () => void;
};

function getDpr(): number {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio || 1, MAX_DPR);
}

function mountEngine(
  canvas: HTMLCanvasElement,
  getReducedMotion: () => boolean,
  initialAnim?: Partial<AnimationEngineConfig>,
  initialIx?: Partial<InteractionEngineConfig>,
): EngineHandle {
  const store = new UniformStore();
  const scroll = new ScrollField();
  const anim = new ProceduralAnimationController(initialAnim);
  const ix = new InteractionController(initialIx);

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
    onFrame: (current, dt) => {
      const reduced = getReducedMotion();
      const payload = anim.tick(
        dt * Math.max(0, current.animationSpeed),
        reduced,
      );
      current.time = payload.time;
      const ixPayload = ix.tick(dt, reduced, payload.time, {
        lightX: current.lightX,
        lightY: current.lightY,
        influence: current.cursorInfluence,
      });
      current.pointerX = ixPayload.pointerX;
      current.pointerY = ixPayload.pointerY;
      renderer.draw(current, payload, ixPayload);
    },
  });

  return {
    store,
    loop,
    renderer,
    scroll,
    anim,
    ix,
    kind,
    externalPointer: false,
    dispose: () => {
      loop.stop();
      renderer.dispose();
    },
  };
}

/**
 * React bridge to the Surface Engine.
 * Owns pointer tracking (DOM→UV); props update targets without setState on rAF.
 */
export function SurfaceCanvas({
  params,
  animation,
  interaction,
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
  const initialAnimRef = useRef(animation);
  const initialIxRef = useRef(interaction);
  const pointerPropRef = useRef(pointer);

  const onParams = useEffectEvent((p?: Partial<MonochromeParams>) => {
    if (p) engineRef.current?.store.setParams(p);
  });

  const onAnimation = useEffectEvent(
    (cfg?: Partial<AnimationEngineConfig>) => {
      if (cfg) engineRef.current?.anim.syncFromProps(cfg);
    },
  );

  const onInteraction = useEffectEvent(
    (cfg?: Partial<InteractionEngineConfig>) => {
      if (cfg) engineRef.current?.ix.syncFromProps(cfg);
    },
  );

  const onPointerProp = useEffectEvent(
    (ptr: { x: number; y: number; down?: boolean } | null) => {
      const engine = engineRef.current;
      if (!engine) return;
      engine.externalPointer = ptr !== null && ptr !== undefined;
      if (reducedRef.current || !ptr) {
        if (!ptr) engine.ix.setPointerExit();
        return;
      }
      // External prop is DOM-normalized (y=0 top)
      engine.ix.setTargetDom(ptr.x, ptr.y, true);
      if (typeof ptr.down === "boolean") {
        engine.ix.setPointerDown(ptr.down);
      }
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
    pointerPropRef.current = pointer;
  }, [pointer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const engine = mountEngine(
      canvas,
      () => reducedRef.current,
      initialAnimRef.current,
      initialIxRef.current,
    );
    engineRef.current = engine;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = getDpr();
      engine.renderer.resize(rect.width, rect.height, dpr);
      engine.store.setResolution(rect.width, rect.height, dpr);
      engine.ix.setViewportSize(rect.width, rect.height);
    };

    resize();
    engine.loop.start();

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const readLocalPointer = (clientX: number, clientY: number) => {
      const rect = wrap.getBoundingClientRect();
      const x = Math.min(
        1,
        Math.max(0, (clientX - rect.left) / Math.max(rect.width, 1)),
      );
      const y = Math.min(
        1,
        Math.max(0, (clientY - rect.top) / Math.max(rect.height, 1)),
      );
      return { x, y };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (reducedRef.current) return;
      if (pointerPropRef.current) return; // external drive
      const { x, y } = readLocalPointer(e.clientX, e.clientY);
      engine.ix.setTargetDom(x, y, true);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (reducedRef.current) return;
      wrap.setPointerCapture?.(e.pointerId);
      const { x, y } = readLocalPointer(e.clientX, e.clientY);
      engine.ix.setTargetDom(x, y, true);
      engine.ix.setPointerDown(true);
    };

    const onPointerUp = (e: PointerEvent) => {
      engine.ix.setPointerDown(false);
      try {
        wrap.releasePointerCapture?.(e.pointerId);
      } catch {
        /* already released */
      }
    };

    const onPointerLeave = () => {
      if (pointerPropRef.current) return;
      engine.ix.setPointerExit();
    };

    wrap.addEventListener("pointermove", onPointerMove, { passive: true });
    wrap.addEventListener("pointerdown", onPointerDown, { passive: true });
    wrap.addEventListener("pointerup", onPointerUp, { passive: true });
    wrap.addEventListener("pointercancel", onPointerUp, { passive: true });
    wrap.addEventListener("pointerleave", onPointerLeave, { passive: true });

    const onScroll = () => {
      if (typeof scrollProgressRef.current === "number") return;
      engine.scroll.fromWindow();
      engine.store.setScroll(engine.scroll.progress);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerdown", onPointerDown);
      wrap.removeEventListener("pointerup", onPointerUp);
      wrap.removeEventListener("pointercancel", onPointerUp);
      wrap.removeEventListener("pointerleave", onPointerLeave);
      ro.disconnect();
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    onParams(params);
  }, [params]);

  useEffect(() => {
    onAnimation(animation);
  }, [animation]);

  useEffect(() => {
    onInteraction(interaction);
  }, [interaction]);

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
      engine.ix.setPointerExit();
      engine.anim.patchTimeline({ playing: false });
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
