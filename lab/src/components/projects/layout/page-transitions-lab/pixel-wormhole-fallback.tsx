"use client";

import type { CSSProperties } from "react";
import { sanitizeHex } from "./curtain-style";
import type { PixelColorMode } from "./types";

type PixelWormholeFallbackProps = {
  durationMs: number;
  holdMs: number;
  playKey: number;
  reducedMotion: boolean;
  colorA: string;
  colorB: string;
  colorMode: PixelColorMode;
};

/**
 * CSS fallback when WebGL is unavailable — same phase story
 * (disintegrate → hole → emit) without a different visual language.
 */
export function PixelWormholeFallback({
  durationMs,
  holdMs,
  playKey,
  reducedMotion,
  colorA,
  colorB,
  colorMode,
}: PixelWormholeFallbackProps) {
  const phase = reducedMotion ? 160 : durationMs;
  const hold = reducedMotion ? 0 : holdMs;
  const total = phase * 2 + hold + Math.round(phase * 0.4);

  const a = sanitizeHex(colorA, "#10a4ff");
  const b = sanitizeHex(colorB, "#ffffff");
  const fill =
    colorMode === "white"
      ? "#ffffff"
      : colorMode === "solid"
        ? a
        : colorMode === "gradient"
          ? `linear-gradient(135deg, ${a}, ${b})`
          : a;

  return (
    <div
      className="ptl-wormhole-fallback"
      aria-hidden="true"
      style={
        {
          "--ptl-wh-total": `${total}ms`,
          "--ptl-wh-fill": fill,
          "--ptl-wh-a": a,
        } as CSSProperties
      }
    >
      <div className="ptl-wormhole-fallback__pixels">
        {Array.from({ length: 36 }, (_, i) => (
          <span
            key={`${playKey}-${i}`}
            style={
              {
                "--ptl-wh-i": i,
                animationDelay: `${(i % 6) * 18 + Math.floor(i / 6) * 12}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="ptl-wormhole-fallback__hole" />
      <div className="ptl-wormhole-fallback__rings" />
    </div>
  );
}
