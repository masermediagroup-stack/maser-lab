import type { ComponentType } from "react";

export const demoRegistry: Record<string, ComponentType> = {};

export function registerDemo(slug: string, component: ComponentType) {
  demoRegistry[slug] = component;
}
