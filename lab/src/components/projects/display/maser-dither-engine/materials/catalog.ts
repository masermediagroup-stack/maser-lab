import { MONOCHROME_DEFAULTS } from "../constants";
import type { MaterialDefinition, MaterialId, MonochromeParams } from "../types";
import { createMonochromeMaterial } from "../engine/materials/MonochromeMaterial";

const MATERIALS: MaterialDefinition[] = [
  {
    id: "monochrome",
    label: "Monochrome",
    status: "ready",
    description:
      "Ordered Bayer + optional blue-noise print density. Reference material for the Dither Engine.",
    defaults: MONOCHROME_DEFAULTS,
  },
  {
    id: "gradient",
    label: "Gradient",
    status: "stub",
    description: "Soft luminance ramps with dithered transitions — coming soon.",
  },
  {
    id: "noise",
    label: "Noise",
    status: "stub",
    description: "Stochastic field materials for atmospheric fills — coming soon.",
  },
  {
    id: "chrome",
    label: "Chrome",
    status: "stub",
    description: "Specular monochrome metal response — coming soon.",
  },
  {
    id: "paper",
    label: "Paper",
    status: "stub",
    description: "Fiber-aware print textures — coming soon.",
  },
  {
    id: "velvet",
    label: "Velvet",
    status: "stub",
    description: "Soft anisotropic sheen — coming soon.",
  },
  {
    id: "aurora",
    label: "Aurora",
    status: "stub",
    description: "Slow luminous bands — coming soon.",
  },
  {
    id: "water",
    label: "Water",
    status: "stub",
    description: "Rippled reflective mono — coming soon.",
  },
  {
    id: "smoke",
    label: "Smoke",
    status: "stub",
    description: "Diffusive volumetric fields — coming soon.",
  },
];

const byId = new Map(MATERIALS.map((m) => [m.id, m]));

export const MaterialCatalog = {
  list(): MaterialDefinition[] {
    return MATERIALS.slice();
  },
  get(id: MaterialId): MaterialDefinition | undefined {
    return byId.get(id);
  },
  ready(): MaterialDefinition[] {
    return MATERIALS.filter((m) => m.status === "ready");
  },
  stubs(): MaterialDefinition[] {
    return MATERIALS.filter((m) => m.status === "stub");
  },
  createParams(
    id: MaterialId,
    overrides?: Partial<MonochromeParams>,
  ): MonochromeParams {
    const def = byId.get(id);
    if (!def || def.status !== "ready") {
      return createMonochromeMaterial(overrides);
    }
    return createMonochromeMaterial({ ...def.defaults, ...overrides });
  },
};

/** @deprecated Prefer MaterialCatalog — kept for transfer API stability. */
export const MaterialRegistry = {
  list: () => MaterialCatalog.list(),
  get: (id: MaterialId) => MaterialCatalog.get(id),
  readyIds: () => MaterialCatalog.ready().map((m) => m.id),
  stubIds: MaterialCatalog.stubs().map((m) => m.id),
};
