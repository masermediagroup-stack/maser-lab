import type { PageSample } from "./types";

/** Preview pages — landing wireframe → article wireframe. */
export const pageSamples: PageSample[] = [
  {
    id: "landing",
    kind: "landing",
    path: "/",
    brand: "Northline",
    title: "Build quieter digital products",
    accent: "#10a4ff",
  },
  {
    id: "article",
    kind: "article",
    path: "/journal/route-transitions",
    brand: "Northline",
    title: "How route transitions should feel",
    accent: "#10a4ff",
  },
];

export function getNeighborPage(index: number) {
  return (index + 1) % pageSamples.length;
}
