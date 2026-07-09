"use client";

import { useEffect, useRef, useState } from "react";
import type { PreviewStatus, TransitionSettings } from "./types";

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
 * One-shot transition runner with explicit in → out timing.
 * After both phases complete we swap the current page and return to rest —
 * never reverse mid-tween by dropping status early.
 */
export function useTransitionRunner({
  settings,
  reducedMotion,
  curtainCount,
  wormholeExtra,
  onComplete,
}: {
  settings: TransitionSettings;
  reducedMotion: boolean;
  /** When set, total wait includes staggered curtain in + out drops. */
  curtainCount?: number;
  /** Pixel Wormhole needs extra time for tunnel + assemble phases. */
  wormholeExtra?: boolean;
  onComplete?: () => void;
}) {
  const [status, setStatus] = useState<PreviewStatus>("rest");
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

  const phaseMs = reducedMotion ? 140 : settings.duration;
  const holdMs = reducedMotion ? 0 : Math.min(180, Math.round(settings.duration * 0.18));
  const staggerTail =
    curtainCount && curtainCount > 1
      ? settings.stagger * (curtainCount - 1)
      : 0;

  // Cover (in) + hold + reveal (out). Curtains stagger on both phases.
  // Wormhole: float+suck+tunnel+emit+assemble ≈ 2.4× duration.
  const totalMs = reducedMotion
    ? 200
    : wormholeExtra
      ? Math.round(phaseMs * 2.4) + holdMs + 120
      : phaseMs * 2 + holdMs + staggerTail * 2 + 100;

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

  return { status, playKey, play, cancel, totalMs, phaseMs, holdMs };
}

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
