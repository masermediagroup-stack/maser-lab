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
    id: "interaction",
    title: "Procedural Interaction & Lighting",
    body: `Sprint 2 adds engine/interaction/. Pointer pipeline: DOM-normalized (y=0 top) → UV (y=0 bottom) inside InteractionController.setTargetDom — fixes the prior upward/right drift. PointerPhysics implements unique math per mode (Follow, Spring, Magnetic, Sticky, Gravity, Repel, Orbit Pointer, Elastic, Pressure, Ripple, None). Multi-light engine packs 1–8 ProceduralLight slots (ambient/pointer/primary/secondary/accent/edge/animated) with radius, intensity, color, blend, phase, softness, opacity, noise, and movement. Hold/release behaviors, trails, ripples, falloff curves, and optional debug overlay are GPU-uniform driven — no React setState on rAF. Sprint 3 increases light travel (soft-bound UV, larger orbit offsets). Pass interaction?: Partial<InteractionEngineConfig> into SurfaceCanvas. Reduced motion disables interaction animations and exits the pointer.`,
  },
  {
    id: "color-material",
    title: "Color & Material System",
    body: `Sprint 3 adds engine/color/. ColorMaterialController packs palette colors, gradient mode/behavior, blend mode, and exposure/gamma/density into GPU uniforms each frame. COLOR_GLSL composes RGB from ink + dither + bloom without rewriting the renderer. Palette Studio includes Monochrome, Blueprint, Aurora, Ocean, Paper, Chrome, Sunset, Heat Map, Terminal, Matrix, Pearl, Acid, Infrared, Smoke, Forest, Cyberpunk, Electric Blue, Graphite, Velvet. Sprint 6 moved procedural material structure out of color “behaviors” into engine/material/ — Color owns chroma; Material owns structure. Pass color?: Partial<ColorMaterialConfig> into SurfaceCanvas. Toggle colorEnabled for grayscale.`,
  },
  {
    id: "procedural-materials",
    title: "Procedural Materials (Sprint 6)",
    body: `engine/material/ defines Paper, Ink, Velvet, Metal, Smoke, Fog, Cloud, Glass, Chrome, and CRT as true procedural materials with distinct UV, structure, finish, and interaction response under identical shared lighting/palette/dither. MaterialController packs uMat* uniforms; layer recipe (enable/bypass/solo) gates structure without shader recompile. Materials page: live thumbnails, family filters, search, favorites, detail, side/swipe/A-B compare. Playground Material panel shows only supportedControls for the active material. Performance tiers + mobile lowQuality. CRT flicker capped; reduced motion zeros flicker. See docs/sprint6-materials.md.`,
  },
  {
    id: "content-editing",
    title: "Live Component Editing",
    body: `Every adapter accepts content?: Partial<ComponentContent>. The playground Content editor updates labels, titles, descriptions, nav items, placeholders, progress, scrollbar thickness/radius instantly while the material keeps animating. Content is React overlay state — it never remounts the WebGL surface.`,
  },
  {
    id: "engine-api",
    title: "Engine API",
    body: `Use createEngineParams / splitConfig / mergeConfig from engine/api.ts to group Material, Animation, Lighting, Colors, Interaction, Noise, and Dither. UniformStore + AnimationLoop damp material targets on rAF without React setState thrash. Pointer position is owned by InteractionController (not damp keys). ColorMaterialController owns palette/gradient uniforms. Timeline transport: play/pause/restart/reverse/loop/ping-pong/playbackSpeed/timeScale. Dither sizes: 2×2, 4×4, 8×8, 32×32, 64×64.`,
  },
  {
    id: "accessibility",
    title: "Accessibility",
    body: `Honor prefers-reduced-motion (demo toggle + OS). Surfaces expose aria-labels; interactive adapters use native controls. Reduced motion pauses the animation timeline, disables interaction physics/lights motion, and freezes gradient behaviors. Material never replaces text contrast requirements.`,
  },
  {
    id: "performance",
    title: "Performance",
    body: `DPR clamped to 2. Prefer pausing offscreen surfaces. Discrete dither size + seed snap avoid texture rebuild thrash. Animation + interaction + color uniforms update each frame without React re-renders. Object reuse in InteractionController (ripples, trail, light pack). Canvas2D fallback approximates color + motion when WebGL2 is unavailable. Target 120 FPS desktop / 60 FPS mobile.`,
  },
  {
    id: "future-engines",
    title: "Future Engines",
    body: `Follow this package shape: engine/ (immutable renderer), materials/, components/adapters/, presets/, shell/, docs/. New engines should mirror catalogs + playground routing. Animation, interaction, color, dither, and material modes extend by appending to their catalogs + GLSL branches — no giant UI switches. Sprint 7 candidates: ceramic/newsprint IDs, deeper glass variants, Canvas2D material fields, persisted material recipes, visual regression.`,
  },
] as const;
