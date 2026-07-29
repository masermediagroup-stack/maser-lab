import type { ControlGroupId } from "../types";
import type { MonochromeParams } from "../types";

export type ControlField =
  | { kind: "ditherSize" }
  | { kind: "slider"; key: keyof Omit<MonochromeParams, "ditherSize"> };

export type ControlGroupDef = {
  id: ControlGroupId;
  label: string;
  fields: ControlField[];
};

export const CONTROL_GROUPS: ControlGroupDef[] = [
  {
    id: "material",
    label: "Material",
    fields: [
      { kind: "ditherSize" },
      { kind: "slider", key: "posterization" },
      { kind: "slider", key: "softEdge" },
      { kind: "slider", key: "opacity" },
      { kind: "slider", key: "randomSeed" },
    ],
  },
  {
    id: "animation",
    label: "Animation",
    fields: [
      { kind: "slider", key: "animationSpeed" },
      { kind: "slider", key: "noiseSpeed" },
    ],
  },
  {
    id: "lighting",
    label: "Lighting",
    fields: [
      { kind: "slider", key: "lightX" },
      { kind: "slider", key: "lightY" },
      { kind: "slider", key: "bloom" },
      { kind: "slider", key: "bloomRadius" },
      { kind: "slider", key: "depth" },
      { kind: "slider", key: "shadowStrength" },
      { kind: "slider", key: "highlightStrength" },
    ],
  },
  {
    id: "colors",
    label: "Colors",
    fields: [
      { kind: "slider", key: "gradientAngle" },
      { kind: "slider", key: "gradientColorA" },
      { kind: "slider", key: "gradientColorB" },
      { kind: "slider", key: "brightness" },
      { kind: "slider", key: "contrast" },
    ],
  },
  {
    id: "interaction",
    label: "Interaction",
    fields: [
      { kind: "slider", key: "cursorInfluence" },
      { kind: "slider", key: "scrollInfluence" },
    ],
  },
  {
    id: "noise",
    label: "Noise",
    fields: [
      { kind: "slider", key: "noiseScale" },
      { kind: "slider", key: "blueNoiseAmount" },
      { kind: "slider", key: "grainAmount" },
    ],
  },
  {
    id: "rendering",
    label: "Rendering",
    fields: [{ kind: "slider", key: "pixelDensity" }],
  },
];
