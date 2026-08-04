import type { ComponentId } from "../types";

/**
 * Live-editable copy & chrome for demo adapters.
 * Every component playground exposes relevant fields.
 */
export type AvatarShape = "circle" | "rounded" | "square";
export type AvatarMode = "initials" | "image" | "placeholder";
export type AvatarPresence = "online" | "away" | "busy" | "offline";
export type AvatarSizeToken = "sm" | "md" | "lg" | "xl";
/** Shared preview size tokens for badge / loader / progress / scrollbar. */
export type ChromeSizeToken = "sm" | "md" | "lg" | "xl";

export type ImageAspectId =
  | "1:1"
  | "4:3"
  | "3:2"
  | "16:9"
  | "9:16"
  | "21:9"
  | "custom";

export type ImageFitMode = "cover" | "contain" | "fill";

export type ScrollbarOrientation = "vertical" | "horizontal";

export type ChromeCorner = "pill" | "rounded" | "soft" | "square";
export type LabelBlendMode = "solid" | "exclusion";

export type ComponentContent = {
  buttonLabel: string;
  buttonIcon: string;
  badgeLabel: string;
  badgeSize: ChromeSizeToken;
  /** Corner radius preset for button / badge (and similar chrome). */
  chromeCorner: ChromeCorner;
  /** Solid hex color for text sitting on dither fills. */
  labelColor: string;
  /** `solid` = opaque label; `exclusion` = invert against the fill. */
  labelBlend: LabelBlendMode;
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
  progressSize: ChromeSizeToken;
  /** When true, fill loops 0→100 independently of progressValue. */
  progressAuto: boolean;
  /** Cycles per second when progressAuto is on (0.05–1). */
  progressSpeed: number;
  loaderLabel: string;
  loaderSize: ChromeSizeToken;
  /** Spin rate multiplier for the loader ring (0.25–3). */
  loaderSpeed: number;
  avatarInitials: string;
  avatarShape: AvatarShape;
  avatarMode: AvatarMode;
  avatarSize: AvatarSizeToken;
  avatarShowPresence: boolean;
  avatarPresence: AvatarPresence;
  avatarBorder: number;
  avatarGlow: number;
  imageCaption: string;
  imageAspect: ImageAspectId;
  imageCustomAspect: number;
  imageFit: ImageFitMode;
  imageRadius: number;
  imagePadding: number;
  imageBorder: number;
  imageOverlay: number;
  scrollbarNote: string;
  scrollbarSize: ChromeSizeToken;
  scrollbarThickness: number;
  scrollbarRadius: number;
  scrollbarOrientation: ScrollbarOrientation;
  scrollbarProgress: number;
};

export const DEFAULT_COMPONENT_CONTENT: ComponentContent = {
  buttonLabel: "Continue",
  buttonIcon: "→",
  badgeLabel: "Live",
  badgeSize: "md",
  chromeCorner: "pill",
  labelColor: "#ffffff",
  labelBlend: "solid",
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
  progressSize: "md",
  progressAuto: true,
  progressSpeed: 0.22,
  loaderLabel: "Rendering",
  loaderSize: "md",
  loaderSpeed: 1,
  avatarInitials: "MD",
  avatarShape: "circle",
  avatarMode: "initials",
  avatarSize: "lg",
  avatarShowPresence: true,
  avatarPresence: "online",
  avatarBorder: 2,
  avatarGlow: 0.35,
  imageCaption: "Upload a photo to dither",
  imageAspect: "16:9",
  imageCustomAspect: 1.777,
  imageFit: "cover",
  imageRadius: 12,
  imagePadding: 0,
  imageBorder: 1,
  imageOverlay: 0,
  scrollbarNote: "Drag the thumb · scroll the pane",
  scrollbarSize: "md",
  scrollbarThickness: 14,
  scrollbarRadius: 8,
  scrollbarOrientation: "vertical",
  scrollbarProgress: 0.22,
};

export const AVATAR_SIZE_PX: Record<AvatarSizeToken, number> = {
  sm: 40,
  md: 56,
  lg: 80,
  xl: 112,
};

export const BADGE_SIZE: Record<
  ChromeSizeToken,
  { height: number; padX: number; font: number }
> = {
  sm: { height: 22, padX: 8, font: 10 },
  md: { height: 28, padX: 11, font: 11 },
  lg: { height: 34, padX: 14, font: 12 },
  xl: { height: 42, padX: 16, font: 13 },
};

export const LOADER_SIZE_PX: Record<ChromeSizeToken, number> = {
  sm: 40,
  md: 56,
  lg: 72,
  xl: 96,
};

export const PROGRESS_SIZE: Record<
  ChromeSizeToken,
  { height: number; width: number }
> = {
  sm: { height: 6, width: 240 },
  md: { height: 10, width: 320 },
  lg: { height: 14, width: 400 },
  xl: { height: 20, width: 480 },
};

export const SCROLLBAR_SIZE: Record<
  ChromeSizeToken,
  { thickness: number; stage: number }
> = {
  sm: { thickness: 10, stage: 160 },
  md: { thickness: 14, stage: 200 },
  lg: { thickness: 18, stage: 240 },
  xl: { thickness: 24, stage: 280 },
};

export const CHROME_SIZE_OPTIONS: { id: ChromeSizeToken; label: string }[] = [
  { id: "sm", label: "SM" },
  { id: "md", label: "MD" },
  { id: "lg", label: "LG" },
  { id: "xl", label: "XL" },
];

export const IMAGE_ASPECT_RATIO: Record<Exclude<ImageAspectId, "custom">, number> =
  {
    "1:1": 1,
    "4:3": 4 / 3,
    "3:2": 3 / 2,
    "16:9": 16 / 9,
    "9:16": 9 / 16,
    "21:9": 21 / 9,
  };

export function resolveImageAspect(content: ComponentContent): number {
  if (content.imageAspect === "custom") {
    return Math.max(0.35, Math.min(3.5, content.imageCustomAspect || 1));
  }
  return IMAGE_ASPECT_RATIO[content.imageAspect];
}

export function contentForComponent(
  id: ComponentId,
  base: ComponentContent = DEFAULT_COMPONENT_CONTENT,
): ComponentContent {
  return { ...base, navItems: [...base.navItems] };
}

export type ContentFieldKey = keyof ComponentContent;
