import type { ComponentType } from "react";
import { BlobbyRotationDemo } from "./feedback/blobby-rotation-loader";
import { PlotlineTabNavDemo } from "./navigation/plotline-tab-nav/plotline-tab-nav-demo";
import { PrismNavDemo } from "./navigation/prism/prism-nav-demo";
import { SummitPathSignUpDemo } from "./sign-up/summitpath-sign-up";
import { MakeYourDayCalendarDemo } from "./web-apps/makeyourday-calendar";
import { LiquidMonochromeDemo } from "./scroll/liquid-monochrome";
import { TextAnimationLabDemo } from "./display/text-animation-lab";

export const demoRegistry: Record<string, ComponentType> = {
  "liquid-monochrome": LiquidMonochromeDemo,
  "blobby-rotation-loader": BlobbyRotationDemo,
  "makeyourday-calendar": MakeYourDayCalendarDemo,
  "plotline-tab-nav": PlotlineTabNavDemo,
  prism: PrismNavDemo,
  "summitpath-sign-up": SummitPathSignUpDemo,
  "text-animation-lab": TextAnimationLabDemo,
};

export function registerDemo(slug: string, component: ComponentType) {
  demoRegistry[slug] = component;
}
