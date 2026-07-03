"use client";

import { useCallback, useId, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildLiquidClipPath, buildLiquidEdgePath } from "./clip-path";
import {
  FILTER_ID,
  LIQUID_MONOCHROME_DEFAULTS,
  LUMINANCE_MATRIX,
} from "./constants";
import styles from "./LiquidMonochrome.module.css";
import type { LiquidMonochromeProps } from "./types";
import { useLiquidScroll } from "./use-liquid-scroll";

gsap.registerPlugin(ScrollTrigger);

export function LiquidMonochrome({
  children,
  intensity = LIQUID_MONOCHROME_DEFAULTS.intensity,
  direction = LIQUID_MONOCHROME_DEFAULTS.direction,
  pin = LIQUID_MONOCHROME_DEFAULTS.pin,
  scrub = LIQUID_MONOCHROME_DEFAULTS.scrub,
  turbulence = LIQUID_MONOCHROME_DEFAULTS.turbulence,
  noiseScale = LIQUID_MONOCHROME_DEFAULTS.noiseScale,
  liquidStrength = LIQUID_MONOCHROME_DEFAULTS.liquidStrength,
  edgeSoftness = LIQUID_MONOCHROME_DEFAULTS.edgeSoftness,
  maskSoftness,
  pinDuration = LIQUID_MONOCHROME_DEFAULTS.pinDuration,
  overscroll = LIQUID_MONOCHROME_DEFAULTS.overscroll,
  speed = LIQUID_MONOCHROME_DEFAULTS.speed,
  seed = LIQUID_MONOCHROME_DEFAULTS.seed,
  lockPosition = LIQUID_MONOCHROME_DEFAULTS.lockPosition,
  liquidShader = LIQUID_MONOCHROME_DEFAULTS.liquidShader,
  meniscusSize = LIQUID_MONOCHROME_DEFAULTS.meniscusSize,
  start,
  end,
  duration = LIQUID_MONOCHROME_DEFAULTS.duration,
  blendMode = LIQUID_MONOCHROME_DEFAULTS.blendMode,
  disabled = LIQUID_MONOCHROME_DEFAULTS.disabled,
  progress: externalProgress,
  className,
  onProgressChange,
}: LiquidMonochromeProps) {
  const instanceId = useId().replace(/:/g, "");
  const filterId = `${FILTER_ID}-${instanceId}`;
  const triggerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const monoLayerRef = useRef<HTMLDivElement>(null);
  const waterlineSvgRef = useRef<SVGSVGElement>(null);
  const waterlinePathRef = useRef<SVGPathElement>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const rafRef = useRef<number | null>(null);
  const idleRafRef = useRef<number | null>(null);

  const softness = maskSoftness ?? edgeSoftness;
  const clampedLockPosition = Math.min(100, Math.max(0, lockPosition));
  const resolvedStart = start ?? `center ${clampedLockPosition}%`;

  const applyFrame = useCallback(
    (progress: number, phase: number) => {
      const mono = monoLayerRef.current;
      if (!mono) return;

      const { width, height } = sizeRef.current;
      if (width <= 0 || height <= 0) return;

      const clipOptions = {
        direction,
        turbulence,
        noiseScale,
        liquidStrength,
        edgeSoftness: softness,
        segments: 80,
        seed,
        phase,
      };

      const clip = buildLiquidClipPath(progress, width, height, clipOptions);
      const edgePath = buildLiquidEdgePath(progress, width, height, clipOptions);

      mono.style.clipPath = clip;
      mono.style.setProperty("-webkit-clip-path", clip);
      mono.style.opacity = String(intensity);

      if (waterlineSvgRef.current && waterlinePathRef.current) {
        waterlineSvgRef.current.setAttribute("viewBox", `0 0 ${width} ${height}`);
        waterlinePathRef.current.setAttribute("d", edgePath);
        waterlinePathRef.current.style.strokeWidth = `${Math.max(
          1.25,
          Math.min(3.5, height * meniscusSize * 0.16),
        )}`;
        waterlineSvgRef.current.style.opacity = "0";
      }
    },
    [
      direction,
      turbulence,
      noiseScale,
      liquidStrength,
      softness,
      seed,
      intensity,
      meniscusSize,
    ],
  );

  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    sizeRef.current = {
      width: rect.width,
      height: rect.height,
    };
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(() => measure());
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [measure]);

  const { progressRef, reducedMotionRef } = useLiquidScroll(
    triggerRef,
    stageRef,
    monoLayerRef,
    {
      pin: duration === "scroll" ? pin : false,
      scrub,
      pinDuration,
      overscroll,
      speed,
      lockPosition: clampedLockPosition,
      start: resolvedStart,
      end,
      disabled: disabled || externalProgress !== undefined,
      externalProgress,
      onProgressChange,
      onFrame: (p, phase) => {
        if (rafRef.current !== null) return;
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          applyFrame(p, phase);
        });
      },
    },
  );

  useEffect(() => {
    applyFrame(externalProgress ?? 0, 0);
  }, [applyFrame, externalProgress]);

  useEffect(() => {
    if (disabled || externalProgress !== undefined || !liquidShader) return;

    const tick = (now: number) => {
      const progress = progressRef.current;

      if (!reducedMotionRef.current && progress > 0.01 && progress < 0.99) {
        const phase = progress * Math.PI * 4 + now * 0.00135;
        applyFrame(progress, phase);
      }

      idleRafRef.current = requestAnimationFrame(tick);
    };

    idleRafRef.current = requestAnimationFrame(tick);

    return () => {
      if (idleRafRef.current !== null) {
        cancelAnimationFrame(idleRafRef.current);
        idleRafRef.current = null;
      }
    };
  }, [
    applyFrame,
    disabled,
    externalProgress,
    liquidShader,
    progressRef,
    reducedMotionRef,
  ]);

  return (
    <div
      ref={triggerRef}
      className={[styles.trigger, className].filter(Boolean).join(" ")}
      data-liquid-monochrome=""
      data-direction={direction}
    >
      <div ref={stageRef} className={styles.stage}>
        <div className={styles.colorLayer}>{children}</div>
        <div
          ref={monoLayerRef}
          className={styles.monoLayer}
          aria-hidden="true"
          style={{ mixBlendMode: blendMode }}
        >
          <div
            className={styles.monoContent}
            style={{ filter: `url(#${filterId})` }}
          >
            {children}
          </div>
        </div>
        <svg
          ref={waterlineSvgRef}
          className={styles.waterlineLayer}
          aria-hidden="true"
        >
          <path ref={waterlinePathRef} className={styles.waterlinePath} />
        </svg>
      </div>

      <svg className={styles.filterSvg} aria-hidden="true">
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
          >
            <feColorMatrix type="matrix" values={LUMINANCE_MATRIX} />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
