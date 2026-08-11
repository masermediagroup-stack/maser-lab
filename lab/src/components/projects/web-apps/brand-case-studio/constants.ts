export const STORAGE_KEY = "brand-case-studio:v1";
export const STORAGE_VERSION = 1;

export const BCS_DEFAULTS = {
  animationEnabled: true,
  revealDurationMs: 320,
  spacingScale: 1,
} as const;

export const DESKTOP_FRAME = { width: 1280, height: 900 } as const;
export const MOBILE_FRAME = { width: 390, height: 844 } as const;

export const SECTION_TEMPLATES = [
  { type: "overview" as const, title: "Overview", placeholder: "Project context and goals…" },
  { type: "challenge" as const, title: "Challenge", placeholder: "What problem did the brand need to solve?" },
  { type: "approach" as const, title: "Approach", placeholder: "Strategy, process, and creative direction…" },
  { type: "results" as const, title: "Results", placeholder: "Outcomes, metrics, or client feedback…" },
] as const;

export const ASSET_KIND_LABELS: Record<string, string> = {
  logo: "Logo",
  color: "Color",
  typography: "Typography",
  photo: "Photography",
  guideline: "Guideline",
  video: "Video",
};
