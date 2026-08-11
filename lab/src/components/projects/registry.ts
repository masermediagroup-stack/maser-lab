import type { ComponentType } from "react";
import { BlobbyRotationDemo } from "./feedback/blobby-rotation-loader";
import { PlotlineTabNavDemo } from "./navigation/plotline-tab-nav/plotline-tab-nav-demo";
import { PrismNavDemo } from "./navigation/prism/prism-nav-demo";
import { SummitPathSignUpDemo } from "./sign-up/summitpath-sign-up";
import { MakeYourDayCalendarDemo } from "./web-apps/makeyourday-calendar/makeyourday-calendar-demo";
import { LiquidMonochromeDemo } from "./scroll/liquid-monochrome";
import { TextAnimationLabDemo } from "./display/text-animation-lab";
import { PageTransitionsLabDemo } from "./layout/page-transitions-lab";
import { KineticPerspectiveBarsDemo } from "./display/kinetic-perspective-bars";
import { MaserDitherEngineDemo } from "./display/maser-dither-engine/maser-dither-engine-demo";
import { ServiceShowcaseDemo } from "./marketing/service-showcase";
import { PixelInfoCardDemo } from "./display/pixel-info-card/pixel-info-card-demo";
import { BrandCaseStudioDemo } from "./web-apps/brand-case-studio/brand-case-studio-demo";

export const demoRegistry: Record<string, ComponentType> = {
  "liquid-monochrome": LiquidMonochromeDemo,
  "blobby-rotation-loader": BlobbyRotationDemo,
  "makeyourday-calendar": MakeYourDayCalendarDemo,
  "plotline-tab-nav": PlotlineTabNavDemo,
  prism: PrismNavDemo,
  "page-transitions-lab": PageTransitionsLabDemo,
  "summitpath-sign-up": SummitPathSignUpDemo,
  "text-animation-lab": TextAnimationLabDemo,
  "kinetic-perspective-bars": KineticPerspectiveBarsDemo,
  "maser-dither-engine": MaserDitherEngineDemo,
  "service-showcase": ServiceShowcaseDemo,
  "pixel-info-card": PixelInfoCardDemo,
  "brand-case-studio": BrandCaseStudioDemo,
};

export function registerDemo(slug: string, component: ComponentType) {
  demoRegistry[slug] = component;
}
