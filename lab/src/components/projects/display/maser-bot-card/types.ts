export type MaserBotCardFace = "front" | "back";

export type MaserBotCardProps = {
  tiltEnabled?: boolean;
  /** Multiplier around live yaw/pitch feel. Not a product token. */
  maxAngleFeel?: number;
  shineEnabled?: boolean;
  shineIntensity?: number;
  face?: MaserBotCardFace;
  onFaceChange?: (face: MaserBotCardFace) => void;
  /** Clean slate ground only. Card fill stays #000. Default off-white `#F7F5F0`. */
  groundColor?: string;
  forceReducedMotion?: boolean;
  className?: string;
};
