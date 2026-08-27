"use client";

import type { CSSProperties } from "react";
import { HOVER_SPEED_BOOST, LOGO_SRC } from "./constants";
import type { WaveRuntimeParams } from "./types";

type CssWaveFallbackProps = {
  look: WaveRuntimeParams;
  className?: string;
};

function maskStyle(extra?: CSSProperties): CSSProperties {
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
 * fights preserve-3d. White band + cool leading fringe, masked to Blue-HD.
 * Body is retinted to Maser blue (`#10a4ff`) — the SVG fill is `#2cafff`.
 */
export function CssWaveFallback({ look, className }: CssWaveFallbackProps) {
  const duration = Math.max(1.2, 4.8 / Math.max(look.speed, 0.08));
  const hoverBoost = look.hover > 0.5 ? 1 / HOVER_SPEED_BOOST : 1;
  const waveStyle = maskStyle({
    "--clpw-css-duration": `${duration * hoverBoost}s`,
    "--clpw-css-width": `${Math.round(look.bandWidth * 100)}%`,
    "--clpw-css-fringe": String(look.fringe),
  } as CSSProperties);

  return (
    <div className={className} aria-hidden="true">
      <div className="clpw-logo-body" style={maskStyle()} />
      <div className="clpw-css-wave" style={waveStyle} />
    </div>
  );
}
