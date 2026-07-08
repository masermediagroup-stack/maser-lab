import type { PageSample } from "./types";

export const pageSamples: PageSample[] = [
  {
    id: "collection",
    path: "/shop/spring-objects",
    label: "Collection",
    title: "Spring Objects",
    kicker: "New arrivals",
    items: ["Stoneware Set", "Linen Overshirt", "Oak Tray"],
    accent: "#8fa896",
  },
  {
    id: "product",
    path: "/shop/ceramic-pour-set",
    label: "Product",
    title: "Ceramic Pour Set",
    kicker: "Featured piece",
    items: ["Matte glaze", "Ships in 2 days", "$84"],
    accent: "#c4a574",
  },
  {
    id: "cart",
    path: "/cart",
    label: "Cart",
    title: "Your bag",
    kicker: "2 items",
    items: ["Pour Set × 1", "Oak Tray × 1", "Subtotal $142"],
    accent: "#9a8f7a",
  },
];

export function getNeighborPage(index: number): number {
  return (index + 1) % pageSamples.length;
}
