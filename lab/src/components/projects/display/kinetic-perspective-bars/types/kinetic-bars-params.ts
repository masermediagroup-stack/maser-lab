export type MotionMode =
  | "traveling"
  | "reverse"
  | "breathing"
  | "pulse";

export type KineticBarsParams = {
  barCount: number;
  barWidth: number;
  barThickness: number;
  gap: number;
  minHeight: number;
  maxHeight: number;
  cornerRadius: number;
  liftAmplitude: number;
  waveSpeed: number;
  phaseOffset: number;
  waveDirection: 1 | -1;
  hoverStrength: number;
  hoverRadius: number;
  rippleStrength: number;
  rippleSpeed: number;
  rippleDecay: number;
  edgeBrightness: number;
  fillOpacity: number;
  backgroundColor: string;
  cameraZoom: number;
  cameraPosition: [number, number, number];
  groupRotation: [number, number, number];
  groupScale: number;
  animationMode: MotionMode;
  paused: boolean;
  reducedMotionPreview: boolean;
  cameraDrift: boolean;
  perspectiveAngle: number;
};
