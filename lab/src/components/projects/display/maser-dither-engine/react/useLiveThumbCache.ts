"use client";

import { useEffect, useRef, useState } from "react";
import {
  ThumbBlitEngine,
  type ThumbScene,
} from "../engine/preview/ThumbBlitEngine";
import type { EngineMaterialId } from "../engine/material/types";
import type { AnimationModeId } from "../engine/animation/types";

/**
 * Serializes material captures through one WebGL context.
 * Debounces sceneKey churn; optionally refreshes the active id at low FPS
 * for live Material Dock motion without N contexts.
 */
export function useLiveThumbCache(
  ids: EngineMaterialId[],
  scene: ThumbScene,
  sceneKey: string,
  options?: { activeId?: EngineMaterialId | null; live?: boolean },
): Record<string, string> {
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const engineRef = useRef<ThumbBlitEngine | null>(null);
  const genRef = useRef(0);
  const sceneRef = useRef(scene);
  const activeId = options?.activeId ?? null;
  const live = options?.live ?? false;

  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);

  useEffect(() => {
    let cancelled = false;
    const gen = ++genRef.current;

    const run = () => {
      try {
        if (!engineRef.current) {
          engineRef.current = new ThumbBlitEngine(144);
        }
        const engine = engineRef.current;
        engine.applyScene(sceneRef.current);
        const next: Record<string, string> = {};
        for (const id of ids) {
          if (cancelled || gen !== genRef.current) return;
          const url = engine.captureMaterial(id);
          if (url) next[id] = url;
        }
        if (!cancelled && gen === genRef.current) {
          setThumbs((prev) => ({ ...prev, ...next }));
        }
      } catch {
        if (!cancelled) setThumbs({});
      }
    };

    const delay = 160;
    const handle = window.setTimeout(() => {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(run, { timeout: 500 });
      } else {
        run();
      }
    }, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sceneKey hashes scene
  }, [ids.join("|"), sceneKey]);

  useEffect(() => {
    if (!live || !activeId) return;
    let cancelled = false;
    let raf = 0;
    let last = 0;
    const FPS_MS = 1000 / 6;

    const tick = (t: number) => {
      raf = window.requestAnimationFrame(tick);
      if (t - last < FPS_MS) return;
      last = t;
      try {
        if (!engineRef.current) {
          engineRef.current = new ThumbBlitEngine(144);
        }
        const engine = engineRef.current;
        engine.applyScene(sceneRef.current);
        const time = (t / 1000) % 8;
        const url = engine.captureMaterialLive(activeId, time);
        if (!cancelled && url) {
          setThumbs((prev) =>
            prev[activeId] === url ? prev : { ...prev, [activeId]: url },
          );
        }
      } catch {
        /* ignore live blit errors */
      }
    };

    raf = window.requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
    };
  }, [live, activeId, sceneKey]);

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  return thumbs;
}

export function useAnimationThumbCache(
  modeIds: AnimationModeId[],
  scene: ThumbScene,
  sceneKey: string,
): Record<string, string> {
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const engineRef = useRef<ThumbBlitEngine | null>(null);
  const genRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const gen = ++genRef.current;

    const run = () => {
      try {
        if (!engineRef.current) {
          engineRef.current = new ThumbBlitEngine(120);
        }
        const engine = engineRef.current;
        engine.applyScene(scene);
        const next: Record<string, string> = {};
        for (const id of modeIds) {
          if (cancelled || gen !== genRef.current) return;
          const url = engine.captureAnimation(id);
          if (url) next[id] = url;
        }
        if (!cancelled && gen === genRef.current) {
          setThumbs((prev) => ({ ...prev, ...next }));
        }
      } catch {
        if (!cancelled) setThumbs({});
      }
    };

    const handle = window.setTimeout(() => {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(run, { timeout: 700 });
      } else {
        run();
      }
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sceneKey hashes scene
  }, [modeIds.join("|"), sceneKey]);

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  return thumbs;
}
