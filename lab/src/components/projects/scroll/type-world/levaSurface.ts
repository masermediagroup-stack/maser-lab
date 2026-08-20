/**
 * Leva stores folder inputs as `Folder.inputKey`.
 * `get("surfaceEnabled")` returns undefined inside "Surface Effect"
 * and would hide every conditional control.
 */
export const TYPE_WORLD_SURFACE_FOLDER = "Surface Effect";

export function levaControlValue(
  get: (key: string) => unknown,
  key: string,
): unknown {
  const nested = get(`${TYPE_WORLD_SURFACE_FOLDER}.${key}`);
  if (nested !== undefined) return nested;
  return get(key);
}
