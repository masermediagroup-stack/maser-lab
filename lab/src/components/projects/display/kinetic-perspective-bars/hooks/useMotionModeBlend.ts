"use client";

import { useCallback, useRef } from "react";
import { MODE_BLEND_DURATION } from "../lib/constants";
import type { MotionMode } from "../types/kinetic-bars";

type BlendState = {
  from: MotionMode;
  to: MotionMode;
  mix: number;
  blending: boolean;
};

/**
 * Crossfades between motion modes over MODE_BLEND_DURATION seconds.
 * Call `tick(dt)` from the shared useFrame loop — no React state per frame.
 */
export function useMotionModeBlend(initial: MotionMode) {
  const stateRef = useRef<BlendState>({
    from: initial,
    to: initial,
    mix: 1,
    blending: false,
  });

  const requestMode = useCallback((next: MotionMode) => {
    const s = stateRef.current;
    if (next === s.to && !s.blending) return;
    // Start blend from the currently displayed mix point.
    s.from = s.mix >= 1 ? s.to : s.from;
    // If mid-blend, treat current visual as "from" by keeping mix semantics:
    // we always blend from→to with mix 0→1; snap from to previous to when starting fresh.
    if (s.blending && s.mix < 1) {
      // Continue from current visual: set from = weighted — approximated by keeping to as from
      s.from = s.to;
    } else {
      s.from = s.to;
    }
    s.to = next;
    s.mix = 0;
    s.blending = true;
  }, []);

  const tick = useCallback((dt: number) => {
    const s = stateRef.current;
    if (!s.blending) return;
    s.mix = Math.min(1, s.mix + dt / MODE_BLEND_DURATION);
    if (s.mix >= 1) {
      s.mix = 1;
      s.blending = false;
      s.from = s.to;
    }
  }, []);

  const getModes = useCallback(() => {
    const s = stateRef.current;
    return { from: s.from, to: s.to, mix: s.mix };
  }, []);

  const syncMode = useCallback((mode: MotionMode) => {
    const s = stateRef.current;
    if (!s.blending && s.to !== mode) {
      requestMode(mode);
    }
  }, [requestMode]);

  return { stateRef, requestMode, tick, getModes, syncMode };
}
