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
  /** Stage field (vgpu). Card face stays solid #000. */
  bgMode?: MaserBotCardBgMode;
  bgIntensity?: number;
  /** Stage ground only (demo Background knob). Card fill stays #000. Default `#000000`. */
  groundColor?: string;
  forceReducedMotion?: boolean;
  className?: string;
};
