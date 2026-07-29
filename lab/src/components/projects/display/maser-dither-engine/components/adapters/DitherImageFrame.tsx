"use client";

import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import { cn } from "@/lib/utils";

export function DitherImageFrame({
  params,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  return (
    <figure className={cn("mde-adapter mde-adapter--frame", className)}>
      <div className="mde-adapter-frame__matte" aria-hidden>
        <SurfaceCanvas params={params} reducedMotion={reducedMotion} />
      </div>
      <div className="mde-adapter-frame__photo">
        <div className="mde-adapter-frame__placeholder">Image</div>
      </div>
      <figcaption>Dither matte · photo stays crisp</figcaption>
    </figure>
  );
}
