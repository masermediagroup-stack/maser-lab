"use client";

import type { Ref } from "react";

export type TornTransitionOverlayProps = {
  ref?: Ref<HTMLCanvasElement>;
  mode: "fixed" | "contained";
  /** Drives `visibility` so an idle overlay costs nothing to composite. */
  active: boolean;
  /** False when reduced motion or a missing context sends us to the CSS path. */
  shader: boolean;
  fadeOpacity: number;
  fadeColor: string;
  fadeDuration: number;
};

/**
 * The overlay is `pointer-events: none` at all times and `aria-hidden`: it is
 * decoration over live, still-interactive content. Nothing here can trap focus
 * or swallow a click, which is the failure mode that makes shader transitions
 * feel broken.
 */
export function TornTransitionOverlay({
  ref,
  mode,
  active,
  shader,
  fadeOpacity,
  fadeColor,
  fadeDuration,
}: TornTransitionOverlayProps) {
  const className = [
    "tgt-overlay",
    mode === "contained" ? "tgt-overlay--contained" : "tgt-overlay--fixed",
  ].join(" ");

  if (!shader) {
    return (
      <div
        className={className}
        aria-hidden
        data-active={active || fadeOpacity > 0 ? "true" : "false"}
        style={{
          background: fadeColor,
          opacity: fadeOpacity,
          transition: `opacity ${fadeDuration}ms linear`,
        }}
      />
    );
  }

  return (
    <canvas
      ref={ref}
      className={className}
      aria-hidden
      data-active={active ? "true" : "false"}
    />
  );
}
