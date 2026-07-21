"use client";

import { useCallback, useRef } from "react";
import { damp } from "../lib/easing";
import { sampleHoverLift } from "../lib/waveMath";

/**
 * Pointer proximity influence with Gaussian falloff.
 * Strengths are smoothed toward targets each frame (no React state).
 */
export function usePointerInfluence(maxBars = 32) {
  const nearestRef = useRef(-1);
  const activeRef = useRef(false);
  const strengthsRef = useRef(new Float32Array(maxBars));
  const targetsRef = useRef(new Float32Array(maxBars));

  const setNearest = useCallback((index: number, active: boolean) => {
    nearestRef.current = index;
    activeRef.current = active;
  }, []);

  const tick = useCallback(
    (
      count: number,
      dt: number,
      hoverStrength: number,
      hoverRadius: number,
    ) => {
      const targets = targetsRef.current;
      const strengths = strengthsRef.current;
      const nearest = nearestRef.current;
      const active = activeRef.current;

      for (let i = 0; i < count; i++) {
        targets[i] = active
          ? sampleHoverLift(i, nearest, hoverStrength, hoverRadius)
          : 0;
        strengths[i] = damp(strengths[i], targets[i], active ? 10 : 6, dt);
      }
    },
    [],
  );

  const getStrength = useCallback((index: number) => {
    return strengthsRef.current[index] ?? 0;
  }, []);

  const reset = useCallback(() => {
    nearestRef.current = -1;
    activeRef.current = false;
    strengthsRef.current.fill(0);
    targetsRef.current.fill(0);
  }, []);

  return {
    nearestRef,
    activeRef,
    strengthsRef,
    setNearest,
    tick,
    getStrength,
    reset,
  };
}
