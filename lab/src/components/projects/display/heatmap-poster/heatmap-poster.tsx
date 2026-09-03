"use client";

import { useCallback, useEffect, useRef } from "react";
import { HEATMAP_COPY } from "./copy";
import { HEATMAP_DEFAULTS } from "./constants";
import { emptyPack, packImageField } from "./prepare-shape";
import { computeLayout, drawPoster, type PosterColors } from "./poster-renderer";
import { startHeatmapField, type HeatmapDriver } from "./start-heatmap";
import { heatmapTrace } from "./trace";
import type { HeatmapPosterProps, PackedMask } from "./types";
import "./tokens.css";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const local = src.startsWith("blob:") || src.startsWith("data:");
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
  pack: PackedMask;
};

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
  const posterCanvasRef = useRef<HTMLCanvasElement>(null);
  const heatCanvasRef = useRef<HTMLCanvasElement>(null);
  const lookRef = useRef(look);
  const reducedRef = useRef(forceReducedMotion);
  const driverRef = useRef<HeatmapDriver | null>(null);
  const queuedPackRef = useRef<PackedMask>(emptyPack());
  const generationRef = useRef(0);
  const cachedReadRef = useRef<CachedRead | null>(null);
  const onReadStatusRef = useRef(onReadStatus);
  const captionRef = useRef(caption);
  const readStatusRef = useRef(readStatus);
  const imageRef = useRef(image);
  const fileStatusRef = useRef(fileStatus);

  useEffect(() => {
    lookRef.current = look;
    reducedRef.current = forceReducedMotion;
    onReadStatusRef.current = onReadStatus;
    captionRef.current = caption;
    readStatusRef.current = readStatus;
    imageRef.current = image;
    fileStatusRef.current = fileStatus;
  });

  const applyPack = useCallback((pack: PackedMask) => {
    queuedPackRef.current = pack;
    const driver = driverRef.current;
    if (driver) driver.setPack(pack);
  }, []);

  const drawFrame = useCallback(() => {
    const posterCanvas = posterCanvasRef.current;
    const heatCanvas = heatCanvasRef.current;
    if (!posterCanvas) return;

    const cardW = posterCanvas.clientWidth;
    const cardH = posterCanvas.clientHeight;
    if (cardW < 1 || cardH < 1) return;

    const dpr = window.devicePixelRatio || 1;
    if (
      posterCanvas.width !== Math.round(cardW * dpr) ||
      posterCanvas.height !== Math.round(cardH * dpr)
    ) {
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
            : !img
              ? HEATMAP_COPY.empty
              : "";

    if (heatCanvas) {
      heatCanvas.style.height = `${layout.imagePlateH}px`;
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
    let cancelled = false;
    let driver: HeatmapDriver | null = null;
    heatmapTrace("driver:start");
    void (async () => {
      driver = await startHeatmapField(
        {
          canvas: heatCanvas,
          lookRef,
          reducedRef,
          onReady: () => {
            heatmapTrace("driver:ready");
            drawFrame();
          },
        },
        () => cancelled,
      );
      if (cancelled) {
        driver?.dispose();
        return;
      }
      if (!driver) return;
      driverRef.current = driver;
      driver.setPack(queuedPackRef.current);
      drawFrame();
    })();
    return () => {
      cancelled = true;
      driver?.dispose();
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

  useEffect(() => {
    const gen = ++generationRef.current;
    const srcChanged = lastSrcRef.current !== imageSrc;
    lastSrcRef.current = imageSrc;

    if (!imageSrc || !image) {
      cachedReadRef.current = null;
      applyPack(emptyPack());
      onReadStatusRef.current?.("idle");
      return;
    }

    if (!srcChanged && cachedReadRef.current?.src === imageSrc) {
      applyPack(cachedReadRef.current.pack);
      return;
    }

    let cancelled = false;
    heatmapTrace("pipeline:start", { srcChanged });
    onReadStatusRef.current?.("reading");

    void (async () => {
      try {
        const el = await loadImage(imageSrc);
        if (cancelled || gen !== generationRef.current) return;
        if (el.naturalWidth < 1 || el.naturalHeight < 1) {
          throw new Error("decoded image has no pixels");
        }

        heatmapTrace("silhouette:start", {
          w: el.naturalWidth,
          h: el.naturalHeight,
        });
        const pack = packImageField(el);
        heatmapTrace("field:packed", { w: pack.width, h: pack.height });
        if (cancelled || gen !== generationRef.current) return;

        cachedReadRef.current = { src: imageSrc, pack };
        applyPack(pack);
        drawFrame();
        onReadStatusRef.current?.("idle");
        heatmapTrace("field:bound-and-rendered");
      } catch (err) {
        heatmapTrace("pipeline:error", {
          message: err instanceof Error ? err.message : String(err),
        });
        console.error("[heatmap] pipeline:error", err);
        if (cancelled || gen !== generationRef.current) return;
        if (!cachedReadRef.current) applyPack(emptyPack());
        onReadStatusRef.current?.("idle");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [imageSrc, image, applyPack, drawFrame]);

  const hasRealText = caption != null && caption.length > 0;
  const showPlaceholder = !isExport && !hasRealText && image != null;

  return (
    <section
      className={["heatmap-poster", className].filter(Boolean).join(" ")}
      data-format={format}
      aria-label="Heatmap poster"
    >
      <canvas ref={posterCanvasRef} className="heatmap-poster__poster-canvas" />
      <canvas
        ref={heatCanvasRef}
        className="heatmap-poster__heat-source"
        aria-hidden
      />
      {showPlaceholder ? (
        <div className="heatmap-poster__caption-placeholder" aria-hidden>
          <p className="heatmap-poster__caption-label">{HEATMAP_COPY.captionLabel}</p>
          <p className="heatmap-poster__caption-text">{HEATMAP_COPY.captionPlaceholder}</p>
        </div>
      ) : null}
    </section>
  );
}
