"use client";

import { useCallback, useEffect, useRef } from "react";
import { HEATMAP_COPY } from "./copy";
import { HEATMAP_DEFAULTS } from "./constants";
import { closeDecoded, decodeImageSource, sourceKey } from "./decode-source";
import { emptyPack, packImageField } from "./prepare-shape";
import { computeLayout, drawPoster, type PosterColors } from "./poster-renderer";
import { startHeatmapField, type HeatmapDriver } from "./start-heatmap";
import { heatmapTrace } from "./trace";
import type { HeatmapPosterProps, PackedMask } from "./types";
import "./tokens.css";

type CachedRead = {
  key: string;
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
  onFileStatus,
  caption,
  isExport = false,
}: HeatmapPosterProps) {
  const posterCanvasRef = useRef<HTMLCanvasElement>(null);
  const heatHostRef = useRef<HTMLDivElement>(null);
  const lookRef = useRef(look);
  const reducedRef = useRef(forceReducedMotion);
  const driverRef = useRef<HeatmapDriver | null>(null);
  const queuedPackRef = useRef<PackedMask>(emptyPack());
  const generationRef = useRef(0);
  const cachedReadRef = useRef<CachedRead | null>(null);
  const onReadStatusRef = useRef(onReadStatus);
  const onFileStatusRef = useRef(onFileStatus);
  const captionRef = useRef(caption);
  const readStatusRef = useRef(readStatus);
  const imageRef = useRef(image);
  const fileStatusRef = useRef(fileStatus);

  useEffect(() => {
    lookRef.current = look;
    reducedRef.current = forceReducedMotion;
    onReadStatusRef.current = onReadStatus;
    onFileStatusRef.current = onFileStatus;
    captionRef.current = caption;
    readStatusRef.current = readStatus;
    imageRef.current = image;
    fileStatusRef.current = fileStatus;
  });

  const applyPack = useCallback((pack: PackedMask) => {
    queuedPackRef.current = pack;
    const driver = driverRef.current;
    if (!driver) return;
    driver.setSourceImage(pack);
  }, []);

  const drawFrame = useCallback(() => {
    const posterCanvas = posterCanvasRef.current;
    const heatHost = heatHostRef.current;
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

    if (heatHost) {
      heatHost.style.height = `${layout.imagePlateH}px`;
    }

    drawPoster(ctx, layout, colors, captionRef.current, statusText, dpr);
  }, []);

  useEffect(() => {
    const host = heatHostRef.current;
    if (!host) return;
    let cancelled = false;
    let driver: HeatmapDriver | null = null;

    const canvas = document.createElement("canvas");
    canvas.className = "heatmap-poster__heat-canvas";
    canvas.setAttribute("aria-hidden", "true");
    host.replaceChildren(canvas);

    heatmapTrace("driver:start");
    void (async () => {
      driver = await startHeatmapField(
        {
          canvas,
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
      driver.setSourceImage(queuedPackRef.current);
      drawFrame();
    })();

    return () => {
      cancelled = true;
      driver?.dispose();
      driverRef.current = null;
      host.replaceChildren();
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

  const imageKey = sourceKey(image);
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const gen = ++generationRef.current;
    const keyChanged = lastKeyRef.current !== imageKey;
    lastKeyRef.current = imageKey;

    if (!imageKey || !image) {
      cachedReadRef.current = null;
      applyPack(emptyPack());
      onReadStatusRef.current?.("idle");
      drawFrame();
      return;
    }

    if (!keyChanged && cachedReadRef.current?.key === imageKey) {
      applyPack(cachedReadRef.current.pack);
      return;
    }

    let cancelled = false;
    heatmapTrace("pipeline:start", { keyChanged, hasFile: Boolean(image.file) });
    onReadStatusRef.current?.("reading");
    drawFrame();

    void (async () => {
      let decoded: CanvasImageSource | null = null;
      try {
        decoded = await decodeImageSource(image);
        if (cancelled || gen !== generationRef.current) return;

        const size =
          "naturalWidth" in decoded
            ? {
                w: (decoded as HTMLImageElement).naturalWidth,
                h: (decoded as HTMLImageElement).naturalHeight,
              }
            : {
                w: (decoded as ImageBitmap).width,
                h: (decoded as ImageBitmap).height,
              };
        if (size.w < 1 || size.h < 1) {
          throw new Error("decoded image has no pixels");
        }

        heatmapTrace("silhouette:start", { w: size.w, h: size.h });
        const pack = packImageField(decoded);
        heatmapTrace("field:packed", { w: pack.width, h: pack.height });
        if (cancelled || gen !== generationRef.current) return;

        cachedReadRef.current = { key: imageKey, pack };
        applyPack(pack);
        onFileStatusRef.current?.("ok");
        onReadStatusRef.current?.("idle");
        drawFrame();
        heatmapTrace("field:bound-and-rendered");
      } catch (err) {
        heatmapTrace("pipeline:error", {
          message: err instanceof Error ? err.message : String(err),
        });
        console.error("[heatmap] pipeline:error", err);
        if (cancelled || gen !== generationRef.current) return;
        cachedReadRef.current = null;
        applyPack(emptyPack());
        onFileStatusRef.current?.("error");
        onReadStatusRef.current?.("idle");
        drawFrame();
      } finally {
        if (decoded) closeDecoded(decoded);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [imageKey, image, applyPack, drawFrame]);

  const hasRealText = caption != null && caption.length > 0;
  const showPlaceholder = !isExport && !hasRealText && image != null;

  return (
    <section
      className={["heatmap-poster", className].filter(Boolean).join(" ")}
      data-format={format}
      aria-label="Heatmap poster"
    >
      <div ref={heatHostRef} className="heatmap-poster__heat-host" aria-hidden />
      <canvas ref={posterCanvasRef} className="heatmap-poster__poster-canvas" />
      {showPlaceholder ? (
        <div className="heatmap-poster__caption-placeholder" aria-hidden>
          <p className="heatmap-poster__caption-label">{HEATMAP_COPY.captionLabel}</p>
          <p className="heatmap-poster__caption-text">{HEATMAP_COPY.captionPlaceholder}</p>
        </div>
      ) : null}
    </section>
  );
}
