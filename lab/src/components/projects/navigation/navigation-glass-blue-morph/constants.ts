export const NAV_ITEM_IDS = [
  "home",
  "explore",
  "library",
  "gallery",
  "profile",
] as const;

export type NavItemId = (typeof NAV_ITEM_IDS)[number];

export type NavItem = {
  id: NavItemId;
  label: string;
};

export const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home" },
  { id: "explore", label: "Explore" },
  { id: "library", label: "Library" },
  { id: "gallery", label: "Gallery" },
  { id: "profile", label: "Profile" },
];

export const BRAND_NAME = "Prism";
