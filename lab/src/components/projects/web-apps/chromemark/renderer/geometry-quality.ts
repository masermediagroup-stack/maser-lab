import type { GeometrySettings } from "../types";

export type GeometryQualityId = "draft" | "high" | "ultra";

export const GEOMETRY_QUALITY = {
  draft: { curveSegments: 32, bevelSegments: 6 },
  high: { curveSegments: 64, bevelSegments: 12 },
  ultra: { curveSegments: 128, bevelSegments: 16 },
} as const;

export const INTERACTIVE_GEOMETRY_QUALITY: GeometryQualityId = "high";
export const EXPORT_GEOMETRY_QUALITY: GeometryQualityId = "ultra";

export const CREASE_ANGLE_RAD = (45 * Math.PI) / 180;

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
