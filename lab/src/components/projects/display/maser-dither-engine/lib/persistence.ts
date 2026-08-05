import type { AppRoute, ComponentId, ControlGroupId, ControlGroupState } from "../types";
import { STORAGE_KEYS } from "../constants";

export const DEFAULT_PANEL_STATE: ControlGroupState = {
  material: true,
  animation: false,
  lighting: true,
  colors: true,
  dither: true,
  finish: false,
  interaction: false,
  noise: false,
  rendering: false,
  content: true,
  export: false,
  presets: true,
};

export function loadPanelState(): ControlGroupState {
  if (typeof window === "undefined") return DEFAULT_PANEL_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.panels);
    if (!raw) return DEFAULT_PANEL_STATE;
    return { ...DEFAULT_PANEL_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PANEL_STATE;
  }
}

export function savePanelState(state: ControlGroupState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.panels, JSON.stringify(state));
}

export function loadFavorites(): ComponentId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.favorites);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    return ids
      .map((id) =>
        id === "hero-background" ? "section-background" : id,
      )
      .filter(Boolean) as ComponentId[];
  } catch {
    return [];
  }
}

export function saveFavorites(ids: ComponentId[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(ids));
}

export function loadRecent(): ComponentId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.recent);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    return ids
      .map((id) =>
        id === "hero-background" ? "section-background" : id,
      )
      .filter(Boolean) as ComponentId[];
  } catch {
    return [];
  }
}

export function pushRecent(id: ComponentId): ComponentId[] {
  const next = [id, ...loadRecent().filter((x) => x !== id)].slice(0, 6);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.recent, JSON.stringify(next));
  }
  return next;
}

export function parseHash(hash: string): AppRoute {
  const h = hash.replace(/^#\/?/, "").replace(/^\//, "");
  if (!h || h === "overview") return { view: "overview" };
  if (h === "components") return { view: "components" };
  if (h === "materials") return { view: "materials" };
  if (h === "animations") return { view: "animations" };
  if (h === "presets") return { view: "presets" };
  if (h === "projects" || h === "studio") return { view: "projects" };
  if (h === "playground") return { view: "playground" };
  if (h === "export") return { view: "export" };
  if (h === "present") return { view: "present" };
  if (h === "transfer-fixtures") return { view: "transfer-fixtures" };
  if (h.startsWith("scene")) {
    const q = h.includes("?") ? h.split("?")[1] : "";
    const params = new URLSearchParams(q);
    return { view: "scene", payload: params.get("c") ?? undefined };
  }
  if (h === "docs" || h.startsWith("docs/")) {
    const topic = h.includes("/") ? h.split("/")[1] : undefined;
    return { view: "docs", topic };
  }
  if (h.startsWith("components/")) {
    let id = h.split("/")[1] as ComponentId | "hero-background";
    // Sprint 7.4 — hero background folded into section background
    if (id === "hero-background") id = "section-background";
    return { view: "component", id: id as ComponentId };
  }
  return { view: "overview" };
}

export function routeToHash(route: AppRoute): string {
  switch (route.view) {
    case "overview":
      return "#/overview";
    case "components":
      return "#/components";
    case "component":
      return `#/components/${route.id}`;
    case "materials":
      return "#/materials";
    case "animations":
      return "#/animations";
    case "presets":
      return "#/presets";
    case "projects":
      return "#/projects";
    case "playground":
      return "#/playground";
    case "export":
      return "#/export";
    case "present":
      return "#/present";
    case "scene":
      return route.payload
        ? `#/scene?c=${route.payload}`
        : "#/scene";
    case "transfer-fixtures":
      return "#/transfer-fixtures";
    case "docs":
      return route.topic ? `#/docs/${route.topic}` : "#/docs";
    default:
      return "#/overview";
  }
}

export function toggleFavorite(
  id: ComponentId,
  current: ComponentId[],
): ComponentId[] {
  return current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
}

export type { ControlGroupId };
