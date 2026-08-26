"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LiquidMetalFallback } from "./fallback";
import { MeatballRenderer, isWebGL2Available } from "./renderer";
import { MeatballSimulation } from "./simulation";
import type { LiquidMetalMeatballsProps, SequencePhase } from "./types";
import "./tokens.css";

function subscribeNever(): () => void {
  return () => {};
}

function subscribeReducedMotion(onChange: () => void): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );
}

function dprForWidth(width: number): number {
  const cap = width < 768 ? 1.25 : 1.75;
  return Math.min(window.devicePixelRatio || 1, cap);
}

export function LiquidMetalMeatballs({
  triggerRef,
  forceReducedMotion = false,
  replayKey = 0,
  className,
  onPhaseChange,
}: LiquidMetalMeatballsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const osReduced = usePrefersReducedMotion();
  const reduced = forceReducedMotion || osReduced;
  const webgl = useSyncExternalStore(
    subscribeNever,
    isWebGL2Available,
    () => true,
  );
  const [glFailed, setGlFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !webgl) return;

    let renderer: MeatballRenderer;
    try {
      renderer = new MeatballRenderer(canvas);
    } catch {
      queueMicrotask(() => setGlFailed(true));
      return;
    }

    const sim = new MeatballSimulation();
    let raf = 0;
    let last = performance.now();
    let spawning = false;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let running = true;
    let lastPhase: SequencePhase | null = null;

    const reportPhase = (phase: SequencePhase) => {
      if (phase === lastPhase) return;
      lastPhase = phase;
      onPhaseChange?.(phase);
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      renderer.setSize(width, height, dprForWidth(width));
      if (reduced) {
        sim.loadStillCluster(width, height);
        renderer.draw(sim.charges);
        reportPhase("still");
      }
    };

    const loop = (now: number) => {
      if (!running) return;
      if (document.hidden) {
        raf = 0;
        last = now;
        return;
      }
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (reduced) {
        reportPhase("still");
        return;
      }
      sim.setSpawning(spawning);
      sim.step(dt, width, height);
      renderer.draw(sim.charges);
      if (spawning) reportPhase("sequence");
      else if (sim.aliveCount > 0) reportPhase("finishing");
      else reportPhase("idle");
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
        return;
      }
      last = performance.now();
      if (raf === 0 && running) raf = requestAnimationFrame(loop);
    };

    resize();
    if (reduced) {
      sim.loadStillCluster(width, height);
      renderer.draw(sim.charges);
      reportPhase("still");
    } else {
      raf = requestAnimationFrame(loop);
    }

    const trigger = triggerRef.current;
    const observer =
      trigger && !reduced
        ? new IntersectionObserver(
            ([entry]) => {
              spawning = Boolean(entry?.isIntersecting);
            },
            { threshold: 0.28 },
          )
        : null;
    if (trigger && observer) observer.observe(trigger);

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.dispose();
    };
  }, [webgl, reduced, replayKey, triggerRef, onPhaseChange]);

  if (!webgl || glFailed) {
    return <LiquidMetalFallback className={className} />;
  }

  return (
    <canvas
      ref={canvasRef}
      className={className ? `lmm-canvas ${className}` : "lmm-canvas"}
      aria-hidden
    />
  );
}

export type { LiquidMetalMeatballsProps, SequencePhase };
