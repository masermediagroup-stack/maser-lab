import type { ComponentType } from "react";
import { PlotlineTabNavDemo } from "./navigation/plotline-tab-nav/plotline-tab-nav-demo";
import { PrismNavDemo } from "./navigation/navigation-glass-blue-morph/prism-nav-demo";

export const demoRegistry: Record<string, ComponentType> = {
  "plotline-tab-nav": PlotlineTabNavDemo,
  "navigation-glass-blue-morph": PrismNavDemo,
};

export function registerDemo(slug: string, component: ComponentType) {
  demoRegistry[slug] = component;
}
