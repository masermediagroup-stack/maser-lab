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

/**
 * Spawn only when a majority of the trigger *height* is on screen.
 * Stop once the section bottom has entered the viewport — the user has
 * reached the end of the zone, even if a tall trigger is still mostly visible.
 */
function isSpawnZoneActive(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  const visH = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0));
  const ratio = visH / Math.max(1, rect.height);
  if (ratio < 0.5) return false;
  // Bottom of the zone is still below the fold — user has not reached section end.
  if (rect.bottom < vh - 4) return false;
  return true;
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
  const reducedRef = useRef(reduced);
  const replayKeyRef = useRef(replayKey);
  const onPhaseChangeRef = useRef(onPhaseChange);

  const freezeStillRef = useRef<() => void>(() => {});
  const restartLiveRef = useRef<() => void>(() => {});
  const replaySimRef = useRef<() => void>(() => {});

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
      onPhaseChangeRef.current?.(phase);
    };

    const ensureLoop = () => {
      if (!running || document.hidden) return;
      if (raf === 0) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    const readSize = () => {
      width = Math.max(1, canvas.clientWidth || window.innerWidth);
      height = Math.max(1, canvas.clientHeight || window.innerHeight);
    };

    const updateGate = () => {
      const trigger = triggerRef.current;
      const next = Boolean(trigger && isSpawnZoneActive(trigger));
      spawning = next;
      if (!reducedRef.current) {
        sim.setSpawning(next, { width, height });
      }
    };

    const freezeStill = () => {
      sim.loadStillCluster(width, height);
      renderer.draw(sim.charges);
      reportPhase("still");
      ensureLoop();
    };

    const restartLive = () => {
      readSize();
      renderer.setSize(width, height, dprForWidth(width));
      sim.reset();
      updateGate();
      renderer.draw(sim.charges);
      if (spawning) reportPhase("sequence");
      else reportPhase("idle");
      ensureLoop();
    };

    const replaySim = () => {
      if (reducedRef.current) freezeStill();
      else restartLive();
    };

    freezeStillRef.current = freezeStill;
    restartLiveRef.current = restartLive;
    replaySimRef.current = replaySim;

    const resize = () => {
      readSize();
      renderer.setSize(width, height, dprForWidth(width));
      if (reducedRef.current) {
        freezeStill();
        return;
      }
      renderer.draw(sim.charges);
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
      if (reducedRef.current) {
        renderer.draw(sim.charges);
        reportPhase("still");
        return;
      }
      updateGate();
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
      ensureLoop();
    };

    resize();
    if (reducedRef.current) freezeStill();
    else {
      updateGate();
      ensureLoop();
    }

    const canvasRo = new ResizeObserver(resize);
    canvasRo.observe(canvas);

    const trigger = triggerRef.current;
    const observer = trigger
      ? new IntersectionObserver(
          () => {
            updateGate();
          },
          { threshold: [0, 0.25, 0.5, 0.75, 1] },
        )
      : null;
    if (trigger && observer) observer.observe(trigger);

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", updateGate, { passive: true, capture: true });
    document.addEventListener("scroll", updateGate, { passive: true, capture: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      canvasRo.disconnect();
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", updateGate, true);
      document.removeEventListener("scroll", updateGate, true);
      document.removeEventListener("visibilitychange", onVisibility);
      freezeStillRef.current = () => {};
      restartLiveRef.current = () => {};
      replaySimRef.current = () => {};
      renderer.dispose();
    };
  }, [webgl, triggerRef]);

  useEffect(() => {
    onPhaseChangeRef.current = onPhaseChange;
  }, [onPhaseChange]);

  useEffect(() => {
    reducedRef.current = reduced;
    if (reduced) freezeStillRef.current();
    else restartLiveRef.current();
  }, [reduced]);

  useEffect(() => {
    if (replayKey === replayKeyRef.current) return;
    replayKeyRef.current = replayKey;
    replaySimRef.current();
  }, [replayKey]);

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
