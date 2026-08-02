"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState, type RefObject } from "react";
import type { LiquidScrollOptions } from "./types";

gsap.registerPlugin(ScrollTrigger);

export type UseLiquidScrollResult = {
  progressRef: RefObject<number>;
  reducedMotionRef: RefObject<boolean>;
};

export function useLiquidScroll(
  triggerRef: RefObject<HTMLElement | null>,
  stageRef: RefObject<HTMLElement | null>,
  monoLayerRef: RefObject<HTMLElement | null>,
  options: LiquidScrollOptions & {
    onFrame?: (progress: number, phase: number) => void;
    externalProgress?: number | undefined;
  },
): UseLiquidScrollResult {
  const progressRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const onChange = () => {
      reducedMotionRef.current = mq.matches;
      setReducedMotion(mq.matches);
      ScrollTrigger.refresh();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useGSAP(
    () => {
      const trigger = triggerRef.current;
      const stage = stageRef.current;
      if (!trigger || !stage || options.disabled) return;

      if (options.externalProgress !== undefined) {
        progressRef.current = options.externalProgress;
        options.onFrame?.(options.externalProgress, options.externalProgress * Math.PI * 2);
        options.onProgressChange?.(options.externalProgress);
        return;
      }

      const reduced = reducedMotion;
      const pinDuration = options.pinDuration ?? 1.25;
      const overscroll = options.overscroll ?? 0;
      const speed = options.speed ?? 1;
      const pin = reduced ? false : (options.pin ?? true);
      const scrub = reduced ? false : options.scrub ?? true;

      const scrollDistance = () => {
        const vh = window.innerHeight;
        return (pinDuration * speed + overscroll) * vh;
      };

      const st = ScrollTrigger.create({
        trigger,
        start: options.start ?? "top top",
        end: options.end ?? (() => `+=${scrollDistance()}`),
        pin: pin ? stage : false,
        pinSpacing: true,
        scrub: scrub === false ? false : scrub === true ? 0.45 : scrub,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = reduced
            ? self.progress > 0.5
              ? 1
              : 0
            : self.progress;
          progressRef.current = p;
          const phase = p * Math.PI * 4 + self.scroll() * 0.002;
          options.onFrame?.(p, phase);
          options.onProgressChange?.(p);
        },
      });

      return () => {
        st.kill();
      };
    },
    {
      scope: triggerRef,
      dependencies: [
        options.pin,
        options.scrub,
        options.pinDuration,
        options.overscroll,
        options.speed,
        options.lockPosition,
        options.start,
        options.end,
        options.disabled,
        options.externalProgress,
        reducedMotion,
      ],
      revertOnUpdate: true,
    },
  );

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  return { progressRef, reducedMotionRef };
}
