import type { TransitionDefinition, TransitionId } from "./types";

const sharedControls = [
  {
    key: "duration" as const,
    label: "Duration",
    min: 240,
    max: 1200,
    step: 20,
    suffix: "ms",
  },
  {
    key: "intensity" as const,
    label: "Intensity",
    min: 0,
    max: 100,
    step: 2,
  },
  {
    key: "stagger" as const,
    label: "Stagger",
    min: 0,
    max: 220,
    step: 10,
    suffix: "ms",
  },
  {
    key: "radius" as const,
    label: "Radius",
    min: 0,
    max: 120,
    step: 2,
    suffix: "px",
  },
];

export const transitionDefinitions: TransitionDefinition[] = [
  {
    id: "editorial-wipe",
    title: "Editorial Wipe",
    eyebrow: "Collection → Product",
    description:
      "A full-bleed brand panel sweeps across the viewport, giving product-detail pages a clear editorial handoff.",
    useCase:
      "Use when moving from a merchandised collection or campaign page into a featured product detail.",
    mechanics:
      "A cover panel translates across the stage once. The outgoing page holds, then the incoming page is revealed behind the wipe — no reverse on settle.",
    risk: "Can feel heavy on high-frequency category browsing if the duration is too long.",
    engine: "css",
    dependencies: ["React", "CSS custom properties"],
    defaults: {
      duration: 560,
      intensity: 72,
      stagger: 80,
      radius: 8,
      curtains: 6,
    },
    controls: sharedControls,
  },
  {
    id: "product-shelf-slide",
    title: "Product Shelf Slide",
    eyebrow: "Category → Category",
    description:
      "Adjacent pages move like shelves in the same aisle: old content exits left while new content enters from the right.",
    useCase:
      "Use for collection tabs, filtered category routes, or sibling editorial pages with a shared layout.",
    mechanics:
      "Both pages translate on the x-axis with a small scale change. Animation runs forward once, then locks to the settled next page.",
    risk: "Needs clear routing direction so it does not read as a carousel when pages are not siblings.",
    engine: "css",
    dependencies: ["React", "CSS custom properties"],
    defaults: {
      duration: 460,
      intensity: 52,
      stagger: 40,
      radius: 12,
      curtains: 6,
    },
    controls: sharedControls,
  },
  {
    id: "spotlight-iris",
    title: "Spotlight Iris",
    eyebrow: "Campaign → Feature",
    description:
      "A circular reveal opens from a product or CTA region, focusing attention before expanding into the full page.",
    useCase:
      "Use when a click target semantically becomes the next page, such as a hero product tile opening a detail page.",
    mechanics:
      "Incoming page is clipped by an expanding circle while the old page dims. Clip settles fully open — never snaps shut on idle.",
    risk: "Needs a fallback origin for keyboard navigation, direct links, or browser back/forward transitions.",
    engine: "css",
    dependencies: ["React", "CSS clip-path"],
    defaults: {
      duration: 620,
      intensity: 76,
      stagger: 60,
      radius: 100,
      curtains: 6,
    },
    controls: sharedControls,
  },
  {
    id: "receipt-lift",
    title: "Receipt Lift",
    eyebrow: "Cart → Checkout",
    description:
      "The next step rises over the cart like an order sheet, preserving transactional context while moving forward.",
    useCase:
      "Use for cart, checkout, quote, or booking flows where progress should feel concrete and secure.",
    mechanics:
      "Incoming page translates upward over a slightly compressed outgoing page. After completion, only the next page remains visible.",
    risk: "Should not feel like a dismissible modal if the route has fully changed.",
    engine: "css",
    dependencies: ["React", "CSS custom properties"],
    defaults: {
      duration: 520,
      intensity: 64,
      stagger: 30,
      radius: 22,
      curtains: 6,
    },
    controls: sharedControls,
  },
  {
    id: "soft-crossfade-blur",
    title: "Soft Crossfade Blur",
    eyebrow: "Utility → Utility",
    description:
      "A fast opacity bridge with restrained blur for unrelated layouts where direction would be misleading.",
    useCase:
      "Use for account, search, support, or policy pages that do not share a physical navigation metaphor.",
    mechanics:
      "Outgoing page fades and lightly blurs as incoming content resolves. One-shot only — no bounce-back when the phase ends.",
    risk: "Blur can cost more on low-end devices; reduced motion should remove blur and keep a direct fade.",
    engine: "css",
    dependencies: ["React", "CSS filter"],
    defaults: {
      duration: 320,
      intensity: 28,
      stagger: 0,
      radius: 10,
      curtains: 6,
    },
    controls: sharedControls,
  },
  {
    id: "curtain-fall",
    title: "Curtain Fall",
    eyebrow: "Destination reveal",
    description:
      "Vertical curtains drop one by one across the screen. Each strip carries the destination page texture, then settles into the full next view.",
    useCase:
      "Use for campaign landings, lookbook handoffs, or branded route changes where the next page should arrive as a physical reveal.",
      mechanics:
        "Destination page is painted onto staggered strips that fall from above. Desktop can overlay Three.js planes; mobile uses the painted CSS path so the reveal stays visible. Curtain count is live-tunable.",
      risk: "Desktop Three.js path needs WebGL. Mobile always uses the CSS strip cascade so play never blanks.",
    engine: "three",
    dependencies: ["React", "three", "WebGL"],
    defaults: {
      duration: 900,
      intensity: 70,
      stagger: 70,
      radius: 0,
      curtains: 8,
    },
    controls: [
      {
        key: "curtains",
        label: "Curtains",
        min: 3,
        max: 16,
        step: 1,
      },
      {
        key: "duration",
        label: "Duration",
        min: 400,
        max: 1600,
        step: 20,
        suffix: "ms",
      },
      {
        key: "stagger",
        label: "Stagger",
        min: 20,
        max: 180,
        step: 5,
        suffix: "ms",
      },
      {
        key: "intensity",
        label: "Drop depth",
        min: 20,
        max: 100,
        step: 2,
      },
    ],
  },
];

export function getTransitionDefinition(id: TransitionId) {
  return transitionDefinitions.find((transition) => transition.id === id);
}
