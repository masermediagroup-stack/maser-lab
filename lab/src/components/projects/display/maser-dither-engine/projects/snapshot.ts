import type { ComponentContent } from "../content/types";
import { DEFAULT_COMPONENT_CONTENT } from "../content/types";
import type { AnimationEngineConfig } from "../engine/animation/types";
import type { ColorMaterialConfig } from "../engine/color/types";
import type { DitherConfig } from "../engine/dither/types";
import type { InteractionEngineConfig } from "../engine/interaction/types";
import type { LightShapeConfig } from "../engine/lighting/types";
import type { MaterialEngineConfig } from "../engine/material/types";
import type { ComponentId, MonochromeParams } from "../types";
import {
  PROJECT_SCHEMA_VERSION,
  type ProjectSnapshot,
} from "./types";

export type CaptureInput = {
  componentId: ComponentId;
  params: MonochromeParams;
  animation: AnimationEngineConfig;
  interaction: InteractionEngineConfig;
  color: ColorMaterialConfig;
  light: LightShapeConfig;
  dither: DitherConfig;
  material: MaterialEngineConfig;
  content: ComponentContent;
  sourceUrl: string | null;
  sourceLightMix: number;
  basePresetId: string;
};

/** Persistable snapshot — drops blob: uploads (cannot survive reload). */
export function captureSnapshot(input: CaptureInput): ProjectSnapshot {
  const sourceUrl =
    input.sourceUrl && !input.sourceUrl.startsWith("blob:")
      ? input.sourceUrl
      : null;

  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    componentId: input.componentId,
    params: { ...input.params },
    animation: structuredClone(input.animation),
    interaction: structuredClone(input.interaction),
    color: structuredClone(input.color),
    light: structuredClone(input.light),
    dither: structuredClone(input.dither),
    material: structuredClone(input.material),
    content: structuredClone(input.content),
    sourceUrl,
    sourceLightMix: input.sourceLightMix,
    basePresetId: input.basePresetId,
  };
}

export function cloneSnapshot(snapshot: ProjectSnapshot): ProjectSnapshot {
  return structuredClone(snapshot);
}

export type SnapshotApplier = {
  setParams: (v: MonochromeParams) => void;
  setAnimation: (v: AnimationEngineConfig) => void;
  setInteraction: (v: InteractionEngineConfig) => void;
  setColor: (v: ColorMaterialConfig) => void;
  setLight: (v: LightShapeConfig) => void;
  setDither: (v: DitherConfig) => void;
  setMaterial: (v: MaterialEngineConfig) => void;
  setContent: (v: ComponentContent) => void;
  setSource: (v: { url: string | null; lightMix: number }) => void;
  setPresetId: (v: string) => void;
};

export function applySnapshot(
  snapshot: ProjectSnapshot,
  applier: SnapshotApplier,
): void {
  const componentId =
    (snapshot.componentId as string) === "hero-background"
      ? ("section-background" as const)
      : snapshot.componentId;
  // componentId lives on the snapshot for routing — playground already opened the route
  void componentId;
  applier.setParams({ ...snapshot.params });
  applier.setAnimation(structuredClone(snapshot.animation));
  applier.setInteraction(structuredClone(snapshot.interaction));
  applier.setColor(structuredClone(snapshot.color));
  applier.setLight(structuredClone(snapshot.light));
  applier.setDither(structuredClone(snapshot.dither));
  applier.setMaterial(structuredClone(snapshot.material));
  applier.setContent({
    ...DEFAULT_COMPONENT_CONTENT,
    ...structuredClone(snapshot.content),
    navItems: [
      ...(snapshot.content.navItems ?? DEFAULT_COMPONENT_CONTENT.navItems),
    ],
  });
  applier.setSource({
    url: snapshot.sourceUrl,
    lightMix: snapshot.sourceLightMix,
  });
  applier.setPresetId(snapshot.basePresetId);
}
