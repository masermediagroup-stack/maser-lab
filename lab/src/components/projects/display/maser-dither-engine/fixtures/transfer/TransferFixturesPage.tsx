"use client";

/**
 * Sprint 8 — Independent transfer fixtures (no editor / studio / panels).
 * Proves exported components survive outside the creative editor.
 */

import { useMemo } from "react";
import {
  DEFAULT_ANIMATION_CONFIG,
} from "../../engine/animation";
import { DEFAULT_COLOR_MATERIAL, applyPaletteToConfig } from "../../engine/color";
import { DEFAULT_DITHER_CONFIG } from "../../engine/dither";
import { DEFAULT_INTERACTION_CONFIG } from "../../engine/interaction";
import { DEFAULT_LIGHT_SHAPE } from "../../engine/lighting";
import {
  DEFAULT_MATERIAL_CONFIG,
  createDefaultLayers,
} from "../../engine/material";
import { MONOCHROME_DEFAULTS } from "../../constants";
import { DEFAULT_COMPONENT_CONTENT } from "../../content/types";
import { DitherCard } from "../../components/adapters/DitherCard";
import { DitherButton } from "../../components/adapters/DitherButton";
import { DitherImageFrame } from "../../components/adapters/DitherImageFrame";
import {
  buildRuntimeConfig,
  type MaserDitherRuntimeConfig,
} from "../../export";

function fixtureCard(): MaserDitherRuntimeConfig {
  const color = {
    ...applyPaletteToConfig(
      "aurora",
      structuredClone(DEFAULT_COLOR_MATERIAL),
    ),
    colorEnabled: true,
  };
  return buildRuntimeConfig({
    componentId: "card",
    params: { ...MONOCHROME_DEFAULTS, contrast: 1.35, bloom: 0.55 },
    animation: {
      ...DEFAULT_ANIMATION_CONFIG,
      modeId: "wave",
      timeline: { ...DEFAULT_ANIMATION_CONFIG.timeline, playing: true },
    },
    interaction: { ...DEFAULT_INTERACTION_CONFIG, modeId: "follow" },
    color,
    light: { ...DEFAULT_LIGHT_SHAPE, radius: 0.5 },
    dither: { ...DEFAULT_DITHER_CONFIG, algorithm: "bayer", matrixSize: 8 },
    material: {
      ...DEFAULT_MATERIAL_CONFIG,
      materialId: "paper",
      layers: createDefaultLayers("paper"),
    },
    content: {
      ...DEFAULT_COMPONENT_CONTENT,
      cardTitle: "Transfer fixture — Card",
      cardSubtitle: "Custom color + animation",
      cardButtonLabel: "Open",
    },
    sourceUrl: null,
    sourceLightMix: 0.45,
    basePresetId: "fixture-card",
  });
}

function fixtureButton(): MaserDitherRuntimeConfig {
  return buildRuntimeConfig({
    componentId: "button",
    params: { ...MONOCHROME_DEFAULTS, contrast: 1.15 },
    animation: {
      ...DEFAULT_ANIMATION_CONFIG,
      modeId: "breathing",
    },
    interaction: {
      ...DEFAULT_INTERACTION_CONFIG,
      modeId: "spring",
    },
    color: { ...DEFAULT_COLOR_MATERIAL, colorEnabled: true },
    light: { ...DEFAULT_LIGHT_SHAPE },
    dither: { ...DEFAULT_DITHER_CONFIG, algorithm: "bayer", matrixSize: 4 },
    material: {
      ...DEFAULT_MATERIAL_CONFIG,
      materialId: "chrome",
      layers: createDefaultLayers("chrome"),
    },
    content: {
      ...DEFAULT_COMPONENT_CONTENT,
      buttonLabel: "Interactive chrome",
    },
    sourceUrl: null,
    sourceLightMix: 0.45,
    basePresetId: "fixture-button",
  });
}

function fixtureImageFrame(): MaserDitherRuntimeConfig {
  return buildRuntimeConfig({
    componentId: "image-frame",
    params: { ...MONOCHROME_DEFAULTS },
    animation: { ...DEFAULT_ANIMATION_CONFIG, modeId: "noise-drift" },
    interaction: { ...DEFAULT_INTERACTION_CONFIG, modeId: "none" },
    color: { ...DEFAULT_COLOR_MATERIAL, colorEnabled: true },
    light: { ...DEFAULT_LIGHT_SHAPE },
    dither: { ...DEFAULT_DITHER_CONFIG, algorithm: "bayer", matrixSize: 8 },
    material: {
      ...DEFAULT_MATERIAL_CONFIG,
      materialId: "ink",
      layers: createDefaultLayers("ink"),
    },
    content: {
      ...DEFAULT_COMPONENT_CONTENT,
      imageCaption: "External reference image (replace path in host apps)",
      imageAspect: "16:9",
    },
    // Portable public path — not a blob URL
    sourceUrl: "/demos/maser-dither-engine/fixture-placeholder.svg",
    sourceLightMix: 0.4,
    basePresetId: "fixture-image",
  });
}

export function TransferFixturesPage({
  reducedMotion = false,
}: {
  reducedMotion?: boolean;
}) {
  const card = useMemo(() => fixtureCard(), []);
  const button = useMemo(() => fixtureButton(), []);
  const frame = useMemo(() => fixtureImageFrame(), []);

  return (
    <div className="mde-page mde-transfer-fixtures" aria-label="Transfer fixtures">
      <header>
        <p className="mde-export-workspace__eyebrow">Sprint 8 verification</p>
        <h1>Transfer fixtures</h1>
        <p>
          Three exports rendered without editor state, project browser, Preset
          Studio, or Lab control panels.
        </p>
      </header>

      <section aria-labelledby="fx-card">
        <h2 id="fx-card">1. Card — custom color + animation</h2>
        <DitherCard
          params={card.params}
          animation={card.animation}
          interaction={card.interaction}
          color={card.color}
          light={card.light}
          dither={card.dither}
          material={card.material}
          content={card.content}
          reducedMotion={reducedMotion}
        />
      </section>

      <section aria-labelledby="fx-btn">
        <h2 id="fx-btn">2. Button — interactive material</h2>
        <DitherButton
          params={button.params}
          animation={button.animation}
          interaction={button.interaction}
          color={button.color}
          light={button.light}
          dither={button.dither}
          material={button.material}
          content={button.content}
          reducedMotion={reducedMotion}
        />
      </section>

      <section aria-labelledby="fx-img">
        <h2 id="fx-img">3. Image Frame — external asset path</h2>
        <DitherImageFrame
          params={frame.params}
          animation={frame.animation}
          interaction={frame.interaction}
          color={frame.color}
          light={frame.light}
          dither={frame.dither}
          material={frame.material}
          content={frame.content}
          sourceUrl={frame.sourceUrl}
          sourceLightMix={frame.sourceLightMix}
          reducedMotion={reducedMotion}
        />
      </section>
    </div>
  );
}

export const TRANSFER_FIXTURE_RUNTIMES = {
  card: fixtureCard,
  button: fixtureButton,
  imageFrame: fixtureImageFrame,
};
