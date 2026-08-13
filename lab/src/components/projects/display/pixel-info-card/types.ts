export type PixelInfoTheme = "dark" | "light";

export type PixelInfoPhase = "idle" | "expanding" | "expanded" | "collapsing";

export type PixelInfoTuning = {
  pixelSize: number;
  pixelDensity: number;
  assembleMs: number;
  dissipateMs: number;
  cardRadius: number;
};

export type PixelInfoCardProps = {
  theme?: PixelInfoTheme;
  title?: string;
  body?: string;
  className?: string;
  /** Demo / lab overrides for motion tuning */
  tuning?: Partial<PixelInfoTuning>;
  reducedMotion?: boolean;
  /**
   * Uniform UI scale (1 = default). Fullscreen demo uses 2 so the whole
   * squircle + card + pixels read larger without a CSS transform fight.
   */
  scale?: number;
};
