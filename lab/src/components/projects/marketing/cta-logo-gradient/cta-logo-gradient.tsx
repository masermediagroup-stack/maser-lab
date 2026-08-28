"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import {
  CTA_LOGO_GRADIENT_DEFAULTS,
  LOOP_SECONDS,
  LERP,
  LOGO_SRC,
  MAX_LIFT,
  MAX_TILT_X,
  MAX_TILT_Y,
  PERSPECTIVE_PX,
} from "./constants";
import { startGradient } from "./start-gradient";
import type { CtaLogoGradientLook, CtaLogoGradientProps } from "./types";
import "./tokens.css";

type TiltState = {
  x: number;
  y: number;
  z: number;
};

function prefersFinePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function applyTilt(node: HTMLElement, current: TiltState) {
  node.style.setProperty("--cta-logo-tilt-x", `${current.x}deg`);
  node.style.setProperty("--cta-logo-tilt-y", `${current.y}deg`);
  node.style.setProperty("--cta-logo-tilt-z", `${current.z}px`);
}

export function CtaLogoGradient({
  className,
  forceReducedMotion = false,
  look = CTA_LOGO_GRADIENT_DEFAULTS,
}: CtaLogoGradientProps) {
  const hitRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lookRef = useRef<CtaLogoGradientLook>(look);
  const [gpuPainted, setGpuPainted] = useState(false);

  useEffect(() => {
    lookRef.current = look;
  }, [look]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return startGradient({
      canvas,
      lookRef,
      onPainted: () => setGpuPainted(true),
    });
  }, []);

  useEffect(() => {
    const hit = hitRef.current;
    const tilt = tiltRef.current;
    if (!hit || !tilt) return;
    if (forceReducedMotion || prefersReducedMotion() || !prefersFinePointer()) {
      applyTilt(tilt, { x: 0, y: 0, z: 0 });
      return;
    }

    let disposed = false;
    let isVisible = true;
    let rafId = 0;
    const target: TiltState = { x: 0, y: 0, z: 0 };
    const current: TiltState = { x: 0, y: 0, z: 0 };

    const setPointerTilt = (clientX: number, clientY: number) => {
      const rect = hit.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((clientY - rect.top) / rect.height) * 2 - 1;
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
      current.x += (target.x - current.x) * LERP;
      current.y += (target.y - current.y) * LERP;
      current.z += (target.z - current.z) * LERP;
      applyTilt(tilt, current);
    };

    const loop = () => {
      if (disposed || !isVisible) return;
      renderFrame();
      rafId = window.requestAnimationFrame(loop);
    };

    const onPointerEnter = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      setPointerTilt(event.clientX, event.clientY);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      setPointerTilt(event.clientX, event.clientY);
    };

    const onPointerLeave = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      resetTilt();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          renderFrame();
          rafId = window.requestAnimationFrame(loop);
        } else {
          window.cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0.01 },
    );

    hit.addEventListener("pointerenter", onPointerEnter);
    hit.addEventListener("pointermove", onPointerMove);
    hit.addEventListener("pointerleave", onPointerLeave);
    observer.observe(hit);
    rafId = window.requestAnimationFrame(loop);

    return () => {
      disposed = true;
      observer.disconnect();
      window.cancelAnimationFrame(rafId);
      hit.removeEventListener("pointerenter", onPointerEnter);
      hit.removeEventListener("pointermove", onPointerMove);
      hit.removeEventListener("pointerleave", onPointerLeave);
      applyTilt(tilt, { x: 0, y: 0, z: 0 });
    };
  }, [forceReducedMotion]);

  const period = `${(LOOP_SECONDS / Math.max(look.speed, 0.01)).toFixed(2)}s`;

  return (
    <div
      ref={hitRef}
      className={cn("clg-hit", className)}
      tabIndex={0}
      aria-label="Maser Media CTA logo"
      style={{
        "--clg-period": period,
        "--clg-angle": `${look.angle}deg`,
        "--clg-highlight": String(look.highlight),
        "--clg-shade": String(look.shade),
        "--clg-glow": String(look.glow),
        "--clg-perspective": `${PERSPECTIVE_PX}px`,
      } as CSSProperties}
    >
      <div className="clg-viewport">
        <div ref={tiltRef} className="clg-tilt">
          <Image
            src={LOGO_SRC}
            alt=""
            fill
            priority
            sizes="(min-width: 640px) 36rem, 88vw"
            className="clg-plate"
            unoptimized
            draggable={false}
          />
          <div
            className="clg-mark"
            data-gpu={gpuPainted ? "painting" : "pending"}
            aria-hidden="true"
          >
            <div className="clg-grain">
              <div className="clg-ascii-ground" />
              <div className="clg-layer clg-layer-dot">
                <div className="clg-wash clg-band-dot" />
              </div>
              <div className="clg-layer clg-layer-colon">
                <div className="clg-wash clg-band-colon" />
              </div>
              <div className="clg-layer clg-layer-plus">
                <div className="clg-wash clg-band-plus" />
              </div>
              <div className="clg-layer clg-layer-x">
                <div className="clg-wash clg-band-x" />
              </div>
              <div className="clg-layer clg-layer-m">
                <div className="clg-wash clg-band-m" />
              </div>
              <div className="clg-dust clg-dust-cyan">
                <div className="clg-wash clg-band-m clg-speck-cyan" />
              </div>
              <div className="clg-dust clg-dust-magenta">
                <div className="clg-wash clg-band-m clg-speck-magenta" />
              </div>
            </div>
            <canvas ref={canvasRef} className="clg-canvas" />
          </div>
        </div>
      </div>
    </div>
  );
}
