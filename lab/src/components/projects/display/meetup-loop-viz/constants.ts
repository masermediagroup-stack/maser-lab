import type { LoopStep } from "./types";

/** Locked copy 2026-09-05 — verbatim. Do not rewrite. */
export const LOOP_STEPS: readonly LoopStep[] = [
  {
    id: "drop",
    title: "Drop",
    line: "The job lands: audience, offer, format, where it lives.",
  },
  {
    id: "kickoff",
    title: "Kickoff",
    line: "Producer sequences the room so nobody freelances the ask.",
  },
  {
    id: "shape",
    title: "Shape",
    line: "Designer owns the look. Figma when a locked component needs it.",
  },
  {
    id: "package",
    title: "Package",
    line: "design.md locks decisions a stranger can build from.",
  },
  {
    id: "build",
    title: "Build",
    line: "Engineer ships from the package and drops a fresh preview.",
  },
  {
    id: "critique",
    title: "Critique",
    line: "Human times the live canvas. Keep, cut, or recut.",
  },
];

/** Quiet spur copy from design.md — not a 7th step. */
export const GROOT_SPUR_LINE = "when product/IA is unknown.";

export const GROOT_SPUR_LABEL = "Groot";

export const DOTS_PER_CONNECTOR = 4;
