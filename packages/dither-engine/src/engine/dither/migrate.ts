/**
 * Sprint 5 preset / persisted-config migration.
 * Renamed and removed keys are mapped without breaking saved looks.
 */

import type { MonochromeParams, PresetDefinition } from "../../types";
import type { DitherConfig } from "./types";
import { DEFAULT_DITHER_CONFIG } from "./types";
import type { InteractionEngineConfig } from "../interaction/types";

/** Documented renames / removals for Sprint 5. */
export const DEPRECATED_KEYS = {
  depth: "Removed from UI — never sampled in FRAG (was placebo).",
  softEdge:
    "Relocated to Finish as UV Soft Clamp (now drives softClamp01).",
  cursorInfluence:
    "Merged into Interaction → Pointer Influence (no longer multiplies).",
  lightX: "Owned by Lighting panel light-shape center (legacy params kept).",
  lightY: "Owned by Lighting panel light-shape center (legacy params kept).",
  "poster-16": "Renamed to poster-32 — matrix was always 32×32, never 16×16.",
  ditherSize: "Renamed in UI to Matrix Size; Pattern Scale is separate.",
  pixelDensity: "Renamed in UI to Render Density.",
  animationSpeed: "Renamed in UI to Master Time Scale.",
  blueNoiseAmount: "Renamed to Bayer Blue-Noise Mix (Bayer-family only).",
} as const;

export type MigratedPlaygroundState = {
  params: Partial<MonochromeParams>;
  dither: Partial<DitherConfig>;
  interactionPatch?: Partial<InteractionEngineConfig>;
};

/**
 * Migrate a partial saved params blob into consolidated domains.
 */
export function migrateParamsBlob(
  raw: Partial<MonochromeParams> & Record<string, unknown>,
): MigratedPlaygroundState {
  const params: Partial<MonochromeParams> = { ...raw };
  const dither: Partial<DitherConfig> = {};
  const interactionPatch: Partial<InteractionEngineConfig> = {};

  if (typeof raw.ditherSize === "number") {
    dither.matrixSize = raw.ditherSize as DitherConfig["matrixSize"];
  }

  // Legacy cursorInfluence → interaction.influence (single owner)
  if (typeof raw.cursorInfluence === "number") {
    interactionPatch.influence = raw.cursorInfluence;
  }

  // Legacy algorithm string if ever persisted
  if (typeof raw.algorithm === "string") {
    dither.algorithm = raw.algorithm as DitherConfig["algorithm"];
  }
  if (typeof raw.patternScale === "number") {
    dither.patternScale = raw.patternScale;
  }

  return { params, dither, interactionPatch };
}

export function migratePreset(preset: PresetDefinition): PresetDefinition {
  const id = preset.id === "poster-16" ? "poster-32" : preset.id;
  const label = preset.id === "poster-16" ? "Poster 32" : preset.label;
  const description =
    preset.id === "poster-16"
      ? "Posterized luminance with a fine 32×32 Bayer matrix (never was 16×16)."
      : preset.description;

  const dither: Partial<DitherConfig> = {
    ...DEFAULT_DITHER_CONFIG,
    ...(preset.dither ?? {}),
    matrixSize:
      (preset.dither?.matrixSize as DitherConfig["matrixSize"] | undefined) ??
      (preset.params.ditherSize as DitherConfig["matrixSize"] | undefined) ??
      DEFAULT_DITHER_CONFIG.matrixSize,
  };

  // Soft-film used blue-noise amount heavily — prefer blue-noise algorithm
  if (preset.id === "soft-film" && !preset.dither) {
    dither.algorithm = "blue-noise";
    dither.distribution = 0.9;
  }
  if (preset.id === "hard-ink" && !preset.dither) {
    dither.algorithm = "bayer";
    dither.thresholdBias = 0.12;
  }
  if ((preset.id === "poster-16" || id === "poster-32") && !preset.dither) {
    dither.algorithm = "posterized";
    dither.matrixSize = 32;
  }

  return {
    ...preset,
    id,
    label,
    description,
    dither,
  };
}
