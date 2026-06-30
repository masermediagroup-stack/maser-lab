import type { ComponentType } from "react";
import { BlobbyRotationDemo } from "./feedback/blobby-rotation-loader";
import { PlotlineTabNavDemo } from "./navigation/plotline-tab-nav/plotline-tab-nav-demo";
import { PrismNavDemo } from "./navigation/prism/prism-nav-demo";
import { SummitPathSignUpDemo } from "./sign-up/summitpath-sign-up";

export const demoRegistry: Record<string, ComponentType> = {
  "blobby-rotation-loader": BlobbyRotationDemo,
  "plotline-tab-nav": PlotlineTabNavDemo,
  prism: PrismNavDemo,
  "summitpath-sign-up": SummitPathSignUpDemo,
};

export function registerDemo(slug: string, component: ComponentType) {
  demoRegistry[slug] = component;
}
