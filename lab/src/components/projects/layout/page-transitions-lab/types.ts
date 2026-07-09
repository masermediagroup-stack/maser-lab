export type TransitionId =
  | "editorial-wipe"
  | "product-shelf-slide"
  | "spotlight-iris"
  | "receipt-lift"
  | "soft-crossfade-blur"
  | "curtain-fall"
  | "pixel-wormhole";

export type CurtainGradientMode = "solid" | "vertical" | "horizontal";

export type PixelColorMode = "preserve" | "solid" | "gradient" | "white";

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
  /** Pixel Wormhole — grid density across the stage */
  pixelDensity: number;
  /** Pixel Wormhole — how pixel colors are chosen */
  pixelColorMode: PixelColorMode;
  /** Pixel Wormhole — solid / gradient start */
  pixelColorA: string;
  /** Pixel Wormhole — gradient end */
  pixelColorB: string;
};

export type SliderControlDefinition = {
  type?: "slider";
  key: keyof Pick<
    TransitionSettings,
    | "duration"
    | "intensity"
    | "stagger"
    | "radius"
    | "curtains"
    | "pixelDensity"
  >;
  label: string;
  min: number;
  max: number;
  step: number;
  suffix?: string;
};

export type ColorControlDefinition = {
  type: "color";
  key: "curtainColorA" | "curtainColorB" | "pixelColorA" | "pixelColorB";
  label: string;
};

export type SelectControlDefinition =
  | {
      type: "select";
      key: "curtainGradient";
      label: string;
      options: { value: CurtainGradientMode; label: string }[];
    }
  | {
      type: "select";
      key: "pixelColorMode";
      label: string;
      options: { value: PixelColorMode; label: string }[];
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

export type PageKind = "landing" | "article";

export type PageSample = {
  id: string;
  kind: PageKind;
  path: string;
  brand: string;
  title: string;
  accent: string;
};

/** Shared defaults for unused curtain / pixel fields. */
export const defaultCurtainLook = {
  curtainColorA: "#071018",
  curtainColorB: "#10a4ff",
  curtainGradient: "solid" as CurtainGradientMode,
};

export const defaultPixelLook = {
  pixelDensity: 28,
  pixelColorMode: "preserve" as PixelColorMode,
  pixelColorA: "#10a4ff",
  pixelColorB: "#ffffff",
};
