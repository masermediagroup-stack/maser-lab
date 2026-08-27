"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Leva, levaStore } from "leva";
import { TypeWorld } from "./TypeWorld";
import {
  TypeWorldControls,
  surfaceFromDemoParams,
  type TypeWorldDemoParams,
  type TypeWorldStageTheme,
} from "./TypeWorldControls";
import {
  TYPE_WORLD_AUTO_DEFAULTS,
  TYPE_WORLD_DEFAULTS,
  TYPE_WORLD_ORB_DEFAULTS,
  TYPE_WORLD_QUOTE,
} from "./constants";
import { SURFACE_EFFECT_DEFAULTS } from "./shaders/registry";
import { TYPE_WORLD_SURFACE_DEFAULTS } from "./surface";
import { withLevaFolderPaths } from "./levaSurface";
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
  autoRotateDirection: TYPE_WORLD_AUTO_DEFAULTS.direction,
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
  surfaceEnabled: TYPE_WORLD_SURFACE_DEFAULTS.enabled,
  surfaceType: TYPE_WORLD_SURFACE_DEFAULTS.type,
  orbCount: TYPE_WORLD_ORB_DEFAULTS.count,
  orbSeed: TYPE_WORLD_ORB_DEFAULTS.seed,
  orbAnimSpeed: SURFACE_EFFECT_DEFAULTS.orbs.speed,
  orbScale: SURFACE_EFFECT_DEFAULTS.orbs.scale,
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
  mbSpeed: SURFACE_EFFECT_DEFAULTS.metaballs.speed,
  mbScale: SURFACE_EFFECT_DEFAULTS.metaballs.scale,
  mbSoftness: SURFACE_EFFECT_DEFAULTS.metaballs.softness,
  mbDensity: SURFACE_EFFECT_DEFAULTS.metaballs.density,
  mbThreshold: SURFACE_EFFECT_DEFAULTS.metaballs.threshold,
  mbSeed: SURFACE_EFFECT_DEFAULTS.metaballs.seed,
  waveSpeed: SURFACE_EFFECT_DEFAULTS.waves.speed,
  waveScale: SURFACE_EFFECT_DEFAULTS.waves.scale,
  waveSoftness: SURFACE_EFFECT_DEFAULTS.waves.softness,
  waveFrequency: SURFACE_EFFECT_DEFAULTS.waves.frequency,
  waveThickness: SURFACE_EFFECT_DEFAULTS.waves.thickness,
  waveAmplitude: SURFACE_EFFECT_DEFAULTS.waves.amplitude,
  waveDirection: SURFACE_EFFECT_DEFAULTS.waves.direction,
  voronoiSpeed: SURFACE_EFFECT_DEFAULTS.voronoi.speed,
  voronoiScale: SURFACE_EFFECT_DEFAULTS.voronoi.scale,
  voronoiThreshold: SURFACE_EFFECT_DEFAULTS.voronoi.threshold,
  voronoiEdge: SURFACE_EFFECT_DEFAULTS.voronoi.edge,
  voronoiDistortion: SURFACE_EFFECT_DEFAULTS.voronoi.distortion,
  voronoiSeed: SURFACE_EFFECT_DEFAULTS.voronoi.seed,
  perlinSpeed: SURFACE_EFFECT_DEFAULTS.perlin.speed,
  perlinScale: SURFACE_EFFECT_DEFAULTS.perlin.scale,
  perlinSoftness: SURFACE_EFFECT_DEFAULTS.perlin.softness,
  perlinThreshold: SURFACE_EFFECT_DEFAULTS.perlin.threshold,
  perlinContrast: SURFACE_EFFECT_DEFAULTS.perlin.contrast,
  perlinSeed: SURFACE_EFFECT_DEFAULTS.perlin.seed,
};

function syncLeva(params: TypeWorldDemoParams) {
  levaStore.set(
    withLevaFolderPaths({
      quote: params.quote,
      forceFallback: params.forceFallback,
      theme: params.theme,
      fillViewport: params.fillViewport,
      scale: params.scale,
      dragSensitivity: params.dragSensitivity,
      inertia: params.inertia,
      pitchLimit: params.pitchLimit,
      autoRotate: params.autoRotate,
      autoRotateDirection: params.autoRotateDirection,
      autoRotateSpeed: params.autoRotateSpeed,
      autoResumeDelay: params.autoResumeDelay,
      gradientColor1: params.gradientColor1,
      gradientColor2: params.gradientColor2,
      gradientColor3: params.gradientColor3,
      gradientSpeed: params.gradientSpeed,
      gradientAngle: params.gradientAngle,
      gradientSpread: params.gradientSpread,
      gradientReverse: params.gradientReverse,
      surfaceEnabled: params.surfaceEnabled,
      surfaceType: params.surfaceType,
      orbCount: params.orbCount,
      orbSeed: params.orbSeed,
      orbAnimSpeed: params.orbAnimSpeed,
      orbScale: params.orbScale,
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
      mbSpeed: params.mbSpeed,
      mbScale: params.mbScale,
      mbSoftness: params.mbSoftness,
      mbDensity: params.mbDensity,
      mbThreshold: params.mbThreshold,
      mbSeed: params.mbSeed,
      waveSpeed: params.waveSpeed,
      waveScale: params.waveScale,
      waveSoftness: params.waveSoftness,
      waveFrequency: params.waveFrequency,
      waveThickness: params.waveThickness,
      waveAmplitude: params.waveAmplitude,
      waveDirection: params.waveDirection,
      voronoiSpeed: params.voronoiSpeed,
      voronoiScale: params.voronoiScale,
      voronoiThreshold: params.voronoiThreshold,
      voronoiEdge: params.voronoiEdge,
      voronoiDistortion: params.voronoiDistortion,
      voronoiSeed: params.voronoiSeed,
      perlinSpeed: params.perlinSpeed,
      perlinScale: params.perlinScale,
      perlinSoftness: params.perlinSoftness,
      perlinThreshold: params.perlinThreshold,
      perlinContrast: params.perlinContrast,
      perlinSeed: params.perlinSeed,
    }),
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
  const surface = useMemo(() => surfaceFromDemoParams(params), [params]);
  const orbs = useMemo(
    () => ({
      enabled: params.surfaceEnabled && params.surfaceType === "orbs",
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
    }),
    [params],
  );

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
        autoRotateDirection={params.autoRotateDirection}
        autoRotateSpeed={params.autoRotateSpeed}
        autoResumeDelay={params.autoResumeDelay}
        reducedMotion={reducedMotion}
        forceFallback={params.forceFallback}
        captureVerticalDrag={fillViewport}
        scale={params.scale}
        theme={theme}
        surface={surface}
        orbs={orbs}
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
