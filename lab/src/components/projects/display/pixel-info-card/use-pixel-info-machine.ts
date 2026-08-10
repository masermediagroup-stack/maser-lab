"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CARD_DOM_REVEAL_AT, RETARGET_BLEND_MS } from "./constants";
import type { PixelInfoPhase, PixelInfoTuning } from "./types";

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

type MachineOptions = {
  assembleMs: number;
  reducedMotion: boolean;
};

export type PixelInfoMachine = {
  phase: PixelInfoPhase;
  /** 0 = idle/squircle, 1 = fully expanded card */
  progress: number;
  showCardDom: boolean;
  /** True once card plate is fully opaque and text may enter */
  showCardContent: boolean;
  toggle: () => void;
  collapse: () => void;
  reset: () => void;
};

export function usePixelInfoMachine({
  assembleMs,
  reducedMotion,
}: MachineOptions): PixelInfoMachine {
  const [phase, setPhase] = useState<PixelInfoPhase>("idle");
  const [progress, setProgress] = useState(0);
  const phaseRef = useRef<PixelInfoPhase>("idle");
  const progressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const animRef = useRef<{
    from: number;
    to: number;
    start: number;
    duration: number;
    nextPhase: PixelInfoPhase;
  } | null>(null);

  const stopRaf = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const commitPhase = useCallback((next: PixelInfoPhase, p: number) => {
    phaseRef.current = next;
    progressRef.current = p;
    setPhase(next);
    setProgress(p);
  }, []);

  const runTo = useCallback(
    (to: number, duration: number, nextPhase: PixelInfoPhase) => {
      stopRaf();
      const from = progressRef.current;
      const start = performance.now();
      animRef.current = { from, to, start, duration, nextPhase };

      const tick = (now: number) => {
        const anim = animRef.current;
        if (!anim) return;
        const t = anim.duration <= 0 ? 1 : clamp01((now - anim.start) / anim.duration);
        const eased = easeOutCubic(t);
        const value = anim.from + (anim.to - anim.from) * eased;
        progressRef.current = value;
        setProgress(value);

        if (t >= 1) {
          animRef.current = null;
          commitPhase(anim.nextPhase, anim.to);
          rafRef.current = null;
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };

      if (to > from) {
        phaseRef.current = "expanding";
        setPhase("expanding");
      } else if (to < from) {
        phaseRef.current = "collapsing";
        setPhase("collapsing");
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [commitPhase, stopRaf],
  );

  const open = useCallback(() => {
    if (reducedMotion) {
      commitPhase("expanded", 1);
      return;
    }
    const remaining = Math.max(0.05, 1 - progressRef.current);
    const duration = Math.max(RETARGET_BLEND_MS, assembleMs * remaining);
    runTo(1, duration, "expanded");
  }, [assembleMs, commitPhase, reducedMotion, runTo]);

  const close = useCallback(() => {
    if (reducedMotion) {
      commitPhase("idle", 0);
      return;
    }
    const remaining = Math.max(0.05, progressRef.current);
    const duration = Math.max(RETARGET_BLEND_MS, assembleMs * remaining);
    runTo(0, duration, "idle");
  }, [assembleMs, commitPhase, reducedMotion, runTo]);

  const toggle = useCallback(() => {
    const p = phaseRef.current;
    if (p === "idle" || p === "collapsing") {
      open();
      return;
    }
    close();
  }, [close, open]);

  const collapse = useCallback(() => {
    if (phaseRef.current === "idle") return;
    close();
  }, [close]);

  const reset = useCallback(() => {
    stopRaf();
    animRef.current = null;
    commitPhase("idle", 0);
  }, [commitPhase, stopRaf]);

  useEffect(() => () => stopRaf(), [stopRaf]);

  const showCardDom =
    phase === "expanded" ||
    (phase === "expanding" && progress >= CARD_DOM_REVEAL_AT);

  /** Content only after resting expanded — avoids text during pixel→plate handoff */
  const showCardContent = phase === "expanded";

  return {
    phase,
    progress,
    showCardDom,
    showCardContent,
    toggle,
    collapse,
    reset,
  };
}

export function mergeTuning(partial?: Partial<PixelInfoTuning>): PixelInfoTuning {
  const base: PixelInfoTuning = {
    pixelSize: 5,
    snakeDensity: 0.42,
    assembleMs: 720,
    dissipateMs: 70,
    cardRadius: 20,
  };
  return { ...base, ...partial };
}
