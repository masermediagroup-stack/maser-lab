import type { TransitionDefinition, TransitionId } from "./types";

export const transitionDefinitions: TransitionDefinition[] = [
  {
    id: "editorial-wipe",
    title: "Editorial Wipe",
    eyebrow: "Collection -> Product",
    description:
      "A full-bleed brand panel sweeps across the viewport, giving product-detail pages a clear editorial handoff.",
    useCase:
      "Use when moving from a merchandised collection or campaign page into a featured product detail.",
    mechanics:
      "Outgoing page holds position, a cover panel translates across the stage, and the incoming page fades in behind it.",
    risk: "Can feel heavy on high-frequency category browsing if the duration is too long.",
    dependencies: ["React", "CSS custom properties"],
    defaults: { duration: 560, intensity: 72, stagger: 80, radius: 8 },
  },
  {
    id: "product-shelf-slide",
    title: "Product Shelf Slide",
    eyebrow: "Category -> Category",
    description:
      "Adjacent pages move like shelves in the same aisle: old content exits left while new content enters from the right.",
    useCase:
      "Use for collection tabs, filtered category routes, or sibling editorial pages with a shared layout.",
    mechanics:
      "Both pages translate on the x-axis with a small scale change to preserve depth and direction.",
    risk: "Needs clear routing direction so it does not read as a carousel when pages are not siblings.",
    dependencies: ["React", "CSS custom properties"],
    defaults: { duration: 460, intensity: 52, stagger: 40, radius: 12 },
  },
  {
    id: "spotlight-iris",
    title: "Spotlight Iris",
    eyebrow: "Campaign -> Feature",
    description:
      "A circular reveal opens from a product or CTA region, focusing attention before expanding into the full page.",
    useCase:
      "Use when a click target semantically becomes the next page, such as a hero product tile opening a detail page.",
    mechanics:
      "Incoming page is clipped by an expanding circle while the old page dims and settles backward.",
    risk: "Needs a fallback origin for keyboard navigation, direct links, or browser back/forward transitions.",
    dependencies: ["React", "CSS clip-path"],
    defaults: { duration: 620, intensity: 76, stagger: 60, radius: 100 },
  },
  {
    id: "receipt-lift",
    title: "Receipt Lift",
    eyebrow: "Cart -> Checkout",
    description:
      "The next step rises over the cart like an order sheet, preserving transactional context while moving forward.",
    useCase:
      "Use for cart, checkout, quote, or booking flows where progress should feel concrete and secure.",
    mechanics:
      "Incoming page translates upward over a slightly compressed outgoing page with a controlled shadow.",
    risk: "Should not feel like a dismissible modal if the route has fully changed.",
    dependencies: ["React", "CSS custom properties"],
    defaults: { duration: 520, intensity: 64, stagger: 30, radius: 22 },
  },
  {
    id: "soft-crossfade-blur",
    title: "Soft Crossfade Blur",
    eyebrow: "Utility -> Utility",
    description:
      "A fast opacity bridge with restrained blur for unrelated layouts where direction would be misleading.",
    useCase:
      "Use for account, search, support, or policy pages that do not share a physical navigation metaphor.",
    mechanics:
      "Outgoing page fades and lightly blurs as incoming content resolves without directional travel.",
    risk: "Blur can cost more on low-end devices; reduced motion should remove blur and keep a direct fade.",
    dependencies: ["React", "CSS filter"],
    defaults: { duration: 320, intensity: 28, stagger: 0, radius: 10 },
  },
];

export function getTransitionDefinition(id: TransitionId) {
  return transitionDefinitions.find((transition) => transition.id === id);
}
