export type TransitionId =
  | "editorial-wipe"
  | "product-shelf-slide"
  | "spotlight-iris"
  | "receipt-lift"
  | "soft-crossfade-blur"
  | "curtain-fall";

export type TransitionSettings = {
  duration: number;
  intensity: number;
  stagger: number;
  radius: number;
  curtains: number;
};

export type ControlDefinition = {
  key: keyof TransitionSettings;
  label: string;
  min: number;
  max: number;
  step: number;
  suffix?: string;
};

export type TransitionDefinition = {
  id: TransitionId;
  title: string;
  eyebrow: string;
  description: string;
  useCase: string;
  mechanics: string;
  risk: string;
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
  items: string[];
  accent: string;
};
