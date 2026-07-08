"use client";

import { useEffect, useRef, useState } from "react";
import type { TransitionSettings } from "./types";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

/**
 * One-shot transition runner.
 * Key insight: after the animation completes we swap the "current" page
 * and stay in rest — we never reverse CSS transitions by dropping
 * data-phase="animating" while both layers are still mid-tween.
 */
export function useTransitionRunner({
  settings,
  reducedMotion,
  curtainCount,
  onComplete,
}: {
  settings: TransitionSettings;
  reducedMotion: boolean;
  /** When set, total wait includes staggered curtain drops. */
  curtainCount?: number;
  onComplete?: () => void;
}) {
  const [status, setStatus] = useState<"rest" | "running">("rest");
  const [playKey, setPlayKey] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const staggerTail =
    curtainCount && curtainCount > 1
      ? settings.stagger * (curtainCount - 1)
      : settings.stagger;

  const totalMs = reducedMotion ? 160 : settings.duration + staggerTail + 80;

  const play = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setStatus("running");
    setPlayKey((key) => key + 1);

    timeoutRef.current = window.setTimeout(() => {
      onCompleteRef.current?.();
      setStatus("rest");
    }, totalMs);
  };

  const cancel = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setStatus("rest");
  };

  return { status, playKey, play, cancel, totalMs };
}

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
