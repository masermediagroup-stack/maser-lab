export const COLLAPSED_HEIGHT = 96;
export const EXPANDED_HEIGHT = 272;
export const DRIP_SIZE = 40;
export const DRAG_CLICK_PX = 10;
export const OPEN_THRESHOLD = 0.36;
export const CARD_MAX_WIDTH = 420;

export const COPY = {
  title: "Learn More",
  pullHint: "pull for more info",
  closeHint: "Press to close",
  bodyTitle: "Print, then liquid",
  body: "A dither pulse prints from this heading to the card edge and dissolves. Pull and the grey surface goes gooey — two engines, one drawer.",
} as const;

export const RADIAL_PULSE_PARAMS = {
  speed: 1.05,
  radius: 1.18,
  width: 0.11,
  strength: 0.58,
  falloff: 2.15,
  repeat: 2,
} as const;
