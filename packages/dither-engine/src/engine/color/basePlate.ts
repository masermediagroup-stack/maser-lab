import type { ColorMaterialConfig, Rgb } from "./types";
import { rgb } from "./types";

/** Foundation plate behind the dither material — only two defaults. */
export type BasePlateId = "black" | "white";

export const BASE_PLATE_OPTIONS: {
  id: BasePlateId;
  label: string;
}[] = [
  { id: "black", label: "Black" },
  { id: "white", label: "White" },
];

export const BASE_PLATE_RGB: Record<BasePlateId, Rgb> = {
  black: rgb(0, 0, 0),
  white: rgb(1, 1, 1),
};

/** Relative luminance 0–1 (sRGB, Rec. 709). */
export function rgbLuminance({ r, g, b }: Rgb): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Map current background toward the nearest default plate. */
export function resolveBasePlate(background: Rgb): BasePlateId {
  return rgbLuminance(background) >= 0.5 ? "white" : "black";
}

export function withBasePlate(
  config: ColorMaterialConfig,
  plate: BasePlateId,
): ColorMaterialConfig {
  return {
    ...config,
    colors: {
      ...config.colors,
      background: { ...BASE_PLATE_RGB[plate] },
    },
  };
}
