import type { LiquidMonochromeProps } from "./types";

export const LIQUID_MONOCHROME_DEFAULTS: Required<
  Pick<
    LiquidMonochromeProps,
    | "intensity"
    | "direction"
    | "pin"
    | "scrub"
    | "turbulence"
    | "noiseScale"
    | "liquidStrength"
    | "edgeSoftness"
    | "maskSoftness"
    | "pinDuration"
    | "overscroll"
    | "speed"
    | "seed"
    | "start"
    | "duration"
    | "blendMode"
    | "disabled"
  >
> = {
  intensity: 1,
  direction: "bottom-to-top",
  pin: true,
  scrub: true,
  turbulence: 0.55,
  noiseScale: 0.32,
  liquidStrength: 1,
  edgeSoftness: 0.45,
  maskSoftness: 0.45,
  pinDuration: 1.25,
  overscroll: 0,
  speed: 1,
  seed: 7,
  start: "top top",
  duration: "scroll",
  blendMode: "normal",
  disabled: false,
};

/** Perceptual luminance weights (ITU-R BT.709) */
export const LUMINANCE_MATRIX =
  "0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0";

export const FILTER_ID = "liquid-mono-luminance";
