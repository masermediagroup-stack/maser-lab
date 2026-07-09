"use client";

import type { CSSProperties } from "react";
import {
  curtainStaggerRank,
  curtainStripCssStyle,
} from "./curtain-style";
import type { CurtainGradientMode, CurtainOrigin } from "./types";

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
  fallIn: CurtainOrigin;
  fallOut: CurtainOrigin;
};

/**
 * Opaque cover strips: fall in to cover the stage, hold, then fall out
 * downward to reveal the destination page mounted underneath.
 * Fall-in / fall-out origins control which strip leads each phase.
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
  fallIn,
  fallOut,
}: DestinationCurtainsProps) {
  const strips = Math.max(3, Math.min(16, Math.round(count)));
  const inMs = reducedMotion ? 140 : durationMs;
  const outMs = reducedMotion ? 140 : durationMs;
  const hold = reducedMotion ? 0 : holdMs;

  return (
    <div className="ptl-curtain-fallback" aria-hidden="true">
      {Array.from({ length: strips }, (_, index) => {
        const inRank = curtainStaggerRank(index, strips, fallIn);
        const outRank = curtainStaggerRank(index, strips, fallOut);
        const inDelay = reducedMotion ? 0 : inRank * staggerMs;
        const outDelay = reducedMotion
          ? 0
          : inDelay + inMs + hold + outRank * staggerMs;
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
                "--ptl-curtain-delay": `${inDelay}ms`,
                animationDelay: `${inDelay}ms, ${outDelay}ms`,
                animationDuration: `${inMs}ms, ${outMs}ms`,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
