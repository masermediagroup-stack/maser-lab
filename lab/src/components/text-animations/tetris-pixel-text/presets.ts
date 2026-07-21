import {
  DEFAULT_TETRIS_SETTINGS,
  type TetrisPixelSettings,
} from "./types";

export type PresetId =
  | "classic-blocks"
  | "arcade-rainbow"
  | "slow-assembly"
  | "glitch-build"
  | "minimal-lock-in";

export type PresetDefinition = {
  id: PresetId;
  label: string;
  description: string;
  settings: Partial<TetrisPixelSettings>;
};

export const TETRIS_PRESETS: PresetDefinition[] = [
  {
    id: "classic-blocks",
    label: "Classic Blocks",
    description: "White pieces, black background, moderate motion, subtle glow.",
    settings: {
      ...DEFAULT_TETRIS_SETTINGS,
      colorMode: "solid",
      color: "#ffffff",
      background: "#000000",
      cellSize: 5,
      coverageThreshold: 0.12,
      horizontalMovement: 0.65,
      rotationAmount: 0.7,
      maxQuarterTurns: 2,
      fallDuration: 1800,
      stagger: 45,
      glowIntensity: 0.45,
      impactFlash: 0.4,
      landingBounce: 0.35,
    },
  },
  {
    id: "arcade-rainbow",
    label: "Arcade Rainbow",
    description: "Rainbow by piece, stronger movement, brighter impact.",
    settings: {
      colorMode: "rainbow",
      color: "#ffffff",
      background: "#000000",
      horizontalMovement: 0.9,
      horizontalCorrections: 3,
      rotationAmount: 0.85,
      maxQuarterTurns: 3,
      fallDuration: 1400,
      stagger: 38,
      staggerRandomness: 0.5,
      glowIntensity: 0.65,
      impactFlash: 0.7,
      glowRadius: 4,
      rainbowSaturation: 0.9,
      rainbowBrightness: 0.95,
      rainbowSpread: 1,
    },
  },
  {
    id: "slow-assembly",
    label: "Slow Assembly",
    description: "Slow fall, larger pieces, visible rotations, longer glow.",
    settings: {
      colorMode: "solid",
      color: "#ffffff",
      background: "#000000",
      pieceSizePreference: 0.9,
      tetrominoFrequency: 0.85,
      fallDuration: 2800,
      stagger: 90,
      staggerRandomness: 0.15,
      horizontalMovement: 0.55,
      rotationAmount: 0.9,
      maxQuarterTurns: 2,
      glowIntensity: 0.55,
      glowDuration: 520,
      landingBounce: 0.4,
    },
  },
  {
    id: "glitch-build",
    label: "Glitch Build",
    description: "Fast corrections, more rotations, short flashes, irregular timing.",
    settings: {
      colorMode: "animated-rainbow",
      color: "#ffffff",
      background: "#050508",
      fallDuration: 1100,
      stagger: 28,
      staggerRandomness: 0.75,
      horizontalMovement: 1,
      horizontalCorrections: 4,
      rotationAmount: 1,
      maxQuarterTurns: 3,
      rotationSpeed: 0.9,
      glowIntensity: 0.5,
      impactFlash: 0.95,
      glowDuration: 180,
      hueSpeed: 0.22,
      rainbowSpread: 1.2,
    },
  },
  {
    id: "minimal-lock-in",
    label: "Minimal Lock-In",
    description: "Almost no lateral move, few rotations, restrained glow.",
    settings: {
      colorMode: "solid",
      color: "#ffffff",
      background: "#000000",
      horizontalMovement: 0.08,
      horizontalCorrections: 1,
      rotationAmount: 0.15,
      maxQuarterTurns: 1,
      fallDuration: 1600,
      stagger: 40,
      glowIntensity: 0.22,
      impactFlash: 0.15,
      landingBounce: 0.12,
      finalWordGlow: 0.25,
    },
  },
];

export function applyPreset(
  presetId: PresetId,
  current: TetrisPixelSettings,
): TetrisPixelSettings {
  const preset = TETRIS_PRESETS.find((p) => p.id === presetId);
  if (!preset) return current;
  return {
    ...current,
    ...preset.settings,
    // Preserve seeds unless preset implies reset — keep current seeds for reproducibility
    layoutSeed: current.layoutSeed,
    motionSeed: current.motionSeed,
    phase: current.phase,
    paused: false,
    line2: current.line2,
  };
}
