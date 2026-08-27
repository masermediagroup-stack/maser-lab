"use client";

import type { CSSProperties } from "react";
import { HOVER_SPEED_BOOST, LOGO_SRC } from "./constants";
import type { WaveRuntimeParams } from "./types";

type CssWaveFallbackProps = {
  look: WaveRuntimeParams;
  className?: string;
};

function logoMaskStyle(extra?: CSSProperties): CSSProperties {
  return {
    WebkitMaskImage: `url(${LOGO_SRC})`,
    maskImage: `url(${LOGO_SRC})`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    ...extra,
  };
}

/**
 * Same-plane fallback when WebGPU is missing or the swapchain canvas
 * fights preserve-3d. Dry white filament + optional cool leading skin,
 * masked to Blue-HD. Body is retinted to Maser blue (`#10a4ff`).
 */
export function CssWaveFallback({ look, className }: CssWaveFallbackProps) {
  const duration = Math.max(1.2, 4.8 / Math.max(look.speed, 0.08));
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
          x="-8%"
          y="-8%"
          width="116%"
          height="116%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.15 0.18"
            numOctaves="2"
            seed="2"
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale="2.4"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <div className="clpw-logo-body" style={logoMaskStyle()} />
      <div className="clpw-css-wave" style={waveVars} />
    </div>
  );
}
