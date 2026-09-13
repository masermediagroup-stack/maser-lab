import type { MouseEvent } from "react";

export type FrostNavId = "home" | "work" | "contact";

export type FrostNavShell =
  | "dim-peek"
  | "glowing-peek"
  | "expanded-quiet"
  | "expanded-slot";

export type FrostNavItem = {
  id: FrostNavId;
  href: string;
  label: "Home" | "Work" | "Contact";
};

export type TylerGlassNavProps = {
  pathname?: string;
  items?: readonly FrostNavItem[];
  forceExpanded?: boolean;
  forceReducedMotion?: boolean;
  forceReducedTransparency?: boolean;
  forceShell?: FrostNavShell;
  forceSlotHover?: FrostNavId | null;
  onNavigate?: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
};

export type FrostNavIconProps = {
  solid: boolean;
};
