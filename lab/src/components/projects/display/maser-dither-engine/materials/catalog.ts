/**
 * Material catalog facade — Sprint 6 procedural materials.
 * Bridges legacy MaterialCatalog API to engine/material.
 */

import { MONOCHROME_DEFAULTS } from "../constants";
import type { MaterialCatalogEntry, MaterialId, MonochromeParams } from "../types";
import { createMonochromeMaterial } from "../engine/materials/MonochromeMaterial";
import {
  PROCEDURAL_MATERIALS,
  getMaterialDefinition,
  listReadyMaterials,
} from "../engine/material/catalog";
import type { EngineMaterialId } from "../engine/material/types";

function toEntry(
  id: EngineMaterialId,
): MaterialCatalogEntry {
  const def = getMaterialDefinition(id)!;
  return {
    id: def.id,
    label: def.label,
    status: def.status,
    description: def.description,
    defaults: id === "monochrome" ? MONOCHROME_DEFAULTS : undefined,
  };
}

const MATERIALS: MaterialCatalogEntry[] = PROCEDURAL_MATERIALS.map((m) =>
  toEntry(m.id),
);

const byId = new Map(MATERIALS.map((m) => [m.id, m]));

export const MaterialCatalog = {
  list(): MaterialCatalogEntry[] {
    return MATERIALS.slice();
  },
  get(id: MaterialId): MaterialCatalogEntry | undefined {
    return byId.get(id);
  },
  ready(): MaterialCatalogEntry[] {
    return listReadyMaterials().map((m) => toEntry(m.id));
  },
  stubs(): MaterialCatalogEntry[] {
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
