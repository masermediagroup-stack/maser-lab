"use client";

import { useEffect, useRef } from "react";
import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import {
  DEFAULT_COMPONENT_CONTENT,
  PROGRESS_SIZE,
} from "../../content/types";
import { cn } from "@/lib/utils";

/**
 * Progress bar — manual value or auto 0→100 loop (DOM-driven, no React thrash).
 */
export function DitherProgressBar({
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
  const size = PROGRESS_SIZE[c.progressSize] ?? PROGRESS_SIZE.md;
  const fillRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const manual = Math.min(100, Math.max(0, c.progressValue));
  const auto = c.progressAuto && !reducedMotion;

  useEffect(() => {
    const fill = fillRef.current;
    const label = valueRef.current;
    if (!fill) return;

    if (!auto) {
      fill.style.width = `${manual}%`;
      if (label) label.textContent = `${Math.round(manual)}%`;
      return;
    }

    let raf = 0;
    const t0 = performance.now();
    const cyclesPerSec = Math.max(0.05, Math.min(1, c.progressSpeed));

    const tick = (now: number) => {
      const elapsed = (now - t0) / 1000;
      const phase = (elapsed * cyclesPerSec) % 1;
      const pct = phase * 100;
      fill.style.width = `${pct}%`;
      if (label) label.textContent = `${Math.round(pct)}%`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [auto, manual, c.progressSpeed]);

  const ariaNow = auto ? undefined : manual;

  return (
    <div
      className={cn("mde-adapter mde-adapter--progress", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={ariaNow}
      aria-label={c.progressLabel}
      data-size={c.progressSize}
      style={{
        width: `min(100%, ${size.width}px)`,
        ["--mde-progress-h" as string]: `${size.height}px`,
      }}
    >
      <div className="mde-adapter-progress__track">
        <div ref={fillRef} className="mde-adapter-progress__fill">
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
          />
        </div>
      </div>
      <span ref={valueRef} className="mde-adapter-progress__value">
        {Math.round(manual)}%
      </span>
    </div>
  );
}
