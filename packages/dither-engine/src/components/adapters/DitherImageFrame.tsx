"use client";

import {
  useCallback,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type DragEvent,
} from "react";
import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import {
  DEFAULT_COMPONENT_CONTENT,
  resolveImageAspect,
} from "../../content/types";
import { cn } from "../../lib/utils";

/**
 * Image frame — upload, aspect ratios, fit modes, material overlay.
 */
export function DitherImageFrame({
  params,
  animation,
  interaction,
  color,
  light,
  dither,
  material,
  content,
  sourceUrl,
  sourceLightMix,
  onSourceChange,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  const c = { ...DEFAULT_COMPONENT_CONTENT, ...content };
  const hasSource = Boolean(sourceUrl);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const aspect = resolveImageAspect(c);

  const applyFile = useCallback(
    (file: File | null | undefined) => {
      if (!file || !onSourceChange) return;
      if (!file.type.startsWith("image/")) return;
      onSourceChange({ url: URL.createObjectURL(file) });
    },
    [onSourceChange],
  );

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    applyFile(e.target.files?.[0]);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    applyFile(e.dataTransfer.files?.[0]);
  };

  const clear = () => {
    if (!onSourceChange) return;
    onSourceChange({ url: null });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <figure
      className={cn("mde-adapter mde-adapter--frame", className)}
      style={
        {
          "--mde-frame-radius": `${c.imageRadius}px`,
          "--mde-frame-pad": `${c.imagePadding}px`,
          "--mde-frame-border": `${c.imageBorder}px`,
        } as CSSProperties
      }
    >
      <div
        className={cn(
          "mde-adapter-frame__matte",
          hasSource && "mde-adapter-frame__matte--sourced",
          dragging && "mde-adapter-frame__matte--drag",
          `mde-adapter-frame__matte--fit-${c.imageFit}`,
        )}
        style={{ aspectRatio: String(aspect) }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <SurfaceCanvas
          params={params}
          animation={animation}
          interaction={interaction}
          color={color}
          light={light}
          dither={dither}
          material={material}
          sourceUrl={sourceUrl}
          sourceLightMix={sourceLightMix}
          reducedMotion={reducedMotion}
          aria-label={
            hasSource
              ? "Dithered source image"
              : "Dither matte — drop or upload an image"
          }
        />

        {c.imageOverlay > 0.01 ? (
          <div
            className="mde-adapter-frame__overlay"
            style={{ opacity: c.imageOverlay }}
            aria-hidden
          />
        ) : null}

        {!hasSource ? (
          <label
            htmlFor={inputId}
            className="mde-adapter-frame__empty mde-adapter-frame__empty--interactive"
          >
            <span>Drop image or click to upload</span>
            <span className="mde-adapter-frame__empty-sub">
              {c.imageAspect} · {c.imageFit}
            </span>
          </label>
        ) : null}

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={onFile}
        />
      </div>

      <figcaption className="mde-adapter-frame__caption">
        <span>
          {hasSource
            ? c.imageCaption || "Dithered source image"
            : c.imageCaption || "Upload a photo to dither"}
        </span>
        <span className="mde-adapter-frame__actions">
          {hasSource ? (
            <>
              <label htmlFor={inputId} className="mde-btn mde-btn--compact">
                Replace
              </label>
              <button
                type="button"
                className="mde-btn mde-btn--compact"
                onClick={clear}
              >
                Remove
              </button>
            </>
          ) : (
            <label htmlFor={inputId} className="mde-btn mde-btn--compact">
              Upload
            </label>
          )}
        </span>
      </figcaption>
    </figure>
  );
}
