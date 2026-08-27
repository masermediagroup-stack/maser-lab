"use client";

import type { CSSProperties } from "react";
import { HOVER_SPEED_BOOST } from "./constants";
import type { WaveRuntimeParams } from "./types";

type CssWaveFallbackProps = {
  look: WaveRuntimeParams;
  className?: string;
};

/**
 * Same-plane filament overlay when WebGPU is missing. Does not paint the
 * mark — Blue-HD.svg already sits in the tilt viewport. Wave rides on it.
 */
export function CssWaveFallback({ look, className }: CssWaveFallbackProps) {
  /* One crossing ≈ 1 / speed. Do not use 4.8 / speed (~17s glow sweep). */
  const duration = Math.max(1.4, 1 / Math.max(look.speed, 0.08));
  const hoverBoost = look.hover > 0.5 ? 1 / HOVER_SPEED_BOOST : 1;
  const waveVars = {
    "--clpw-css-duration": `${duration * hoverBoost}s`,
    "--clpw-css-width": `${Math.max(look.bandWidth * 100, 0.6)}%`,
    "--clpw-css-fringe": String(look.fringe),
  } as CSSProperties;

  return (
    <div className={className} aria-hidden="true">
      <svg className="clpw-css-filter" aria-hidden="true" focusable="false">
        <filter
          id="clpw-filament-jitter"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.85 0.28"
            numOctaves="3"
            seed="2"
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale="14"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <div className="clpw-css-wave" style={waveVars} />
    </div>
  );
}
