/**
 * Sprint 8 — Lightweight export history (metadata only).
 */

import { ENGINE_VERSION, STORAGE_KEYS } from "../constants";
import type { ComponentId } from "../types";
import { EXPORT_SCHEMA_VERSION } from "./types";
import type { ExportHistoryEntry, ExportModeId } from "./types";

export const EXPORT_HISTORY_KEY = STORAGE_KEYS.exportHistory;
const MAX_ENTRIES = 40;

function fingerprint(runtimeJson: string): string {
  // Short stable fingerprint — not cryptographic
  let h = 0;
  for (let i = 0; i < Math.min(runtimeJson.length, 4000); i++) {
    h = (h * 31 + runtimeJson.charCodeAt(i)) | 0;
  }
  return `fp_${(h >>> 0).toString(36)}_${runtimeJson.length}`;
}

export function loadExportHistory(): ExportHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EXPORT_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ExportHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveExportHistory(entries: ExportHistoryEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    EXPORT_HISTORY_KEY,
    JSON.stringify(entries.slice(0, MAX_ENTRIES)),
  );
}

export function recordExport(input: {
  name: string;
  projectName: string | null;
  componentId: ComponentId;
  exportType: ExportModeId;
  runtimeJson: string;
  engineVersion?: string;
}): ExportHistoryEntry {
  const entry: ExportHistoryEntry = {
    id: `exp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: input.name,
    projectName: input.projectName,
    componentId: input.componentId,
    exportType: input.exportType,
    createdAt: new Date().toISOString(),
    engineVersion: input.engineVersion ?? ENGINE_VERSION,
    schemaVersion: EXPORT_SCHEMA_VERSION,
    runtimeFingerprint: fingerprint(input.runtimeJson),
  };
  const next = [entry, ...loadExportHistory()].slice(0, MAX_ENTRIES);
  saveExportHistory(next);
  return entry;
}

export function removeExportHistoryEntry(id: string): ExportHistoryEntry[] {
  const next = loadExportHistory().filter((e) => e.id !== id);
  saveExportHistory(next);
  return next;
}

export function clearExportHistory(): void {
  saveExportHistory([]);
}
