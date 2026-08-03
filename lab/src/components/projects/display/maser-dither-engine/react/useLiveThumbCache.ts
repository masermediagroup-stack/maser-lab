"use client";

import { useEffect, useRef, useState } from "react";
import {
  ThumbBlitEngine,
  type ThumbScene,
} from "../engine/preview/ThumbBlitEngine";
import type { EngineMaterialId } from "../engine/material/types";
import type { AnimationModeId } from "../engine/animation/types";

/**
 * Serializes material (or animation) captures through one WebGL context.
 */
export function useLiveThumbCache(
  ids: EngineMaterialId[],
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
          engineRef.current = new ThumbBlitEngine(144);
        }
        const engine = engineRef.current;
        engine.applyScene(scene);
        const next: Record<string, string> = {};
        for (const id of ids) {
          if (cancelled || gen !== genRef.current) return;
          const url = engine.captureMaterial(id);
          if (url) next[id] = url;
        }
        if (!cancelled && gen === genRef.current) {
          setThumbs(next);
        }
      } catch {
        if (!cancelled) setThumbs({});
      }
    };

    const handle = window.requestIdleCallback
      ? window.requestIdleCallback(run, { timeout: 600 })
      : window.setTimeout(run, 32);

    return () => {
      cancelled = true;
      if (typeof handle === "number" && window.cancelIdleCallback) {
        window.cancelIdleCallback(handle);
      } else {
        window.clearTimeout(handle as number);
      }
    };
    // scene object identity varies; sceneKey is the intentional dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sceneKey hashes scene
  }, [ids.join("|"), sceneKey]);

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
          setThumbs(next);
        }
      } catch {
        if (!cancelled) setThumbs({});
      }
    };

    const handle = window.requestIdleCallback
      ? window.requestIdleCallback(run, { timeout: 800 })
      : window.setTimeout(run, 40);

    return () => {
      cancelled = true;
      if (typeof handle === "number" && window.cancelIdleCallback) {
        window.cancelIdleCallback(handle);
      } else {
        window.clearTimeout(handle as number);
      }
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
