export type NavItemId =
  | "features"
  | "faq"
  | "updates"
  | "integrations"
  | "pricing"
  | "sign-in";

export type NavItem = {
  id: NavItemId;
  label: string;
};

export const CENTER_NAV_ITEMS: NavItem[] = [
  { id: "features", label: "Features" },
  { id: "faq", label: "FAQ" },
  { id: "updates", label: "Updates" },
  { id: "integrations", label: "Integrations" },
  { id: "pricing", label: "Pricing" },
];

export const SIGN_IN_ITEM: NavItem = { id: "sign-in", label: "Sign in" };

/** All navigable tabs including Sign in (for typing / demo state). */
export const NAV_ITEMS: NavItem[] = [...CENTER_NAV_ITEMS, SIGN_IN_ITEM];

export const BRAND_NAME = "Plotline";
