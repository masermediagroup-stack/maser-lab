"use client";

import { useControls, folder, button, levaStore } from "leva";
import { useEffect, useRef } from "react";
import {
  MAX_SURFACE_ORBS,
  TYPE_WORLD_DEFAULTS,
  TYPE_WORLD_ORB_DEFAULTS,
  TYPE_WORLD_QUOTE,
} from "./constants";
import type { TypeWorldStageTheme } from "./types";

export type { TypeWorldStageTheme };

export type TypeWorldDemoParams = {
  quote: string;
  dragSensitivity: number;
  inertia: number;
  pitchLimit: number;
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
  orbsEnabled: boolean;
  orbCount: number;
  orbSeed: number;
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

function randomizeOrbSeed(): void {
  const next = Math.floor(Math.random() * 1_000_000);
  levaStore.set({ orbSeed: next }, false);
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
    Gradient: folder({
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
    Orbs: folder({
      orbsEnabled: {
        value: TYPE_WORLD_ORB_DEFAULTS.enabled,
        label: "Enabled",
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
      "Randomize Seed": button(randomizeOrbSeed),
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
        min: 0.02,
        max: 0.45,
        step: 0.01,
        label: "Edge Softness",
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
        label: "Steer Amount",
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
    }),
    "Orb Colors": folder({
      orbColorLight: {
        value: TYPE_WORLD_ORB_DEFAULTS.colorLight,
        label: "Orb Color Light",
      },
      orbColorDark: {
        value: TYPE_WORLD_ORB_DEFAULTS.colorDark,
        label: "Orb Color Dark",
      },
      orbTextColor: {
        value: TYPE_WORLD_ORB_DEFAULTS.textColor,
        label: "Orb Text Color",
      },
      orbTextColor2: {
        value: TYPE_WORLD_ORB_DEFAULTS.textColor2,
        label: "Orb Text Color 2",
      },
      orbInvertText: {
        value: TYPE_WORLD_ORB_DEFAULTS.invertText,
        label: "Invert Text In Orb",
      },
      orbRenderBody: {
        value: TYPE_WORLD_ORB_DEFAULTS.renderBody,
        label: "Render Orb Body",
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
    const patch: Partial<TypeWorldDemoParams> = {
      quote: String(v.quote ?? TYPE_WORLD_QUOTE),
      forceFallback: Boolean(v.forceFallback),
      theme: asTheme(v.theme),
      fillViewport: Boolean(v.fillViewport),
      scale: Number(v.scale),
      dragSensitivity: Number(v.dragSensitivity),
      inertia: Number(v.inertia),
      pitchLimit: Number(v.pitchLimit),
      gradientColor1: asHex(v.gradientColor1, TYPE_WORLD_DEFAULTS.gradientColor1),
      gradientColor2: asHex(v.gradientColor2, TYPE_WORLD_DEFAULTS.gradientColor2),
      gradientColor3: asHex(v.gradientColor3, TYPE_WORLD_DEFAULTS.gradientColor3),
      gradientSpeed: Number(v.gradientSpeed),
      gradientAngle: Number(v.gradientAngle),
      gradientSpread: Number(v.gradientSpread),
      gradientReverse: Boolean(v.gradientReverse),
      orbsEnabled: Boolean(v.orbsEnabled),
      orbCount: Number(v.orbCount),
      orbSeed: Number(v.orbSeed),
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
      orbRenderBody: Boolean(v.orbRenderBody),
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
