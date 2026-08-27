/**
 * Leva stores folder inputs as `Folder.inputKey`.
 * `get("surfaceEnabled")` returns undefined inside "Surface Effect"
 * and would hide every conditional control.
 *
 * `levaStore.set({ mbSpeed })` also misses nested keys, so Reset / seed
 * writes both the short key and `Surface Effect.mbSpeed`.
 */
export const TYPE_WORLD_SURFACE_FOLDER = "Surface Effect";

const LEVA_FOLDER_BY_KEY: Record<string, string> = {
  theme: "Appearance",
  fillViewport: "Appearance",
  scale: "Appearance",
  quote: "Typography",
  forceFallback: "Typography",
  dragSensitivity: "Interaction",
  inertia: "Interaction",
  pitchLimit: "Interaction",
  autoRotate: "Auto Motion",
  autoRotateDirection: "Auto Motion",
  autoRotateSpeed: "Auto Motion",
  autoResumeDelay: "Auto Motion",
  gradientColor1: "Gradient",
  gradientColor2: "Gradient",
  gradientColor3: "Gradient",
  gradientSpeed: "Gradient",
  gradientAngle: "Gradient",
  gradientSpread: "Gradient",
  gradientReverse: "Gradient",
};

function levaFolderFor(key: string): string | undefined {
  if (LEVA_FOLDER_BY_KEY[key]) return LEVA_FOLDER_BY_KEY[key];
  if (
    key.startsWith("surface") ||
    key.startsWith("orb") ||
    key.startsWith("mb") ||
    key.startsWith("wave") ||
    key.startsWith("voronoi") ||
    key.startsWith("perlin")
  ) {
    return TYPE_WORLD_SURFACE_FOLDER;
  }
  return undefined;
}

export function withLevaFolderPaths(
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...patch };
  for (const [key, value] of Object.entries(patch)) {
    const folder = levaFolderFor(key);
    if (folder) next[`${folder}.${key}`] = value;
  }
  return next;
}

export function levaControlValue(
  get: (key: string) => unknown,
  key: string,
): unknown {
  const nested = get(`${TYPE_WORLD_SURFACE_FOLDER}.${key}`);
  if (nested !== undefined) return nested;
  return get(key);
}
