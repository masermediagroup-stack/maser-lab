import { ENGINE_NAME, ENGINE_VERSION } from "../constants";
import type { ComponentDefinition, MonochromeParams } from "../types";

export function generateExportCode(
  component: ComponentDefinition,
  params: MonochromeParams,
): string {
  const adapterName = component.label.replace(/\s+/g, "");
  return `import { SurfaceCanvas, createMonochromeMaterial } from "@/components/projects/display/maser-dither-engine";

// ${ENGINE_NAME} v${ENGINE_VERSION} — ${component.label}
const params = createMonochromeMaterial(${JSON.stringify(params, null, 2)});

export function Example() {
  return (
    <SurfaceCanvas
      params={params}
      aria-label="${component.label} dither surface"
    />
  );
}

// Adapter: ${adapterName} consumes the same shared engine — never duplicate shaders.
`;
}

export const DOCS_TOPICS = [
  {
    id: "architecture",
    title: "Architecture",
    body: `The Maser Dither Engine separates a shared WebGL2/Canvas2D renderer from UI adapters. Components never own shaders — they pass MonochromeParams into SurfaceCanvas. This module is the reference layout for future engines (Glass, Grain, Liquid, CRT, …).`,
  },
  {
    id: "engine-api",
    title: "Engine API",
    body: `Use createEngineParams / splitConfig / mergeConfig from engine/api.ts to group Material, Animation, Lighting, Colors, Interaction, Noise, and Dither. UniformStore + AnimationLoop damp targets on rAF without React setState thrash.`,
  },
  {
    id: "accessibility",
    title: "Accessibility",
    body: `Honor prefers-reduced-motion (demo toggle + OS). Surfaces expose aria-labels; interactive adapters use native controls. Material never replaces text contrast requirements.`,
  },
  {
    id: "performance",
    title: "Performance",
    body: `DPR clamped to 2. Prefer pausing offscreen surfaces. Discrete dither size + seed snap avoid texture rebuild thrash. Canvas2D fallback exists when WebGL2 is unavailable.`,
  },
  {
    id: "future-engines",
    title: "Future Engines",
    body: `Follow this package shape: engine/ (immutable renderer), materials/, components/adapters/, presets/, shell/, docs/. New engines (Glass, Grain, Liquid, Noise, Pixel, Mesh Gradient, CRT, Chromatic) should mirror catalogs + playground routing.`,
  },
] as const;
