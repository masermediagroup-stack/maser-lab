"use client";

import type { CSSProperties } from "react";
import {
  curtainEdgeClipPath,
  curtainLeadingSideIn,
  curtainLeadingSideOut,
  curtainStaggerRank,
  curtainMaxStaggerRank,
  curtainStripCssStyle,
} from "./curtain-style";
import type {
  CurtainDirection,
  CurtainEdge,
  CurtainGradientMode,
  CurtainOrigin,
} from "./types";

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
  dirIn: CurtainDirection;
  dirOut: CurtainDirection;
  edgeIn: CurtainEdge;
  edgeOut: CurtainEdge;
};

/**
 * Opaque cover strips: enter to cover, hold, then exit to reveal.
 * Direction (top/bottom), stagger origin, and edge shape are independent
 * per phase. Edge silhouette swaps at the out-phase boundary.
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
  dirIn,
  dirOut,
  edgeIn,
  edgeOut,
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

  const sideIn = curtainLeadingSideIn(dirIn);
  const sideOut = curtainLeadingSideOut(dirOut);

  return (
    <div
      className="ptl-curtain-fallback"
      aria-hidden="true"
      data-dir-in={dirIn}
      data-dir-out={dirOut}
      data-edge-in={edgeIn}
      data-edge-out={edgeOut}
    >
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
        // Per-strip clip so flow-curve samples one continuous stage-wide wave.
        const clipIn = curtainEdgeClipPath(edgeIn, sideIn, index, strips);
        const clipOut = curtainEdgeClipPath(edgeOut, sideOut, index, strips);
        const inAnim =
          dirIn === "top" ? "ptl-css-curtain-in-top" : "ptl-css-curtain-in-bottom";
        const outAnim =
          dirOut === "top"
            ? "ptl-css-curtain-out-top"
            : "ptl-css-curtain-out-bottom";
        const startY = dirIn === "top" ? "-110%" : "110%";
        return (
          <span
            key={`${playKey}-${index}`}
            data-dir-in={dirIn}
            data-dir-out={dirOut}
            style={
              {
                ...fill,
                transform: `translate3d(0, ${startY}, 0)`,
                ...(clipIn
                  ? { clipPath: clipIn, WebkitClipPath: clipIn }
                  : { clipPath: "none", WebkitClipPath: "none" }),
                "--ptl-curtain-clip-in": clipIn ?? "none",
                "--ptl-curtain-clip-out": clipOut ?? "none",
                "--ptl-curtain-in": `${inMs}ms`,
                "--ptl-curtain-out": `${outMs}ms`,
                "--ptl-curtain-hold": `${hold}ms`,
                "--ptl-curtain-delay": `${inDelay}ms`,
                animationName: `${inAnim}, ${outAnim}, ptl-css-curtain-edge-swap`,
                animationDelay: `${inDelay}ms, ${outDelay}ms, ${outPhaseStart}ms`,
                animationDuration: `${inMs}ms, ${outMs}ms, 1ms`,
                animationTimingFunction:
                  "cubic-bezier(0.22, 1, 0.36, 1), cubic-bezier(0.55, 0, 1, 0.45), step-end",
                animationFillMode: "both, forwards, forwards",
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
