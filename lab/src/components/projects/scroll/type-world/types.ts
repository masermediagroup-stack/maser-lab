export type TypeWorldGradient = {
  color1: string;
  color2: string;
  color3: string;
  speed: number;
  angle: number;
  spread: number;
  reverse: boolean;
};

export type TypeWorldStageTheme = "light" | "dark";

/** Surface discs that glide on the implied sphere (shader-masked, not extra meshes). */
export type TypeWorldOrbs = {
  enabled: boolean;
  count: number;
  seed: number;
  /** Angular radius on the unit sphere (radians). */
  sizeMin: number;
  sizeMax: number;
  /** Soft edge as a fraction of radius. Graphic, not a glow. */
  edgeSoftness: number;
  speedMin: number;
  speedMax: number;
  steerAmount: number;
  speedNoise: number;
  driftNoise: number;
  colorLight: string;
  colorDark: string;
  textColor: string;
  textColor2: string;
  invertText: boolean;
  renderBody: boolean;
};

export type TypeWorldProps = {
  /** Quote body. Newlines become separate centered lines on the sphere. */
  quote?: string;
  /**
   * Fallback / Color 1 when `gradientColor1` is omitted.
   * Gradient Color 1 is the royal-blue identity stop.
   */
  textColor?: string;
  /** Section field color (CSS + renderer clear). */
  backgroundColor?: string;
  /** Font-family stack used by CanvasTexture and the static fallback. */
  fontFamily?: string;
  /** Radians of yaw per CSS pixel of horizontal drag. */
  dragSensitivity?: number;
  /**
   * Coast amount after release, 0–1.
   * Higher keeps a short velocity tail; never a free spin.
   */
  inertia?: number;
  /** Maximum pitch from the equator, in degrees. */
  pitchLimit?: number;
  /** Optional override. When omitted, the product honors OS reduced motion. */
  reducedMotion?: boolean;
  /** Force the static quote (demo / no-WebGL). */
  forceFallback?: boolean;
  /** Understated discoverability line. Empty string hides it. */
  hint?: string;
  gradientColor1?: string;
  gradientColor2?: string;
  gradientColor3?: string;
  /** 0 = static, 1 = default traversal, 2 = 2×. */
  gradientSpeed?: number;
  /** Direction of travel in degrees (0 = +U). Default 25. */
  gradientAngle?: number;
  /** 0.5 = broad fields, 3 = tighter stripes. */
  gradientSpread?: number;
  /** Reverse pigment travel only — does not affect drag. */
  gradientReverse?: boolean;
  /**
   * Capture vertical drags as pitch (no page-scroll handoff).
   * Use in fill-viewport / chrome hosts where the canvas is the only scroller.
   */
  captureVerticalDrag?: boolean;
  /**
   * Multiplier on canvas-fit rest size. 1 = default fit.
   * Hosts and the demo Scale slider use this; grip press still stacks on top.
   */
  scale?: number;
  /** Picks orb body / in-orb text defaults (light = black discs, dark = white). */
  theme?: TypeWorldStageTheme;
  /** Surface orbs. Omitted fields use `TYPE_WORLD_ORB_DEFAULTS`. */
  orbs?: Partial<TypeWorldOrbs>;
  className?: string;
};

export type TypographyTextureOptions = {
  quote: string;
  fontFamily: string;
  width: number;
  height: number;
};

export type DragRotationOptions = {
  yawSensitivity: number;
  pitchSensitivity: number;
  pitchLimit: number;
  inertia: number;
  reducedMotion: boolean;
  /** When true, touch pitch is live; vertical-first does not yield to the page. */
  captureVertical: boolean;
  onInteract?: () => void;
};
