export type MaserBotCardBgMode = "calm" | "interactive";
export type MaserBotCardFace = "front" | "back";

export type MaserBotCardProps = {
  tiltEnabled?: boolean;
  /** Multiplier around live yaw/pitch feel. Not a product token. */
  maxAngleFeel?: number;
  shineEnabled?: boolean;
  shineIntensity?: number;
  bandEnabled?: boolean;
  face?: MaserBotCardFace;
  onFaceChange?: (face: MaserBotCardFace) => void;
  bgMode?: MaserBotCardBgMode;
  bgIntensity?: number;
  bgSpeed?: number;
  forceReducedMotion?: boolean;
  className?: string;
};
