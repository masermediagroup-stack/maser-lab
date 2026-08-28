"use client";

import type { CSSProperties } from "react";
import {
  CSS_WAVE_DURATION_S,
  CTA_LOGO_PRISM_WAVE_DEFAULTS,
  FILAMENT_DASH,
  FILAMENT_DELAY_FRAC,
  FILAMENT_DURATION_SCALE,
  FILAMENT_FRINGE_DASH,
  FILAMENT_PATHS,
  FILAMENT_WEIGHTS,
  HOVER_SPEED_BOOST,
} from "./constants";
import type { WaveRuntimeParams } from "./types";

type CssWaveFallbackProps = {
  look: WaveRuntimeParams;
  className?: string;
};

/**
 * Overlapping continuous snakes when WebGPU is missing or not yet painting.
 * Lane paths miss each other; entries on different edges. Soft presence
 * (no dash snap). RGB split on the stroke. Masked to Blue-HD.
 */
export function CssWaveFallback({ look, className }: CssWaveFallbackProps) {
  const speed = Math.max(look.speed, 0.12);
  const duration =
    (CSS_WAVE_DURATION_S * CTA_LOGO_PRISM_WAVE_DEFAULTS.speed) / speed;
  const hoverBoost = look.hover > 0.5 ? 1 / HOVER_SPEED_BOOST : 1;
  const stroke = Math.max(1.7, look.bandWidth * 168);
  const fringe = Math.max(0, Math.min(1, look.fringe));
  const ca = 0.28 + fringe * 0.55;
  const waveVars = {
    "--clpw-css-stroke": `${stroke}`,
    "--clpw-css-fringe": `${fringe}`,
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
          {FILAMENT_PATHS.map((d, index) => {
            const tripDur =
              duration *
              hoverBoost *
              (FILAMENT_DURATION_SCALE[index] ?? 1);
            const tripVars = {
              "--clpw-css-duration": `${tripDur}s`,
              "--clpw-css-delay": `${-tripDur * (FILAMENT_DELAY_FRAC[index] ?? 0)}s`,
              "--clpw-css-weight": `${FILAMENT_WEIGHTS[index] ?? 1}`,
            } as CSSProperties;
            return (
              <g
                key={d}
                className={`clpw-css-trip clpw-css-trip--${index}`}
                style={tripVars}
              >
                <path
                  className="clpw-css-filament clpw-css-filament--glow"
                  d={d}
                  pathLength={1}
                  strokeDasharray={FILAMENT_DASH}
                />
                <g
                  className="clpw-css-ca clpw-css-ca--r"
                  transform={`translate(${-ca}, ${ca * 0.55})`}
                >
                  <path
                    className="clpw-css-filament clpw-css-filament--ca-r"
                    d={d}
                    pathLength={1}
                    strokeDasharray={FILAMENT_DASH}
                  />
                </g>
                <g
                  className="clpw-css-ca clpw-css-ca--b"
                  transform={`translate(${ca}, ${-ca * 0.62})`}
                >
                  <path
                    className="clpw-css-filament clpw-css-filament--ca-b"
                    d={d}
                    pathLength={1}
                    strokeDasharray={FILAMENT_DASH}
                  />
                </g>
                <path
                  className="clpw-css-filament clpw-css-filament--core"
                  d={d}
                  pathLength={1}
                  strokeDasharray={FILAMENT_DASH}
                />
                <path
                  className="clpw-css-filament clpw-css-filament--lead"
                  d={d}
                  pathLength={1}
                  strokeDasharray={FILAMENT_FRINGE_DASH}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
