export type TypeWorldProps = {
  /** Quote body. Newlines become separate centered lines on the sphere. */
  quote?: string;
  /** Glyph color. Applied as an unlit material tint over a white texture. */
  textColor?: string;
  /** Section field color (CSS + renderer clear). */
  backgroundColor?: string;
  /** Font-family stack used by CanvasTexture and the static fallback. */
  fontFamily?: string;
  /**
   * Section scroll progress (0–1) at which reveal scale reaches 1.
   * Default ~0.26 so inflation is the first 20–30% of the sticky travel.
   */
  revealEnd?: number;
  /** Peak scale during the inflate overshoot (then settles to 1). */
  overshoot?: number;
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
  onInteract?: () => void;
};
