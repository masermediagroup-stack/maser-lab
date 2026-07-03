import type { ComponentType } from "react";
import type { EaseOption } from "@/components/text-animations/shared";

export type ControlGroup =
  | "content"
  | "timing"
  | "motion"
  | "style"
  | "interaction"
  | "export";

export type ControlDefinition =
  | {
      type: "text";
      key: string;
      label: string;
      group: ControlGroup;
      multiline?: boolean;
    }
  | {
      type: "slider";
      key: string;
      label: string;
      group: ControlGroup;
      min: number;
      max: number;
      step: number;
    }
  | {
      type: "switch";
      key: string;
      label: string;
      group: ControlGroup;
    }
  | {
      type: "select";
      key: string;
      label: string;
      group: ControlGroup;
      options: { value: string; label: string }[];
    };

export type AnimationSettings = Record<string, string | number | boolean>;

export type AnimationDefinition = {
  id: string;
  title: string;
  description: string;
  defaultText: string;
  defaultSettings: AnimationSettings;
  controls: ControlDefinition[];
  component: ComponentType<AnimationSettings & { text: string; playKey?: number; compact?: boolean }>;
  dependencies?: string[];
};

export type TypingSettings = {
  typingSpeed: number;
  startDelay: number;
  showCursor: boolean;
  cursorBlinkSpeed: number;
  ease: EaseOption;
  loop: boolean;
};

export type LetterFlipFrameSettings = {
  flipSpeed: number;
  stagger: number;
  flipAxis: "x" | "y" | "z";
  perspective: number;
  ease: EaseOption;
  direction: "forward" | "reverse";
};

export type PouredTextSettings = {
  speed: number;
  curveIntensity: number;
  stagger: number;
  verticalOffset: number;
  horizontalOffset: number;
  blur: number;
  ease: EaseOption;
};

export type StrokeFillGlowSettings = {
  strokeDuration: number;
  fillDuration: number;
  glowIntensity: number;
  glowRadius: number;
  wordStagger: number;
  strokeWidth: number;
  ease: EaseOption;
};

export type RandomLetterFadeSettings = {
  fadeSpeed: number;
  stagger: number;
  randomOrder: boolean;
  randomnessAmount: number;
  blur: number;
  ease: EaseOption;
};

export type DirectionalLetterFlipSettings = {
  direction: "top" | "bottom" | "left" | "right";
  flipSpeed: number;
  stagger: number;
  perspective: number;
  rotationAmount: number;
  ease: EaseOption;
};

export type CursorAsciiRevealSettings = {
  revealRadius: number;
  revealSoftness: number;
  revealSpeed: number;
  asciiDensity: number;
  noiseAmount: number;
  hoverMode: boolean;
  pressMode: boolean;
};

export type GlideTextSettings = {
  direction: "left" | "right" | "top" | "bottom" | "diagonal";
  glideDistance: number;
  speed: number;
  stagger: number;
  blur: number;
  ease: EaseOption;
};

export type ScaleAnchorSettings = {
  scaleStart: number;
  scaleEnd: number;
  speed: number;
  stagger: number;
  ease: EaseOption;
  anchor:
    | "center"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
};

export type ScrollLineRevealSettings = {
  scrollStart: string;
  scrollEnd: string;
  scrubAmount: number;
  lineStagger: number;
  revealDirection: "up" | "down" | "left" | "right";
  blur: number;
  opacityFade: boolean;
  pinSection: boolean;
};
