"use client";

import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import { DEFAULT_COMPONENT_CONTENT } from "../../content/types";
import { cn } from "@/lib/utils";

export function DitherInput({
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
  return (
    <label className={cn("mde-adapter mde-adapter--input", className)}>
      <span className="mde-adapter-input__label">{c.inputLabel}</span>
      <span className="mde-adapter-input__field">
        <span className="mde-adapter-input__fill" aria-hidden>
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
          />
        </span>
        <input
          type="email"
          placeholder={c.inputPlaceholder}
          autoComplete="off"
        />
      </span>
    </label>
  );
}
