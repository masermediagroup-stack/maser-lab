"use client";

import { useEffect, useRef } from "react";
import { HEATMAP_COPY } from "./copy";
import { HEATMAP_DEFAULTS } from "./constants";
import { prefetchDepthModel, readDepth } from "./depth-estimator";
import { emptyPack, flattenOntoGround, packDepthField, packFallbackFromImage } from "./prepare-mask";
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

export function HeatmapPoster({
  className,
  format = "9-16",
  look = HEATMAP_DEFAULTS,
  image = null,
  forceReducedMotion = false,
  readStatus = "idle",
  onReadStatus,
}: HeatmapPosterProps) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lookRef = useRef(look);
  const reducedRef = useRef(forceReducedMotion);
  const driverRef = useRef<HeatmapDriver | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const generationRef = useRef(0);

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

  useEffect(() => {
    const driver = driverRef.current;
    if (!driver) return;
    const gen = ++generationRef.current;
    const frameNode = frameRef.current;
    const srcChanged = lastSrcRef.current !== imageSrc;
    lastSrcRef.current = imageSrc;

    if (!imageSrc || !image) {
      driver.setFallback(emptyPack());
      driver.setDepth(null);
      driver.snapMaskMix(0);
      if (frameNode) frameNode.style.display = "none";
      onReadStatus?.("idle");
      return;
    }

    let cancelled = false;
    if (srcChanged) {
      onReadStatus?.("reading");
      driver.snapMaskMix(0);
    }

    void (async () => {
      try {
        const el = await loadImage(imageSrc);
        if (cancelled || gen !== generationRef.current) return;
        const fallback = packFallbackFromImage(
          el,
          el.naturalWidth,
          el.naturalHeight,
          format,
        );
        driver.setFallback(fallback);
        if (frameNode) {
          if (fallback.frame) {
            frameNode.style.display = "block";
            frameNode.style.left = `${fallback.frame.x * 100}%`;
            frameNode.style.top = `${fallback.frame.y * 100}%`;
            frameNode.style.width = `${fallback.frame.w * 100}%`;
            frameNode.style.height = `${fallback.frame.h * 100}%`;
          } else {
            frameNode.style.display = "none";
          }
        }

        const flat = flattenOntoGround(el, el.naturalWidth, el.naturalHeight);
        const depth = await readDepth(flat, imageSrc);
        if (cancelled || gen !== generationRef.current) return;
        onReadStatus?.(readStatusAfterDepth(depth.outcome));
        if (depth.outcome !== "ok") return;

        const packed = packDepthField(depth.depth, depth.width, depth.height, format);
        driver.setDepth(packed);
        if (srcChanged && !reducedRef.current) driver.setMaskMixTarget(1);
        else driver.snapMaskMix(1);
      } catch {
        if (cancelled || gen !== generationRef.current) return;
        onReadStatus?.("idle");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [image, imageSrc, format, onReadStatus]);

  const statusText =
    readStatus === "reading"
      ? HEATMAP_COPY.reading
      : readStatus === "rough-read"
        ? HEATMAP_COPY.roughRead
        : !image
          ? HEATMAP_COPY.empty
          : "";

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
      <canvas ref={canvasRef} className="heatmap-poster__canvas" aria-hidden />
      <div ref={frameRef} className="heatmap-poster__frame" aria-hidden />
      {statusText ? (
        <p className="heatmap-status heatmap-poster__status">{statusText}</p>
      ) : null}
    </section>
  );
}
