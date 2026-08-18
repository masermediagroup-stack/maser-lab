import { PRESET_STORAGE_KEY } from "./defaults";
import type { SavedRendererPreset } from "./types";

export function loadSavedPresets(): SavedRendererPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PRESET_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedPreset);
  } catch {
    return [];
  }
}

export function savePresets(presets: SavedRendererPreset[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
}

function isSavedPreset(value: unknown): value is SavedRendererPreset {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<SavedRendererPreset>;
  return (
    typeof record.name === "string" &&
    typeof record.savedAt === "number" &&
    typeof record.geometry === "object" &&
    typeof record.material === "object" &&
    typeof record.environment === "object" &&
    typeof record.camera === "object" &&
    typeof record.animation === "object"
  );
}
