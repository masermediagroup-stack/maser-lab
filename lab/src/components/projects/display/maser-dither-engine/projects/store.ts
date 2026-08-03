import { STORAGE_KEYS } from "../constants";
import type { MaterialId } from "../types";
import { SYSTEM_PROJECTS } from "./system-projects";
import type {
  ProjectLibraryState,
  ProjectRecord,
  WorkspaceMode,
  ProjectBrowserView,
} from "./types";

const LIBRARY_VERSION = 1 as const;

function emptyUserLibrary(): ProjectLibraryState {
  return {
    version: LIBRARY_VERSION,
    projects: [],
    dockOrder: [],
    favoriteProjectIds: [],
    favoriteControlIds: [],
    workspaceMode: "advanced",
    browserView: "grid",
    lastOpenedProjectId: null,
    autosaveEnabled: true,
  };
}

export function loadLibrary(): ProjectLibraryState {
  if (typeof window === "undefined") return emptyUserLibrary();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.projects);
    if (!raw) return emptyUserLibrary();
    const parsed = JSON.parse(raw) as ProjectLibraryState;
    if (parsed.version !== LIBRARY_VERSION || !Array.isArray(parsed.projects)) {
      return emptyUserLibrary();
    }
    // Never trust stored system rows — strip any that sneak in.
    return {
      ...emptyUserLibrary(),
      ...parsed,
      projects: parsed.projects.filter((p) => p.origin === "user" && !p.readOnly),
    };
  } catch {
    return emptyUserLibrary();
  }
}

export function saveLibrary(state: ProjectLibraryState): void {
  if (typeof window === "undefined") return;
  const safe: ProjectLibraryState = {
    ...state,
    version: LIBRARY_VERSION,
    projects: state.projects.filter((p) => p.origin === "user" && !p.readOnly),
  };
  localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(safe));
}

export function listAllProjects(library: ProjectLibraryState): ProjectRecord[] {
  const fav = new Set(library.favoriteProjectIds ?? []);
  return [...SYSTEM_PROJECTS, ...library.projects].map((p) => ({
    ...p,
    favorite: fav.has(p.id) || (p.origin === "user" && p.favorite),
  }));
}

export function getProject(
  library: ProjectLibraryState,
  id: string,
): ProjectRecord | undefined {
  return SYSTEM_PROJECTS.find((p) => p.id === id) ??
    library.projects.find((p) => p.id === id);
}

export function createUserProjectId(): string {
  return `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function upsertUserProject(
  library: ProjectLibraryState,
  project: ProjectRecord,
): ProjectLibraryState {
  if (project.origin !== "user" || project.readOnly) {
    throw new Error("Cannot write system presets into the user library.");
  }
  const without = library.projects.filter((p) => p.id !== project.id);
  const next: ProjectLibraryState = {
    ...library,
    projects: [project, ...without],
    lastOpenedProjectId: project.id,
  };
  saveLibrary(next);
  return next;
}

export function deleteUserProject(
  library: ProjectLibraryState,
  id: string,
): ProjectLibraryState {
  const target = library.projects.find((p) => p.id === id);
  if (!target) {
    // System preset — refuse silently for callers that pass wrong ids.
    return library;
  }
  const next: ProjectLibraryState = {
    ...library,
    projects: library.projects.filter((p) => p.id !== id),
    lastOpenedProjectId:
      library.lastOpenedProjectId === id ? null : library.lastOpenedProjectId,
  };
  saveLibrary(next);
  return next;
}

export function renameUserProject(
  library: ProjectLibraryState,
  id: string,
  name: string,
): ProjectLibraryState {
  const target = library.projects.find((p) => p.id === id);
  if (!target) return library;
  return upsertUserProject(library, {
    ...target,
    name: name.trim() || target.name,
    updatedAt: Date.now(),
  });
}

export function duplicateUserProject(
  library: ProjectLibraryState,
  id: string,
): ProjectLibraryState {
  const source = getProject(library, id);
  if (!source) return library;
  const now = Date.now();
  const copy: ProjectRecord = {
    ...structuredClone(source),
    id: createUserProjectId(),
    origin: "user",
    readOnly: false,
    name: `${source.name} Copy`,
    favorite: false,
    createdAt: now,
    updatedAt: now,
  };
  return upsertUserProject(library, copy);
}

export function setProjectFavorite(
  library: ProjectLibraryState,
  id: string,
  favorite: boolean,
): ProjectLibraryState {
  const current = new Set(library.favoriteProjectIds ?? []);
  if (favorite) current.add(id);
  else current.delete(id);
  const favoriteProjectIds = [...current];

  const target = library.projects.find((p) => p.id === id);
  if (target) {
    return upsertUserProject(
      { ...library, favoriteProjectIds },
      { ...target, favorite, updatedAt: Date.now() },
    );
  }

  // System preset favorites live only in favoriteProjectIds (immutable rows).
  return updateWorkspacePrefs(library, { favoriteProjectIds });
}

export function updateWorkspacePrefs(
  library: ProjectLibraryState,
  patch: Partial<
    Pick<
      ProjectLibraryState,
      | "workspaceMode"
      | "browserView"
      | "dockOrder"
      | "favoriteProjectIds"
      | "favoriteControlIds"
      | "autosaveEnabled"
      | "lastOpenedProjectId"
    >
  >,
): ProjectLibraryState {
  const next = { ...library, ...patch };
  saveLibrary(next);
  return next;
}

export function setDockOrder(
  library: ProjectLibraryState,
  order: MaterialId[],
): ProjectLibraryState {
  return updateWorkspacePrefs(library, { dockOrder: order });
}

export function setWorkspaceMode(
  library: ProjectLibraryState,
  workspaceMode: WorkspaceMode,
): ProjectLibraryState {
  return updateWorkspacePrefs(library, { workspaceMode });
}

export function setBrowserView(
  library: ProjectLibraryState,
  browserView: ProjectBrowserView,
): ProjectLibraryState {
  return updateWorkspacePrefs(library, { browserView });
}

export function exportProjectJson(project: ProjectRecord): string {
  return JSON.stringify(project, null, 2);
}

export function importProjectJson(
  library: ProjectLibraryState,
  raw: string,
): ProjectLibraryState {
  const parsed = JSON.parse(raw) as ProjectRecord;
  if (!parsed?.snapshot || !parsed?.name) {
    throw new Error("Invalid project file.");
  }
  const now = Date.now();
  const project: ProjectRecord = {
    ...parsed,
    id: createUserProjectId(),
    origin: "user",
    readOnly: false,
    createdAt: now,
    updatedAt: now,
    favorite: false,
  };
  return upsertUserProject(library, project);
}
