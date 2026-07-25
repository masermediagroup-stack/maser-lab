"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePrefersReducedMotion } from "../hooks/use-reduced-motion";
import type { PerformanceStore } from "../lib/performance-store";
import { TornTransitionContext } from "../lib/transition-context";
import { TornRenderer } from "../lib/torn-renderer";
import {
  WATCHDOG_SLACK_MS,
  computeFrame,
  createRun,
  runTotalDuration,
  type TransitionRun,
} from "../lib/transition-state-machine";
import type {
  QualityMode,
  StartTransitionOptions,
  TornTransitionSettings,
  TransitionOrigin,
  TransitionPhase,
} from "../lib/transition-types";
import { QUALITY_PROFILES } from "../lib/transition-utils";
import { TornTransitionOverlay } from "./torn-transition-overlay";

export type TornTransitionProviderProps = {
  children: ReactNode;
  settings: TornTransitionSettings;
  /**
   * `contained` keeps the sheet inside the nearest positioned ancestor — used
   * by the lab preview. `fixed` covers the viewport, which is what a real app
   * wants.
   */
  mode?: "fixed" | "contained";
  quality?: QualityMode;
  /** Freezes the shader clock without stopping the transition itself. */
  paused?: boolean;
  /** Manual scrub. When set, the sheet holds this frame instead of animating. */
  hold?: { lead: number; trail: number } | null;
  origin?: TransitionOrigin;
  /** `true` / `false` force the behaviour; omit to follow the OS setting. */
  reducedMotion?: boolean;
  perfStore?: PerformanceStore;
  className?: string;
  /** Fires on every phase change, including back to `idle`. */
  onPhaseChange?: (phase: TransitionPhase) => void;
};

const REDUCED_FADE_MS = 190;

export function TornTransitionProvider({
  children,
  settings,
  mode = "fixed",
  quality = "balanced",
  paused = false,
  hold = null,
  origin,
  reducedMotion,
  perfStore,
  className,
  onPhaseChange,
}: TornTransitionProviderProps) {
  const systemReduced = usePrefersReducedMotion();
  const reduced = reducedMotion ?? systemReduced;

  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [webglSupported, setWebglSupported] = useState(true);
  const [fadeOpacity, setFadeOpacity] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<TornRenderer | null>(null);
  const rafRef = useRef<number | null>(null);
  const runRef = useRef<TransitionRun | null>(null);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef<TransitionPhase>("idle");

  // Everything below is read inside the animation loop, so it lives in refs to
  // keep the loop out of React's dependency graph entirely. The mirrors are
  // written from an effect (never during render) — the loop only reads them on
  // the next frame, which always lands after the commit.
  const settingsRef = useRef(settings);
  const holdRef = useRef(hold);
  const pausedRef = useRef(paused);
  const pointerRef = useRef<TransitionOrigin>({ x: 0.5, y: 0.5 });
  const originRef = useRef<TransitionOrigin>(origin ?? { x: 0.5, y: 0.5 });
  const clockRef = useRef({ time: 0, last: 0 });
  const fpsRef = useRef({ frames: 0, since: 0 });
  const reducedTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    holdRef.current = hold;
  }, [hold]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (origin) originRef.current = origin;
  }, [origin]);

  const publishPhase = useCallback(
    (next: TransitionPhase) => {
      if (phaseRef.current === next) return;
      phaseRef.current = next;
      setPhase(next);
      perfStore?.publish({ phase: next });
      onPhaseChange?.(next);
    },
    [onPhaseChange, perfStore],
  );

  // ── Renderer lifecycle ─────────────────────────────────────────────────
  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new TornRenderer(canvas, quality);
    if (!renderer.isReady) {
      renderer.dispose();
      setWebglSupported(false);
      return;
    }

    rendererRef.current = renderer;
    setWebglSupported(true);

    const host = canvas.parentElement ?? canvas;
    const maxDpr = QUALITY_PROFILES[quality].maxDpr;

    const applySize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      renderer.resize(rect.width || 1, rect.height || 1, dpr);
      const size = renderer.renderSize;
      perfStore?.publish({
        dpr: Number(size.dpr.toFixed(2)),
        renderWidth: size.width,
        renderHeight: size.height,
        quality,
      });
    };

    applySize();
    const observer = new ResizeObserver(applySize);
    observer.observe(host);

    return () => {
      observer.disconnect();
      renderer.dispose();
      rendererRef.current = null;
    };
  }, [quality, reduced, perfStore]);

  // ── Animation loop ─────────────────────────────────────────────────────
  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    perfStore?.publish({ looping: false, fps: 0 });
  }, [perfStore]);

  const drawFrame = useCallback(
    (lead: number, trail: number) => {
      const renderer = rendererRef.current;
      if (!renderer) return;
      renderer.applySettings(settingsRef.current);
      renderer.render({
        lead,
        trail,
        origin: originRef.current,
        pointer: pointerRef.current,
        time: clockRef.current.time,
      });
    },
    [],
  );

  const finishRun = useCallback(
    (run: TransitionRun) => {
      if (!run.completeFired) {
        run.completeFired = true;
        run.onComplete?.();
      }
      runRef.current = null;
      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current);
        watchdogRef.current = null;
      }
      publishPhase("complete");
      rendererRef.current?.clear();
      // `complete` is a report, not a resting state — settle straight to idle.
      publishPhase("idle");
    },
    [publishPhase],
  );

  const startLoop = useCallback(() => {
    if (rafRef.current !== null) return;
    clockRef.current.last = 0;
    fpsRef.current = { frames: 0, since: performance.now() };

    // Declared (hoisted) rather than assigned so the body can re-queue itself
    // without reading a binding that is still in its temporal dead zone.
    function tick(now: number) {
      rafRef.current = requestAnimationFrame(tick);

      const clock = clockRef.current;
      const delta = clock.last ? (now - clock.last) / 1000 : 0;
      clock.last = now;
      if (!pausedRef.current) {
        clock.time += Math.min(delta, 0.05) * settingsRef.current.animationSpeed;
      }

      const fps = fpsRef.current;
      fps.frames += 1;
      if (now - fps.since >= 450) {
        perfStore?.publish({
          fps: Math.round((fps.frames * 1000) / (now - fps.since)),
          looping: true,
        });
        fps.frames = 0;
        fps.since = now;
      }

      const held = holdRef.current;
      const run = runRef.current;

      if (run) {
        const frame = computeFrame(run, now);

        if (frame.swapDue && !run.swapFired) {
          run.swapFired = true;
          run.onCovered?.();
        }

        publishPhase(frame.phase);
        drawFrame(frame.lead, frame.trail);

        if (frame.done) {
          finishRun(run);
          if (!holdRef.current) stopLoop();
        }
        return;
      }

      if (held) {
        drawFrame(held.lead, held.trail);
        // A paused, held frame has nothing left to animate.
        if (pausedRef.current) stopLoop();
        return;
      }

      stopLoop();
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [drawFrame, finishRun, perfStore, publishPhase, stopLoop]);

  // Held frames need at least one draw, plus a live loop when time is running.
  useEffect(() => {
    if (reduced || !hold) return;
    startLoop();
    return () => {
      if (!runRef.current) stopLoop();
    };
  }, [hold, paused, reduced, startLoop, stopLoop]);

  // Redraw a paused hold when any setting changes.
  useEffect(() => {
    if (reduced || !hold || !paused) return;
    const id = requestAnimationFrame(() => drawFrame(hold.lead, hold.trail));
    return () => cancelAnimationFrame(id);
  }, [drawFrame, hold, paused, reduced, settings]);

  // ── Reduced-motion / no-WebGL path ─────────────────────────────────────
  const clearReducedTimers = useCallback(() => {
    for (const t of reducedTimers.current) clearTimeout(t);
    reducedTimers.current = [];
  }, []);

  const startReduced = useCallback(
    (options?: StartTransitionOptions) => {
      clearReducedTimers();
      publishPhase("entering");
      setFadeOpacity(1);

      reducedTimers.current.push(
        setTimeout(() => {
          publishPhase("covered");
          publishPhase("content-swapping");
          options?.onCovered?.();
          publishPhase("revealing");
          setFadeOpacity(0);
        }, REDUCED_FADE_MS),
        setTimeout(
          () => {
            publishPhase("complete");
            options?.onComplete?.();
            publishPhase("idle");
          },
          REDUCED_FADE_MS * 2 + 30,
        ),
      );
    },
    [clearReducedTimers, publishPhase],
  );

  // ── Public API ─────────────────────────────────────────────────────────
  const startTransition = useCallback(
    (options?: StartTransitionOptions) => {
      if (reduced || !webglSupported) {
        startReduced(options);
        return;
      }

      const now = performance.now();
      const active = runRef.current;

      // Rapid navigation: if the sheet is still on its way in, the newest
      // intent simply replaces the pending one. Restarting here would make the
      // sheet jump backwards, and queueing would navigate twice.
      if (active && !active.swapFired) {
        active.onCovered = options?.onCovered;
        active.onComplete = options?.onComplete;
        if (options?.origin) originRef.current = options.origin;
        return;
      }

      if (options?.origin) originRef.current = options.origin;
      if (settingsRef.current.direction === "pointer" && !options?.origin) {
        originRef.current = { ...pointerRef.current };
      }

      const run = createRun(
        settingsRef.current,
        options,
        originRef.current,
        now,
      );
      runRef.current = run;

      if (watchdogRef.current) clearTimeout(watchdogRef.current);
      watchdogRef.current = setTimeout(
        () => {
          const stuck = runRef.current;
          if (!stuck || stuck.id !== run.id) return;
          // Belt and braces: the loop is time-driven and self-completing, but a
          // backgrounded tab that never resumes must not leave a live overlay.
          if (!stuck.swapFired) {
            stuck.swapFired = true;
            stuck.onCovered?.();
          }
          finishRun(stuck);
          stopLoop();
        },
        runTotalDuration(settingsRef.current) + WATCHDOG_SLACK_MS,
      );

      startLoop();
    },
    [finishRun, reduced, startLoop, startReduced, stopLoop, webglSupported],
  );

  const cancelTransition = useCallback(() => {
    clearReducedTimers();
    setFadeOpacity(0);
    const run = runRef.current;
    if (run) finishRun(run);
    if (!holdRef.current) stopLoop();
  }, [clearReducedTimers, finishRun, stopLoop]);

  useEffect(
    () => () => {
      clearReducedTimers();
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [clearReducedTimers],
  );

  // Pointer tracking stays in a ref; it must never trigger a render.
  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerRef.current = {
        x: (event.clientX - rect.left) / rect.width,
        y: 1 - (event.clientY - rect.top) / rect.height,
      };
    },
    [],
  );

  const value = useMemo(
    () => ({
      startTransition,
      cancelTransition,
      phase,
      isTransitioning: phase !== "idle",
      settings,
      reducedMotion: reduced,
      webglSupported,
    }),
    [
      cancelTransition,
      phase,
      reduced,
      settings,
      startTransition,
      webglSupported,
    ],
  );

  const useShader = !reduced && webglSupported;

  return (
    <TornTransitionContext.Provider value={value}>
      <div
        className={[
          "tgt-root",
          mode === "contained" ? "tgt-root--contained" : "tgt-root--fixed",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        onPointerMove={useShader ? handlePointerMove : undefined}
      >
        {children}
        <TornTransitionOverlay
          ref={canvasRef}
          mode={mode}
          active={phase !== "idle"}
          shader={useShader}
          fadeOpacity={fadeOpacity}
          fadeColor={settings.color1}
          fadeDuration={REDUCED_FADE_MS}
        />
      </div>
    </TornTransitionContext.Provider>
  );
}
