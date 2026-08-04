"use client";

import { useEffect, useRef } from "react";
import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import {
  DEFAULT_COMPONENT_CONTENT,
  PROGRESS_SIZE,
} from "../../content/types";
import { cn } from "@/lib/utils";

function setFillProgress(el: HTMLDivElement, pct: number) {
  const clamped = Math.min(100, Math.max(0, pct));
  /* Full-width canvas + clip — never animate width (avoids GL resize flash). */
  el.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
}

/**
 * Progress bar — manual value or auto 0→100 loop (DOM-driven, no React thrash).
 * Speed changes update rate only — phase is continuous so the fill never flashes away.
 * Fill uses clip-path so the dither canvas keeps a stable size while progress moves.
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
  const phaseRef = useRef(Math.min(100, Math.max(0, c.progressValue)) / 100);
  const lastTsRef = useRef<number | null>(null);
  const speedRef = useRef(Math.max(0.05, Math.min(1, c.progressSpeed)));

  const manual = Math.min(100, Math.max(0, c.progressValue));
  const auto = c.progressAuto && !reducedMotion;

  useEffect(() => {
    speedRef.current = Math.max(0.05, Math.min(1, c.progressSpeed));
  }, [c.progressSpeed]);

  useEffect(() => {
    const fill = fillRef.current;
    const label = valueRef.current;
    if (!fill) return;

    if (!auto) {
      lastTsRef.current = null;
      phaseRef.current = manual / 100;
      setFillProgress(fill, manual);
      if (label) label.textContent = `${Math.round(manual)}%`;
      return;
    }

    let raf = 0;
    const tick = (now: number) => {
      const last = lastTsRef.current ?? now;
      /* Cap dt so tab-blur / long frames don't jump a full cycle */
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      lastTsRef.current = now;
      // cyclesPerSec from speedRef — changing speed never resets phase
      phaseRef.current = (phaseRef.current + dt * speedRef.current) % 1;
      const pct = phaseRef.current * 100;
      setFillProgress(fill, pct);
      if (label) label.textContent = `${Math.round(pct)}%`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      /* Keep lastTs so a remount from unrelated deps doesn't spike dt */
      lastTsRef.current = null;
    };
  }, [auto, manual]);

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
