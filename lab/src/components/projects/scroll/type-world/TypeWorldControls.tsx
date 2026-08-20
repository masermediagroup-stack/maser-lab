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
import { withLevaFolderPaths, levaControlValue } from "./levaSurface";
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

const DEFAULT_SURFACE_EXTRAS: Record<string, unknown> = {
  orbAnimSpeed: SURFACE_EFFECT_DEFAULTS.orbs.speed,
  orbScale: SURFACE_EFFECT_DEFAULTS.orbs.scale,
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
  mbSpeed: MB.speed,
  mbScale: MB.scale,
  mbSoftness: MB.softness,
  mbDensity: MB.density,
  mbThreshold: MB.threshold,
  mbSeed: MB.seed,
  waveSpeed: WAVE.speed,
  waveScale: WAVE.scale,
  waveSoftness: WAVE.softness,
  waveFrequency: WAVE.frequency,
  waveThickness: WAVE.thickness,
  waveAmplitude: WAVE.amplitude,
  waveDirection: WAVE.direction,
  voronoiSpeed: VORONOI.speed,
  voronoiScale: VORONOI.scale,
  voronoiThreshold: VORONOI.threshold,
  voronoiEdge: VORONOI.edge,
  voronoiDistortion: VORONOI.distortion,
  voronoiSeed: VORONOI.seed,
  perlinSpeed: PERLIN.speed,
  perlinScale: PERLIN.scale,
  perlinSoftness: PERLIN.softness,
  perlinThreshold: PERLIN.threshold,
  perlinContrast: PERLIN.contrast,
  perlinSeed: PERLIN.seed,
};


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

function asFinite(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function holdSurfaceExtras(
  held: Record<string, unknown>,
  incoming: Record<string, unknown>,
): void {
  for (const key of Object.keys(DEFAULT_SURFACE_EXTRAS)) {
    if (incoming[key] !== undefined) held[key] = incoming[key];
  }
}

let activeEffectForSeed: SurfaceEffectId = "orbs";

function randomizeActiveSeed(): void {
  const next = Math.floor(Math.random() * 1_000_000);
  const key =
    activeEffectForSeed === "orbs"
      ? "orbSeed"
      : activeEffectForSeed === "metaballs"
        ? "mbSeed"
        : activeEffectForSeed === "voronoi"
          ? "voronoiSeed"
          : "perlinSeed";
  levaStore.set(withLevaFolderPaths({ [key]: next }), false);
}

function randomizeColorPalette(): void {
  const patch = paletteToPatch(pickRandomTypeWorldPalette());
  levaStore.set(withLevaFolderPaths(patch as Record<string, unknown>), false);
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

function whenEffect(id: SurfaceEffectId) {
  return (get: LevaGet) =>
    Boolean(levaControlValue(get, "surfaceEnabled")) &&
    asEffect(levaControlValue(get, "surfaceType")) === id;
}

function whenSeededEffect(get: LevaGet) {
  if (!Boolean(levaControlValue(get, "surfaceEnabled"))) return false;
  const type = asEffect(levaControlValue(get, "surfaceType"));
  return (
    type === "orbs" ||
    type === "metaballs" ||
    type === "voronoi" ||
    type === "perlin"
  );
}

function visibleFields(id: SurfaceEffectId): Record<string, object> {
  const fields = effectFields(id);
  const out: Record<string, object> = {};
  for (const [key, spec] of Object.entries(fields)) {
    out[key] = { ...spec, render: whenEffect(id) };
  }
  return out;
}

function effectFields(type: SurfaceEffectId): Record<string, object> {
  if (type === "none") return {};
  if (type === "orbs") {
    return {
      orbAnimSpeed: {
        value: SURFACE_EFFECT_DEFAULTS.orbs.speed,
        min: -2,
        max: 2,
        step: 0.01,
        label: "Speed",
        format: formatEffectSpeed,
      },
      orbScale: {
        value: SURFACE_EFFECT_DEFAULTS.orbs.scale,
        min: 0.35,
        max: 2,
        step: 0.01,
        label: "Scale",
      },
      orbCount: {
        value: TYPE_WORLD_ORB_DEFAULTS.count,
        min: 1,
        max: MAX_SURFACE_ORBS,
        step: 1,
        label: "Count",
      },
      orbSeed: {
        value: TYPE_WORLD_ORB_DEFAULTS.seed,
        min: 0,
        max: 999999,
        step: 1,
        label: "Seed",
      },
      orbSizeMin: {
        value: TYPE_WORLD_ORB_DEFAULTS.sizeMin,
        min: 0.08,
        max: 0.55,
        step: 0.01,
        label: "Size Min",
      },
      orbSizeMax: {
        value: TYPE_WORLD_ORB_DEFAULTS.sizeMax,
        min: 0.08,
        max: 0.55,
        step: 0.01,
        label: "Size Max",
      },
      orbEdgeSoftness: {
        value: TYPE_WORLD_ORB_DEFAULTS.edgeSoftness,
        min: 0.01,
        max: 0.45,
        step: 0.005,
        label: "Effect Softness",
      },
      orbSpeedMin: {
        value: TYPE_WORLD_ORB_DEFAULTS.speedMin,
        min: 0,
        max: 0.45,
        step: 0.005,
        label: "Speed Min",
      },
      orbSpeedMax: {
        value: TYPE_WORLD_ORB_DEFAULTS.speedMax,
        min: 0,
        max: 0.45,
        step: 0.005,
        label: "Speed Max",
      },
      orbSteerAmount: {
        value: TYPE_WORLD_ORB_DEFAULTS.steerAmount,
        min: 0,
        max: 2,
        step: 0.01,
        label: "Steer",
      },
      orbSpeedNoise: {
        value: TYPE_WORLD_ORB_DEFAULTS.speedNoise,
        min: 0,
        max: 1.5,
        step: 0.01,
        label: "Speed Noise",
      },
      orbDriftNoise: {
        value: TYPE_WORLD_ORB_DEFAULTS.driftNoise,
        min: 0,
        max: 1.5,
        step: 0.01,
        label: "Drift Noise",
      },
    };
  }
  if (type === "metaballs") {
    return {
      mbSpeed: {
        value: MB.speed,
        min: -2,
        max: 2,
        step: 0.01,
        label: "Speed",
        format: formatEffectSpeed,
      },
      mbScale: {
        value: MB.scale,
        min: 0.35,
        max: 2.4,
        step: 0.01,
        label: "Scale",
      },
      mbSoftness: {
        value: MB.softness,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Effect Softness",
      },
      mbDensity: {
        value: MB.density,
        min: 1,
        max: 12,
        step: 1,
        label: "Density",
      },
      mbThreshold: {
        value: MB.threshold,
        min: 0.08,
        max: 1.2,
        step: 0.01,
        label: "Threshold",
      },
      mbSeed: {
        value: MB.seed,
        min: 0,
        max: 999999,
        step: 1,
        label: "Seed",
      },
    };
  }
  if (type === "waves") {
    return {
      waveSpeed: {
        value: WAVE.speed,
        min: -2,
        max: 2,
        step: 0.01,
        label: "Speed",
        format: formatEffectSpeed,
      },
      waveScale: {
        value: WAVE.scale,
        min: 0.35,
        max: 2.4,
        step: 0.01,
        label: "Scale",
      },
      waveSoftness: {
        value: WAVE.softness,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Effect Softness",
      },
      waveFrequency: {
        value: WAVE.frequency,
        min: 0.15,
        max: 2.5,
        step: 0.01,
        label: "Frequency",
      },
      waveThickness: {
        value: WAVE.thickness,
        min: 0.08,
        max: 0.92,
        step: 0.01,
        label: "Thickness",
      },
      waveAmplitude: {
        value: WAVE.amplitude,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Amplitude",
      },
      waveDirection: {
        value: WAVE.direction,
        min: 0,
        max: Math.PI * 2,
        step: 0.01,
        label: "Direction",
      },
    };
  }
  if (type === "voronoi") {
    return {
      voronoiSpeed: {
        value: VORONOI.speed,
        min: -2,
        max: 2,
        step: 0.01,
        label: "Speed",
        format: formatEffectSpeed,
      },
      voronoiScale: {
        value: VORONOI.scale,
        min: 0.35,
        max: 2.4,
        step: 0.01,
        label: "Cell Scale",
      },
      voronoiThreshold: {
        value: VORONOI.threshold,
        min: 0.15,
        max: 0.9,
        step: 0.01,
        label: "Threshold",
      },
      voronoiEdge: {
        value: VORONOI.edge,
        min: 0.2,
        max: 3,
        step: 0.01,
        label: "Edge",
      },
      voronoiDistortion: {
        value: VORONOI.distortion,
        min: 0,
        max: 0.5,
        step: 0.01,
        label: "Distortion",
      },
      voronoiSeed: {
        value: VORONOI.seed,
        min: 0,
        max: 999999,
        step: 1,
        label: "Seed",
      },
    };
  }
  return {
    perlinSpeed: {
      value: PERLIN.speed,
      min: -2,
      max: 2,
      step: 0.01,
      label: "Speed",
      format: formatEffectSpeed,
    },
    perlinScale: {
      value: PERLIN.scale,
      min: 0.35,
      max: 2.6,
      step: 0.01,
      label: "Noise Scale",
    },
    perlinSoftness: {
      value: PERLIN.softness,
      min: 0,
      max: 1,
      step: 0.01,
      label: "Effect Softness",
    },
    perlinThreshold: {
      value: PERLIN.threshold,
      min: 0.15,
      max: 0.85,
      step: 0.01,
      label: "Threshold",
    },
    perlinContrast: {
      value: PERLIN.contrast,
      min: 0.02,
      max: 0.5,
      step: 0.01,
      label: "Contrast",
    },
    perlinSeed: {
      value: PERLIN.seed,
      min: 0,
      max: 999999,
      step: 1,
      label: "Seed",
    },
  };
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
      },
      orbColorDark: {
        value: TYPE_WORLD_ORB_DEFAULTS.colorDark,
        label: "Effect Color Dark",
      },
      orbInvertText: {
        value: TYPE_WORLD_ORB_DEFAULTS.invertText,
        label: "Invert",
      },
      orbTextColor: {
        value: TYPE_WORLD_ORB_DEFAULTS.textColor,
        render: () => false,
      },
      orbTextColor2: {
        value: TYPE_WORLD_ORB_DEFAULTS.textColor2,
        render: () => false,
      },
      ...visibleFields("orbs"),
      ...visibleFields("metaballs"),
      ...visibleFields("waves"),
      ...visibleFields("voronoi"),
      ...visibleFields("perlin"),
      "Randomize Seed": {
        ...button(randomizeActiveSeed),
        render: whenSeededEffect,
      },
    }),
    Reset: button(onReset),
  });

  const lastSerializedRef = useRef("");
  const pendingRef = useRef<Partial<TypeWorldDemoParams> | null>(null);
  const rafRef = useRef<number | null>(null);
  const extrasHeldRef = useRef<Record<string, unknown>>({
    ...DEFAULT_SURFACE_EXTRAS,
  });
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);


  useEffect(() => {
    const held = extrasHeldRef.current;
    holdSurfaceExtras(held, values as Record<string, unknown>);
    const v = {
      ...held,
      ...(values as Record<string, unknown>),
    };
    const surfaceType = asEffect(v.surfaceType);
    activeEffectForSeed = surfaceType;
    const patch: Partial<TypeWorldDemoParams> = {
      quote: String(v.quote ?? TYPE_WORLD_QUOTE),
      forceFallback: Boolean(v.forceFallback),
      theme: asTheme(v.theme),
      fillViewport: Boolean(v.fillViewport),
      scale: asFinite(v.scale, TYPE_WORLD_DEFAULTS.scale),
      dragSensitivity: asFinite(
        v.dragSensitivity,
        TYPE_WORLD_DEFAULTS.dragSensitivity,
      ),
      inertia: asFinite(v.inertia, TYPE_WORLD_DEFAULTS.inertia),
      pitchLimit: asFinite(v.pitchLimit, TYPE_WORLD_DEFAULTS.pitchLimit),
      autoRotate: Boolean(v.autoRotate),
      autoRotateDirection: asAutoDirection(v.autoRotateDirection),
      autoRotateSpeed: Math.abs(
        asFinite(v.autoRotateSpeed, TYPE_WORLD_AUTO_DEFAULTS.speed),
      ),
      autoResumeDelay: asFinite(
        v.autoResumeDelay,
        TYPE_WORLD_AUTO_DEFAULTS.resumeDelay,
      ),
      gradientColor1: asHex(v.gradientColor1, TYPE_WORLD_DEFAULTS.gradientColor1),
      gradientColor2: asHex(v.gradientColor2, TYPE_WORLD_DEFAULTS.gradientColor2),
      gradientColor3: asHex(v.gradientColor3, TYPE_WORLD_DEFAULTS.gradientColor3),
      gradientSpeed: asFinite(
        v.gradientSpeed,
        TYPE_WORLD_DEFAULTS.gradientSpeed,
      ),
      gradientAngle: asFinite(
        v.gradientAngle,
        TYPE_WORLD_DEFAULTS.gradientAngle,
      ),
      gradientSpread: asFinite(
        v.gradientSpread,
        TYPE_WORLD_DEFAULTS.gradientSpread,
      ),
      gradientReverse: Boolean(v.gradientReverse),
      surfaceEnabled: Boolean(v.surfaceEnabled),
      surfaceType,
      orbCount: asFinite(v.orbCount, TYPE_WORLD_ORB_DEFAULTS.count),
      orbSeed: asFinite(v.orbSeed, TYPE_WORLD_ORB_DEFAULTS.seed),
      orbAnimSpeed: asFinite(
        v.orbAnimSpeed,
        SURFACE_EFFECT_DEFAULTS.orbs.speed,
      ),
      orbScale: asFinite(v.orbScale, SURFACE_EFFECT_DEFAULTS.orbs.scale),
      orbSizeMin: asFinite(v.orbSizeMin, TYPE_WORLD_ORB_DEFAULTS.sizeMin),
      orbSizeMax: asFinite(v.orbSizeMax, TYPE_WORLD_ORB_DEFAULTS.sizeMax),
      orbEdgeSoftness: asFinite(
        v.orbEdgeSoftness,
        TYPE_WORLD_ORB_DEFAULTS.edgeSoftness,
      ),
      orbSpeedMin: asFinite(v.orbSpeedMin, TYPE_WORLD_ORB_DEFAULTS.speedMin),
      orbSpeedMax: asFinite(v.orbSpeedMax, TYPE_WORLD_ORB_DEFAULTS.speedMax),
      orbSteerAmount: asFinite(
        v.orbSteerAmount,
        TYPE_WORLD_ORB_DEFAULTS.steerAmount,
      ),
      orbSpeedNoise: asFinite(
        v.orbSpeedNoise,
        TYPE_WORLD_ORB_DEFAULTS.speedNoise,
      ),
      orbDriftNoise: asFinite(
        v.orbDriftNoise,
        TYPE_WORLD_ORB_DEFAULTS.driftNoise,
      ),
      orbColorLight: asHex(v.orbColorLight, TYPE_WORLD_ORB_DEFAULTS.colorLight),
      orbColorDark: asHex(v.orbColorDark, TYPE_WORLD_ORB_DEFAULTS.colorDark),
      orbTextColor: asHex(v.orbTextColor, TYPE_WORLD_ORB_DEFAULTS.textColor),
      orbTextColor2: asHex(v.orbTextColor2, TYPE_WORLD_ORB_DEFAULTS.textColor2),
      orbInvertText: Boolean(v.orbInvertText),
      orbRenderBody: true,
      mbSpeed: asFinite(v.mbSpeed, MB.speed),
      mbScale: asFinite(v.mbScale, MB.scale),
      mbSoftness: asFinite(v.mbSoftness, MB.softness),
      mbDensity: asFinite(v.mbDensity, MB.density),
      mbThreshold: asFinite(v.mbThreshold, MB.threshold),
      mbSeed: asFinite(v.mbSeed, MB.seed),
      waveSpeed: asFinite(v.waveSpeed, WAVE.speed),
      waveScale: asFinite(v.waveScale, WAVE.scale),
      waveSoftness: asFinite(v.waveSoftness, WAVE.softness),
      waveFrequency: asFinite(v.waveFrequency, WAVE.frequency),
      waveThickness: asFinite(v.waveThickness, WAVE.thickness),
      waveAmplitude: asFinite(v.waveAmplitude, WAVE.amplitude),
      waveDirection: asFinite(v.waveDirection, WAVE.direction),
      voronoiSpeed: asFinite(v.voronoiSpeed, VORONOI.speed),
      voronoiScale: asFinite(v.voronoiScale, VORONOI.scale),
      voronoiThreshold: asFinite(v.voronoiThreshold, VORONOI.threshold),
      voronoiEdge: asFinite(v.voronoiEdge, VORONOI.edge),
      voronoiDistortion: asFinite(v.voronoiDistortion, VORONOI.distortion),
      voronoiSeed: asFinite(v.voronoiSeed, VORONOI.seed),
      perlinSpeed: asFinite(v.perlinSpeed, PERLIN.speed),
      perlinScale: asFinite(v.perlinScale, PERLIN.scale),
      perlinSoftness: asFinite(v.perlinSoftness, PERLIN.softness),
      perlinThreshold: asFinite(v.perlinThreshold, PERLIN.threshold),
      perlinContrast: asFinite(v.perlinContrast, PERLIN.contrast),
      perlinSeed: asFinite(v.perlinSeed, PERLIN.seed),
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
