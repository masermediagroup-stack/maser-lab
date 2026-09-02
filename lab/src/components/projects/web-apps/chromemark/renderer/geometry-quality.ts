import type { GeometrySettings } from "../types";

export type GeometryQualityId = "draft" | "high" | "ultra";

export const GEOMETRY_QUALITY = {
  draft: { curveSegments: 32, bevelSegments: 6 },
  high: { curveSegments: 64, bevelSegments: 12 },
  ultra: { curveSegments: 128, bevelSegments: 16 },
} as const;

export const INTERACTIVE_GEOMETRY_QUALITY: GeometryQualityId = "high";
export const EXPORT_GEOMETRY_QUALITY: GeometryQualityId = "ultra";

/** Blend all adjacent shell faces. A 45° crease was the broken bevel/wall edge. */
export const SHELL_SMOOTH_ANGLE_RAD = Math.PI;

export function tessellateGeometry(
  settings: GeometrySettings,
  quality: GeometryQualityId,
): GeometrySettings {
  const preset = GEOMETRY_QUALITY[quality];
  if (quality === "ultra") {
    return {
      ...settings,
      curveDetail: Math.max(settings.curveDetail, preset.curveSegments),
      bevelSegments: Math.max(settings.bevelSegments, preset.bevelSegments),
    };
  }
  return settings;
}
