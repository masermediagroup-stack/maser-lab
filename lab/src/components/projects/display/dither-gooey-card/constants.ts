export const COLLAPSED_HEIGHT = 80;
export const EXPANDED_HEIGHT = 272;
export const DRIP_SIZE = 48;
/** How far the droplet hangs below the visual card edge. */
export const DRIP_OVERLAP = DRIP_SIZE * 0.42;
export const DRIP_HANG = DRIP_SIZE - DRIP_OVERLAP;
export const DRAG_CLICK_PX = 10;
export const OPEN_THRESHOLD = 0.36;
export const CARD_MAX_WIDTH = 420;

export const DEFAULT_BACKGROUND = "#4a4a4e";
export const DEFAULT_TEXT = "#f6f6f4";

export const COPY = {
  title: "Learn More",
  closeHint: "Pull up to close",
  bodyTitle: "More to read",
  body: "Grab the arrow and pull down to open. Pull up or tap the arrow to close. The surface stays behind the type.",
} as const;
