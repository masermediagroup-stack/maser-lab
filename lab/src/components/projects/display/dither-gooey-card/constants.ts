export const COLLAPSED_HEIGHT = 72;
export const EXPANDED_HEIGHT = 196;
/** Transparent hit target covering the hanging droplet. */
export const HANDLE_SIZE = 100;
/** Extra stage room for the static gooey bulge below the rect. */
export const GOOEY_HANG = 84;
/** How far the gooey drip cluster overlaps the visual card bottom. */
export const DRIP_OVERLAP = 52;
export const DRAG_CLICK_PX = 10;
export const OPEN_THRESHOLD = 0.36;
export const CARD_MAX_WIDTH = 352;

export const DEFAULT_BACKGROUND = "#4a4a4e";
export const DEFAULT_TEXT = "#f6f6f4";

export const COPY = {
  title: "Learn More",
  closeHint: "Pull up to close",
  bodyTitle: "More to read",
  body: "Grab the arrow and pull down to open. Pull up or tap the arrow to close. The surface stays behind the type.",
} as const;
