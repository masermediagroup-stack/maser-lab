export const SS_DEFAULTS = {
  activeId: "residential",
  panelDurationMs: 300,
  tabDurationMs: 250,
  borderRadiusPx: 24,
  spacingScale: 1,
  imageMode: "auto" as const,
  animationEnabled: true,
} as const;

export const SS_RANGES = {
  panelDurationMs: { min: 150, max: 600, step: 10 },
  borderRadiusPx: { min: 16, max: 32, step: 1 },
  spacingScale: { min: 0.85, max: 1.25, step: 0.01 },
} as const;

export const DESKTOP_FRAME = { width: 1280, height: 820 } as const;
export const MOBILE_FRAME = { width: 390, height: 844 } as const;

/** Shared layoutId so the active pill animates across tab remounts within one showcase. */
export const SS_PILL_LAYOUT_ID = "ss-active-pill";
