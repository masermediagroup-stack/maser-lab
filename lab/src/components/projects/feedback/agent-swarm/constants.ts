import type {
  AgentSwarmColorMode,
  AgentSwarmMode,
  AgentSwarmNodeCount,
  AgentSwarmParams,
} from "./types";

export const DEFAULT_SEED = "18427";

export const NODE_COUNT_OPTIONS: AgentSwarmNodeCount[] = [6, 10, 15];

export const MODE_OPTIONS: AgentSwarmMode[] = [
  "swap",
  "shuffle",
  "pulse",
  "resolve",
  "cascade",
  "route",
  "orbit",
  "process",
];

export const COLOR_MODE_OPTIONS: AgentSwarmColorMode[] = [
  "white",
  "spectral",
  "cool",
  "warm",
  "custom",
];

export const MAX_TRAIL = 8;

export const VIEW_PADDING = 72;

export const DEFAULT_PARAMS: AgentSwarmParams = {
  nodeCount: 10,
  horizontalSpacing: 1,
  verticalSpacing: 1,
  nodeSize: 1,
  animation: true,
  speed: 1,
  travelDuration: 800,
  idleDuration: 450,
  settleDuration: 120,
  stagger: 0.16,
  pathCurvature: 0.3,
  randomness: 0.7,
  movementDistance: 0.28,
  activeAgentPercentage: 0.4,
  seed: DEFAULT_SEED,
  mode: "swap",
  colorMode: "spectral",
  customPalette: ["#ffffff", "#f3e8ff", "#e8f7ff", "#ffe8f2"],
  glowIntensity: 1,
  glowRadius: 1,
  bloomStrength: 1,
  coreBrightness: 1,
  atmosphericGlow: 1,
  trailOpacity: 0.35,
  trailLength: 4,
  background: "black",
  customBackground: "#050505",
  interaction: "off",
  pointerRadius: 88,
  pointerStrength: 0.35,
  debug: false,
  status: "loading",
};

export const PARAM_RANGES = {
  horizontalSpacing: { min: 0.65, max: 1.45, step: 0.01 },
  verticalSpacing: { min: 0.65, max: 1.45, step: 0.01 },
  nodeSize: { min: 0.6, max: 1.6, step: 0.01 },
  speed: { min: 0, max: 3, step: 0.05 },
  travelDuration: { min: 280, max: 1800, step: 10 },
  idleDuration: { min: 80, max: 1400, step: 10 },
  settleDuration: { min: 40, max: 400, step: 10 },
  stagger: { min: 0, max: 0.6, step: 0.01 },
  pathCurvature: { min: 0, max: 1, step: 0.01 },
  randomness: { min: 0, max: 1, step: 0.01 },
  movementDistance: { min: 0, max: 1, step: 0.01 },
  activeAgentPercentage: { min: 0.2, max: 1, step: 0.05 },
  glowIntensity: { min: 0.3, max: 1.8, step: 0.01 },
  glowRadius: { min: 0.5, max: 1.8, step: 0.01 },
  bloomStrength: { min: 0.3, max: 1.8, step: 0.01 },
  coreBrightness: { min: 0.4, max: 1.4, step: 0.01 },
  atmosphericGlow: { min: 0.2, max: 1.8, step: 0.01 },
  trailOpacity: { min: 0, max: 0.85, step: 0.01 },
  trailLength: { min: 0, max: MAX_TRAIL, step: 1 },
  pointerRadius: { min: 32, max: 180, step: 1 },
  pointerStrength: { min: 0, max: 1, step: 0.01 },
} as const;

export type PresetId = "core" | "spectral" | "fast" | "deep" | "resolve";

export const PRESETS: Record<
  PresetId,
  { label: string; patch: Partial<AgentSwarmParams> }
> = {
  core: {
    label: "Core",
    patch: {
      mode: "swap",
      colorMode: "white",
      speed: 1,
      travelDuration: 860,
      idleDuration: 520,
      pathCurvature: 0.26,
      trailOpacity: 0.18,
      trailLength: 3,
      glowIntensity: 0.9,
      atmosphericGlow: 0.75,
      movementDistance: 0.22,
      activeAgentPercentage: 0.3,
    },
  },
  spectral: {
    label: "Spectral",
    patch: {
      mode: "swap",
      colorMode: "spectral",
      speed: 1,
      travelDuration: 800,
      idleDuration: 450,
      pathCurvature: 0.3,
      trailOpacity: 0.35,
      trailLength: 4,
      glowIntensity: 1.05,
      atmosphericGlow: 1.15,
      bloomStrength: 1.1,
    },
  },
  fast: {
    label: "Fast Agents",
    patch: {
      mode: "shuffle",
      colorMode: "cool",
      speed: 1.65,
      travelDuration: 520,
      idleDuration: 180,
      stagger: 0.08,
      pathCurvature: 0.22,
      trailOpacity: 0.22,
      trailLength: 3,
      activeAgentPercentage: 0.55,
      movementDistance: 0.4,
    },
  },
  deep: {
    label: "Deep Work",
    patch: {
      mode: "swap",
      colorMode: "warm",
      speed: 0.7,
      travelDuration: 1100,
      idleDuration: 900,
      pathCurvature: 0.34,
      glowIntensity: 1.2,
      atmosphericGlow: 1.45,
      trailOpacity: 0.28,
      trailLength: 5,
      activeAgentPercentage: 0.3,
      movementDistance: 0.18,
    },
  },
  resolve: {
    label: "Resolve",
    patch: {
      mode: "resolve",
      colorMode: "spectral",
      speed: 1,
      travelDuration: 920,
      idleDuration: 380,
      pathCurvature: 0.42,
      glowIntensity: 1,
      trailOpacity: 0.3,
      trailLength: 5,
    },
  },
};

export const COLOR_PALETTES: Record<Exclude<AgentSwarmColorMode, "custom">, string[]> = {
  white: ["#ffffff", "#fff8f0", "#f5f7ff", "#fff6ea"],
  spectral: ["#ffffff", "#f4f0ff", "#ffe8f2", "#e8f7ff", "#ece6ff", "#f7fbff"],
  cool: ["#ffffff", "#eaf4ff", "#d7eeff", "#cfe8ff"],
  warm: ["#ffffff", "#fff4e8", "#ffe8f0", "#ffe9cc"],
};

export const WARNING_TINT = "#e8c9a0";
