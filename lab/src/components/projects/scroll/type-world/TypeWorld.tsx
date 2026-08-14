"use client";

import dynamic from "next/dynamic";
import { Instrument_Serif } from "next/font/google";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { isWebGLAvailable } from "@/three/utils/capabilities";
import { TYPE_WORLD_DEFAULTS } from "./constants";
import { TypeWorldFallback } from "./TypeWorldFallback";
import { useDragRotation } from "./useDragRotation";
import {
  useClientMounted,
  useIsNarrow,
  usePrefersReducedMotion,
  useScrollReveal,
} from "./useScrollReveal";
import type { TypeWorldProps } from "./types";
import "./tokens.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const TypeWorldCanvas = dynamic(
  () => import("./TypeWorldCanvas").then((module) => module.TypeWorldCanvas),
  { ssr: false },
);

export function TypeWorld({
  quote = TYPE_WORLD_DEFAULTS.quote,
  textColor = TYPE_WORLD_DEFAULTS.textColor,
  backgroundColor = TYPE_WORLD_DEFAULTS.backgroundColor,
  fontFamily,
  revealEnd = TYPE_WORLD_DEFAULTS.revealEnd,
  overshoot = TYPE_WORLD_DEFAULTS.overshoot,
  dragSensitivity = TYPE_WORLD_DEFAULTS.dragSensitivity,
  inertia = TYPE_WORLD_DEFAULTS.inertia,
  pitchLimit = TYPE_WORLD_DEFAULTS.pitchLimit,
  reducedMotion: reducedMotionProp,
  forceFallback = false,
  hint = TYPE_WORLD_DEFAULTS.hint,
  className,
}: TypeWorldProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLDivElement>(null);
  const mounted = useClientMounted();
  const osReduced = usePrefersReducedMotion();
  const narrow = useIsNarrow();
  const reducedMotion = reducedMotionProp ?? osReduced;
  const [hintVisible, setHintVisible] = useState(true);

  const resolvedFont = fontFamily ?? instrumentSerif.style.fontFamily;
  const webgl = mounted && isWebGLAvailable() && !forceFallback;

  const progressRef = useScrollReveal(trackRef, { reducedMotion });

  const onInteract = useCallback(() => {
    setHintVisible(false);
  }, []);

  const drag = useDragRotation(hitRef, {
    yawSensitivity: dragSensitivity,
    pitchSensitivity: dragSensitivity * 0.42,
    pitchLimit,
    inertia,
    reducedMotion,
    onInteract,
  });

  const accessibleQuote = useMemo(
    () =>
      quote
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .join(" "),
    [quote],
  );

  const rootClass = ["type-world", instrumentSerif.className, className]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={rootClass}
      aria-label="Type World"
      style={
        {
          "--type-world-bg": backgroundColor,
          "--type-world-ink": textColor,
        } as CSSProperties
      }
    >
      <blockquote className="type-world__sr">{accessibleQuote}</blockquote>

      <div ref={trackRef} className="type-world__track">
        <div className="type-world__stage">
          {webgl ? (
            <TypeWorldCanvas
              quote={quote}
              textColor={textColor}
              backgroundColor={backgroundColor}
              fontFamily={resolvedFont}
              reducedMotion={reducedMotion}
              revealEnd={revealEnd}
              overshoot={overshoot}
              progressRef={progressRef}
              drag={drag}
              narrow={narrow}
            />
          ) : mounted ? (
            <TypeWorldFallback
              quote={quote}
              textColor={textColor}
              fontFamily={resolvedFont}
            />
          ) : null}

          <div
            ref={hitRef}
            className="type-world__hit"
            aria-hidden="true"
            {...drag.handlers}
          />

          {webgl && hint && hintVisible ? (
            <p className="type-world__hint">{hint}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
