import type { CSSProperties, ComponentType } from "react";
import type { ComponentContent } from "./content/types";
import type { AnimationEngineConfig } from "./engine/animation/types";
import type { ColorMaterialConfig } from "./engine/color/types";
import type { InteractionEngineConfig } from "./engine/interaction/types";
import type { LightShapeConfig } from "./engine/lighting/types";
import type { DitherConfig } from "./engine/dither/types";
import type { MaterialEngineConfig } from "./engine/material/types";
import type { EngineMaterialId } from "./engine/material/types";

/** Bayer matrix size options for ordered dithering. */
export type DitherSize = 2 | 4 | 8 | 32 | 64;

/** Tunable monochrome / dither material parameters (targets → damped current). */
export type MonochromeParams = {
  ditherSize: DitherSize;
  posterization: number;
  noiseScale: number;
  noiseSpeed: number;
  contrast: number;
  brightness: number;
  gradientAngle: number;
  gradientColorA: number;
  gradientColorB: number;
  bloom: number;
  bloomRadius: number;
  grainAmount: number;
  pixelDensity: number;
  shadowStrength: number;
  highlightStrength: number;
  softEdge: number;
  randomSeed: number;
  animationSpeed: number;
  cursorInfluence: number;
  scrollInfluence: number;
  depth: number;
  lightX: number;
  lightY: number;
  opacity: number;
  blueNoiseAmount: number;
};

export type MonochromeUniformState = MonochromeParams & {
  time: number;
  pointerX: number;
  pointerY: number;
  scrollY: number;
  resolutionX: number;
  resolutionY: number;
  dpr: number;
};

export type SurfaceRendererKind = "webgl2" | "canvas2d";

/** Procedural materials (Sprint 6) — structure, not palette aliases. */
export type MaterialId = EngineMaterialId;

export type MaterialCatalogEntry = {
  id: MaterialId;
  label: string;
  status: "ready" | "stub";
  description: string;
  defaults?: Partial<MonochromeParams>;
};

export type SurfaceCanvasProps = {
  params?: Partial<MonochromeParams>;
  /** Procedural animation engine config (modes, blend, timeline). */
  animation?: Partial<AnimationEngineConfig>;
  /** Procedural interaction & lighting engine config. */
  interaction?: Partial<InteractionEngineConfig>;
  /** Procedural color / gradient config (palette — not material structure). */
  color?: Partial<ColorMaterialConfig>;
  /** Procedural light-shape luminance config. */
  light?: Partial<LightShapeConfig>;
  /** Dither algorithm config (matrix size, pattern scale, algo-specific). */
  dither?: Partial<DitherConfig>;
  /** Procedural material structure / recipe config. */
  material?: Partial<MaterialEngineConfig>;
  /**
   * Object URL or http(s) URL of an image to dither.
   * When set, luminance is driven by the photo (cover-fit) then dithered.
   */
  sourceUrl?: string | null;
  /** 0 = image luminance only; 1 = image × light field. Default 0.45. */
  sourceLightMix?: number;
  className?: string;
  style?: CSSProperties;
  reducedMotion?: boolean;
  /** Optional external DOM-normalized pointer (y=0 top). Prefer SurfaceCanvas-owned tracking. */
  pointer?: { x: number; y: number; down?: boolean } | null;
  scrollProgress?: number;
  "aria-label"?: string;
};

export type SurfaceCardProps = {
  title?: string;
  subtitle?: string;
  description?: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  params?: Partial<MonochromeParams>;
  animation?: Partial<AnimationEngineConfig>;
  interaction?: Partial<InteractionEngineConfig>;
  color?: Partial<ColorMaterialConfig>;
  light?: Partial<LightShapeConfig>;
  dither?: Partial<DitherConfig>;
  material?: Partial<MaterialEngineConfig>;
  sourceUrl?: string | null;
  sourceLightMix?: number;
  reducedMotion?: boolean;
  className?: string;
};

export type ComponentId =
  | "card"
  | "navigation"
  | "button"
  | "scrollbar"
  | "hero-background"
  | "badge"
  | "avatar"
  | "input"
  | "section-background"
  | "image-frame"
  | "progress-bar"
  | "loader";

export type ComponentDefinition = {
  id: ComponentId;
  label: string;
  category: "surfaces" | "chrome" | "feedback" | "media";
  description: string;
  purpose: string;
  bestUses: string[];
  performanceNotes: string;
  a11yNotes: string;
  mobileNotes: string;
  status: "ready" | "preview";
  defaultPresetId: string;
};

export type PresetDefinition = {
  id: string;
  label: string;
  description: string;
  materialId: MaterialId;
  componentIds: ComponentId[] | "*";
  params: Partial<MonochromeParams>;
  /** Optional light-shape luminance defaults for this material preset. */
  light?: Partial<LightShapeConfig>;
  /** Optional dither algorithm defaults. */
  dither?: Partial<DitherConfig>;
  /** Optional procedural material structure / recipe. */
  material?: {
    materialId?: MaterialId;
    params?: Partial<import("./engine/material/types").MaterialSpecificParams>;
    layers?: import("./engine/material/types").MaterialLayer[];
    lowQuality?: boolean;
  };
  /** Optional palette / color config (nested color slots are also partial). */
  color?: Omit<Partial<ColorMaterialConfig>, "colors" | "properties"> & {
    colors?: Partial<ColorMaterialConfig["colors"]>;
    properties?: Partial<ColorMaterialConfig["properties"]>;
  };
  /** Optional animation defaults. */
  animation?: Partial<AnimationEngineConfig>;
  /** Optional interaction defaults. */
  interaction?: Partial<InteractionEngineConfig>;
};

export type AppView =
  | "overview"
  | "components"
  | "materials"
  | "presets"
  | "projects"
  | "playground"
  | "docs";

export type AppRoute =
  | { view: "overview" }
  | { view: "components" }
  | { view: "component"; id: ComponentId }
  | { view: "materials" }
  | { view: "animations" }
  | { view: "presets" }
  | { view: "projects" }
  | { view: "playground" }
  | { view: "docs"; topic?: string };

export type WorkspaceMode = "beginner" | "advanced" | "presentation" | "debug";

export type ControlGroupId =
  | "material"
  | "animation"
  | "lighting"
  | "colors"
  | "dither"
  | "finish"
  | "interaction"
  | "noise"
  | "rendering"
  | "content"
  | "export"
  | "presets";

export type ControlGroupState = Record<ControlGroupId, boolean>;

export type ControlDensityMode = "basic" | "advanced";

export type DitherAdapterProps = {
  params: MonochromeParams;
  animation?: Partial<AnimationEngineConfig>;
  interaction?: Partial<InteractionEngineConfig>;
  color?: Partial<ColorMaterialConfig>;
  light?: Partial<LightShapeConfig>;
  dither?: Partial<DitherConfig>;
  material?: Partial<MaterialEngineConfig>;
  content?: Partial<ComponentContent>;
  /** Image URL to dither through the shared surface engine. */
  sourceUrl?: string | null;
  sourceLightMix?: number;
  /** Optional upload handler — image-frame / avatar can replace the source in-place. */
  onSourceChange?: (next: {
    url: string | null;
    lightMix?: number;
  }) => void;
  reducedMotion?: boolean;
  className?: string;
};

export type AdapterComponent = ComponentType<DitherAdapterProps>;

/** Grouped configuration surface for the shared engine API. */
export type DitherEngineConfig = {
  material: Pick<
    MonochromeParams,
    "posterization" | "opacity" | "randomSeed"
  >;
  animation: Pick<MonochromeParams, "animationSpeed" | "noiseSpeed">;
  lighting: Pick<
    MonochromeParams,
    | "lightX"
    | "lightY"
    | "bloom"
    | "bloomRadius"
    | "shadowStrength"
    | "highlightStrength"
  >;
  colors: Pick<
    MonochromeParams,
    | "gradientAngle"
    | "gradientColorA"
    | "gradientColorB"
    | "brightness"
    | "contrast"
  >;
  interaction: Pick<MonochromeParams, "scrollInfluence">;
  finish: Pick<
    MonochromeParams,
    "grainAmount" | "blueNoiseAmount" | "softEdge" | "noiseScale"
  >;
  dither: Pick<MonochromeParams, "ditherSize" | "pixelDensity"> & {
    algorithm?: string;
    patternScale?: number;
  };
};
