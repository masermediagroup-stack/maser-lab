export type TransitionId =
  | "editorial-wipe"
  | "product-shelf-slide"
  | "spotlight-iris"
  | "receipt-lift"
  | "soft-crossfade-blur";

export type TransitionSettings = {
  duration: number;
  intensity: number;
  stagger: number;
  radius: number;
};

export type TransitionDefinition = {
  id: TransitionId;
  title: string;
  eyebrow: string;
  description: string;
  useCase: string;
  mechanics: string;
  risk: string;
  dependencies: string[];
  defaults: TransitionSettings;
};

export type PreviewPhase = "idle" | "animating";
