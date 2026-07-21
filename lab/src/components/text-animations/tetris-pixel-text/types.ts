import type {
  ConcurrencyLevel,
  EdgeDetailLevel,
  PieceScale,
  RenderQuality,
  TextDensity,
} from "./density";

export type RotationDeg = 0 | 90 | 180 | 270;

export type ColorMode = "solid" | "rainbow" | "animated-rainbow" | "gradient";

export type RevealOutDirection =
  | "fall-down"
  | "lift-up"
  | "scatter-vertical"
  | "reverse-assembly";

export type FontVariant =
  | "geist-pixel-square"
  | "geist-pixel-grid"
  | "geist-pixel-circle"
  | "geist-pixel-triangle"
  | "geist-pixel-line"
  | "custom";

export type GradientAxis = "horizontal" | "vertical";

export type Cell = { x: number; y: number };

export type TargetCell = Cell & {
  /** 0–1 area coverage from supersampled mask. */
  coverage: number;
};

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
  /** Optional per-cell coverage (same order as occupied when present). */
  coverage?: Map<string, number>;
  logicalCellPx?: number;
  renderCellPx?: number;
};

export type TimelineSummary = {
  requestedDuration: number;
  calculatedDuration: number;
  pieceCount: number;
  peakConcurrent: number;
  effectiveStagger: number;
  effectiveConcurrency: Exclude<ConcurrencyLevel, "auto">;
};

export type MaskStats = {
  gridWidth: number;
  gridHeight: number;
  targetCells: number;
  pieceCount: number;
  logicalCellPx: number;
  renderCellPx: number;
  fontSizeUsed: number;
};

export type TetrisPixelSettings = {
  line2: string;
  fontVariant: FontVariant;
  customFontFamily: string;
  customFontUrl: string;
  customFontWeight: string;
  customFontStyle: "normal" | "italic";
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  textAlign: "left" | "center" | "right";
  background: string;

  textDensity: TextDensity;
  renderQuality: RenderQuality;
  edgeDetailLevel: EdgeDetailLevel;
  pieceScale: PieceScale;

  /**
   * Final on-stage cell size override (CSS px).
   * 0 = auto from density + stage fit. Does not change logical mask resolution.
   */
  cellSize: number;
  gridPadding: number;

  /** Legacy numeric edge bias; prefer edgeDetailLevel. Kept for export compat. */
  edgeDetail: number;
  /** Legacy; 0 = derive from edgeDetailLevel. */
  coverageThreshold: number;

  pieceSizePreference: number;
  tetrominoFrequency: number;
  triominoFrequency: number;
  shapeVariety: number;
  pieceSpacing: number;
  spawnHeightMin: number;
  spawnHeightMax: number;
  landingDensity: number;
  /** Extra cells above the rotated piece height when spawning. */
  spawnSafetyMargin: number;
  /** Dev-only mask/partition overlay. */
  debugOverlay: boolean;

  /** Master reveal length in seconds (first piece visible → last lock). */
  animationDuration: number;
  concurrency: ConcurrencyLevel;

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
  onTimelineReady?: (summary: TimelineSummary) => void;
  onMaskStats?: (stats: MaskStats) => void;
  onFontError?: (message: string) => void;
  onFontLoading?: (loading: boolean) => void;
};

export const DEFAULT_TETRIS_SETTINGS: TetrisPixelSettings = {
  line2: "",
  fontVariant: "geist-pixel-square",
  customFontFamily: "",
  customFontUrl: "",
  customFontWeight: "400",
  customFontStyle: "normal",
  fontSize: 120,
  letterSpacing: 0,
  lineHeight: 1.05,
  textAlign: "center",
  background: "#000000",

  textDensity: "high",
  renderQuality: "high",
  edgeDetailLevel: "detailed",
  pieceScale: "mixed",

  cellSize: 0,
  gridPadding: 1,
  edgeDetail: 0.9,
  coverageThreshold: 0,

  pieceSizePreference: 0.7,
  tetrominoFrequency: 0.65,
  triominoFrequency: 0.25,
  shapeVariety: 0.85,
  pieceSpacing: 0.25,
  spawnHeightMin: 0.35,
  spawnHeightMax: 0.85,
  landingDensity: 0.55,
  spawnSafetyMargin: 2,
  debugOverlay: false,

  animationDuration: 4,
  concurrency: "auto",

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
