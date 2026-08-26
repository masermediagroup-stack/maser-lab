"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LiquidMetalFallback } from "./fallback";
import { MeatballRenderer, isWebGL2Available } from "./renderer";
import { MeatballSimulation } from "./simulation";
import { SPAWN_OFF_DWELL, LIQUID_METAL_MEATBALLS_DEFAULTS } from "./constants";
import type { LiquidMetalLook, LiquidMetalMeatballsProps, SequencePhase } from "./types";
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
  lookRef,
}: LiquidMetalMeatballsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const osReduced = usePrefersReducedMotion();
  const reduced = forceReducedMotion || osReduced;
  const reducedRef = useRef(reduced);
  const replayKeyRef = useRef(replayKey);
  const onPhaseChangeRef = useRef(onPhaseChange);
  const lookSourceRef = lookRef;

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

    const lockedLook: LiquidMetalLook = {
      hue: LIQUID_METAL_MEATBALLS_DEFAULTS.hue,
      sat: LIQUID_METAL_MEATBALLS_DEFAULTS.sat,
      mergeK: LIQUID_METAL_MEATBALLS_DEFAULTS.mergeK,
      wetness: LIQUID_METAL_MEATBALLS_DEFAULTS.wetness,
      speed: LIQUID_METAL_MEATBALLS_DEFAULTS.speed,
    };

    const sim = new MeatballSimulation();
    const syncLook = () => {
      const look = lookSourceRef?.current ?? lockedLook;
      sim.setTravelSpeed(look.speed);
      renderer.applyLook(look);
    };
    let raf = 0;
    let last = performance.now();
    let spawning = false;
    let offDwell = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let running = true;
    let lastPhase: SequencePhase | null = null;

    const reportPhase = (phase: SequencePhase) => {
      if (phase === lastPhase) return;
      lastPhase = phase;
      /* Write through the callback without React setState on this tree.
         Gate flips must not re-render the demo during scroll. */
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
      const rect = canvas.getBoundingClientRect();
      const vw = window.innerWidth || 1;
      const vh = window.innerHeight || 1;
      /* Replaced <canvas> defaults to 300×150 until CSS/layout wins. Never
         let that postage stamp become the sim/GL field. */
      const useRect = rect.width >= vw * 0.5 && rect.height >= vh * 0.5;
      width = Math.max(1, useRect ? rect.width : vw);
      height = Math.max(1, useRect ? rect.height : vh);
    };

    /**
     * Zone math is unchanged (majority in view, bottom still below the fold).
     * ON is immediate; OFF must dwell so the boolean does not chatter mid-scroll.
     */
    const sampleGate = (dt: number) => {
      const trigger = triggerRef.current;
      const raw = Boolean(trigger && isSpawnZoneActive(trigger));
      if (raw) {
        offDwell = 0;
        spawning = true;
      } else if (dt <= 0) {
        offDwell = SPAWN_OFF_DWELL;
        spawning = false;
      } else {
        offDwell += dt;
        if (offDwell >= SPAWN_OFF_DWELL) spawning = false;
      }
      if (!reducedRef.current) {
        sim.setSpawning(spawning, { width, height });
      }
    };

    const freezeStill = () => {
      sim.loadStillCluster(width, height);
      syncLook();
      renderer.draw(sim.charges);
      reportPhase("still");
      ensureLoop();
    };

    const restartLive = () => {
      readSize();
      renderer.setSize(width, height, dprForWidth(width));
      sim.reset();
      offDwell = 0;
      sampleGate(0);
      syncLook();
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
      syncLook();
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
        syncLook();
        renderer.draw(sim.charges);
        reportPhase("still");
        return;
      }
      sampleGate(dt);
      syncLook();
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
      sampleGate(0);
      ensureLoop();
    }

    /* Window resize only. Observing the canvas (or visualViewport) during
       scroll reallocates the drawing buffer and hitch-flashes the field. */
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      freezeStillRef.current = () => {};
      restartLiveRef.current = () => {};
      replaySimRef.current = () => {};
      renderer.dispose();
    };
    // lookRef is sampled in rAF; adding it here remounts the GL program.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        display: "block",
      }}
      aria-hidden
    />
  );
}

export type { LiquidMetalLook, LiquidMetalMeatballsProps, SequencePhase };
