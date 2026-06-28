import type { ComponentType } from "react";
import { PlotlineTabNavDemo } from "./navigation/plotline-tab-nav/plotline-tab-nav-demo";

export const demoRegistry: Record<string, ComponentType> = {
  "plotline-tab-nav": PlotlineTabNavDemo,
};

export function registerDemo(slug: string, component: ComponentType) {
  demoRegistry[slug] = component;
}
