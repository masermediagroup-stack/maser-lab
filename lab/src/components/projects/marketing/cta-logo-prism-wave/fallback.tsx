"use client";

import type { CSSProperties } from "react";
import {
  CSS_WAVE_DURATION_S,
  CTA_LOGO_PRISM_WAVE_DEFAULTS,
  FILAMENT_DASH,
  FILAMENT_PATH,
  HOVER_SPEED_BOOST,
} from "./constants";
import type { WaveRuntimeParams } from "./types";

type CssWaveFallbackProps = {
  look: WaveRuntimeParams;
  className?: string;
};

/**
 * Same-plane filament when WebGPU is missing. One heavy dry snake through
 * the mark — not a hairline dash and not a slow glow. Blue-HD sits in the
 * tilt viewport; CSS mask clips this overlay to that glyph.
 */
export function CssWaveFallback({ look, className }: CssWaveFallbackProps) {
  const speed = Math.max(look.speed, 0.12);
  const duration =
    (CSS_WAVE_DURATION_S * CTA_LOGO_PRISM_WAVE_DEFAULTS.speed) / speed;
  const hoverBoost = look.hover > 0.5 ? 1 / HOVER_SPEED_BOOST : 1;
  const stroke = Math.max(5.2, look.bandWidth * 202);
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
        <g
          fill="none"
          stroke="#fff"
          strokeLinejoin="bevel"
          strokeLinecap="butt"
          pointerEvents="none"
        >
          <path
            className="clpw-css-filament"
            d={FILAMENT_PATH}
            pathLength={100}
            strokeDasharray={FILAMENT_DASH}
          />
        </g>
      </svg>
    </div>
  );
}
