export type NavItemId =
  | "features"
  | "faq"
  | "updates"
  | "integrations"
  | "pricing";

export type NavItem = {
  id: NavItemId;
  label: string;
};

export const NAV_ITEMS: NavItem[] = [
  { id: "features", label: "Features" },
  { id: "faq", label: "FAQ" },
  { id: "updates", label: "Updates" },
  { id: "integrations", label: "Integrations" },
  { id: "pricing", label: "Pricing" },
];

export const BRAND_NAME = "Plotline";
