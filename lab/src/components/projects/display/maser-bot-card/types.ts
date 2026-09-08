export type MaserBotCardBgMode = "calm" | "interactive";
export type MaserBotCardFace = "front" | "back";

export type MaserBotCardProps = {
  tiltEnabled?: boolean;
  /** Multiplier around live yaw/pitch feel. Not a product token. */
  maxAngleFeel?: number;
  shineEnabled?: boolean;
  shineIntensity?: number;
  face?: MaserBotCardFace;
  onFaceChange?: (face: MaserBotCardFace) => void;
  /** Stage field (vgpu). Plate stays solid #000. */
  bgMode?: MaserBotCardBgMode;
  bgIntensity?: number;
  forceReducedMotion?: boolean;
  className?: string;
};
