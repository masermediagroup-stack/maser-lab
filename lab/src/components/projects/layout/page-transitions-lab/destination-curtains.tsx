"use client";

import type { CSSProperties } from "react";
import {
  curtainEdgeClipPath,
  curtainEdgeHeightPercent,
  curtainStaggerRank,
  curtainMaxStaggerRank,
  curtainStripCssStyle,
} from "./curtain-style";
import type { CurtainEdge, CurtainGradientMode, CurtainOrigin } from "./types";

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
  edge: CurtainEdge;
};

/**
 * Opaque cover strips: fall in to cover the stage, hold, then fall out
 * downward to reveal the destination page mounted underneath.
 * Fall-in / fall-out origins control which strip leads each phase.
 * Edge shapes decorate the leading (bottom) hem — tips hang past the
 * cover line so the hold still seals (clipped by the route frame).
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
  edge,
}: DestinationCurtainsProps) {
  const strips = Math.max(3, Math.min(16, Math.round(count)));
  const inMs = reducedMotion ? 140 : durationMs;
  const outMs = reducedMotion ? 140 : durationMs;
  const hold = reducedMotion ? 0 : holdMs;
  // Global cover boundary — out phase starts only after the last fall-in
  // strip lands + hold. Keeps fall-in / fall-out origins independent.
  const inTail = reducedMotion
    ? 0
    : curtainMaxStaggerRank(strips, fallIn) * staggerMs;
  const outPhaseStart = inTail + inMs + hold;
  const clipPath = curtainEdgeClipPath(edge);
  const heightPct = curtainEdgeHeightPercent(edge);

  return (
    <div className="ptl-curtain-fallback" aria-hidden="true" data-edge={edge}>
      {Array.from({ length: strips }, (_, index) => {
        const inRank = curtainStaggerRank(index, strips, fallIn);
        const outRank = curtainStaggerRank(index, strips, fallOut);
        const inDelay = reducedMotion ? 0 : inRank * staggerMs;
        const outDelay = reducedMotion
          ? 0
          : outPhaseStart + outRank * staggerMs;
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
            data-edge={edge}
            style={
              {
                ...fill,
                height: `${heightPct}%`,
                minHeight: `${heightPct}%`,
                ...(clipPath ? { clipPath, WebkitClipPath: clipPath } : null),
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
