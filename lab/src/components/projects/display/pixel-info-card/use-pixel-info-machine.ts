"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  COLLAPSE_EXPAND_START,
  COLLAPSE_EXPAND_WALL,
  RETARGET_BLEND_MS,
} from "./constants";
import type { PixelInfoPhase, PixelInfoTuning } from "./types";

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/**
 * Piecewise collapseT(wall): first segment is linear so merge-to-nothing
 * gets real time. Squircle segment is also linear — DOM ease-out owns arrival
 * (double ease-out here made the plate pop).
 */
function collapseTAtWall(wall: number): number {
  const w = clamp01(wall);
  const expandWall = COLLAPSE_EXPAND_WALL;
  const expandStart = COLLAPSE_EXPAND_START;
  if (w < 1 - expandWall) {
    return expandStart * (w / (1 - expandWall));
  }
  return (
    expandStart +
    (1 - expandStart) * ((w - (1 - expandWall)) / expandWall)
  );
}

function wallAtCollapseT(target: number): number {
  const goal = clamp01(target);
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (collapseTAtWall(mid) < goal) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
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
      const collapsing = to < from;
      const wallFrom = collapsing ? wallAtCollapseT(1 - from) : 0;
      const wallTo = collapsing ? wallAtCollapseT(1 - to) : 1;

      const tick = (now: number) => {
        const anim = animRef.current;
        if (!anim) return;
        const t =
          anim.duration <= 0 ? 1 : clamp01((now - anim.start) / anim.duration);

        let value: number;
        if (collapsing) {
          // Reserve wall-clock for expand so reassemble can ease, not snap
          const wall = wallFrom + (wallTo - wallFrom) * t;
          value = 1 - collapseTAtWall(wall);
        } else {
          const eased = easeOutCubic(t);
          value = anim.from + (anim.to - anim.from) * eased;
        }

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

  const showCardDom = phase === "expanded";

  /** Content after plate is resting — smooth blur-uplift, no mid-handoff glitch */
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
    pixelDensity: 0.42,
    assembleMs: 1400,
    dissipateMs: 160,
    cardRadius: 20,
  };
  return { ...base, ...partial };
}
