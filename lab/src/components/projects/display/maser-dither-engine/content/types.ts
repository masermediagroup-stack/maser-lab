import type { ComponentId } from "../types";

/**
 * Live-editable copy & chrome for demo adapters.
 * Every component playground exposes relevant fields.
 */
export type AvatarShape = "circle" | "rounded" | "square";
export type AvatarMode = "initials" | "image" | "placeholder";
export type AvatarPresence = "online" | "away" | "busy" | "offline";
export type AvatarSizeToken = "sm" | "md" | "lg" | "xl";

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
  scrollbarThickness: number;
  scrollbarRadius: number;
  scrollbarOrientation: ScrollbarOrientation;
  scrollbarProgress: number;
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
