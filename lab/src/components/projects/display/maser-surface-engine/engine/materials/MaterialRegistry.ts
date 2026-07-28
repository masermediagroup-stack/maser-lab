import type { MaterialDefinition, MaterialId } from "../../types";
import { MonochromeMaterial } from "./MonochromeMaterial";

const STUB_IDS: MaterialId[] = [
  "liquid",
  "bubble",
  "paper",
  "foam",
  "mesh",
  "marble",
  "crt",
  "film",
  "chrome",
  "glass",
  "ink",
  "fabric",
  "heatmap",
  "topo",
  "animated-gradient",
  "sdf",
];

function stub(id: MaterialId, label: string): MaterialDefinition {
  return { id, label, status: "stub" };
}

const STUBS: MaterialDefinition[] = [
  stub("liquid", "Liquid"),
  stub("bubble", "Bubble"),
  stub("paper", "Paper"),
  stub("foam", "Foam"),
  stub("mesh", "Mesh"),
  stub("marble", "Marble"),
  stub("crt", "CRT"),
  stub("film", "Film Grain"),
  stub("chrome", "Chrome"),
  stub("glass", "Glass"),
  stub("ink", "Ink"),
  stub("fabric", "Fabric"),
  stub("heatmap", "Heat Map"),
  stub("topo", "Topographic"),
  stub("animated-gradient", "Animated Gradient"),
  stub("sdf", "Signed Distance Field"),
];

const byId = new Map<MaterialId, MaterialDefinition>([
  [
    "monochrome",
    {
      id: MonochromeMaterial.id,
      label: MonochromeMaterial.label,
      status: MonochromeMaterial.status,
      defaults: MonochromeMaterial.defaults,
    },
  ],
  ...STUBS.map((s) => [s.id, s] as const),
]);

export const MaterialRegistry = {
  list(): MaterialDefinition[] {
    return Array.from(byId.values());
  },
  get(id: MaterialId): MaterialDefinition | undefined {
    return byId.get(id);
  },
  readyIds(): MaterialId[] {
    return this.list()
      .filter((m) => m.status === "ready")
      .map((m) => m.id);
  },
  /** Future materials reserved in architecture. */
  stubIds: STUB_IDS,
};
