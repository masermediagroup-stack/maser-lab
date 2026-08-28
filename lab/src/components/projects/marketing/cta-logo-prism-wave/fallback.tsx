"use client";

import type { CSSProperties } from "react";
import {
  CSS_WAVE_DURATION_S,
  CTA_LOGO_PRISM_WAVE_DEFAULTS,
  FILAMENT_DASH,
  FILAMENT_PATHS,
  HOVER_SPEED_BOOST,
} from "./constants";
import type { WaveRuntimeParams } from "./types";

type CssWaveFallbackProps = {
  look: WaveRuntimeParams;
  className?: string;
};

/**
 * Sequential continuous snakes when WebGPU is missing or not yet painting.
 * One path finishes the trip before the next enters. Masked to Blue-HD so
 * glow stays inside the glyph — not a lamp on the mark.
 */
export function CssWaveFallback({ look, className }: CssWaveFallbackProps) {
  const speed = Math.max(look.speed, 0.12);
  const duration =
    (CSS_WAVE_DURATION_S * CTA_LOGO_PRISM_WAVE_DEFAULTS.speed) / speed;
  const hoverBoost = look.hover > 0.5 ? 1 / HOVER_SPEED_BOOST : 1;
  const stroke = Math.max(1.7, look.bandWidth * 168);
  const waveVars = {
    "--clpw-css-duration": `${duration * hoverBoost}s`,
    "--clpw-css-stroke": `${stroke}`,
  } as CSSProperties;

  return (
    <div className={className} style={waveVars} aria-hidden="true">
      <svg
        className="clpw-css-wave"
        viewBox="0 0 200 101"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
        pointerEvents="none"
      >
        <g fill="none" strokeLinejoin="round" strokeLinecap="round" pointerEvents="none">
          {FILAMENT_PATHS.map((d, index) => (
            <g key={d} className={`clpw-css-trip clpw-css-trip--${index}`}>
              <path
                className="clpw-css-filament clpw-css-filament--glow"
                d={d}
                pathLength={1}
                strokeDasharray={FILAMENT_DASH}
              />
              <path
                className="clpw-css-filament clpw-css-filament--core"
                d={d}
                pathLength={1}
                strokeDasharray={FILAMENT_DASH}
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
