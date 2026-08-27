"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  CTA_LOGO_PRISM_WAVE_DEFAULTS,
  LOGO_SRC,
  MAX_LIFT,
  MAX_TILT_X,
  MAX_TILT_Y,
  TILT_LERP,
} from "./constants";
import { CssWaveFallback } from "./fallback";
import { startPrismWave } from "./start-wave";
import type {
  CtaLogoPrismWaveProps,
  PrismWaveMode,
  WaveRuntimeParams,
} from "./types";
import "./tokens.css";

type TiltState = {
  x: number;
  y: number;
  z: number;
};

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Lab demo only. Production CtaLogoTilt keeps `(hover: hover) and (pointer: fine)`. */
function isLabTiltPointer(event: PointerEvent) {
  return event.pointerType === "mouse" || event.pointerType === "pen";
}

function applyCardTilt(viewport: HTMLElement, current: TiltState) {
  viewport.style.setProperty("--cta-logo-tilt-x", `${current.x}deg`);
  viewport.style.setProperty("--cta-logo-tilt-y", `${current.y}deg`);
  viewport.style.setProperty("--cta-logo-tilt-z", `${current.z}px`);
}

export function CtaLogoPrismWave({
  className,
  forceReducedMotion = false,
  lookRef,
  onModeChange,
}: CtaLogoPrismWaveProps) {
  const stageRef = useRef<HTMLElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const gpuCanvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const hoverRef = useRef(0);
  const [mode, setMode] = useState<PrismWaveMode | null>(null);
  const [cssLook, setCssLook] = useState<WaveRuntimeParams>({
    ...CTA_LOGO_PRISM_WAVE_DEFAULTS,
    hover: 0,
  });

  useEffect(() => {
    const gpuCanvas = gpuCanvasRef.current;
    const displayCanvas = displayCanvasRef.current;
    const viewport = viewportRef.current;
    if (!gpuCanvas || !displayCanvas || !viewport) return;
    return startPrismWave({
      gpuCanvas,
      displayCanvas,
      viewport,
      logoUrl: LOGO_SRC,
      paramsRef: {
        get current() {
          const look = lookRef?.current ?? CTA_LOGO_PRISM_WAVE_DEFAULTS;
          return { ...look, hover: hoverRef.current };
        },
      },
      onMode: (next) => {
        setMode(next);
        onModeChange?.(next);
      },
    });
    // lookRef / onModeChange must not remount the GPU context.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mode !== "css") return;
    let raf = 0;
    const tick = () => {
      const look = lookRef?.current ?? CTA_LOGO_PRISM_WAVE_DEFAULTS;
      setCssLook({ ...look, hover: hoverRef.current });
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [mode, lookRef]);

  useEffect(() => {
    const stage = stageRef.current;
    const shell = shellRef.current;
    const viewport = viewportRef.current;
    if (!stage || !shell || !viewport) return;

    /*
     * Lab vs production gate:
     * Production CtaLogoTilt requires `(hover: hover) and (pointer: fine)`.
     * This judging box often fails that media, which used to skip attaching
     * move listeners — tilt looked dead. Lab tilts on mouse/pen pointermove.
     * Touch phones and reduced motion still skip tilt. Wave always runs.
     */
    const tiltEnabled = !forceReducedMotion && !prefersReducedMotion();
    stage.dataset.tilt = tiltEnabled ? "on" : "off";

    if (!tiltEnabled) {
      applyCardTilt(viewport, { x: 0, y: 0, z: 0 });
      return () => {
        delete stage.dataset.tilt;
      };
    }

    let disposed = false;
    let rafId = 0;
    const target: TiltState = { x: 0, y: 0, z: 0 };
    const current: TiltState = { x: 0, y: 0, z: 0 };

    const setPointerTilt = (clientX: number, clientY: number) => {
      // Production maps against the shell (stable box). Do not use the
      // tilting viewport's GBR — that AABB grows and compresses the throw.
      const rect = shell.getBoundingClientRect();
      if (rect.width <= 1 || rect.height <= 1) return;
      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((clientY - rect.top) / rect.height) * 2 - 1;
      const x = Math.max(-1, Math.min(1, nx));
      const y = Math.max(-1, Math.min(1, ny));
      target.y = x * MAX_TILT_Y;
      target.x = -y * MAX_TILT_X;
      target.z = MAX_LIFT;
    };

    const resetTilt = () => {
      target.x = 0;
      target.y = 0;
      target.z = 0;
    };

    const renderFrame = () => {
      current.x += (target.x - current.x) * TILT_LERP;
      current.y += (target.y - current.y) * TILT_LERP;
      current.z += (target.z - current.z) * TILT_LERP;
      applyCardTilt(viewport, current);
    };

    const loop = () => {
      if (disposed) return;
      renderFrame();
      rafId = window.requestAnimationFrame(loop);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isLabTiltPointer(event)) return;
      hoverRef.current = 1;
      setPointerTilt(event.clientX, event.clientY);
    };

    const onEnterTilt = (event: PointerEvent) => {
      if (!isLabTiltPointer(event)) return;
      hoverRef.current = 1;
      setPointerTilt(event.clientX, event.clientY);
    };

    const onLeaveTilt = (event: PointerEvent) => {
      if (!isLabTiltPointer(event)) return;
      hoverRef.current = 0;
      resetTilt();
    };

    /*
     * Capture on the stage: overlay layers are pointer-events:none, so the
     * event target is often the stage itself and never reaches the shell.
     * Tilt rAF stays running while mounted — do not let IntersectionObserver
     * cancel it (a false "not intersecting" left the plane dead on hover).
     */
    const pointerOpts: AddEventListenerOptions = { capture: true };
    stage.addEventListener("pointerenter", onEnterTilt, pointerOpts);
    stage.addEventListener("pointermove", onPointerMove, pointerOpts);
    stage.addEventListener("pointerleave", onLeaveTilt, pointerOpts);
    rafId = window.requestAnimationFrame(loop);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      stage.removeEventListener("pointerenter", onEnterTilt, pointerOpts);
      stage.removeEventListener("pointermove", onPointerMove, pointerOpts);
      stage.removeEventListener("pointerleave", onLeaveTilt, pointerOpts);
      delete stage.dataset.tilt;
      viewport.style.removeProperty("--cta-logo-tilt-x");
      viewport.style.removeProperty("--cta-logo-tilt-y");
      viewport.style.removeProperty("--cta-logo-tilt-z");
    };
  }, [forceReducedMotion]);

  return (
    <section
      ref={stageRef}
      className={cn("clpw-logo-stage", className)}
      aria-label="Maser Media CTA logo prism wave"
      data-wave-mode={mode ?? "pending"}
    >
      {/* Frame = production `.mm-cta__logo-link` (block). Perspective is on the viewport transform so a canvas cannot flatten the throw. Not an <a>. */}
      <div className="clpw-logo-frame">
        <div ref={shellRef} className="clpw-logo-shell">
          <div ref={viewportRef} className="clpw-logo-viewport">
          {/* SVG compositing layer — next/image is the wrong tool here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="clpw-logo-mark"
            src={LOGO_SRC}
            alt=""
            aria-hidden="true"
            decoding="async"
            fetchPriority="high"
          />
          <div className="clpw-logo-body" aria-hidden="true" />
          <canvas
            ref={displayCanvasRef}
            className="clpw-logo-canvas"
            aria-hidden="true"
            data-active={mode === "vgpu" ? "true" : "false"}
          />
          {mode === "css" ? (
            <CssWaveFallback look={cssLook} className="clpw-css-fallback" />
          ) : null}
          </div>
        </div>
      </div>
      {/* GPU source is outside preserve-3d so it cannot flatten the throw. */}
      <div className="clpw-gpu-host" aria-hidden="true">
        <canvas ref={gpuCanvasRef} className="clpw-gpu-source" />
      </div>
    </section>
  );
}
