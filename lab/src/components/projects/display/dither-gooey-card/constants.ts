export const COLLAPSED_HEIGHT = 80;
export const EXPANDED_HEIGHT = 272;
export const DRIP_SIZE = 48;
/** Hang the droplet from the collapsed bar's bottom-center. Does not travel with open. */
export const DRIP_Y = COLLAPSED_HEIGHT - DRIP_SIZE * 0.42;
export const DRAG_CLICK_PX = 10;
export const OPEN_THRESHOLD = 0.36;
export const CARD_MAX_WIDTH = 420;

export const DEFAULT_BACKGROUND = "#4a4a4e";
export const DEFAULT_TEXT = "#f6f6f4";

export const COPY = {
  title: "Learn More",
  closeHint: "Press to close",
  bodyTitle: "More to read",
  body: "Grab the arrow and pull down to open. Press the bottom edge to collapse. The surface stays behind the type.",
} as const;
