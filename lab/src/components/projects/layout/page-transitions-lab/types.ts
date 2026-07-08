export type TransitionId =
  | "editorial-wipe"
  | "product-shelf-slide"
  | "spotlight-iris"
  | "receipt-lift"
  | "soft-crossfade-blur"
  | "curtain-fall";

export type CurtainGradientMode = "solid" | "vertical" | "horizontal";

export type TransitionSettings = {
  duration: number;
  intensity: number;
  stagger: number;
  radius: number;
  curtains: number;
  /** Curtain Fall — primary strip color */
  curtainColorA: string;
  /** Curtain Fall — secondary strip color (gradients) */
  curtainColorB: string;
  /** Curtain Fall — fill style */
  curtainGradient: CurtainGradientMode;
};

export type SliderControlDefinition = {
  type?: "slider";
  key: keyof Pick<
    TransitionSettings,
    "duration" | "intensity" | "stagger" | "radius" | "curtains"
  >;
  label: string;
  min: number;
  max: number;
  step: number;
  suffix?: string;
};

export type ColorControlDefinition = {
  type: "color";
  key: "curtainColorA" | "curtainColorB";
  label: string;
};

export type SelectControlDefinition = {
  type: "select";
  key: "curtainGradient";
  label: string;
  options: { value: CurtainGradientMode; label: string }[];
};

export type ControlDefinition =
  | SliderControlDefinition
  | ColorControlDefinition
  | SelectControlDefinition;

export type TransitionDefinition = {
  id: TransitionId;
  title: string;
  eyebrow: string;
  engine: "css" | "three";
  dependencies: string[];
  defaults: TransitionSettings;
  controls: ControlDefinition[];
};

export type PreviewStatus = "rest" | "running";

export type PageSample = {
  id: string;
  path: string;
  label: string;
  title: string;
  kicker: string;
  accent: string;
};

/** Shared defaults for non-curtain transitions (color fields unused). */
export const defaultCurtainLook = {
  curtainColorA: "#071018",
  curtainColorB: "#10a4ff",
  curtainGradient: "solid" as CurtainGradientMode,
};
