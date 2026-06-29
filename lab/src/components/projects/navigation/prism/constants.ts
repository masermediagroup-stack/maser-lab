export const NAV_ITEM_IDS = [
  "home",
  "explore",
  "library",
  "gallery",
  "profile",
] as const;

export type NavItemId = (typeof NAV_ITEM_IDS)[number];

export type CategoryId = Exclude<NavItemId, "profile">;

export type NavItem = {
  id: NavItemId;
  label: string;
};

export type CategoryItem = {
  id: CategoryId;
  label: string;
};

/** Center nav links — Profile lives in the right-side control */
export const CATEGORY_ITEMS: CategoryItem[] = [
  { id: "home", label: "Home" },
  { id: "explore", label: "Explore" },
  { id: "library", label: "Library" },
  { id: "gallery", label: "Gallery" },
];

export const PROFILE_ITEM: NavItem = { id: "profile", label: "Profile" };

/** @deprecated use CATEGORY_ITEMS — kept for exports */
export const NAV_ITEMS = [...CATEGORY_ITEMS, PROFILE_ITEM];

export const BRAND_NAME = "Prism";

export function isCategoryId(id: NavItemId): id is CategoryId {
  return id !== "profile";
}
