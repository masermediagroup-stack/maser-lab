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
  dropdownItems?: string[];
};

export const CENTER_NAV_ITEMS: NavItem[] = [
  {
    id: "features",
    label: "Features",
    dropdownItems: [
      "Product Tours",
      "Conversion Funnels",
      "Event Tracking",
      "User Segments",
      "Analytics Dashboard",
      "A/B Experiments",
    ],
  },
  { id: "faq", label: "FAQ" },
  { id: "updates", label: "Updates" },
  {
    id: "integrations",
    label: "Integrations",
    dropdownItems: [
      "Stripe",
      "Webflow",
      "Framer",
      "Shopify",
      "HubSpot",
      "Zapier",
      "API Access",
    ],
  },
  { id: "pricing", label: "Pricing" },
];

export const SIGN_IN_ITEM: NavItem = { id: "sign-in", label: "Sign in" };

/** All navigable tabs including Sign in, for typing and demo state. */
export const NAV_ITEMS: NavItem[] = [...CENTER_NAV_ITEMS, SIGN_IN_ITEM];

export const BRAND_NAME = "Plotline";
