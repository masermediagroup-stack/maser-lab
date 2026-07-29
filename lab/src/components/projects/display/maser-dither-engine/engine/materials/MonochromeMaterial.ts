import { MONOCHROME_DEFAULTS } from "../../constants";
import type { MonochromeParams } from "../../types";

export function createMonochromeMaterial(
  overrides?: Partial<MonochromeParams>,
): MonochromeParams {
  return { ...MONOCHROME_DEFAULTS, ...overrides };
}

export const MonochromeMaterial = {
  id: "monochrome" as const,
  label: "Monochrome",
  status: "ready" as const,
  defaults: MONOCHROME_DEFAULTS,
  create: createMonochromeMaterial,
};
