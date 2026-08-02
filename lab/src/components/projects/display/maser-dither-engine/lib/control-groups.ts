import type { ControlGroupId } from "../types";
import type { MonochromeParams } from "../types";

export type ControlField =
  | { kind: "ditherSize" }
  | {
      kind: "slider";
      key: keyof Omit<MonochromeParams, "ditherSize">;
      /** Shown only in Advanced density mode. */
      advanced?: boolean;
    };

export type ControlGroupDef = {
  id: ControlGroupId;
  label: string;
  fields: ControlField[];
};

/**
 * Sprint 5 panel ownership — each concept appears in one group.
 * Dither algorithm UI is rendered by DitherPanel (dither group).
 * Dead/duplicate fields (depth, softEdge-as-material, cursorInfluence) removed from UI.
 */
export const CONTROL_GROUPS: ControlGroupDef[] = [
  {
    id: "material",
    label: "Material",
    fields: [],
  },
  {
    id: "animation",
    label: "Animation",
    fields: [{ kind: "slider", key: "animationSpeed" }],
  },
  {
    id: "interaction",
    label: "Interaction",
    fields: [{ kind: "slider", key: "scrollInfluence", advanced: true }],
  },
  {
    id: "lighting",
    label: "Lighting",
    fields: [
      { kind: "slider", key: "bloom" },
      { kind: "slider", key: "bloomRadius", advanced: true },
      { kind: "slider", key: "shadowStrength", advanced: true },
      { kind: "slider", key: "highlightStrength", advanced: true },
    ],
  },
  {
    id: "colors",
    label: "Color",
    fields: [
      { kind: "slider", key: "brightness", advanced: true },
      { kind: "slider", key: "contrast" },
      { kind: "slider", key: "gradientAngle", advanced: true },
      { kind: "slider", key: "gradientColorA", advanced: true },
      { kind: "slider", key: "gradientColorB", advanced: true },
    ],
  },
  {
    id: "dither",
    label: "Dither",
    fields: [
      { kind: "slider", key: "posterization", advanced: true },
      { kind: "slider", key: "pixelDensity", advanced: true },
    ],
  },
  {
    id: "finish",
    label: "Finish",
    fields: [
      { kind: "slider", key: "grainAmount" },
      { kind: "slider", key: "blueNoiseAmount", advanced: true },
      { kind: "slider", key: "noiseScale", advanced: true },
      { kind: "slider", key: "noiseSpeed", advanced: true },
      { kind: "slider", key: "softEdge", advanced: true },
      { kind: "slider", key: "opacity", advanced: true },
      { kind: "slider", key: "randomSeed", advanced: true },
    ],
  },
];

/** Fields still in MonochromeParams but removed from UI (kept for migration). */
export const DEPRECATED_PARAM_KEYS = [
  "depth",
  "cursorInfluence",
  "lightX",
  "lightY",
] as const;
