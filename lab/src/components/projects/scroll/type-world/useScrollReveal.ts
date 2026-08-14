"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
  type RefObject,
} from "react";
import { clamp } from "./math";

type ScrollRevealOptions = {
  reducedMotion: boolean;
};

/**
 * Maps the sticky track through the viewport to 0–1 without GSAP pin.
 * Progress 0 = track top at the viewport top (sticky lock begins).
 */
export function useScrollReveal(
  trackRef: RefObject<HTMLElement | null>,
  { reducedMotion }: ScrollRevealOptions,
): RefObject<number> {
  const progressRef = useRef(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) {
      progressRef.current = 1;
      return;
    }

    let raf = 0;

    const measure = () => {
      raf = 0;
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      const scrollable = Math.max(1, rect.height - viewHeight);
      progressRef.current = clamp(-rect.top / scrollable, 0, 1);
    };

    const requestMeasure = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", requestMeasure, { passive: true });
    window.addEventListener("resize", requestMeasure, { passive: true });

    return () => {
      window.removeEventListener("scroll", requestMeasure);
      window.removeEventListener("resize", requestMeasure);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [reducedMotion, trackRef]);

  return progressRef;
}

function subscribeReducedMotion(onStoreChange: () => void): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function reducedMotionSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    reducedMotionSnapshot,
    () => false,
  );
}

function emptySubscribe(): () => void {
  return () => {};
}

export function useClientMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function useIsNarrow(query = "(max-width: 767px)"): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    [query],
  );
  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
