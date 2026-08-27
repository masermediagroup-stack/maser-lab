"use client";

import type { CSSProperties } from "react";
import {
  FILAMENT_DASH,
  FILAMENT_FORK_DASH,
  FILAMENT_FORK_PATH,
  FILAMENT_PATH,
  FILAMENT_SPUR_DASH,
  FILAMENT_SPUR_PATH,
  HOVER_SPEED_BOOST,
} from "./constants";
import type { WaveRuntimeParams } from "./types";

type CssWaveFallbackProps = {
  look: WaveRuntimeParams;
  className?: string;
};

/**
 * Same-plane filament when WebGPU is missing. The centerline is an SVG snake
 * through the mark (not a linear-gradient slit with grain). Blue-HD already
 * sits in the tilt viewport; CSS mask clips this overlay to that glyph.
 */
export function CssWaveFallback({ look, className }: CssWaveFallbackProps) {
  const duration = Math.max(1.4, 1 / Math.max(look.speed, 0.08));
  const hoverBoost = look.hover > 0.5 ? 1 / HOVER_SPEED_BOOST : 1;
  const stroke = Math.max(0.9, look.bandWidth * 78);
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
          <path
            className="clpw-css-filament clpw-css-filament--fork"
            d={FILAMENT_FORK_PATH}
            pathLength={100}
            strokeDasharray={FILAMENT_FORK_DASH}
          />
          <path
            className="clpw-css-filament clpw-css-filament--spur"
            d={FILAMENT_SPUR_PATH}
            pathLength={100}
            strokeDasharray={FILAMENT_SPUR_DASH}
          />
        </g>
      </svg>
    </div>
  );
}
