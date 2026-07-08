"use client";

import type { CSSProperties } from "react";
import { curtainStripCssStyle } from "./curtain-style";
import type { CurtainGradientMode } from "./types";

type DestinationCurtainsProps = {
  count: number;
  staggerMs: number;
  durationMs: number;
  holdMs: number;
  playKey: number;
  reducedMotion: boolean;
  colorA: string;
  colorB: string;
  gradient: CurtainGradientMode;
};

/**
 * Opaque cover strips: fall in to cover the stage, hold, then fall out
 * downward to reveal the destination page mounted underneath.
 */
export function DestinationCurtains({
  count,
  staggerMs,
  durationMs,
  holdMs,
  playKey,
  reducedMotion,
  colorA,
  colorB,
  gradient,
}: DestinationCurtainsProps) {
  const strips = Math.max(3, Math.min(16, Math.round(count)));
  const inMs = reducedMotion ? 140 : durationMs;
  const outMs = reducedMotion ? 140 : durationMs;
  const hold = reducedMotion ? 0 : holdMs;

  return (
    <div className="ptl-curtain-fallback" aria-hidden="true">
      {Array.from({ length: strips }, (_, index) => {
        const delay = reducedMotion ? 0 : index * staggerMs;
        const fill = curtainStripCssStyle(
          colorA,
          colorB,
          gradient,
          index,
          strips,
        );
        return (
          <span
            key={`${playKey}-${index}`}
            style={
              {
                ...fill,
                "--ptl-curtain-in": `${inMs}ms`,
                "--ptl-curtain-out": `${outMs}ms`,
                "--ptl-curtain-hold": `${hold}ms`,
                "--ptl-curtain-delay": `${delay}ms`,
                animationDelay: `${delay}ms, calc(${delay}ms + ${inMs}ms + ${hold}ms)`,
                animationDuration: `${inMs}ms, ${outMs}ms`,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
