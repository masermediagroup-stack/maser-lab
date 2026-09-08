export const LOOP_STEP_IDS = [
  "drop",
  "kickoff",
  "shape",
  "package",
  "build",
  "critique",
] as const;

export type LoopStepId = (typeof LOOP_STEP_IDS)[number];

export type LoopFocus = LoopStepId | "all";

export type LoopStep = {
  id: LoopStepId;
  title: string;
  line: string;
};

export type MeetupLoopVizProps = {
  focusedStep?: LoopFocus;
  showGrootSpur?: boolean;
  forceReducedMotion?: boolean;
};
