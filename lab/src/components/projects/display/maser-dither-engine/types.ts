import type { CSSProperties, ComponentType } from "react";
import type { ComponentContent } from "./content/types";
import type { AnimationEngineConfig } from "./engine/animation/types";
import type { ColorMaterialConfig } from "./engine/color/types";
import type { InteractionEngineConfig } from "./engine/interaction/types";
import type { LightShapeConfig } from "./engine/lighting/types";

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

/** Materials available or reserved in the Dither Engine catalog. */
export type MaterialId =
  | "monochrome"
  | "gradient"
  | "noise"
  | "chrome"
  | "paper"
  | "velvet"
  | "aurora"
  | "water"
  | "smoke";

export type MaterialDefinition = {
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
  /** Procedural color / gradient / material behavior config. */
  color?: Partial<ColorMaterialConfig>;
  /** Procedural light-shape luminance config. */
  light?: Partial<LightShapeConfig>;
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
};

export type AppView =
  | "overview"
  | "components"
  | "materials"
  | "presets"
  | "playground"
  | "docs";

export type AppRoute =
  | { view: "overview" }
  | { view: "components" }
  | { view: "component"; id: ComponentId }
  | { view: "materials" }
  | { view: "presets" }
  | { view: "playground" }
  | { view: "docs"; topic?: string };

export type ControlGroupId =
  | "material"
  | "animation"
  | "lighting"
  | "colors"
  | "interaction"
  | "noise"
  | "rendering"
  | "content"
  | "export"
  | "presets";

export type ControlGroupState = Record<ControlGroupId, boolean>;

export type DitherAdapterProps = {
  params: MonochromeParams;
  animation?: Partial<AnimationEngineConfig>;
  interaction?: Partial<InteractionEngineConfig>;
  color?: Partial<ColorMaterialConfig>;
  light?: Partial<LightShapeConfig>;
  content?: Partial<ComponentContent>;
  reducedMotion?: boolean;
  className?: string;
};

export type AdapterComponent = ComponentType<DitherAdapterProps>;

/** Grouped configuration surface for the shared engine API. */
export type DitherEngineConfig = {
  material: Pick<
    MonochromeParams,
    | "ditherSize"
    | "posterization"
    | "softEdge"
    | "pixelDensity"
    | "opacity"
    | "randomSeed"
  >;
  animation: Pick<MonochromeParams, "animationSpeed" | "noiseSpeed">;
  lighting: Pick<
    MonochromeParams,
    | "lightX"
    | "lightY"
    | "bloom"
    | "bloomRadius"
    | "depth"
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
  interaction: Pick<
    MonochromeParams,
    "cursorInfluence" | "scrollInfluence"
  >;
  noise: Pick<
    MonochromeParams,
    "noiseScale" | "blueNoiseAmount" | "grainAmount"
  >;
  dither: Pick<MonochromeParams, "ditherSize" | "pixelDensity">;
};
