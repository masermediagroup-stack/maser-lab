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
import {
  TYPE_WORLD_AUTO_DEFAULTS,
  TYPE_WORLD_DEFAULTS,
  TYPE_WORLD_ORB_DEFAULTS,
  TYPE_WORLD_QUOTE,
} from "./constants";
import {
  useClientMounted,
  useIsNarrow,
  usePrefersReducedMotion,
} from "./useScrollReveal";
import "./type-world-demo.css";

const STAGE_BACKGROUND: Record<TypeWorldStageTheme, string> = {
  light: "#FAFAF7",
  dark: "#000000",
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
      elevation1: "#000000",
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
  autoRotate: TYPE_WORLD_AUTO_DEFAULTS.enabled,
  autoRotateSpeed: TYPE_WORLD_AUTO_DEFAULTS.speed,
  autoResumeDelay: TYPE_WORLD_AUTO_DEFAULTS.resumeDelay,
  forceFallback: false,
  theme: "light",
  fillViewport: false,
  scale: TYPE_WORLD_DEFAULTS.scale,
  gradientColor1: TYPE_WORLD_DEFAULTS.gradientColor1,
  gradientColor2: TYPE_WORLD_DEFAULTS.gradientColor2,
  gradientColor3: TYPE_WORLD_DEFAULTS.gradientColor3,
  gradientSpeed: TYPE_WORLD_DEFAULTS.gradientSpeed,
  gradientAngle: TYPE_WORLD_DEFAULTS.gradientAngle,
  gradientSpread: TYPE_WORLD_DEFAULTS.gradientSpread,
  gradientReverse: TYPE_WORLD_DEFAULTS.gradientReverse,
  orbsEnabled: TYPE_WORLD_ORB_DEFAULTS.enabled,
  orbCount: TYPE_WORLD_ORB_DEFAULTS.count,
  orbSeed: TYPE_WORLD_ORB_DEFAULTS.seed,
  orbSizeMin: TYPE_WORLD_ORB_DEFAULTS.sizeMin,
  orbSizeMax: TYPE_WORLD_ORB_DEFAULTS.sizeMax,
  orbEdgeSoftness: TYPE_WORLD_ORB_DEFAULTS.edgeSoftness,
  orbSpeedMin: TYPE_WORLD_ORB_DEFAULTS.speedMin,
  orbSpeedMax: TYPE_WORLD_ORB_DEFAULTS.speedMax,
  orbSteerAmount: TYPE_WORLD_ORB_DEFAULTS.steerAmount,
  orbSpeedNoise: TYPE_WORLD_ORB_DEFAULTS.speedNoise,
  orbDriftNoise: TYPE_WORLD_ORB_DEFAULTS.driftNoise,
  orbColorLight: TYPE_WORLD_ORB_DEFAULTS.colorLight,
  orbColorDark: TYPE_WORLD_ORB_DEFAULTS.colorDark,
  orbTextColor: TYPE_WORLD_ORB_DEFAULTS.textColor,
  orbTextColor2: TYPE_WORLD_ORB_DEFAULTS.textColor2,
  orbInvertText: TYPE_WORLD_ORB_DEFAULTS.invertText,
  orbRenderBody: TYPE_WORLD_ORB_DEFAULTS.renderBody,
};

function syncLeva(params: TypeWorldDemoParams) {
  levaStore.set(
    {
      quote: params.quote,
      forceFallback: params.forceFallback,
      theme: params.theme,
      fillViewport: params.fillViewport,
      scale: params.scale,
      dragSensitivity: params.dragSensitivity,
      inertia: params.inertia,
      pitchLimit: params.pitchLimit,
      autoRotate: params.autoRotate,
      autoRotateSpeed: params.autoRotateSpeed,
      autoResumeDelay: params.autoResumeDelay,
      gradientColor1: params.gradientColor1,
      gradientColor2: params.gradientColor2,
      gradientColor3: params.gradientColor3,
      gradientSpeed: params.gradientSpeed,
      gradientAngle: params.gradientAngle,
      gradientSpread: params.gradientSpread,
      gradientReverse: params.gradientReverse,
      orbsEnabled: params.orbsEnabled,
      orbCount: params.orbCount,
      orbSeed: params.orbSeed,
      orbSizeMin: params.orbSizeMin,
      orbSizeMax: params.orbSizeMax,
      orbEdgeSoftness: params.orbEdgeSoftness,
      orbSpeedMin: params.orbSpeedMin,
      orbSpeedMax: params.orbSpeedMax,
      orbSteerAmount: params.orbSteerAmount,
      orbSpeedNoise: params.orbSpeedNoise,
      orbDriftNoise: params.orbDriftNoise,
      orbColorLight: params.orbColorLight,
      orbColorDark: params.orbColorDark,
      orbTextColor: params.orbTextColor,
      orbTextColor2: params.orbTextColor2,
      orbInvertText: params.orbInvertText,
      orbRenderBody: params.orbRenderBody,
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
        autoRotate={params.autoRotate}
        autoRotateSpeed={params.autoRotateSpeed}
        autoResumeDelay={params.autoResumeDelay}
        reducedMotion={reducedMotion}
        forceFallback={params.forceFallback}
        captureVerticalDrag={fillViewport}
        scale={params.scale}
        theme={theme}
        orbs={{
          enabled: params.orbsEnabled,
          count: params.orbCount,
          seed: params.orbSeed,
          sizeMin: params.orbSizeMin,
          sizeMax: params.orbSizeMax,
          edgeSoftness: params.orbEdgeSoftness,
          speedMin: params.orbSpeedMin,
          speedMax: params.orbSpeedMax,
          steerAmount: params.orbSteerAmount,
          speedNoise: params.orbSpeedNoise,
          driftNoise: params.orbDriftNoise,
          colorLight: params.orbColorLight,
          colorDark: params.orbColorDark,
          textColor: params.orbTextColor,
          textColor2: params.orbTextColor2,
          invertText: params.orbInvertText,
          renderBody: params.orbRenderBody,
        }}
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
            theme={LEVA_THEME[theme]}
          />
        </>
      ) : null}
    </div>
  );
}
