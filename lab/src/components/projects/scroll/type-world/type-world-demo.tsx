"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Leva, levaStore } from "leva";
import { TypeWorld } from "./TypeWorld";
import { TypeWorldControls, type TypeWorldDemoParams } from "./TypeWorldControls";
import { TYPE_WORLD_DEFAULTS, TYPE_WORLD_QUOTE } from "./constants";
import {
  useClientMounted,
  useIsNarrow,
  usePrefersReducedMotion,
} from "./useScrollReveal";
import "./type-world-demo.css";

const INITIAL_PARAMS: TypeWorldDemoParams = {
  quote: TYPE_WORLD_QUOTE,
  dragSensitivity: TYPE_WORLD_DEFAULTS.dragSensitivity,
  inertia: TYPE_WORLD_DEFAULTS.inertia,
  pitchLimit: TYPE_WORLD_DEFAULTS.pitchLimit,
  forceFallback: false,
  gradientColor1: TYPE_WORLD_DEFAULTS.gradientColor1,
  gradientColor2: TYPE_WORLD_DEFAULTS.gradientColor2,
  gradientColor3: TYPE_WORLD_DEFAULTS.gradientColor3,
  gradientSpeed: TYPE_WORLD_DEFAULTS.gradientSpeed,
  gradientAngle: TYPE_WORLD_DEFAULTS.gradientAngle,
  gradientSpread: TYPE_WORLD_DEFAULTS.gradientSpread,
  gradientReverse: TYPE_WORLD_DEFAULTS.gradientReverse,
};

export function TypeWorldDemo() {
  const osReduced = usePrefersReducedMotion();
  const mounted = useClientMounted();
  const narrow = useIsNarrow();
  const [reducedPreview, setReducedPreview] = useState(false);
  const [params, setParams] = useState<TypeWorldDemoParams>(INITIAL_PARAMS);

  const reducedMotion = osReduced || reducedPreview;

  const patchParams = useCallback((patch: Partial<TypeWorldDemoParams>) => {
    setParams((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setParams(INITIAL_PARAMS);
    setReducedPreview(false);
    levaStore.set(
      {
        quote: INITIAL_PARAMS.quote,
        forceFallback: false,
        dragSensitivity: INITIAL_PARAMS.dragSensitivity,
        inertia: INITIAL_PARAMS.inertia,
        pitchLimit: INITIAL_PARAMS.pitchLimit,
        gradientColor1: INITIAL_PARAMS.gradientColor1,
        gradientColor2: INITIAL_PARAMS.gradientColor2,
        gradientColor3: INITIAL_PARAMS.gradientColor3,
        gradientSpeed: INITIAL_PARAMS.gradientSpeed,
        gradientAngle: INITIAL_PARAMS.gradientAngle,
        gradientSpread: INITIAL_PARAMS.gradientSpread,
        gradientReverse: INITIAL_PARAMS.gradientReverse,
      },
      false,
    );
  }, []);

  return (
    <div className="type-world-demo">
      <header className="type-world-demo__bar">
        <Link href="/" className="type-world-demo__back">
          ← Lab
        </Link>
        <div className="type-world-demo__identity">
          <p className="type-world-demo__eyebrow">Scroll</p>
          <h1 className="type-world-demo__title">TYPE WORLD</h1>
        </div>
        <button
          type="button"
          className="type-world-demo__toggle"
          aria-label="Toggle reduced motion"
          aria-pressed={reducedPreview || osReduced}
          onClick={() => setReducedPreview((value) => !value)}
        >
          Reduced motion: {reducedMotion ? "on" : "off"}
        </button>
      </header>

      <div className="type-world-demo__lead">
        <p>An editorial sphere.</p>
        <p>Already here — drag to turn it.</p>
      </div>

      <TypeWorld
        quote={params.quote}
        textColor={params.gradientColor1}
        gradientColor1={params.gradientColor1}
        gradientColor2={params.gradientColor2}
        gradientColor3={params.gradientColor3}
        gradientSpeed={params.gradientSpeed}
        gradientAngle={params.gradientAngle}
        gradientSpread={params.gradientSpread}
        gradientReverse={params.gradientReverse}
        dragSensitivity={params.dragSensitivity}
        inertia={params.inertia}
        pitchLimit={params.pitchLimit}
        reducedMotion={reducedMotion}
        forceFallback={params.forceFallback}
      />

      <footer className="type-world-demo__after">
        <p>The same sentence exists on the far side of the world.</p>
      </footer>

      {mounted ? (
        <>
          <TypeWorldControls onChange={patchParams} onReset={reset} />
          <Leva
            collapsed={narrow}
            titleBar={{ title: "TYPE WORLD", filter: false }}
            theme={{
              sizes: { rootWidth: "280px" },
              colors: {
                elevation1: "#0c0c0e",
                elevation2: "#121216",
                elevation3: "#1a1a20",
                accent1: "#c8c8d0",
                accent2: "#a8a8b4",
                accent3: "#888894",
                highlight1: "#e8e8ec",
                highlight2: "#c8c8d0",
                highlight3: "#a0a0aa",
                vivid1: "#6B42FF",
              },
            }}
          />
        </>
      ) : null}
    </div>
  );
}
