import type { CSSProperties } from "react";
import type { SvgInput } from "./resolve-svg";

export type GradientMode = "radial" | "linear" | "conic" | "solid";

export type RotationDirection = "clockwise" | "counterclockwise";

export type RotationAxis = "y" | "x" | "both";

export type SVG3DRotatorProps = {
  /** SVG element or component to extrude and rotate. */
  svg: SvgInput;
  width?: number;
  height?: number;
  /** Number of stacked layers creating extrusion depth. */
  depth?: number;
  /** Z spacing per layer in px. */
  depthStep?: number;
  strokeColor?: string;
  strokeWidth?: number;
  faceColor?: string;
  backColor?: string;
  /** Rotation speed in degrees per second. */
  rotationSpeed?: number;
  direction?: RotationDirection;
  rotationAxis?: RotationAxis;
  gradientMode?: GradientMode;
  gradientStart?: string;
  gradientEnd?: string;
  gradientCenter?: string;
  gradientEdge?: string;
  ambientGlow?: string;
  shadowColor?: string;
  cardRadius?: number;
  padding?: number | string;
  perspective?: number;
  /** Pause rotation on hover when true. */
  hoverPause?: boolean;
  /** Enable hover speed boost, glow, and scale. */
  enableHoverEffects?: boolean;
  autoRotate?: boolean;
  /** Alias for autoRotate={false}. */
  pauseAnimation?: boolean;
  /** Subtle vertical float animation. */
  enableFloat?: boolean;
  /** Hover rotation speed multiplier. */
  hoverSpeedMultiplier?: number;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
};

export const SVG3D_DEFAULTS = {
  width: 420,
  height: 420,
  depth: 18,
  depthStep: 1,
  strokeColor: "#ffffff",
  strokeWidth: 2,
  faceColor: "#050505",
  backColor: "#0d0d0d",
  rotationSpeed: 18,
  direction: "clockwise" as RotationDirection,
  rotationAxis: "both" as RotationAxis,
  gradientMode: "radial" as GradientMode,
  gradientStart: "#3E6BFF",
  gradientEnd: "#D86BCF",
  gradientCenter: "#3D71FF",
  gradientEdge: "#B86ACF",
  ambientGlow: "#4F82FF",
  shadowColor: "rgba(0, 0, 0, 0.45)",
  cardRadius: 32,
  padding: "12%",
  perspective: 720,
  hoverPause: false,
  enableHoverEffects: true,
  autoRotate: true,
  enableFloat: true,
  hoverSpeedMultiplier: 2.4,
} as const;
