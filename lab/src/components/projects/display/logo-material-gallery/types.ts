export type MaterialId =
  | "wood"
  | "glass"
  | "gradient"
  | "steel"
  | "marble"
  | "gold";

export type GalleryMode = "gallery" | "studio";

export type StudioParams = {
  spinSpeed: number;
  paused: boolean;
  scale: number;
  depth: number;
  keyLight: number;
  envIntensity: number;
};

export type LogoMaterialGalleryProps = {
  reducedMotion?: boolean;
  className?: string;
};

export type Vec2 = { x: number; y: number };
