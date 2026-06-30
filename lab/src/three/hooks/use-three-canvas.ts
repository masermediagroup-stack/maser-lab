"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";

export type ThreeCanvasLifecycle = {
  container: HTMLDivElement;
  width: number;
  height: number;
  pixelRatio: number;
};

export type UseThreeCanvasOptions = {
  maxPixelRatio?: number;
  onMount?: (lifecycle: ThreeCanvasLifecycle) => void | (() => void);
};

/**
 * Client-only hook for Three.js canvas containers.
 * Handles resize observation and cleanup callback from onMount.
 */
export function useThreeCanvas({
  maxPixelRatio = 2,
  onMount,
}: UseThreeCanvasOptions = {}): RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<(() => void) | void>(undefined);
  const onMountRef = useRef(onMount);

  useEffect(() => {
    onMountRef.current = onMount;
  }, [onMount]);

  const measure = useCallback((): ThreeCanvasLifecycle | null => {
    const container = containerRef.current;
    if (!container) return null;

    const { width, height } = container.getBoundingClientRect();
    if (width === 0 || height === 0) return null;

    return {
      container,
      width,
      height,
      pixelRatio: Math.min(window.devicePixelRatio, maxPixelRatio),
    };
  }, [maxPixelRatio]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const runMount = () => {
      const lifecycle = measure();
      if (!lifecycle) return;

      cleanupRef.current?.();
      cleanupRef.current = onMountRef.current?.(lifecycle);
    };

    runMount();

    const observer = new ResizeObserver(() => {
      runMount();
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      cleanupRef.current?.();
      cleanupRef.current = undefined;
    };
  }, [measure]);

  return containerRef;
}
