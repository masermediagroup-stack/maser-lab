"use client";

/**
 * Sprint 8 — Export route host: builds runtime from last opened / default project.
 */

import { useMemo } from "react";
import { MONOCHROME_DEFAULTS } from "../constants";
import { DEFAULT_COMPONENT_CONTENT } from "../content/types";
import { DEFAULT_ANIMATION_CONFIG } from "../engine/animation";
import { DEFAULT_COLOR_MATERIAL } from "../engine/color";
import { DEFAULT_DITHER_CONFIG } from "../engine/dither";
import { DEFAULT_INTERACTION_CONFIG } from "../engine/interaction";
import { DEFAULT_LIGHT_SHAPE } from "../engine/lighting";
import { DEFAULT_MATERIAL_CONFIG } from "../engine/material";
import {
  buildRuntimeConfig,
  projectMetaFromRecord,
  runtimeFromSnapshot,
} from "../export";
import type { ProjectLibraryState, ProjectRecord } from "../projects/types";
import { getProject, listAllProjects } from "../projects/store";
import { ExportWorkspace } from "./ExportWorkspace";
import type { AppRoute } from "../types";

export function ExportPage({
  library,
  onNavigate,
  onOpenPresentation,
}: {
  library: ProjectLibraryState;
  reducedMotion?: boolean;
  onNavigate: (route: AppRoute) => void;
  onOpenPresentation: (project?: ProjectRecord | null) => void;
}) {
  const { runtime, projectMeta } = useMemo(() => {
    const id = library.lastOpenedProjectId;
    const project = id ? getProject(library, id) : listAllProjects(library)[0];
    if (project) {
      return {
        runtime: runtimeFromSnapshot(project.snapshot),
        projectMeta: projectMetaFromRecord(project),
      };
    }
    return {
      runtime: buildRuntimeConfig({
        componentId: "card",
        params: { ...MONOCHROME_DEFAULTS },
        animation: { ...DEFAULT_ANIMATION_CONFIG },
        interaction: { ...DEFAULT_INTERACTION_CONFIG },
        color: { ...DEFAULT_COLOR_MATERIAL },
        light: { ...DEFAULT_LIGHT_SHAPE },
        dither: { ...DEFAULT_DITHER_CONFIG },
        material: { ...DEFAULT_MATERIAL_CONFIG },
        content: { ...DEFAULT_COMPONENT_CONTENT },
        sourceUrl: null,
        sourceLightMix: 0.45,
        basePresetId: "custom",
      }),
      projectMeta: undefined,
    };
  }, [library]);

  return (
    <div className="mde-page mde-export-page">
      <ExportWorkspace
        runtime={runtime}
        projectMeta={projectMeta}
        onOpenPresentation={() => onOpenPresentation(null)}
        onClose={() => onNavigate({ view: "projects" })}
      />
    </div>
  );
}
