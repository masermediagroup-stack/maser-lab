/**
 * Sprint 7 — project / preset studio types.
 * Serializes the full playground surface without forking the renderer.
 */

import type { ComponentContent } from "../content/types";
import type { AnimationEngineConfig } from "../engine/animation/types";
import type { ColorMaterialConfig } from "../engine/color/types";
import type { DitherConfig } from "../engine/dither/types";
import type { InteractionEngineConfig } from "../engine/interaction/types";
import type { LightShapeConfig } from "../engine/lighting/types";
import type { MaterialEngineConfig } from "../engine/material/types";
import type {
  ComponentId,
  ControlDensityMode,
  ControlGroupState,
  MaterialId,
  MonochromeParams,
} from "../types";

export const PROJECT_SCHEMA_VERSION = 1 as const;

export type ProjectOrigin = "system" | "user";

export type ColorLabel =
  | "none"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "gray";

export type WorkspaceMode = "beginner" | "advanced" | "presentation" | "debug";

export type ProjectBrowserView = "grid" | "list";

export type ProjectSortKey =
  | "recent"
  | "created"
  | "name"
  | "favorites"
  | "material";

/** Full recreatable material state. */
export type ProjectSnapshot = {
  schemaVersion: typeof PROJECT_SCHEMA_VERSION;
  componentId: ComponentId;
  params: MonochromeParams;
  animation: AnimationEngineConfig;
  interaction: InteractionEngineConfig;
  color: ColorMaterialConfig;
  light: LightShapeConfig;
  dither: DitherConfig;
  material: MaterialEngineConfig;
  content: ComponentContent;
  /** Non-blob source URLs only; blob: uploads are omitted from persistence. */
  sourceUrl: string | null;
  sourceLightMix: number;
  /** System preset id or "custom" / user project id when derived. */
  basePresetId: string;
};

export type ProjectRecord = {
  id: string;
  origin: ProjectOrigin;
  name: string;
  description: string;
  notes: string;
  tags: string[];
  colorLabel: ColorLabel;
  favorite: boolean;
  materialId: MaterialId;
  thumbnailDataUrl: string | null;
  createdAt: number;
  updatedAt: number;
  snapshot: ProjectSnapshot;
  /** System presets are immutable — store never writes over them. */
  readOnly: boolean;
};

export type ProjectLibraryState = {
  version: 1;
  projects: ProjectRecord[];
  dockOrder: MaterialId[];
  /** Favorites for both system + user project ids (`system:…` / `user-…`). */
  favoriteProjectIds: string[];
  favoriteControlIds: string[];
  workspaceMode: WorkspaceMode;
  browserView: ProjectBrowserView;
  lastOpenedProjectId: string | null;
  autosaveEnabled: boolean;
};

export type ProjectBrowserFilters = {
  query: string;
  origin: "all" | ProjectOrigin;
  favoritesOnly: boolean;
  materialId: MaterialId | "all";
  sort: ProjectSortKey;
};

export type PlaygroundChromeState = {
  panels: ControlGroupState;
  densityMode: ControlDensityMode;
  workspaceMode: WorkspaceMode;
};
