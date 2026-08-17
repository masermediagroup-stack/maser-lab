"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Leva, levaStore } from "leva";
import { TypeWorld } from "./TypeWorld";
import {
  TypeWorldControls,
  type TypeWorldDemoParams,
  type TypeWorldStageTheme,
} from "./TypeWorldControls";
import { TYPE_WORLD_DEFAULTS, TYPE_WORLD_QUOTE } from "./constants";
import {
  useClientMounted,
  useIsNarrow,
  usePrefersReducedMotion,
} from "./useScrollReveal";
import "./type-world-demo.css";

const STAGE_BACKGROUND: Record<TypeWorldStageTheme, string> = {
  light: "#FAFAF7",
  dark: "#0C0C0E",
};

const LEVA_THEME = {
  light: {
    sizes: { rootWidth: "280px" },
    colors: {
      elevation1: "#ecece6",
      elevation2: "#f4f4ee",
      elevation3: "#ffffff",
      accent1: "#1a1a20",
      accent2: "#3a3a44",
      accent3: "#5a5a66",
      highlight1: "#0c0c0e",
      highlight2: "#1a1a20",
      highlight3: "#3a3a44",
      vivid1: "#6B42FF",
    },
  },
  dark: {
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
  },
} as const;

const INITIAL_PARAMS: TypeWorldDemoParams = {
  quote: TYPE_WORLD_QUOTE,
  dragSensitivity: TYPE_WORLD_DEFAULTS.dragSensitivity,
  inertia: TYPE_WORLD_DEFAULTS.inertia,
  pitchLimit: TYPE_WORLD_DEFAULTS.pitchLimit,
  forceFallback: false,
  theme: "light",
  fillViewport: false,
  gradientColor1: TYPE_WORLD_DEFAULTS.gradientColor1,
  gradientColor2: TYPE_WORLD_DEFAULTS.gradientColor2,
  gradientColor3: TYPE_WORLD_DEFAULTS.gradientColor3,
  gradientSpeed: TYPE_WORLD_DEFAULTS.gradientSpeed,
  gradientAngle: TYPE_WORLD_DEFAULTS.gradientAngle,
  gradientSpread: TYPE_WORLD_DEFAULTS.gradientSpread,
  gradientReverse: TYPE_WORLD_DEFAULTS.gradientReverse,
};

function syncLeva(params: TypeWorldDemoParams) {
  levaStore.set(
    {
      quote: params.quote,
      forceFallback: params.forceFallback,
      theme: params.theme,
      fillViewport: params.fillViewport,
      dragSensitivity: params.dragSensitivity,
      inertia: params.inertia,
      pitchLimit: params.pitchLimit,
      gradientColor1: params.gradientColor1,
      gradientColor2: params.gradientColor2,
      gradientColor3: params.gradientColor3,
      gradientSpeed: params.gradientSpeed,
      gradientAngle: params.gradientAngle,
      gradientSpread: params.gradientSpread,
      gradientReverse: params.gradientReverse,
    },
    false,
  );
}

export function TypeWorldDemo() {
  const osReduced = usePrefersReducedMotion();
  const mounted = useClientMounted();
  const narrow = useIsNarrow();
  const [reducedPreview, setReducedPreview] = useState(false);
  const [params, setParams] = useState<TypeWorldDemoParams>(INITIAL_PARAMS);

  const reducedMotion = osReduced || reducedPreview;
  const fillViewport = params.fillViewport;
  const theme = params.theme;

  const patchParams = useCallback((patch: Partial<TypeWorldDemoParams>) => {
    setParams((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setParams(INITIAL_PARAMS);
    setReducedPreview(false);
    syncLeva(INITIAL_PARAMS);
  }, []);

  useEffect(() => {
    if (!fillViewport) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      levaStore.set({ fillViewport: false }, false);
      setParams((prev) =>
        prev.fillViewport ? { ...prev, fillViewport: false } : prev,
      );
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [fillViewport]);

  return (
    <div
      className="type-world-demo"
      data-theme={theme}
      data-stage={fillViewport ? "fill" : "page"}
    >
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
        backgroundColor={STAGE_BACKGROUND[theme]}
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
            collapsed={narrow && !fillViewport}
            titleBar={{ title: "TYPE WORLD", filter: false }}
            theme={LEVA_THEME[theme]}
          />
        </>
      ) : null}
    </div>
  );
}
