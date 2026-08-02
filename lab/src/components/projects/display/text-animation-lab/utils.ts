import type { ControlGroup } from "./types";

export const CONTROL_GROUP_LABELS: Record<ControlGroup, string> = {
  content: "Content",
  quality: "Quality",
  animation: "Animation",
  appearance: "Appearance",
  advanced: "Advanced Motion",
  timing: "Timing",
  motion: "Motion",
  style: "Style",
  interaction: "Interaction",
  export: "Randomization & Export",
};

export const CONTROL_GROUP_ORDER: ControlGroup[] = [
  "content",
  "quality",
  "animation",
  "appearance",
  "advanced",
  "timing",
  "motion",
  "style",
  "interaction",
  "export",
];

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
