export type PixelInfoTheme = "dark" | "light";

export type PixelInfoPhase = "idle" | "expanding" | "expanded" | "collapsing";

export type PixelInfoTuning = {
  pixelSize: number;
  snakeDensity: number;
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
};
