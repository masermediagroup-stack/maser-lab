import type { CSSProperties } from "react";

export type AgentSwarmMode =
  | "swap"
  | "shuffle"
  | "pulse"
  | "resolve"
  | "cascade"
  | "route"
  | "orbit"
  | "process";

export type AgentSwarmStatus = "idle" | "loading" | "success" | "error";

export type AgentSwarmColorMode = "white" | "spectral" | "cool" | "warm" | "custom";

export type AgentSwarmBackground = "black" | "transparent" | "custom";

export type AgentSwarmInteraction = "off" | "repel" | "attract" | "tap-swap";

export type AgentSwarmNodeCount = 6 | 10 | 15;

export type CyclePhase = "idle" | "planning" | "moving" | "settling" | "waiting";

export type Vec2 = {
  x: number;
  y: number;
};

export type Anchor = {
  id: number;
  row: number;
  column: number;
  x: number;
  y: number;
};

export type Movement = {
  agentId: number;
  fromAnchor: number;
  toAnchor: number;
  delay: number;
  duration: number;
  curvature: number;
  direction: 1 | -1;
};

export type CubicBezier = {
  p0: Vec2;
  p1: Vec2;
  p2: Vec2;
  p3: Vec2;
};

export type DebugSnapshot = {
  phase: CyclePhase;
  cycleIndex: number;
  occupancy: number[];
  moves: Movement[];
  paths: CubicBezier[];
};

/** Reserved for a future live agent-status mapping. Unwired in V1. */
export type AgentActivityStatus =
  | "idle"
  | "queued"
  | "thinking"
  | "executing"
  | "waiting"
  | "handoff"
  | "complete"
  | "failed";

export type AgentActivity = {
  id: string;
  status: AgentActivityStatus;
};

export type AgentSwarmParams = {
  nodeCount: AgentSwarmNodeCount;
  horizontalSpacing: number;
  verticalSpacing: number;
  nodeSize: number;
  animation: boolean;
  speed: number;
  travelDuration: number;
  idleDuration: number;
  settleDuration: number;
  stagger: number;
  pathCurvature: number;
  randomness: number;
  movementDistance: number;
  activeAgentPercentage: number;
  seed: string;
  mode: AgentSwarmMode;
  colorMode: AgentSwarmColorMode;
  customPalette: string[];
  glowIntensity: number;
  glowRadius: number;
  bloomStrength: number;
  coreBrightness: number;
  atmosphericGlow: number;
  trailOpacity: number;
  trailLength: number;
  background: AgentSwarmBackground;
  customBackground: string;
  interaction: AgentSwarmInteraction;
  pointerRadius: number;
  pointerStrength: number;
  debug: boolean;
  status: AgentSwarmStatus;
};

export type AgentSwarmProps = {
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
  mode?: AgentSwarmMode;
  seed?: string | number;
  nodeCount?: AgentSwarmNodeCount;
  speed?: number;
  loading?: boolean;
  status?: AgentSwarmStatus;
  colorMode?: AgentSwarmColorMode;
  paused?: boolean;
  reducedMotion?: boolean;
  params?: Partial<AgentSwarmParams>;
  onDebug?: (snapshot: DebugSnapshot) => void;
};
