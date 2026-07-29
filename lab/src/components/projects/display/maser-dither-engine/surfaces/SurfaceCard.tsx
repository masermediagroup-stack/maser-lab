"use client";

import { useCallback, useRef, useState, type PointerEvent } from "react";
import { SurfaceCanvas } from "../react/SurfaceCanvas";
import type { SurfaceCardProps } from "../types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * First surface adapter — editorial card with procedural media plane.
 * Cursor influence is subtle; no dramatic transforms.
 */
export function SurfaceCard({
  title = "Surface Print",
  description = "Procedural monochrome material driven by the Maser Surface Engine.",
  buttonLabel = "Explore",
  onButtonClick,
  params,
  animation,
  reducedMotion = false,
  className,
}: SurfaceCardProps) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);

  const handleMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      const el = mediaRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPointer({
        x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
        y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
      });
    },
    [reducedMotion],
  );

  const handleLeave = useCallback(() => {
    setPointer(null);
  }, []);

  return (
    <article
      className={cn("mse-card", className)}
      aria-label="Maser Surface Engine card"
    >
      <div
        ref={mediaRef}
        className="mse-card__media"
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
      >
        <SurfaceCanvas
          className="mse-card__canvas"
          params={params}
          animation={animation}
          pointer={pointer}
          reducedMotion={reducedMotion}
          aria-label="Procedural monochrome material"
        />
      </div>
      <div className="mse-card__body">
        <h2 className="mse-card__title">{title}</h2>
        <p className="mse-card__desc">{description}</p>
        <Button
          type="button"
          className="mse-card__button"
          onClick={onButtonClick}
        >
          {buttonLabel}
        </Button>
      </div>
    </article>
  );
}
