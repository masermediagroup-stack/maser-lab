"use client";

/**
 * Sprint 8 — Client review / presentation mode (no editor chrome).
 */

import { createElement } from "react";
import { adapters, getComponent } from "../components/registry";
import type { ComponentId } from "../types";
import type { MaserDitherRuntimeConfig } from "../export";
import { cn } from "@/lib/utils";

export type PresentationViewProps = {
  runtime: MaserDitherRuntimeConfig;
  title?: string;
  description?: string;
  reducedMotion?: boolean;
  onOpenEditor?: () => void;
  onDuplicate?: () => void;
  onFullscreen?: () => void;
};

export function PresentationView({
  runtime,
  title,
  description,
  reducedMotion = false,
  onOpenEditor,
  onDuplicate,
  onFullscreen,
}: PresentationViewProps) {
  const def = getComponent(runtime.componentId);
  const materialName = runtime.material.materialId;
  const adapterId = runtime.componentId as ComponentId;
  const reduce =
    runtime.accessibility.reducedMotionPolicy === "force-reduce"
      ? true
      : runtime.accessibility.reducedMotionPolicy === "ignore"
        ? false
        : reducedMotion;

  return (
    <div className="mde-present" aria-label="Presentation mode">
      <header className="mde-present__header">
        <div>
          <p className="mde-present__eyebrow">Client review</p>
          <h1>{title || def?.label || runtime.componentId}</h1>
          {description ? <p>{description}</p> : null}
          <p className="mde-present__meta">
            Material <strong>{materialName}</strong>
            {" · "}
            {def?.label}
          </p>
        </div>
        <div className="mde-present__actions">
          {onFullscreen ? (
            <button type="button" className="mde-btn" onClick={onFullscreen}>
              Fullscreen
            </button>
          ) : null}
          {onOpenEditor ? (
            <button type="button" className="mde-btn" onClick={onOpenEditor}>
              Open in Editor
            </button>
          ) : null}
          {onDuplicate ? (
            <button
              type="button"
              className="mde-btn mde-btn--primary"
              onClick={onDuplicate}
            >
              Duplicate as Project
            </button>
          ) : null}
        </div>
      </header>
      <div className={cn("mde-present__stage")}>
        {createElement(adapters[adapterId], {
          params: runtime.params,
          animation: runtime.animation,
          interaction: runtime.interaction,
          color: runtime.color,
          light: runtime.light,
          dither: runtime.dither,
          material: runtime.material,
          content: runtime.content,
          sourceUrl: runtime.sourceUrl,
          sourceLightMix: runtime.sourceLightMix,
          reducedMotion: reduce,
          className: "mde-present__adapter",
        })}
      </div>
    </div>
  );
}
