import type { PageSample } from "./types";

/** Preview pages — Maser blue / white only. */
export const pageSamples: PageSample[] = [
  {
    id: "collection",
    path: "/shop/spring",
    label: "Collection",
    title: "Spring",
    kicker: "New",
    accent: "#10a4ff",
  },
  {
    id: "product",
    path: "/shop/pour-set",
    label: "Product",
    title: "Pour Set",
    kicker: "Featured",
    accent: "#10a4ff",
  },
  {
    id: "cart",
    path: "/cart",
    label: "Cart",
    title: "Bag",
    kicker: "Ready",
    accent: "#0097f5",
  },
];

export function getNeighborPage(index: number) {
  return (index + 1) % pageSamples.length;
}
