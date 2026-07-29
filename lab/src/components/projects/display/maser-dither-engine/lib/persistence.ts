import type { AppRoute, ComponentId, ControlGroupId, ControlGroupState } from "../types";
import { STORAGE_KEYS } from "../constants";

export const DEFAULT_PANEL_STATE: ControlGroupState = {
  material: true,
  animation: false,
  lighting: true,
  colors: false,
  interaction: false,
  noise: false,
  rendering: false,
  export: true,
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
    return raw ? (JSON.parse(raw) as ComponentId[]) : [];
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
    return raw ? (JSON.parse(raw) as ComponentId[]) : [];
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
  if (h === "presets") return { view: "presets" };
  if (h === "playground") return { view: "playground" };
  if (h === "docs" || h.startsWith("docs/")) {
    const topic = h.includes("/") ? h.split("/")[1] : undefined;
    return { view: "docs", topic };
  }
  if (h.startsWith("components/")) {
    const id = h.split("/")[1] as ComponentId;
    return { view: "component", id };
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
    case "presets":
      return "#/presets";
    case "playground":
      return "#/playground";
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
