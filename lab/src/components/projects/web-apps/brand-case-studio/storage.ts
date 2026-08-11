import { STORAGE_KEY, STORAGE_VERSION } from "./constants";
import type { CaseStore, CaseStudy } from "./types";

type PersistedPayload = {
  version: number;
  cases: CaseStudy[];
};

export function loadCaseStore(): CaseStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PersistedPayload;
    if (parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.cases)) return {};
    return Object.fromEntries(parsed.cases.map((c) => [c.id, c]));
  } catch {
    return {};
  }
}

export function saveCaseStore(store: CaseStore): void {
  if (typeof window === "undefined") return;
  const payload: PersistedPayload = {
    version: STORAGE_VERSION,
    cases: Object.values(store),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function exportCasesJson(store: CaseStore): string {
  return JSON.stringify(
    { version: STORAGE_VERSION, cases: Object.values(store) },
    null,
    2,
  );
}

export function importCasesJson(json: string): CaseStudy[] {
  const parsed = JSON.parse(json) as PersistedPayload;
  if (!parsed || !Array.isArray(parsed.cases)) {
    throw new Error("Invalid case study file — expected { cases: [] }");
  }
  return parsed.cases;
}

export async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}
