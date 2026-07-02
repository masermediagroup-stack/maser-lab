import type { ControlGroup } from "./types";

export const CONTROL_GROUP_LABELS: Record<ControlGroup, string> = {
  content: "Content",
  timing: "Timing",
  motion: "Motion",
  style: "Style",
  interaction: "Interaction",
  export: "Export",
};

export const CONTROL_GROUP_ORDER: ControlGroup[] = [
  "content",
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
