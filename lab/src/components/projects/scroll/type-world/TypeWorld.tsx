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
import { GRADIENT_CYCLE_SECONDS, TYPE_WORLD_DEFAULTS } from "./constants";
import { TypeWorldFallback } from "./TypeWorldFallback";
import { useDragRotation } from "./useDragRotation";
import {
  useClientMounted,
  useIsNarrow,
  usePrefersReducedMotion,
} from "./useScrollReveal";
import type { TypeWorldGradient, TypeWorldProps } from "./types";
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
  dragSensitivity = TYPE_WORLD_DEFAULTS.dragSensitivity,
  inertia = TYPE_WORLD_DEFAULTS.inertia,
  pitchLimit = TYPE_WORLD_DEFAULTS.pitchLimit,
  reducedMotion: reducedMotionProp,
  forceFallback = false,
  hint = TYPE_WORLD_DEFAULTS.hint,
  gradientColor1,
  gradientColor2 = TYPE_WORLD_DEFAULTS.gradientColor2,
  gradientColor3 = TYPE_WORLD_DEFAULTS.gradientColor3,
  gradientSpeed = TYPE_WORLD_DEFAULTS.gradientSpeed,
  gradientAngle = TYPE_WORLD_DEFAULTS.gradientAngle,
  gradientSpread = TYPE_WORLD_DEFAULTS.gradientSpread,
  gradientReverse = TYPE_WORLD_DEFAULTS.gradientReverse,
  captureVerticalDrag = false,
  className,
}: TypeWorldProps) {
  const hitRef = useRef<HTMLDivElement>(null);
  const mounted = useClientMounted();
  const osReduced = usePrefersReducedMotion();
  const narrow = useIsNarrow();
  const reducedMotion = reducedMotionProp ?? osReduced;
  const [hintVisible, setHintVisible] = useState(true);

  const resolvedFont = fontFamily ?? instrumentSerif.style.fontFamily;
  const webgl = mounted && isWebGLAvailable() && !forceFallback;
  const color1 = gradientColor1 ?? textColor;

  const gradient = useMemo<TypeWorldGradient>(
    () => ({
      color1,
      color2: gradientColor2,
      color3: gradientColor3,
      speed: gradientSpeed,
      angle: gradientAngle,
      spread: gradientSpread,
      reverse: gradientReverse,
    }),
    [
      color1,
      gradientAngle,
      gradientColor2,
      gradientColor3,
      gradientReverse,
      gradientSpeed,
      gradientSpread,
    ],
  );

  const onInteract = useCallback(() => {
    setHintVisible(false);
  }, []);

  const drag = useDragRotation(hitRef, {
    yawSensitivity: dragSensitivity,
    pitchSensitivity: dragSensitivity * (captureVerticalDrag ? 1 : 0.42),
    pitchLimit,
    inertia,
    reducedMotion,
    captureVertical: captureVerticalDrag,
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

  const cycleSeconds =
    reducedMotion || gradient.speed <= 0
      ? 0
      : GRADIENT_CYCLE_SECONDS / Math.max(0.05, gradient.speed);

  return (
    <section
      className={rootClass}
      aria-label="Type World"
      data-gradient-motion={cycleSeconds > 0 ? "on" : "off"}
      style={
        {
          "--type-world-bg": backgroundColor,
          "--type-world-ink": color1,
          "--type-world-g1": gradient.color1,
          "--type-world-g2": gradient.color2,
          "--type-world-g3": gradient.color3,
          "--type-world-g-angle": `${gradient.angle}deg`,
          "--type-world-g-spread": String(gradient.spread),
          "--type-world-g-cycle": cycleSeconds ? `${cycleSeconds}s` : "0s",
          "--type-world-g-dir": gradient.reverse ? "reverse" : "normal",
        } as CSSProperties
      }
    >
      <blockquote className="type-world__sr">{accessibleQuote}</blockquote>

      <div className="type-world__track">
        <div className="type-world__stage">
          {webgl ? (
            <TypeWorldCanvas
              quote={quote}
              backgroundColor={backgroundColor}
              fontFamily={resolvedFont}
              reducedMotion={reducedMotion}
              drag={drag}
              narrow={narrow}
              gradient={gradient}
            />
          ) : mounted ? (
            <TypeWorldFallback quote={quote} fontFamily={resolvedFont} />
          ) : null}

          <div
            ref={hitRef}
            className={
              webgl ? "type-world__hit" : "type-world__hit type-world__hit--off"
            }
            data-drag-capture={captureVerticalDrag ? "all" : "pan-y"}
            aria-hidden="true"
            {...(webgl ? drag.handlers : {})}
          />

          {webgl && hint && hintVisible ? (
            <p className="type-world__hint">{hint}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
