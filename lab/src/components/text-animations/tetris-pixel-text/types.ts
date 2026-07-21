export type RotationDeg = 0 | 90 | 180 | 270;

export type ColorMode = "solid" | "rainbow" | "animated-rainbow" | "gradient";

export type RevealOutDirection =
  | "fall-down"
  | "lift-up"
  | "scatter-vertical"
  | "reverse-assembly";

export type FontVariant = "geist-pixel-square" | "geist-pixel-grid";

export type GradientAxis = "horizontal" | "vertical";

export type Cell = { x: number; y: number };

export type ShapeId =
  | "I"
  | "O"
  | "T"
  | "L"
  | "J"
  | "S"
  | "Z"
  | "I3"
  | "V3"
  | "L3"
  | "D2"
  | "P5"
  | "U5"
  | "X5"
  | "F1"
  | "custom";

export type PieceAnimState =
  | "waiting"
  | "falling"
  | "landing"
  | "landed"
  | "exiting";

export type PixelPiece = {
  id: string;
  shapeId: ShapeId;
  /** Local cells relative to piece origin (top-left of bbox at rotation 0). */
  cells: Cell[];
  /** Final grid origin where local (0,0) maps when rotation = targetRotation. */
  targetX: number;
  targetY: number;
  targetRotation: RotationDeg;
  spawnX: number;
  spawnY: number;
  startRotation: RotationDeg;
  rotationSteps: number;
  /** Intermediate column centers (grid X) visited while falling. */
  horizontalWaypoints: number[];
  delay: number;
  duration: number;
  color: string;
  glowColor: string;
  landed: boolean;
};

export type PieceRuntime = PixelPiece & {
  /** Current interpolated grid origin. */
  x: number;
  y: number;
  rotation: number;
  /** 0–1 progress through fall (before bounce). */
  progress: number;
  bounceScaleY: number;
  glowAlpha: number;
  impactFlash: number;
  /** Draw gate — waiting pieces must not render. */
  visible: boolean;
  animState: PieceAnimState;
};

export type OccupancyGrid = {
  width: number;
  height: number;
  cells: Set<string>;
  /** Sorted absolute occupied cells. */
  occupied: Cell[];
};

export type TetrisPixelSettings = {
  line2: string;
  fontVariant: FontVariant;
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  textAlign: "left" | "center" | "right";
  background: string;
  cellSize: number;
  gridPadding: number;
  pieceSizePreference: number;
  tetrominoFrequency: number;
  triominoFrequency: number;
  shapeVariety: number;
  pieceSpacing: number;
  spawnHeightMin: number;
  spawnHeightMax: number;
  landingDensity: number;
  edgeDetail: number;
  /** Fraction of cell samples that must be filled (0–1). */
  coverageThreshold: number;
  /** Extra cells above the rotated piece height when spawning. */
  spawnSafetyMargin: number;
  /** Dev-only mask/partition overlay. */
  debugOverlay: boolean;
  fallDuration: number;
  stagger: number;
  staggerRandomness: number;
  horizontalMovement: number;
  horizontalCorrections: number;
  rotationAmount: number;
  maxQuarterTurns: number;
  rotationSpeed: number;
  landingBounce: number;
  landingDelay: number;
  finalHoldDuration: number;
  revealOutSpeed: number;
  revealOutDirection: RevealOutDirection;
  colorMode: ColorMode;
  color: string;
  rainbowSaturation: number;
  rainbowBrightness: number;
  rainbowSpread: number;
  hueSpeed: number;
  gradientAxis: GradientAxis;
  glowIntensity: number;
  glowRadius: number;
  glowDuration: number;
  impactFlash: number;
  finalWordGlow: number;
  layoutSeed: number;
  motionSeed: number;
  phase: "in" | "out";
  autoPlay: boolean;
  loop: boolean;
  paused: boolean;
};

export type TetrisPixelTextProps = Partial<TetrisPixelSettings> & {
  text: string;
  playKey?: number;
  compact?: boolean;
  className?: string;
  embedded?: boolean;
};

export const DEFAULT_TETRIS_SETTINGS: TetrisPixelSettings = {
  line2: "",
  fontVariant: "geist-pixel-square",
  fontSize: 96,
  letterSpacing: 0,
  lineHeight: 1.05,
  textAlign: "center",
  background: "#000000",
  cellSize: 5,
  gridPadding: 1,
  pieceSizePreference: 0.7,
  tetrominoFrequency: 0.65,
  triominoFrequency: 0.25,
  shapeVariety: 0.85,
  pieceSpacing: 0.25,
  spawnHeightMin: 0.35,
  spawnHeightMax: 0.85,
  landingDensity: 0.55,
  edgeDetail: 0.9,
  coverageThreshold: 0.12,
  spawnSafetyMargin: 2,
  debugOverlay: false,
  fallDuration: 1800,
  stagger: 45,
  staggerRandomness: 0.3,
  horizontalMovement: 0.65,
  horizontalCorrections: 2,
  rotationAmount: 0.7,
  maxQuarterTurns: 2,
  rotationSpeed: 0.55,
  landingBounce: 0.35,
  landingDelay: 0,
  finalHoldDuration: 800,
  revealOutSpeed: 1,
  revealOutDirection: "fall-down",
  colorMode: "solid",
  color: "#ffffff",
  rainbowSaturation: 0.85,
  rainbowBrightness: 0.95,
  rainbowSpread: 1,
  hueSpeed: 0.08,
  gradientAxis: "horizontal",
  glowIntensity: 0.45,
  glowRadius: 2.5,
  glowDuration: 320,
  impactFlash: 0.4,
  finalWordGlow: 0.55,
  layoutSeed: 24819,
  motionSeed: 81203,
  phase: "in",
  autoPlay: true,
  loop: false,
  paused: false,
};

export function cellKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function parseCellKey(key: string): Cell {
  const [xs, ys] = key.split(",");
  return { x: Number(xs), y: Number(ys) };
}
