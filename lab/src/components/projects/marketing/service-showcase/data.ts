import type { ServiceItem } from "./types";

/**
 * Replace this array (or pass `items` to `ServiceShowcase`) to reuse the section
 * on any landing page. Keep `comparison` only on tabs that need before/after.
 */
export const SERVICE_ITEMS: ServiceItem[] = [
  {
    id: "residential",
    label: "Residential",
    title: "Residential Junk Removal",
    description:
      "We remove furniture, appliances, mattresses, yard debris, and unwanted household items with fast scheduling and transparent pricing.",
    cta: { label: "Get a free estimate", href: "#estimate" },
    image: {
      src: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80",
      alt: "Clean residential living room after junk removal",
    },
    comparison: {
      before: {
        src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1600&q=80",
        alt: "Cluttered residential garage before cleanup",
      },
      after: {
        src: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80",
        alt: "Clean residential space after junk removal",
      },
    },
  },
  {
    id: "commercial",
    label: "Commercial",
    title: "Commercial Junk Removal",
    description:
      "Office cleanouts, retail resets, and property turnover — scheduled around your business hours with licensed, insured crews.",
    cta: { label: "Book commercial pickup", href: "#commercial" },
    image: {
      src: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
      alt: "Modern commercial office interior",
    },
    comparison: {
      before: {
        src: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80",
        alt: "Commercial space with leftover equipment before removal",
      },
      after: {
        src: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
        alt: "Cleared commercial office after junk removal",
      },
    },
  },
  {
    id: "industrial",
    label: "Industrial",
    title: "Industrial Junk Removal",
    description:
      "Heavy debris, scrap, and facility clear-outs handled with the right equipment — safe disposal and documentation included.",
    cta: { label: "Request industrial quote", href: "#industrial" },
    image: {
      src: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1600&q=80",
      alt: "Industrial warehouse floor",
    },
    comparison: {
      before: {
        src: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1600&q=80",
        alt: "Industrial site with scrap materials before cleanup",
      },
      after: {
        src: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1600&q=80",
        alt: "Cleared industrial facility after junk removal",
      },
    },
  },
  {
    id: "daily-rentals",
    label: "Daily Rentals",
    title: "Daily Dumpster Rentals",
    description:
      "Same-day drop-off for short projects. Choose the right size roll-off, fill at your pace, and we’ll haul it away on schedule.",
    cta: { label: "Reserve a dumpster", href: "#daily-rentals" },
    image: {
      src: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1600&q=80",
      alt: "Dumpster rental delivered to a worksite",
    },
  },
  {
    id: "weekly-rentals",
    label: "Weekly Rentals",
    title: "Weekly Dumpster Rentals",
    description:
      "Flexible multi-day rentals for renovations and ongoing cleanouts — predictable pricing with pickup when you’re ready.",
    cta: { label: "See weekly rates", href: "#weekly-rentals" },
    image: {
      src: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80",
      alt: "Construction site with roll-off dumpster",
    },
  },
];
