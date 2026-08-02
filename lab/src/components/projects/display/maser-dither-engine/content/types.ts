import type { ComponentId } from "../types";

/**
 * Live-editable copy & chrome for demo adapters.
 * Every component playground exposes relevant fields.
 */
export type ComponentContent = {
  buttonLabel: string;
  buttonIcon: string;
  badgeLabel: string;
  cardTitle: string;
  cardSubtitle: string;
  cardDescription: string;
  cardButtonLabel: string;
  navBrand: string;
  navItems: string[];
  navActiveIndex: number;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  sectionTitle: string;
  sectionBody: string;
  inputLabel: string;
  inputPlaceholder: string;
  progressLabel: string;
  progressValue: number;
  loaderLabel: string;
  avatarInitials: string;
  imageCaption: string;
  scrollbarNote: string;
  scrollbarThickness: number;
  scrollbarRadius: number;
};

export const DEFAULT_COMPONENT_CONTENT: ComponentContent = {
  buttonLabel: "Continue",
  buttonIcon: "→",
  badgeLabel: "Live",
  cardTitle: "Print Density",
  cardSubtitle: "Ordered media",
  cardDescription:
    "Ordered dither media plane — shared engine, card adapter.",
  cardButtonLabel: "Explore",
  navBrand: "Maser",
  navItems: ["Overview", "Components", "Docs"],
  navActiveIndex: 0,
  heroEyebrow: "Maser",
  heroTitle: "Engineered tone",
  heroDescription: "Full-bleed dither field for brand-forward heroes.",
  sectionTitle: "One job per section",
  sectionBody: "Material atmosphere without card clutter.",
  inputLabel: "Email",
  inputPlaceholder: "you@maser.media",
  progressLabel: "Progress",
  progressValue: 64,
  loaderLabel: "Rendering",
  avatarInitials: "MD",
  imageCaption: "Dither matte · photo stays crisp",
  scrollbarNote: "Visual scrollbar chrome",
  scrollbarThickness: 10,
  scrollbarRadius: 6,
};

export function contentForComponent(
  id: ComponentId,
  base: ComponentContent = DEFAULT_COMPONENT_CONTENT,
): ComponentContent {
  return { ...base, navItems: [...base.navItems] };
}

export type ContentFieldKey = keyof ComponentContent;
