export type TransitionId =
  | "editorial-wipe"
  | "product-shelf-slide"
  | "spotlight-iris"
  | "receipt-lift"
  | "soft-crossfade-blur"
  | "curtain-fall"
  | "pixel-wormhole";

export type CurtainGradientMode = "solid" | "vertical" | "horizontal";

/** Which strip leads the stagger for a Curtain Fall phase. */
export type CurtainOrigin = "left" | "right" | "center";

/** Vertical side the curtains enter from / exit toward. */
export type CurtainDirection = "top" | "bottom";

/** Decorative shape on the leading hem of each curtain strip. */
export type CurtainEdge = "flat" | "curve" | "diamond" | "circle";

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
  /** Curtain Fall — which side leads the cover (fall-in) stagger */
  curtainFallIn: CurtainOrigin;
  /** Curtain Fall — which side leads the reveal (fall-out) stagger */
  curtainFallOut: CurtainOrigin;
  /** Curtain Fall — enter from top or bottom */
  curtainDirIn: CurtainDirection;
  /** Curtain Fall — exit toward top or bottom */
  curtainDirOut: CurtainDirection;
  /** Curtain Fall — leading hem silhouette during fall-in */
  curtainEdgeIn: CurtainEdge;
  /** Curtain Fall — leading hem silhouette during fall-out */
  curtainEdgeOut: CurtainEdge;
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
      key: "curtainFallIn" | "curtainFallOut";
      label: string;
      options: { value: CurtainOrigin; label: string }[];
    }
  | {
      type: "select";
      key: "curtainDirIn" | "curtainDirOut";
      label: string;
      options: { value: CurtainDirection; label: string }[];
    }
  | {
      type: "select";
      key: "curtainEdgeIn" | "curtainEdgeOut";
      label: string;
      options: { value: CurtainEdge; label: string }[];
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
  curtainFallIn: "left" as CurtainOrigin,
  curtainFallOut: "left" as CurtainOrigin,
  curtainDirIn: "top" as CurtainDirection,
  curtainDirOut: "bottom" as CurtainDirection,
  curtainEdgeIn: "flat" as CurtainEdge,
  curtainEdgeOut: "flat" as CurtainEdge,
};

export const curtainOriginOptions: { value: CurtainOrigin; label: string }[] = [
  { value: "left", label: "Left → right" },
  { value: "right", label: "Right → left" },
  { value: "center", label: "Center → out" },
];

export const curtainDirectionOptions: {
  value: CurtainDirection;
  label: string;
}[] = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
];

export const curtainEdgeOptions: { value: CurtainEdge; label: string }[] = [
  { value: "flat", label: "Flat" },
  { value: "curve", label: "Flow curve" },
  { value: "diamond", label: "Diamond" },
  { value: "circle", label: "Circle" },
];

export const defaultPixelLook = {
  pixelDensity: 28,
  pixelColorMode: "preserve" as PixelColorMode,
  pixelColorA: "#10a4ff",
  pixelColorB: "#ffffff",
};
