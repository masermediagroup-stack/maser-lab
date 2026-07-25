import { DEFAULT_PRESET_ID, presetSettings } from "./transition-presets";
import type { SettingKey, TornTransitionSettings } from "./transition-types";

export const PRESET_PARAM = "preset";
export const TUNE_PARAM = "tune";
export const PAGE_PARAM = "page";

const PAIR_SEPARATOR = "~";
const KEY_SEPARATOR = ".";

/**
 * Only values that differ from the active preset are serialised. Readable keys
 * are used rather than positional codes so a hand-edited or truncated URL
 * degrades to "some settings applied" instead of "wrong settings applied".
 */
export function encodeSettings(
  presetId: string,
  settings: TornTransitionSettings,
): string {
  const base = presetSettings(presetId);
  const parts: string[] = [];

  for (const key of Object.keys(settings) as SettingKey[]) {
    const value = settings[key];
    const baseValue = base[key];
    if (value === baseValue) continue;

    if (typeof value === "number") {
      if (Math.abs(value - (baseValue as number)) < 1e-6) continue;
      parts.push(`${key}${KEY_SEPARATOR}${Number(value.toFixed(4))}`);
    } else {
      parts.push(`${key}${KEY_SEPARATOR}${String(value).replace("#", "")}`);
    }
  }

  return parts.join(PAIR_SEPARATOR);
}

const COLOR_KEYS = new Set<string>(["color1", "color2", "color3", "color4"]);

export function decodeSettings(
  presetId: string,
  tune: string | null,
): TornTransitionSettings {
  const base = { ...presetSettings(presetId) };
  if (!tune) return base;

  for (const part of tune.split(PAIR_SEPARATOR)) {
    const idx = part.indexOf(KEY_SEPARATOR);
    if (idx <= 0) continue;

    const key = part.slice(0, idx) as SettingKey;
    const raw = part.slice(idx + 1);
    if (!(key in base)) continue;

    const current = base[key];
    if (typeof current === "number") {
      const parsed = Number.parseFloat(raw);
      if (Number.isFinite(parsed)) {
        (base as Record<string, unknown>)[key] = parsed;
      }
      continue;
    }

    if (COLOR_KEYS.has(key)) {
      if (/^[0-9a-fA-F]{3,8}$/.test(raw)) {
        (base as Record<string, unknown>)[key] = `#${raw}`;
      }
      continue;
    }

    // Enum-valued keys: accept only tokens the preset vocabulary already uses.
    if (/^[a-z-]+$/.test(raw)) {
      (base as Record<string, unknown>)[key] = raw;
    }
  }

  return base;
}

export type UrlState = {
  presetId: string;
  settings: TornTransitionSettings;
  page: number;
};

export function readUrlState(search: string): UrlState {
  const params = new URLSearchParams(search);
  const presetId = params.get(PRESET_PARAM) ?? DEFAULT_PRESET_ID;
  const page = Number.parseInt(params.get(PAGE_PARAM) ?? "0", 10);

  return {
    presetId,
    settings: decodeSettings(presetId, params.get(TUNE_PARAM)),
    page: Number.isFinite(page) && page >= 0 ? page : 0,
  };
}

export function buildSearch(state: UrlState): string {
  const params = new URLSearchParams();
  params.set(PRESET_PARAM, state.presetId);
  if (state.page > 0) params.set(PAGE_PARAM, String(state.page));

  const tune = encodeSettings(state.presetId, state.settings);
  if (tune) params.set(TUNE_PARAM, tune);

  return params.toString();
}
