import type { ReactNode } from "react";

export type LiquidDirection =
  | "bottom-to-top"
  | "top-to-bottom"
  | "left-to-right"
  | "right-to-left";

export type LiquidDuration = "scroll" | number;

export type LiquidMonochromeProps = {
  children: ReactNode;
  /** Grayscale blend amount 0–1 */
  intensity?: number;
  /** Which edge the liquid rises from */
  direction?: LiquidDirection;
  /** Pin section while scrubbing */
  pin?: boolean;
  /** Tie animation directly to scroll position */
  scrub?: boolean | number;
  /** Liquid edge turbulence 0–1 */
  turbulence?: number;
  /** Spatial frequency of edge noise */
  noiseScale?: number;
  /** Wave amplitude multiplier */
  liquidStrength?: number;
  /** Softens the transition edge */
  edgeSoftness?: number;
  /** Mask feather — alias for edge softness in API */
  maskSoftness?: number;
  /** Pin length in viewport heights when duration is scroll */
  pinDuration?: number;
  /** Extra scroll distance beyond pin (vh multiplier) */
  overscroll?: number;
  /** Scroll distance multiplier — higher = slower reveal */
  speed?: number;
  /** Unique seed for noise pattern */
  seed?: number;
  /** ScrollTrigger start position */
  start?: string;
  /** ScrollTrigger end position override */
  end?: string;
  /** Duration mode */
  duration?: LiquidDuration;
  /** CSS blend mode on mono layer */
  blendMode?: React.CSSProperties["mixBlendMode"];
  /** Disable pin/scrub — static progress from intersection */
  disabled?: boolean;
  /** Fixed progress 0–1 (bypasses scroll) */
  progress?: number;
  className?: string;
  /** Called each scroll frame with progress 0–1 */
  onProgressChange?: (progress: number) => void;
};

export type LiquidScrollOptions = Pick<
  LiquidMonochromeProps,
  | "pin"
  | "scrub"
  | "pinDuration"
  | "overscroll"
  | "speed"
  | "start"
  | "end"
  | "duration"
  | "disabled"
  | "onProgressChange"
>;
