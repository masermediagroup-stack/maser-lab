"use client";

import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import { cn } from "@/lib/utils";

export function DitherInput({
  params,
  animation,
  interaction,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  return (
    <label className={cn("mde-adapter mde-adapter--input", className)}>
      <span className="mde-adapter-input__label">Email</span>
      <span className="mde-adapter-input__field">
        <span className="mde-adapter-input__fill" aria-hidden>
          <SurfaceCanvas
            params={params}
            animation={animation}
            interaction={interaction}
            reducedMotion={reducedMotion}
          />
        </span>
        <input type="email" placeholder="you@maser.media" autoComplete="off" />
      </span>
    </label>
  );
}
