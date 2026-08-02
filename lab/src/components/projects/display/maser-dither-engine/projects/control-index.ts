import { PARAM_LABELS } from "../constants";
import type { ControlGroupId } from "../types";

export type ControlSearchEntry = {
  id: string;
  label: string;
  group: ControlGroupId | "presets" | "workspace";
  keywords: string[];
  panel: ControlGroupId | "presets";
};

const PARAM_ENTRIES: ControlSearchEntry[] = (
  Object.keys(PARAM_LABELS) as (keyof typeof PARAM_LABELS)[]
).map((key) => ({
  id: `param:${key}`,
  label: PARAM_LABELS[key] ?? key,
  group: "finish",
  keywords: [key, PARAM_LABELS[key] ?? "", "slider", "param"],
  panel: key.includes("bloom")
    ? "lighting"
    : key.includes("grain") || key.includes("noise")
      ? "finish"
      : key.includes("contrast") || key.includes("brightness")
        ? "colors"
        : "finish",
}));

const EXTRA: ControlSearchEntry[] = [
  {
    id: "bloom",
    label: "Bloom",
    group: "lighting",
    keywords: ["bloom", "glow", "light spill"],
    panel: "lighting",
  },
  {
    id: "bloom-radius",
    label: "Bloom Radius",
    group: "lighting",
    keywords: ["bloom", "radius", "spread"],
    panel: "lighting",
  },
  {
    id: "bloom-intensity",
    label: "Bloom Intensity",
    group: "lighting",
    keywords: ["bloom", "intensity", "amount"],
    panel: "lighting",
  },
  {
    id: "bloom-blend",
    label: "Bloom Blend",
    group: "lighting",
    keywords: ["bloom", "blend"],
    panel: "lighting",
  },
  {
    id: "animation-speed",
    label: "Animation Speed",
    group: "animation",
    keywords: ["speed", "timeline", "playback"],
    panel: "animation",
  },
  {
    id: "contrast",
    label: "Contrast",
    group: "colors",
    keywords: ["contrast", "tonal"],
    panel: "colors",
  },
  {
    id: "palette",
    label: "Palette",
    group: "colors",
    keywords: ["palette", "color", "gradient"],
    panel: "colors",
  },
  {
    id: "light-radius",
    label: "Light Radius",
    group: "lighting",
    keywords: ["radius", "light", "falloff"],
    panel: "lighting",
  },
  {
    id: "dither-algorithm",
    label: "Dither Algorithm",
    group: "dither",
    keywords: ["bayer", "blue-noise", "halftone", "algorithm"],
    panel: "dither",
  },
  {
    id: "material-structure",
    label: "Material Structure",
    group: "material",
    keywords: ["structure", "fiber", "material"],
    panel: "material",
  },
  {
    id: "interaction-influence",
    label: "Pointer Influence",
    group: "interaction",
    keywords: ["pointer", "cursor", "influence"],
    panel: "interaction",
  },
];

export const CONTROL_INDEX: ControlSearchEntry[] = [...EXTRA, ...PARAM_ENTRIES];

export function searchControls(query: string): ControlSearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return CONTROL_INDEX.filter((entry) => {
    const hay = [entry.label, entry.id, ...entry.keywords]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  }).slice(0, 24);
}
