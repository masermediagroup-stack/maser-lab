/**
 * Product export surface for ChromeMark.
 * Lab demo chrome lives in `chromemark-demo.tsx` and is registered
 * from `lab/src/components/projects/registry.ts` — do not re-export it here.
 */
export { ChromeMarkApp } from "./chromemark-app";

export type {
  AnimationSettings,
  CameraSettings,
  ChromeMarkAppProps,
  ChromeMarkSettings,
  ChromePresetId,
  EnvironmentSettings,
  ExportSettings,
  GeometrySettings,
  LogoInfo,
  MaterialSettings,
  PreviewBackdropId,
  TraceSettings,
} from "./types";
