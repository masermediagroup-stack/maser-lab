"use client";

import { useControls, folder, button, levaStore } from "leva";
import { useEffect, useRef } from "react";
import {
  MAX_SURFACE_ORBS,
  TYPE_WORLD_AUTO_DEFAULTS,
  TYPE_WORLD_DEFAULTS,
  TYPE_WORLD_ORB_DEFAULTS,
  TYPE_WORLD_QUOTE,
} from "./constants";
import {
  pickRandomTypeWorldPalette,
  paletteToPatch,
} from "./colorPalettes";
import {
  SURFACE_EFFECT_DEFAULTS,
  SURFACE_EFFECT_LABELS,
  isSurfaceEffectId,
  type SurfaceEffectId,
} from "./shaders/registry";
import {
  TYPE_WORLD_SURFACE_DEFAULTS,
  type TypeWorldSurface,
} from "./surface";
import { levaControlValue } from "./levaSurface";
import type { TypeWorldAutoRotateDirection, TypeWorldStageTheme } from "./types";

export type { TypeWorldStageTheme };

export type TypeWorldDemoParams = {
  quote: string;
  dragSensitivity: number;
  inertia: number;
  pitchLimit: number;
  autoRotate: boolean;
  autoRotateSpeed: number;
  autoRotateDirection: TypeWorldAutoRotateDirection;
  autoResumeDelay: number;
  forceFallback: boolean;
  theme: TypeWorldStageTheme;
  fillViewport: boolean;
  scale: number;
  gradientColor1: string;
  gradientColor2: string;
  gradientColor3: string;
  gradientSpeed: number;
  gradientAngle: number;
  gradientSpread: number;
  gradientReverse: boolean;
  surfaceEnabled: boolean;
  surfaceType: SurfaceEffectId;
  orbCount: number;
  orbSeed: number;
  orbAnimSpeed: number;
  orbScale: number;
  orbSizeMin: number;
  orbSizeMax: number;
  orbEdgeSoftness: number;
  orbSpeedMin: number;
  orbSpeedMax: number;
  orbSteerAmount: number;
  orbSpeedNoise: number;
  orbDriftNoise: number;
  orbColorLight: string;
  orbColorDark: string;
  orbTextColor: string;
  orbTextColor2: string;
  orbInvertText: boolean;
  orbRenderBody: boolean;
  mbSpeed: number;
  mbScale: number;
  mbSoftness: number;
  mbDensity: number;
  mbThreshold: number;
  mbSeed: number;
  waveSpeed: number;
  waveScale: number;
  waveSoftness: number;
  waveFrequency: number;
  waveThickness: number;
  waveAmplitude: number;
  waveDirection: number;
  voronoiSpeed: number;
  voronoiScale: number;
  voronoiThreshold: number;
  voronoiEdge: number;
  voronoiDistortion: number;
  voronoiSeed: number;
  perlinSpeed: number;
  perlinScale: number;
  perlinSoftness: number;
  perlinThreshold: number;
  perlinContrast: number;
  perlinSeed: number;
};

const MB = SURFACE_EFFECT_DEFAULTS.metaballs;
const WAVE = SURFACE_EFFECT_DEFAULTS.waves;
const VORONOI = SURFACE_EFFECT_DEFAULTS.voronoi;
const PERLIN = SURFACE_EFFECT_DEFAULTS.perlin;

function asHex(value: unknown, fallback: string): string {
  if (typeof value === "string") {
    if (value.startsWith("#")) return value;
    if (/^[0-9A-Fa-f]{6}$/.test(value)) return `#${value}`;
  }
  if (value && typeof value === "object" && "r" in value && "g" in value && "b" in value) {
    const { r, g, b } = value as { r: number; g: number; b: number };
    const toByte = (n: number) => Math.round(n > 1 ? n : n * 255);
    const hex = (n: number) => toByte(n).toString(16).padStart(2, "0");
    return `#${hex(r)}${hex(g)}${hex(b)}`;
  }
  return fallback;
}

function asTheme(value: unknown): TypeWorldStageTheme {
  return value === "dark" ? "dark" : "light";
}

function asAutoDirection(value: unknown): TypeWorldAutoRotateDirection {
  return value === "ccw" ? "ccw" : "cw";
}

function asEffect(value: unknown): SurfaceEffectId {
  return isSurfaceEffectId(value) ? value : "orbs";
}

let activeEffectForSeed: SurfaceEffectId = "orbs";

function randomizeActiveSeed(): void {
  const next = Math.floor(Math.random() * 1_000_000);
  if (activeEffectForSeed === "orbs") levaStore.set({ orbSeed: next }, false);
  else if (activeEffectForSeed === "metaballs") levaStore.set({ mbSeed: next }, false);
  else if (activeEffectForSeed === "voronoi") levaStore.set({ voronoiSeed: next }, false);
  else if (activeEffectForSeed === "perlin") levaStore.set({ perlinSeed: next }, false);
}

function randomizeColorPalette(): void {
  const patch = paletteToPatch(pickRandomTypeWorldPalette());
  levaStore.set(patch, false);
}

function formatAutoSpeed(value: number): string {
  if (value < 0.005) return "0.00 stopped";
  return value.toFixed(2);
}

function formatEffectSpeed(value: number): string {
  if (Math.abs(value) < 0.005) return "0 frozen";
  return value.toFixed(2);
}

type LevaGet = (key: string) => unknown;

function effectOn(get: LevaGet): boolean {
  return (
    Boolean(levaControlValue(get, "surfaceEnabled")) &&
    levaControlValue(get, "surfaceType") !== "none"
  );
}

function effectIs(get: LevaGet, id: SurfaceEffectId): boolean {
  return (
    Boolean(levaControlValue(get, "surfaceEnabled")) &&
    levaControlValue(get, "surfaceType") === id
  );
}

function effectHasSeed(get: LevaGet): boolean {
  if (!effectOn(get)) return false;
  const type = levaControlValue(get, "surfaceType");
  return type === "orbs" || type === "metaballs" || type === "voronoi" || type === "perlin";
}

export function surfaceFromDemoParams(params: TypeWorldDemoParams): TypeWorldSurface {
  const type = params.surfaceType;
  const enabled = params.surfaceEnabled;
  if (type === "metaballs") {
    return {
      enabled,
      type,
      speed: params.mbSpeed,
      scale: params.mbScale,
      softness: params.mbSoftness,
      seed: params.mbSeed,
      threshold: params.mbThreshold,
      density: params.mbDensity,
      amplitude: MB.amplitude,
      direction: MB.direction,
      distortion: MB.distortion,
      edge: MB.edge,
      contrast: MB.contrast,
      frequency: MB.frequency,
      thickness: MB.thickness,
    };
  }
  if (type === "waves") {
    return {
      enabled,
      type,
      speed: params.waveSpeed,
      scale: params.waveScale,
      softness: params.waveSoftness,
      seed: WAVE.seed,
      threshold: WAVE.threshold,
      density: WAVE.density,
      amplitude: params.waveAmplitude,
      direction: params.waveDirection,
      distortion: WAVE.distortion,
      edge: WAVE.edge,
      contrast: WAVE.contrast,
      frequency: params.waveFrequency,
      thickness: params.waveThickness,
    };
  }
  if (type === "voronoi") {
    return {
      enabled,
      type,
      speed: params.voronoiSpeed,
      scale: params.voronoiScale,
      softness: VORONOI.softness,
      seed: params.voronoiSeed,
      threshold: params.voronoiThreshold,
      density: VORONOI.density,
      amplitude: VORONOI.amplitude,
      direction: VORONOI.direction,
      distortion: params.voronoiDistortion,
      edge: params.voronoiEdge,
      contrast: VORONOI.contrast,
      frequency: VORONOI.frequency,
      thickness: VORONOI.thickness,
    };
  }
  if (type === "perlin") {
    return {
      enabled,
      type,
      speed: params.perlinSpeed,
      scale: params.perlinScale,
      softness: params.perlinSoftness,
      seed: params.perlinSeed,
      threshold: params.perlinThreshold,
      density: PERLIN.density,
      amplitude: PERLIN.amplitude,
      direction: PERLIN.direction,
      distortion: PERLIN.distortion,
      edge: PERLIN.edge,
      contrast: params.perlinContrast,
      frequency: PERLIN.frequency,
      thickness: PERLIN.thickness,
    };
  }
  if (type === "none") {
    return { ...TYPE_WORLD_SURFACE_DEFAULTS, enabled, type: "none", speed: 0 };
  }
  return {
    enabled,
    type: "orbs",
    speed: params.orbAnimSpeed,
    scale: params.orbScale,
    softness: params.orbEdgeSoftness,
    seed: params.orbSeed,
    threshold: SURFACE_EFFECT_DEFAULTS.orbs.threshold,
    density: params.orbCount,
    amplitude: SURFACE_EFFECT_DEFAULTS.orbs.amplitude,
    direction: SURFACE_EFFECT_DEFAULTS.orbs.direction,
    distortion: SURFACE_EFFECT_DEFAULTS.orbs.distortion,
    edge: SURFACE_EFFECT_DEFAULTS.orbs.edge,
    contrast: SURFACE_EFFECT_DEFAULTS.orbs.contrast,
    frequency: SURFACE_EFFECT_DEFAULTS.orbs.frequency,
    thickness: SURFACE_EFFECT_DEFAULTS.orbs.thickness,
  };
}

type TypeWorldControlsProps = {
  onChange: (patch: Partial<TypeWorldDemoParams>) => void;
  onReset: () => void;
};

/**
 * Leva panel — collapsible, off the artwork.
 * Patches flush on rAF so slider drags coalesce (not per-frame React).
 */
export function TypeWorldControls({
  onChange,
  onReset,
}: TypeWorldControlsProps) {
  const values = useControls({
    Appearance: folder({
      theme: {
        value: "light" as TypeWorldStageTheme,
        options: {
          Light: "light",
          Dark: "dark",
        },
        label: "Mode",
      },
      fillViewport: {
        value: false,
        label: "Fill viewport",
      },
      scale: {
        value: TYPE_WORLD_DEFAULTS.scale,
        min: 0.35,
        max: 2,
        step: 0.01,
        label: "Scale",
      },
    }),
    Typography: folder({
      quote: { value: TYPE_WORLD_QUOTE, rows: true },
      forceFallback: {
        value: false,
        label: "Static fallback",
      },
    }),
    Interaction: folder({
      dragSensitivity: {
        value: TYPE_WORLD_DEFAULTS.dragSensitivity,
        min: 0.002,
        max: 0.012,
        step: 0.0002,
        label: "Drag",
      },
      inertia: {
        value: TYPE_WORLD_DEFAULTS.inertia,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Inertia",
      },
      pitchLimit: {
        value: TYPE_WORLD_DEFAULTS.pitchLimit,
        min: 8,
        max: 28,
        step: 1,
        label: "Pitch",
      },
    }),
    "Auto Motion": folder({
      autoRotate: {
        value: TYPE_WORLD_AUTO_DEFAULTS.enabled,
        label: "Auto Rotate",
      },
      autoRotateDirection: {
        value: TYPE_WORLD_AUTO_DEFAULTS.direction,
        options: {
          CW: "cw",
          CCW: "ccw",
        },
        label: "Direction",
      },
      autoRotateSpeed: {
        value: TYPE_WORLD_AUTO_DEFAULTS.speed,
        min: 0,
        max: 2,
        step: 0.01,
        label: "Auto Speed",
        format: formatAutoSpeed,
      },
      autoResumeDelay: {
        value: TYPE_WORLD_AUTO_DEFAULTS.resumeDelay,
        min: 0,
        max: 4,
        step: 0.05,
        label: "Resume Delay",
      },
    }),
    Gradient: folder({
      "Randomize Colors": button(randomizeColorPalette),
      gradientColor1: {
        value: TYPE_WORLD_DEFAULTS.gradientColor1,
        label: "Color 1",
      },
      gradientColor2: {
        value: TYPE_WORLD_DEFAULTS.gradientColor2,
        label: "Color 2",
      },
      gradientColor3: {
        value: TYPE_WORLD_DEFAULTS.gradientColor3,
        label: "Color 3",
      },
      gradientSpeed: {
        value: TYPE_WORLD_DEFAULTS.gradientSpeed,
        min: 0,
        max: 2,
        step: 0.01,
        label: "Speed",
      },
      gradientAngle: {
        value: TYPE_WORLD_DEFAULTS.gradientAngle,
        min: 0,
        max: 360,
        step: 1,
        label: "Angle",
      },
      gradientSpread: {
        value: TYPE_WORLD_DEFAULTS.gradientSpread,
        min: 0.5,
        max: 3,
        step: 0.01,
        label: "Spread",
      },
      gradientReverse: {
        value: TYPE_WORLD_DEFAULTS.gradientReverse,
        label: "Reverse Gradient",
      },
    }),
    "Surface Effect": folder({
      surfaceEnabled: {
        value: TYPE_WORLD_SURFACE_DEFAULTS.enabled,
        label: "Enabled",
      },
      surfaceType: {
        value: TYPE_WORLD_SURFACE_DEFAULTS.type,
        options: {
          [SURFACE_EFFECT_LABELS.none]: "none",
          [SURFACE_EFFECT_LABELS.orbs]: "orbs",
          [SURFACE_EFFECT_LABELS.metaballs]: "metaballs",
          [SURFACE_EFFECT_LABELS.waves]: "waves",
          [SURFACE_EFFECT_LABELS.voronoi]: "voronoi",
          [SURFACE_EFFECT_LABELS.perlin]: "perlin",
        },
        label: "Effect",
      },
      orbColorLight: {
        value: TYPE_WORLD_ORB_DEFAULTS.colorLight,
        label: "Effect Color Light",
        render: (get) => effectOn(get),
      },
      orbColorDark: {
        value: TYPE_WORLD_ORB_DEFAULTS.colorDark,
        label: "Effect Color Dark",
        render: (get) => effectOn(get),
      },
      orbInvertText: {
        value: TYPE_WORLD_ORB_DEFAULTS.invertText,
        label: "Invert",
        render: (get) => effectOn(get),
      },
      orbTextColor: {
        value: TYPE_WORLD_ORB_DEFAULTS.textColor,
        render: () => false,
      },
      orbTextColor2: {
        value: TYPE_WORLD_ORB_DEFAULTS.textColor2,
        render: () => false,
      },
      orbAnimSpeed: {
        value: SURFACE_EFFECT_DEFAULTS.orbs.speed,
        min: -2,
        max: 2,
        step: 0.01,
        label: "Speed",
        format: formatEffectSpeed,
        render: (get) => effectIs(get, "orbs"),
      },
      orbScale: {
        value: SURFACE_EFFECT_DEFAULTS.orbs.scale,
        min: 0.35,
        max: 2,
        step: 0.01,
        label: "Scale",
        render: (get) => effectIs(get, "orbs"),
      },
      orbCount: {
        value: TYPE_WORLD_ORB_DEFAULTS.count,
        min: 1,
        max: MAX_SURFACE_ORBS,
        step: 1,
        label: "Count",
        render: (get) => effectIs(get, "orbs"),
      },
      orbSeed: {
        value: TYPE_WORLD_ORB_DEFAULTS.seed,
        min: 0,
        max: 999999,
        step: 1,
        label: "Seed",
        render: (get) => effectIs(get, "orbs"),
      },
      orbSizeMin: {
        value: TYPE_WORLD_ORB_DEFAULTS.sizeMin,
        min: 0.08,
        max: 0.55,
        step: 0.01,
        label: "Size Min",
        render: (get) => effectIs(get, "orbs"),
      },
      orbSizeMax: {
        value: TYPE_WORLD_ORB_DEFAULTS.sizeMax,
        min: 0.08,
        max: 0.55,
        step: 0.01,
        label: "Size Max",
        render: (get) => effectIs(get, "orbs"),
      },
      orbEdgeSoftness: {
        value: TYPE_WORLD_ORB_DEFAULTS.edgeSoftness,
        min: 0.01,
        max: 0.45,
        step: 0.005,
        label: "Effect Softness",
        render: (get) => effectIs(get, "orbs"),
      },
      orbSpeedMin: {
        value: TYPE_WORLD_ORB_DEFAULTS.speedMin,
        min: 0,
        max: 0.45,
        step: 0.005,
        label: "Speed Min",
        render: (get) => effectIs(get, "orbs"),
      },
      orbSpeedMax: {
        value: TYPE_WORLD_ORB_DEFAULTS.speedMax,
        min: 0,
        max: 0.45,
        step: 0.005,
        label: "Speed Max",
        render: (get) => effectIs(get, "orbs"),
      },
      orbSteerAmount: {
        value: TYPE_WORLD_ORB_DEFAULTS.steerAmount,
        min: 0,
        max: 2,
        step: 0.01,
        label: "Steer",
        render: (get) => effectIs(get, "orbs"),
      },
      orbSpeedNoise: {
        value: TYPE_WORLD_ORB_DEFAULTS.speedNoise,
        min: 0,
        max: 1.5,
        step: 0.01,
        label: "Speed Noise",
        render: (get) => effectIs(get, "orbs"),
      },
      orbDriftNoise: {
        value: TYPE_WORLD_ORB_DEFAULTS.driftNoise,
        min: 0,
        max: 1.5,
        step: 0.01,
        label: "Drift Noise",
        render: (get) => effectIs(get, "orbs"),
      },
      mbSpeed: {
        value: MB.speed,
        min: -2,
        max: 2,
        step: 0.01,
        label: "Speed",
        format: formatEffectSpeed,
        render: (get) => effectIs(get, "metaballs"),
      },
      mbScale: {
        value: MB.scale,
        min: 0.35,
        max: 2.2,
        step: 0.01,
        label: "Scale",
        render: (get) => effectIs(get, "metaballs"),
      },
      mbSoftness: {
        value: MB.softness,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Effect Softness",
        render: (get) => effectIs(get, "metaballs"),
      },
      mbDensity: {
        value: MB.density,
        min: 1,
        max: 12,
        step: 1,
        label: "Density",
        render: (get) => effectIs(get, "metaballs"),
      },
      mbThreshold: {
        value: MB.threshold,
        min: 0.08,
        max: 1.2,
        step: 0.01,
        label: "Threshold",
        render: (get) => effectIs(get, "metaballs"),
      },
      mbSeed: {
        value: MB.seed,
        min: 0,
        max: 999999,
        step: 1,
        label: "Seed",
        render: (get) => effectIs(get, "metaballs"),
      },
      waveSpeed: {
        value: WAVE.speed,
        min: -2,
        max: 2,
        step: 0.01,
        label: "Speed",
        format: formatEffectSpeed,
        render: (get) => effectIs(get, "waves"),
      },
      waveScale: {
        value: WAVE.scale,
        min: 0.35,
        max: 2.4,
        step: 0.01,
        label: "Scale",
        render: (get) => effectIs(get, "waves"),
      },
      waveSoftness: {
        value: WAVE.softness,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Effect Softness",
        render: (get) => effectIs(get, "waves"),
      },
      waveFrequency: {
        value: WAVE.frequency,
        min: 0.15,
        max: 2.5,
        step: 0.01,
        label: "Frequency",
        render: (get) => effectIs(get, "waves"),
      },
      waveThickness: {
        value: WAVE.thickness,
        min: 0.08,
        max: 0.92,
        step: 0.01,
        label: "Thickness",
        render: (get) => effectIs(get, "waves"),
      },
      waveAmplitude: {
        value: WAVE.amplitude,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Amplitude",
        render: (get) => effectIs(get, "waves"),
      },
      waveDirection: {
        value: WAVE.direction,
        min: 0,
        max: Math.PI * 2,
        step: 0.01,
        label: "Direction",
        render: (get) => effectIs(get, "waves"),
      },
      voronoiSpeed: {
        value: VORONOI.speed,
        min: -2,
        max: 2,
        step: 0.01,
        label: "Speed",
        format: formatEffectSpeed,
        render: (get) => effectIs(get, "voronoi"),
      },
      voronoiScale: {
        value: VORONOI.scale,
        min: 0.35,
        max: 2.4,
        step: 0.01,
        label: "Cell Scale",
        render: (get) => effectIs(get, "voronoi"),
      },
      voronoiThreshold: {
        value: VORONOI.threshold,
        min: 0.15,
        max: 0.9,
        step: 0.01,
        label: "Threshold",
        render: (get) => effectIs(get, "voronoi"),
      },
      voronoiEdge: {
        value: VORONOI.edge,
        min: 0.2,
        max: 3,
        step: 0.01,
        label: "Edge",
        render: (get) => effectIs(get, "voronoi"),
      },
      voronoiDistortion: {
        value: VORONOI.distortion,
        min: 0,
        max: 0.5,
        step: 0.01,
        label: "Distortion",
        render: (get) => effectIs(get, "voronoi"),
      },
      voronoiSeed: {
        value: VORONOI.seed,
        min: 0,
        max: 999999,
        step: 1,
        label: "Seed",
        render: (get) => effectIs(get, "voronoi"),
      },
      perlinSpeed: {
        value: PERLIN.speed,
        min: -2,
        max: 2,
        step: 0.01,
        label: "Speed",
        format: formatEffectSpeed,
        render: (get) => effectIs(get, "perlin"),
      },
      perlinScale: {
        value: PERLIN.scale,
        min: 0.35,
        max: 2.6,
        step: 0.01,
        label: "Noise Scale",
        render: (get) => effectIs(get, "perlin"),
      },
      perlinSoftness: {
        value: PERLIN.softness,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Effect Softness",
        render: (get) => effectIs(get, "perlin"),
      },
      perlinThreshold: {
        value: PERLIN.threshold,
        min: 0.15,
        max: 0.85,
        step: 0.01,
        label: "Threshold",
        render: (get) => effectIs(get, "perlin"),
      },
      perlinContrast: {
        value: PERLIN.contrast,
        min: 0.02,
        max: 0.5,
        step: 0.01,
        label: "Contrast",
        render: (get) => effectIs(get, "perlin"),
      },
      perlinSeed: {
        value: PERLIN.seed,
        min: 0,
        max: 999999,
        step: 1,
        label: "Seed",
        render: (get) => effectIs(get, "perlin"),
      },
      "Randomize Seed": {
        ...button(randomizeActiveSeed),
        render: (get) => effectHasSeed(get),
      },
    }),
    Reset: button(onReset),
  });

  const lastSerializedRef = useRef("");
  const pendingRef = useRef<Partial<TypeWorldDemoParams> | null>(null);
  const rafRef = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const v = values as Record<string, unknown>;
    const surfaceType = asEffect(v.surfaceType);
    activeEffectForSeed = surfaceType;
    const patch: Partial<TypeWorldDemoParams> = {
      quote: String(v.quote ?? TYPE_WORLD_QUOTE),
      forceFallback: Boolean(v.forceFallback),
      theme: asTheme(v.theme),
      fillViewport: Boolean(v.fillViewport),
      scale: Number(v.scale),
      dragSensitivity: Number(v.dragSensitivity),
      inertia: Number(v.inertia),
      pitchLimit: Number(v.pitchLimit),
      autoRotate: Boolean(v.autoRotate),
      autoRotateDirection: asAutoDirection(v.autoRotateDirection),
      autoRotateSpeed: Math.abs(Number(v.autoRotateSpeed)),
      autoResumeDelay: Number(v.autoResumeDelay),
      gradientColor1: asHex(v.gradientColor1, TYPE_WORLD_DEFAULTS.gradientColor1),
      gradientColor2: asHex(v.gradientColor2, TYPE_WORLD_DEFAULTS.gradientColor2),
      gradientColor3: asHex(v.gradientColor3, TYPE_WORLD_DEFAULTS.gradientColor3),
      gradientSpeed: Number(v.gradientSpeed),
      gradientAngle: Number(v.gradientAngle),
      gradientSpread: Number(v.gradientSpread),
      gradientReverse: Boolean(v.gradientReverse),
      surfaceEnabled: Boolean(v.surfaceEnabled),
      surfaceType,
      orbCount: Number(v.orbCount),
      orbSeed: Number(v.orbSeed),
      orbAnimSpeed: Number(v.orbAnimSpeed),
      orbScale: Number(v.orbScale),
      orbSizeMin: Number(v.orbSizeMin),
      orbSizeMax: Number(v.orbSizeMax),
      orbEdgeSoftness: Number(v.orbEdgeSoftness),
      orbSpeedMin: Number(v.orbSpeedMin),
      orbSpeedMax: Number(v.orbSpeedMax),
      orbSteerAmount: Number(v.orbSteerAmount),
      orbSpeedNoise: Number(v.orbSpeedNoise),
      orbDriftNoise: Number(v.orbDriftNoise),
      orbColorLight: asHex(v.orbColorLight, TYPE_WORLD_ORB_DEFAULTS.colorLight),
      orbColorDark: asHex(v.orbColorDark, TYPE_WORLD_ORB_DEFAULTS.colorDark),
      orbTextColor: asHex(v.orbTextColor, TYPE_WORLD_ORB_DEFAULTS.textColor),
      orbTextColor2: asHex(v.orbTextColor2, TYPE_WORLD_ORB_DEFAULTS.textColor2),
      orbInvertText: Boolean(v.orbInvertText),
      orbRenderBody: true,
      mbSpeed: Number(v.mbSpeed),
      mbScale: Number(v.mbScale),
      mbSoftness: Number(v.mbSoftness),
      mbDensity: Number(v.mbDensity),
      mbThreshold: Number(v.mbThreshold),
      mbSeed: Number(v.mbSeed),
      waveSpeed: Number(v.waveSpeed),
      waveScale: Number(v.waveScale),
      waveSoftness: Number(v.waveSoftness),
      waveFrequency: Number(v.waveFrequency),
      waveThickness: Number(v.waveThickness),
      waveAmplitude: Number(v.waveAmplitude),
      waveDirection: Number(v.waveDirection),
      voronoiSpeed: Number(v.voronoiSpeed),
      voronoiScale: Number(v.voronoiScale),
      voronoiThreshold: Number(v.voronoiThreshold),
      voronoiEdge: Number(v.voronoiEdge),
      voronoiDistortion: Number(v.voronoiDistortion),
      voronoiSeed: Number(v.voronoiSeed),
      perlinSpeed: Number(v.perlinSpeed),
      perlinScale: Number(v.perlinScale),
      perlinSoftness: Number(v.perlinSoftness),
      perlinThreshold: Number(v.perlinThreshold),
      perlinContrast: Number(v.perlinContrast),
      perlinSeed: Number(v.perlinSeed),
    };
    const serialized = JSON.stringify(patch);
    if (serialized === lastSerializedRef.current) return;
    lastSerializedRef.current = serialized;
    pendingRef.current = patch;

    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const next = pendingRef.current;
      pendingRef.current = null;
      if (next) onChangeRef.current(next);
    });
  }, [values]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return null;
}
