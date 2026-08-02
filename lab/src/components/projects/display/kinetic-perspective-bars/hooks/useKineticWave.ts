"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  blendElevations,
  sampleModeElevation,
} from "../lib/waveMath";
import type { MotionMode } from "../types/kinetic-bars";

type WaveControllerOptions = {
  getModes: () => { from: MotionMode; to: MotionMode; mix: number };
  getHover: (index: number) => number;
  getRipple: (index: number) => number;
  getParams: () => {
    barCount: number;
    liftAmplitude: number;
    waveSpeed: number;
    phaseOffset: number;
    waveDirection: 1 | -1;
    paused: boolean;
    reducedMotion: boolean;
  };
};

/**
 * Shared wave sampler — one time source for all bars.
 */
export function useKineticWave(options: WaveControllerOptions) {
  const timeRef = useRef(0);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const advance = useCallback((dt: number) => {
    const p = optionsRef.current.getParams();
    if (p.paused || p.reducedMotion) return;
    timeRef.current += dt;
  }, []);

  const sample = useCallback((index: number): { y: number; intensity: number } => {
    const opts = optionsRef.current;
    const p = opts.getParams();
    const { from, to, mix } = opts.getModes();

    if (p.reducedMotion) {
      return { y: 0, intensity: 0 };
    }

    const a = sampleModeElevation(
      from,
      timeRef.current,
      index,
      p.barCount,
      p.waveSpeed,
      p.phaseOffset,
      p.waveDirection,
    );
    const b = sampleModeElevation(
      to,
      timeRef.current,
      index,
      p.barCount,
      p.waveSpeed,
      p.phaseOffset,
      p.waveDirection,
    );
    const wave = blendElevations(a, b, mix);
    const hover = opts.getHover(index);
    const ripple = opts.getRipple(index);
    const combined = wave * p.liftAmplitude + hover + ripple;
    const intensity = Math.max(
      0,
      Math.min(1, wave * 0.7 + hover * 1.2 + ripple * 0.9),
    );
    return { y: combined, intensity };
  }, []);

  const resetTime = useCallback(() => {
    timeRef.current = 0;
  }, []);

  return { timeRef, advance, sample, resetTime };
}
