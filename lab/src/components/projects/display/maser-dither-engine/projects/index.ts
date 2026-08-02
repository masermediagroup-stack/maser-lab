export type { ProjectSnapshot, ProjectRecord, ProjectLibraryState, WorkspaceMode } from "./types";
export {
  PROJECT_SCHEMA_VERSION,
  type ColorLabel,
  type ProjectBrowserView,
  type ProjectSortKey,
  type ProjectBrowserFilters,
} from "./types";
export { captureSnapshot, applySnapshot, cloneSnapshot } from "./snapshot";
export type { CaptureInput, SnapshotApplier } from "./snapshot";
export {
  loadLibrary,
  saveLibrary,
  listAllProjects,
  getProject,
  createUserProjectId,
  upsertUserProject,
  deleteUserProject,
  renameUserProject,
  duplicateUserProject,
  setProjectFavorite,
  updateWorkspacePrefs,
  setDockOrder,
  setWorkspaceMode,
  setBrowserView,
  exportProjectJson,
  importProjectJson,
} from "./store";
export { SYSTEM_PROJECTS, presetToSystemProject, getSystemProjectByPresetId } from "./system-projects";
export {
  createHistory,
  pushHistory,
  undoHistory,
  redoHistory,
  canUndo,
  canRedo,
  type HistoryStack,
} from "./history";
export { CONTROL_INDEX, searchControls, type ControlSearchEntry } from "./control-index";
