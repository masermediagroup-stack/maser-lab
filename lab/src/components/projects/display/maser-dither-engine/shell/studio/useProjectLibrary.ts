"use client";

import { useCallback, useMemo, useState } from "react";
import {
  deleteUserProject,
  duplicateUserProject,
  exportProjectJson,
  getProject,
  importProjectJson,
  listAllProjects,
  loadLibrary,
  renameUserProject,
  setBrowserView,
  setDockOrder,
  setProjectFavorite,
  setWorkspaceMode,
  updateWorkspacePrefs,
  upsertUserProject,
  type ProjectLibraryState,
  type ProjectRecord,
  type WorkspaceMode,
} from "../../projects";
import type { MaterialId } from "../../types";

export function useProjectLibrary() {
  const [library, setLibrary] = useState<ProjectLibraryState>(() => loadLibrary());

  const projects = useMemo(() => listAllProjects(library), [library]);

  const commit = useCallback((next: ProjectLibraryState) => {
    setLibrary(next);
  }, []);

  const saveProject = useCallback(
    (project: ProjectRecord) => commit(upsertUserProject(library, project)),
    [commit, library],
  );

  const removeProject = useCallback(
    (id: string) => commit(deleteUserProject(library, id)),
    [commit, library],
  );

  const rename = useCallback(
    (id: string, name: string) => commit(renameUserProject(library, id, name)),
    [commit, library],
  );

  const duplicate = useCallback(
    (id: string) => commit(duplicateUserProject(library, id)),
    [commit, library],
  );

  const favorite = useCallback(
    (id: string, next: boolean) =>
      commit(setProjectFavorite(library, id, next)),
    [commit, library],
  );

  const importRaw = useCallback(
    (raw: string) => commit(importProjectJson(library, raw)),
    [commit, library],
  );

  const exportOne = useCallback(
    (project: ProjectRecord) => exportProjectJson(project),
    [],
  );

  const setMode = useCallback(
    (mode: WorkspaceMode) => commit(setWorkspaceMode(library, mode)),
    [commit, library],
  );

  const setView = useCallback(
    (view: "grid" | "list") => commit(setBrowserView(library, view)),
    [commit, library],
  );

  const setDock = useCallback(
    (order: MaterialId[]) => commit(setDockOrder(library, order)),
    [commit, library],
  );

  const setAutosave = useCallback(
    (autosaveEnabled: boolean) =>
      commit(updateWorkspacePrefs(library, { autosaveEnabled })),
    [commit, library],
  );

  const setLastOpened = useCallback(
    (lastOpenedProjectId: string | null) =>
      commit(updateWorkspacePrefs(library, { lastOpenedProjectId })),
    [commit, library],
  );

  const find = useCallback(
    (id: string) => getProject(library, id),
    [library],
  );

  return {
    library,
    projects,
    setLibrary: commit,
    saveProject,
    removeProject,
    rename,
    duplicate,
    favorite,
    importRaw,
    exportOne,
    setMode,
    setView,
    setDock,
    setAutosave,
    setLastOpened,
    find,
  };
}
