"use client";

import {
  useCallback,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import { DEFAULT_COMPONENT_CONTENT, SCROLLBAR_SIZE } from "../../content/types";
import { cn } from "@/lib/utils";

const DEMO_LINES = [
  "Print Density · ordered Bayer field",
  "Material structure rides the thumb surface",
  "Scroll progress drives thumb travel",
  "Drag the thumb or wheel the pane",
  "Vertical and horizontal orientations",
  "Shared WebGL pipeline — one context",
  "Touch targets sized for mobile editing",
  "Neutral chrome · color lives in the material",
  "Soft edges · matrix size · pattern scale",
  "Aurora · wave · lava · orbit modes",
  "Preserve reduced-motion when requested",
  "Export snapshots without blob URLs",
  "System presets stay read-only",
  "User projects autosave on edit",
  "Dock reorder · inspect · apply",
  "FitStage keeps adapters in view",
];

/**
 * Premium scrollbar demo — interactive track + material-filled thumb.
 */
export function DitherScrollbar({
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
  reducedMotion,
  className,
}: DitherAdapterProps) {
  const c = { ...DEFAULT_COMPONENT_CONTENT, ...content };
  const vertical = c.scrollbarOrientation !== "horizontal";
  const sizeToken = SCROLLBAR_SIZE[c.scrollbarSize] ?? SCROLLBAR_SIZE.md;
  // Size token drives stage + default thickness; explicit thickness slider still overrides when advanced.
  const thickness = Math.max(c.scrollbarThickness, sizeToken.thickness);
  const paneRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const paneId = useId();
  const [progress, setProgress] = useState(c.scrollbarProgress);
  const [progressProp, setProgressProp] = useState(c.scrollbarProgress);
  if (c.scrollbarProgress !== progressProp) {
    setProgressProp(c.scrollbarProgress);
    setProgress(c.scrollbarProgress);
  }
  const dragRef = useRef<{
    start: number;
    startProgress: number;
  } | null>(null);

  const syncFromPane = useCallback(() => {
    const pane = paneRef.current;
    if (!pane) return;
    if (vertical) {
      const max = pane.scrollHeight - pane.clientHeight;
      if (max <= 0) {
        setProgress(0);
        return;
      }
      setProgress(pane.scrollTop / max);
    } else {
      const max = pane.scrollWidth - pane.clientWidth;
      if (max <= 0) {
        setProgress(0);
        return;
      }
      setProgress(pane.scrollLeft / max);
    }
  }, [vertical]);

  const applyProgress = useCallback(
    (next: number) => {
      const clamped = Math.min(1, Math.max(0, next));
      setProgress(clamped);
      const pane = paneRef.current;
      if (!pane) return;
      if (vertical) {
        const max = pane.scrollHeight - pane.clientHeight;
        pane.scrollTop = max * clamped;
      } else {
        const max = pane.scrollWidth - pane.clientWidth;
        pane.scrollLeft = max * clamped;
      }
    },
    [vertical],
  );

  const onThumbPointerDown = (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = {
      start: vertical ? e.clientY : e.clientX,
      startProgress: progress,
    };
  };

  const onThumbPointerMove = (e: ReactPointerEvent) => {
    if (!dragRef.current || !trackRef.current) return;
    const track = trackRef.current.getBoundingClientRect();
    const span = vertical ? track.height : track.width;
    if (span <= 0) return;
    const delta =
      ((vertical ? e.clientY : e.clientX) - dragRef.current.start) / span;
    applyProgress(dragRef.current.startProgress + delta);
  };

  const onThumbPointerUp = (e: ReactPointerEvent) => {
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragRef.current = null;
  };

  const onTrackPointerDown = (e: ReactPointerEvent) => {
    if (!trackRef.current) return;
    if ((e.target as HTMLElement).closest(".mde-adapter-scrollbar__thumb")) {
      return;
    }
    const track = trackRef.current.getBoundingClientRect();
    const thumbRatio = 0.32;
    const usable = 1 - thumbRatio;
    const pos = vertical
      ? (e.clientY - track.top) / track.height
      : (e.clientX - track.left) / track.width;
    applyProgress((pos - thumbRatio / 2) / usable);
  };

  const thumbStyle: CSSProperties = vertical
    ? {
        top: `${progress * (100 - 32)}%`,
        height: "32%",
        left: 0,
        width: "100%",
      }
    : {
        left: `${progress * (100 - 32)}%`,
        width: "32%",
        top: 0,
        height: "100%",
      };

  return (
    <div
      className={cn(
        "mde-adapter mde-adapter--scrollbar",
        vertical
          ? "mde-adapter--scrollbar-vertical"
          : "mde-adapter--scrollbar-horizontal",
        className,
      )}
      style={
        {
          "--mde-scroll-thickness": `${thickness}px`,
          "--mde-scroll-radius": `${c.scrollbarRadius}px`,
          "--mde-scroll-stage": `${sizeToken.stage}px`,
        } as CSSProperties
      }
      data-size={c.scrollbarSize}
    >
      <div className="mde-adapter-scrollbar__stage">
        <div
          ref={paneRef}
          id={paneId}
          className="mde-adapter-scrollbar__pane"
          onScroll={syncFromPane}
          tabIndex={0}
          aria-label="Scrollable preview content"
        >
          <div
            className={cn(
              "mde-adapter-scrollbar__content",
              !vertical && "mde-adapter-scrollbar__content--row",
            )}
          >
            {DEMO_LINES.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>

        <div
          ref={trackRef}
          className="mde-adapter-scrollbar__track"
          role="scrollbar"
          aria-controls={paneId}
          aria-orientation={vertical ? "vertical" : "horizontal"}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-label="Material scrollbar"
          onPointerDown={onTrackPointerDown}
        >
          <div
            className="mde-adapter-scrollbar__thumb"
            style={thumbStyle}
            onPointerDown={onThumbPointerDown}
            onPointerMove={onThumbPointerMove}
            onPointerUp={onThumbPointerUp}
            onPointerCancel={onThumbPointerUp}
          >
            <SurfaceCanvas
              params={{
                ...params,
                animationSpeed: reducedMotion
                  ? 0
                  : Math.max(params.animationSpeed, 1),
              }}
              animation={animation}
              interaction={interaction}
              color={color}
              light={light}
              dither={dither}
              material={material}
              sourceUrl={sourceUrl}
              sourceLightMix={sourceLightMix}
              reducedMotion={reducedMotion}
              aria-label="Scrollbar thumb material"
            />
          </div>
        </div>
      </div>
      <p className="mde-adapter-scrollbar__note">{c.scrollbarNote}</p>
      <div
        className="mde-adapter-scrollbar__meter"
        aria-hidden
      >
        <span style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </div>
  );
}
