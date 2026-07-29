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
    id: "animation",
    title: "Procedural Animation",
    body: `Sprint 1 adds a modular animation engine under engine/animation/. Each mode is catalogued with purpose, math approach, controls, and performance notes. ProceduralAnimationController owns Timeline + ModeBlender; the shared FRAG shader evaluates mode A/B and smoothsteps the blend. Layers stay separate: ambient motion, UV distortion, interaction tug, and lighting modulation. Pass animation?: Partial<AnimationEngineConfig> into SurfaceCanvas. Modes: Linear H/V, Diagonal, Radial Pulse, Ripple, Wave, Spiral, Orbit, Breathing, Bloom, Noise Drift, Flow Field, Magnetic, Aurora, Turbulence, Lava Lamp.`,
  },
  {
    id: "engine-api",
    title: "Engine API",
    body: `Use createEngineParams / splitConfig / mergeConfig from engine/api.ts to group Material, Animation, Lighting, Colors, Interaction, Noise, and Dither. UniformStore + AnimationLoop damp targets on rAF without React setState thrash. Timeline transport: play/pause/restart/reverse/loop/ping-pong/playbackSpeed/timeScale.`,
  },
  {
    id: "accessibility",
    title: "Accessibility",
    body: `Honor prefers-reduced-motion (demo toggle + OS). Surfaces expose aria-labels; interactive adapters use native controls. Reduced motion pauses the animation timeline. Material never replaces text contrast requirements.`,
  },
  {
    id: "performance",
    title: "Performance",
    body: `DPR clamped to 2. Prefer pausing offscreen surfaces. Discrete dither size + seed snap avoid texture rebuild thrash. Animation uniforms update each frame without React re-renders. Canvas2D fallback approximates motion when WebGL2 is unavailable. Target 120 FPS desktop / 60 FPS mobile.`,
  },
  {
    id: "future-engines",
    title: "Future Engines",
    body: `Follow this package shape: engine/ (immutable renderer), materials/, components/adapters/, presets/, shell/, docs/. New engines (Glass, Grain, Liquid, Noise, Pixel, Mesh Gradient, CRT, Chromatic) should mirror catalogs + playground routing. Animation modes extend by appending to ANIMATION_MODES + a GLSL branch — no giant UI switches.`,
  },
] as const;
