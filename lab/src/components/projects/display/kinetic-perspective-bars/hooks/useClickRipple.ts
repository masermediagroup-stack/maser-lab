"use client";

import { useCallback, useRef } from "react";
import { sampleRipple } from "../lib/waveMath";

type Ripple = {
  originIndex: number;
  startTime: number;
  active: boolean;
};

const MAX_RIPPLES = 4;

/**
 * Click/tap ripple propagation. Updated from the shared frame loop.
 */
export function useClickRipple() {
  const ripplesRef = useRef<Ripple[]>([]);
  const clockRef = useRef(0);

  const setTime = useCallback((t: number) => {
    clockRef.current = t;
  }, []);

  const trigger = useCallback((originIndex: number) => {
    const list = ripplesRef.current;
    list.push({
      originIndex,
      startTime: clockRef.current,
      active: true,
    });
    while (list.length > MAX_RIPPLES) list.shift();
  }, []);

  const sample = useCallback(
    (
      index: number,
      strength: number,
      speed: number,
      decay: number,
    ): number => {
      let total = 0;
      const list = ripplesRef.current;
      for (let i = 0; i < list.length; i++) {
        const r = list[i];
        if (!r.active) continue;
        const elapsed = clockRef.current - r.startTime;
        if (elapsed > 4.5) {
          r.active = false;
          continue;
        }
        total += sampleRipple(
          index,
          r.originIndex,
          elapsed,
          strength,
          speed,
          decay,
        );
      }
      return total;
    },
    [],
  );

  const reset = useCallback(() => {
    ripplesRef.current = [];
  }, []);

  return { ripplesRef, setTime, trigger, sample, reset };
}
