"use client";

import { useCallback, useEffect, useRef } from "react";
import { HEATMAP_COPY } from "./copy";
import { FORMAT_ASPECT, HEATMAP_DEFAULTS } from "./constants";
import { prefetchDepthModel, readDepth } from "./depth-estimator";
import {
  emptyPack,
  flattenOntoGround,
  packDepthField,
  packFallbackFromImage,
  readFullSubject,
  type FocalPoint,
} from "./prepare-mask";
import { readStatusAfterDepth } from "./read-status";
import { startHeatmap, type HeatmapDriver } from "./start-heatmap";
import type { HeatmapPosterProps } from "./types";
import "./tokens.css";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image"));
    image.src = src;
  });
}

type CachedRead = {
  src: string;
  el: HTMLImageElement;
  centroid: FocalPoint;
  depthField: { depth: Float32Array; width: number; height: number } | null;
  depthCentroid: FocalPoint | null;
};

export function HeatmapPoster({
  className,
  format = "9-16",
  look = HEATMAP_DEFAULTS,
  image = null,
  forceReducedMotion = false,
  readStatus = "idle",
  onReadStatus,
  caption,
}: HeatmapPosterProps) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagePlateRef = useRef<HTMLDivElement>(null);
  const lookRef = useRef(look);
  const reducedRef = useRef(forceReducedMotion);
  const driverRef = useRef<HeatmapDriver | null>(null);
  const hotFrameRef = useRef<HTMLDivElement>(null);
  const generationRef = useRef(0);
  const cachedReadRef = useRef<CachedRead | null>(null);

  useEffect(() => {
    lookRef.current = look;
    reducedRef.current = forceReducedMotion;
  }, [look, forceReducedMotion]);

  useEffect(() => {
    prefetchDepthModel();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const driver = startHeatmap({
      canvas,
      lookRef,
      reducedRef,
    });
    driverRef.current = driver;
    driver.setFallback(emptyPack());
    return () => {
      driver.dispose();
      driverRef.current = null;
    };
  }, []);

  const imageSrc = image?.src ?? null;
  const lastSrcRef = useRef<string | null>(null);

  const applyPacksForAspect = useCallback(
    (cached: CachedRead, aspect: number) => {
      const driver = driverRef.current;
      if (!driver) return;
      const focal = cached.depthCentroid ?? cached.centroid;
      const fallback = packFallbackFromImage(
        cached.el,
        cached.el.naturalWidth,
        cached.el.naturalHeight,
        aspect,
        focal,
      );
      driver.setFallback(fallback);
      const hotNode = hotFrameRef.current;
      if (hotNode) {
        if (fallback.frame) {
          hotNode.style.display = "block";
          hotNode.style.left = `${fallback.frame.x * 100}%`;
          hotNode.style.top = `${fallback.frame.y * 100}%`;
          hotNode.style.width = `${fallback.frame.w * 100}%`;
          hotNode.style.height = `${fallback.frame.h * 100}%`;
        } else {
          hotNode.style.display = "none";
        }
      }
      if (cached.depthField) {
        const packed = packDepthField(
          cached.depthField.depth,
          cached.depthField.width,
          cached.depthField.height,
          aspect,
          focal,
        );
        driver.setDepth(packed);
      }
    },
    [],
  );

  useEffect(() => {
    const driver = driverRef.current;
    if (!driver) return;
    const gen = ++generationRef.current;
    const srcChanged = lastSrcRef.current !== imageSrc;
    lastSrcRef.current = imageSrc;

    if (!imageSrc || !image) {
      driver.setFallback(emptyPack());
      driver.setDepth(null);
      driver.snapMaskMix(0);
      const hotNode = hotFrameRef.current;
      if (hotNode) hotNode.style.display = "none";
      cachedReadRef.current = null;
      onReadStatus?.("idle");
      return;
    }

    if (!srcChanged && cachedReadRef.current?.src === imageSrc) {
      applyPacksForAspect(cachedReadRef.current, FORMAT_ASPECT[format]);
      return;
    }

    let cancelled = false;
    onReadStatus?.("reading");
    driver.snapMaskMix(0);

    void (async () => {
      try {
        const el = await loadImage(imageSrc);
        if (cancelled || gen !== generationRef.current) return;

        const fullRead = readFullSubject(el, el.naturalWidth, el.naturalHeight);

        const cached: CachedRead = {
          src: imageSrc,
          el,
          centroid: fullRead.centroid,
          depthField: null,
          depthCentroid: null,
        };
        cachedReadRef.current = cached;

        applyPacksForAspect(cached, FORMAT_ASPECT[format]);

        const flat = flattenOntoGround(el, el.naturalWidth, el.naturalHeight);
        const depth = await readDepth(flat, imageSrc);
        if (cancelled || gen !== generationRef.current) return;

        onReadStatus?.(readStatusAfterDepth(depth.outcome));

        if (depth.outcome === "ok") {
          cached.depthField = {
            depth: depth.depth,
            width: depth.width,
            height: depth.height,
          };

          const { subjectCentroid } = await import("./prepare-mask");
          const depthSubject = new Float32Array(depth.width * depth.height);
          for (let i = 0; i < depthSubject.length; i++) {
            depthSubject[i] = depth.depth[i] ?? 0;
          }
          let min = Infinity, max = -Infinity;
          for (let i = 0; i < depthSubject.length; i++) {
            if (depthSubject[i]! < min) min = depthSubject[i]!;
            if (depthSubject[i]! > max) max = depthSubject[i]!;
          }
          const range = max - min;
          if (range > 1e-8) {
            for (let i = 0; i < depthSubject.length; i++) {
              depthSubject[i] = (depthSubject[i]! - min) / range;
            }
          }
          cached.depthCentroid = subjectCentroid(depthSubject, depth.width, depth.height);

          applyPacksForAspect(cached, FORMAT_ASPECT[format]);

          if (!reducedRef.current) driver.setMaskMixTarget(1);
          else driver.snapMaskMix(1);
        }
      } catch {
        if (cancelled || gen !== generationRef.current) return;
        onReadStatus?.("idle");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [imageSrc, format, onReadStatus, applyPacksForAspect, image]);

  useEffect(() => {
    const cached = cachedReadRef.current;
    if (!cached || !cached.src || cached.src !== imageSrc) return;
    applyPacksForAspect(cached, FORMAT_ASPECT[format]);
  }, [format, applyPacksForAspect, imageSrc]);

  const statusText =
    readStatus === "reading"
      ? HEATMAP_COPY.reading
      : readStatus === "rough-read"
        ? HEATMAP_COPY.roughRead
        : !image
          ? HEATMAP_COPY.empty
          : "";

  const hasCaption = caption != null && caption.length > 0;

  return (
    <section
      ref={rootRef}
      className={["heatmap-poster", className].filter(Boolean).join(" ")}
      data-format={format}
      aria-label="Heatmap poster"
      style={{
        ["--heatmap-heat" as string]: `rgb(${Math.round(look.heat[0] * 255)} ${Math.round(look.heat[1] * 255)} ${Math.round(look.heat[2] * 255)})`,
        ["--heatmap-mid" as string]: `rgb(${Math.round(look.mid[0] * 255)} ${Math.round(look.mid[1] * 255)} ${Math.round(look.mid[2] * 255)})`,
        ["--heatmap-ground" as string]: `rgb(${Math.round(look.ground[0] * 255)} ${Math.round(look.ground[1] * 255)} ${Math.round(look.ground[2] * 255)})`,
      }}
    >
      <div ref={imagePlateRef} className="heatmap-poster__image-plate">
        <canvas ref={canvasRef} className="heatmap-poster__canvas" aria-hidden />
        <div ref={hotFrameRef} className="heatmap-poster__hot-frame" aria-hidden />
        {statusText ? (
          <p className="heatmap-status heatmap-poster__status">{statusText}</p>
        ) : null}
      </div>

      {hasCaption ? (
        <div className="heatmap-poster__caption-plate">
          <p className="heatmap-poster__caption-label">{HEATMAP_COPY.captionLabel}</p>
          <p className="heatmap-poster__caption-text">{caption}</p>
        </div>
      ) : null}
    </section>
  );
}
