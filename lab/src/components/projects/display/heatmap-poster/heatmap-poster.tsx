"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HEATMAP_COPY } from "./copy";
import { FORMAT_ASPECT, HEATMAP_DEFAULTS } from "./constants";
import { prefetchDepthModel, readDepth } from "./depth-estimator";
import {
  emptyPack,
  flattenOntoGround,
  packSubjectField,
  readFullDepthMass,
  readFullSubject,
  type FocalPoint,
} from "./prepare-mask";
import { paintBlobMap, type SubjectMassReport } from "./subject-mass";
import { computeLayout, drawPoster, type PosterColors } from "./poster-renderer";
import { readStatusAfterDepth } from "./read-status";
import { startHeatmap, type HeatmapDriver } from "./start-heatmap";
import { heatmapTrace } from "./trace";
import type { HeatmapPosterProps } from "./types";
import "./tokens.css";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const local = src.startsWith("blob:") || src.startsWith("data:");
    // blob:/data: are same-origin. Anonymous CORS on them rejects decode in Chrome.
    if (!local) image.crossOrigin = "anonymous";
    heatmapTrace("decode:start", { srcKind: local ? "local" : "remote" });
    image.onload = () => {
      const finish = () => {
        heatmapTrace("decode:resolved", {
          w: image.naturalWidth,
          h: image.naturalHeight,
        });
        resolve(image);
      };
      if (typeof image.decode === "function") {
        image.decode().then(finish).catch(finish);
      } else {
        finish();
      }
    };
    image.onerror = () => {
      heatmapTrace("decode:failed", { srcKind: local ? "local" : "remote" });
      reject(new Error("image load failed"));
    };
    image.src = src;
  });
}

type CachedRead = {
  src: string;
  el: HTMLImageElement;
  centroid: FocalPoint;
  lumaField: { field: Float32Array; width: number; height: number; labels: Int32Array };
  lumaReport: SubjectMassReport;
  depthField: { field: Float32Array; width: number; height: number } | null;
  depthCentroid: FocalPoint | null;
  depthReport: SubjectMassReport | null;
};

function publishMass(
  report: SubjectMassReport,
  labels?: Int32Array,
  w?: number,
  h?: number,
  field?: Float32Array,
) {
  if (typeof window === "undefined") return;
  const win = window as Window & {
    __heatmapMassReport?: SubjectMassReport;
    __heatmapBlobMap?: { width: number; height: number; pixels: Uint8ClampedArray };
    __heatmapMassField?: { width: number; height: number; field: Float32Array };
  };
  win.__heatmapMassReport = report;
  if (labels && w && h) {
    win.__heatmapBlobMap = {
      width: w,
      height: h,
      pixels: paintBlobMap(labels, w, h, report.winner?.label ?? null),
    };
  }
  if (field && w && h) {
    win.__heatmapMassField = { width: w, height: h, field };
  }
}

function plateAspect(
  cardW: number,
  cardH: number,
  caption: string | undefined,
  format: keyof typeof FORMAT_ASPECT,
): number {
  const layout = computeLayout(cardW, cardH, caption);
  return layout.imagePlateH > 0 ? cardW / layout.imagePlateH : FORMAT_ASPECT[format];
}

function resolveColors(look: typeof HEATMAP_DEFAULTS): PosterColors {
  const toRgb = (c: readonly [number, number, number]) =>
    `rgb(${Math.round(c[0] * 255)} ${Math.round(c[1] * 255)} ${Math.round(c[2] * 255)})`;
  return {
    page: "#000000",
    ground: toRgb(look.ground),
    frame: "rgba(244, 241, 234, 0.18)",
    type: "#f4f1ea",
  };
}

export function HeatmapPoster({
  className,
  format = "9-16",
  look = HEATMAP_DEFAULTS,
  image = null,
  forceReducedMotion = false,
  readStatus = "idle",
  fileStatus = "ok",
  onReadStatus,
  caption,
  isExport = false,
}: HeatmapPosterProps) {
  const rootRef = useRef<HTMLElement>(null);
  const posterCanvasRef = useRef<HTMLCanvasElement>(null);
  const heatCanvasRef = useRef<HTMLCanvasElement>(null);
  const lookRef = useRef(look);
  const reducedRef = useRef(forceReducedMotion);
  const driverRef = useRef<HeatmapDriver | null>(null);
  const [driverBoot, setDriverBoot] = useState(0);
  const generationRef = useRef(0);
  const cachedReadRef = useRef<CachedRead | null>(null);
  const onReadStatusRef = useRef(onReadStatus);
  const captionRef = useRef(caption);
  const readStatusRef = useRef(readStatus);
  const isExportRef = useRef(isExport);
  const imageRef = useRef(image);
  const formatRef = useRef(format);
  const fileStatusRef = useRef(fileStatus);
  const lastPlateAspectRef = useRef<number | null>(null);
  const applyPacksForAspectRef = useRef<
    ((cached: CachedRead, aspect: number) => void) | null
  >(null);

  useEffect(() => {
    lookRef.current = look;
    reducedRef.current = forceReducedMotion;
    onReadStatusRef.current = onReadStatus;
    captionRef.current = caption;
    readStatusRef.current = readStatus;
    isExportRef.current = isExport;
    imageRef.current = image;
    formatRef.current = format;
    fileStatusRef.current = fileStatus;
  });

  useEffect(() => {
    prefetchDepthModel();
  }, []);

  const drawFrame = useCallback(() => {
    const posterCanvas = posterCanvasRef.current;
    const heatCanvas = heatCanvasRef.current;
    if (!posterCanvas) return;

    const cardW = posterCanvas.clientWidth;
    const cardH = posterCanvas.clientHeight;
    if (cardW < 1 || cardH < 1) return;

    const dpr = window.devicePixelRatio || 1;
    if (posterCanvas.width !== Math.round(cardW * dpr) || posterCanvas.height !== Math.round(cardH * dpr)) {
      posterCanvas.width = Math.round(cardW * dpr);
      posterCanvas.height = Math.round(cardH * dpr);
    }

    const ctx = posterCanvas.getContext("2d");
    if (!ctx) return;

    const layout = computeLayout(cardW, cardH, captionRef.current);
    const colors = resolveColors(lookRef.current);

    const rs = readStatusRef.current;
    const img = imageRef.current;
    const fs = fileStatusRef.current;
    const statusText =
      fs === "error"
        ? HEATMAP_COPY.fileError
        : fs === "too-big"
          ? HEATMAP_COPY.tooBig
          : rs === "reading"
            ? HEATMAP_COPY.reading
            : rs === "rough-read"
              ? HEATMAP_COPY.roughRead
              : !img
                ? HEATMAP_COPY.empty
                : "";

    if (heatCanvas) {
      heatCanvas.style.height = `${layout.imagePlateH}px`;
    }

    const nextAspect = plateAspect(cardW, cardH, captionRef.current, formatRef.current);
    const cached = cachedReadRef.current;
    if (cached && lastPlateAspectRef.current !== nextAspect) {
      lastPlateAspectRef.current = nextAspect;
      applyPacksForAspectRef.current?.(cached, nextAspect);
    }

    drawPoster(
      heatCanvas ?? null,
      ctx,
      layout,
      colors,
      captionRef.current,
      statusText,
      dpr,
    );
  }, []);

  useEffect(() => {
    const heatCanvas = heatCanvasRef.current;
    if (!heatCanvas) return;
    heatmapTrace("driver:start");
    const driver = startHeatmap({
      canvas: heatCanvas,
      lookRef,
      reducedRef,
      onReady: () => {
        heatmapTrace("driver:ready");
        setDriverBoot((n) => n + 1);
        drawFrame();
      },
    });
    driverRef.current = driver;
    setDriverBoot((n) => n + 1);
    driver.setFallback(emptyPack());
    return () => {
      driver.dispose();
      driverRef.current = null;
    };
  }, [drawFrame]);

  useEffect(() => {
    drawFrame();
  }, [caption, readStatus, fileStatus, isExport, look, format, image, drawFrame]);

  useEffect(() => {
    const posterCanvas = posterCanvasRef.current;
    if (!posterCanvas) return;
    const ro = new ResizeObserver(() => drawFrame());
    ro.observe(posterCanvas);
    return () => ro.disconnect();
  }, [drawFrame]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      drawFrame();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [drawFrame]);

  const imageSrc = image?.src ?? null;
  const lastSrcRef = useRef<string | null>(null);

  const applyPacksForAspect = useCallback(
    (cached: CachedRead, aspect: number) => {
      const driver = driverRef.current;
      if (!driver) return;
      const focal = cached.depthCentroid ?? cached.centroid;
      const fallback = packSubjectField(
        cached.lumaField.field,
        cached.lumaField.width,
        cached.lumaField.height,
        aspect,
        focal,
      );
      heatmapTrace("luma:bound", {
        w: fallback.width,
        h: fallback.height,
        hasDepth: Boolean(cached.depthField),
      });
      driver.setFallback(fallback);
      heatmapTrace("frame:luma-set");
      if (cached.depthField) {
        const packed = packSubjectField(
          cached.depthField.field,
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
    applyPacksForAspectRef.current = applyPacksForAspect;
  });

  const currentPlateAspect = (): number => {
    const poster = posterCanvasRef.current;
    if (!poster || poster.clientWidth < 1 || poster.clientHeight < 1) {
      return FORMAT_ASPECT[formatRef.current];
    }
    return plateAspect(
      poster.clientWidth,
      poster.clientHeight,
      captionRef.current,
      formatRef.current,
    );
  };

  useEffect(() => {
    const driver = driverRef.current;
    if (!driver) {
      heatmapTrace("pipeline:wait-driver", { hasSrc: Boolean(imageSrc) });
      return;
    }
    const gen = ++generationRef.current;
    const srcChanged = lastSrcRef.current !== imageSrc;
    lastSrcRef.current = imageSrc;

    if (!imageSrc || !image) {
      driver.setFallback(emptyPack());
      driver.setDepth(null);
      driver.snapMaskMix(0);
      cachedReadRef.current = null;
      lastPlateAspectRef.current = null;
      onReadStatusRef.current?.("idle");
      return;
    }

    if (!srcChanged && cachedReadRef.current?.src === imageSrc) {
      const aspect = currentPlateAspect();
      lastPlateAspectRef.current = aspect;
      applyPacksForAspect(cachedReadRef.current, aspect);
      return;
    }

    let cancelled = false;
    heatmapTrace("pipeline:start", { srcChanged });
    onReadStatusRef.current?.("reading");
    driver.snapMaskMix(0);

    void (async () => {
      try {
        const el = await loadImage(imageSrc);
        if (cancelled || gen !== generationRef.current) return;
        if (el.naturalWidth < 1 || el.naturalHeight < 1) {
          throw new Error("decoded image has no pixels");
        }

        heatmapTrace("flatten:start", {
          w: el.naturalWidth,
          h: el.naturalHeight,
        });
        const fullRead = readFullSubject(el, el.naturalWidth, el.naturalHeight);
        heatmapTrace("luma:packed", {
          w: fullRead.width,
          h: fullRead.height,
          cx: fullRead.centroid.cx,
          cy: fullRead.centroid.cy,
        });
        publishMass(
          fullRead.report,
          fullRead.labels,
          fullRead.width,
          fullRead.height,
          fullRead.subject,
        );

        const cached: CachedRead = {
          src: imageSrc,
          el,
          centroid: fullRead.centroid,
          lumaField: {
            field: fullRead.subject,
            width: fullRead.width,
            height: fullRead.height,
            labels: fullRead.labels,
          },
          lumaReport: fullRead.report,
          depthField: null,
          depthCentroid: null,
          depthReport: null,
        };
        cachedReadRef.current = cached;

        const firstAspect = currentPlateAspect();
        lastPlateAspectRef.current = firstAspect;
        applyPacksForAspect(cached, firstAspect);
        heatmapTrace("luma:bound-and-rendered");

        const flat = flattenOntoGround(el, el.naturalWidth, el.naturalHeight);
        heatmapTrace("ground:composited");
        heatmapTrace("depth:start");
        const depth = await readDepth(flat, imageSrc);
        if (cancelled || gen !== generationRef.current) return;
        heatmapTrace("depth:result", { outcome: depth.outcome });

        onReadStatusRef.current?.(readStatusAfterDepth(depth.outcome));

        if (depth.outcome === "ok") {
          const depthMass = readFullDepthMass(depth.depth, depth.width, depth.height);
          if (depthMass.crowned) {
            cached.depthField = {
              field: depthMass.subject,
              width: depthMass.width,
              height: depthMass.height,
            };
            cached.depthCentroid = depthMass.centroid;
            cached.depthReport = depthMass.report;
            publishMass(
              depthMass.report,
              depthMass.labels,
              depthMass.width,
              depthMass.height,
              depthMass.subject,
            );

            const depthAspect = currentPlateAspect();
            lastPlateAspectRef.current = depthAspect;
            applyPacksForAspect(cached, depthAspect);
            heatmapTrace("depth:bound");

            if (!reducedRef.current) driver.setMaskMixTarget(1);
            else driver.snapMaskMix(1);
          } else {
            heatmapTrace("depth:luma-fallback", { path: depthMass.report.path });
            cached.depthReport = depthMass.report;
          }
        }
      } catch (err) {
        heatmapTrace("pipeline:error", {
          message: err instanceof Error ? err.message : String(err),
        });
        if (cancelled || gen !== generationRef.current) return;
        onReadStatusRef.current?.("rough-read");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [imageSrc, image, format, applyPacksForAspect, driverBoot]);

  const hasRealText = caption != null && caption.length > 0;
  const showPlaceholder = !isExport && !hasRealText && image != null;

  return (
    <section
      ref={rootRef}
      className={["heatmap-poster", className].filter(Boolean).join(" ")}
      data-format={format}
      aria-label="Heatmap poster"
    >
      {/* Full-card poster canvas: the ONE renderer */}
      <canvas
        ref={posterCanvasRef}
        className="heatmap-poster__poster-canvas"
      />
      {/* Heat source canvas: fed by vgpu/Canvas2D driver, hidden */}
      <canvas
        ref={heatCanvasRef}
        className="heatmap-poster__heat-source"
        aria-hidden
      />
      {/* Placeholder chrome: DOM overlay, editing only, not in export */}
      {showPlaceholder ? (
        <div className="heatmap-poster__caption-placeholder" aria-hidden>
          <p className="heatmap-poster__caption-label">{HEATMAP_COPY.captionLabel}</p>
          <p className="heatmap-poster__caption-text">{HEATMAP_COPY.captionPlaceholder}</p>
        </div>
      ) : null}
    </section>
  );
}
