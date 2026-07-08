import type { TransitionDefinition, TransitionId } from "./types";
import { defaultCurtainLook } from "./types";

const sharedControls = [
  {
    key: "duration" as const,
    label: "Duration",
    min: 240,
    max: 1200,
    step: 20,
    suffix: "ms",
  },
  {
    key: "intensity" as const,
    label: "Intensity",
    min: 0,
    max: 100,
    step: 2,
  },
  {
    key: "stagger" as const,
    label: "Stagger",
    min: 0,
    max: 220,
    step: 10,
    suffix: "ms",
  },
  {
    key: "radius" as const,
    label: "Radius",
    min: 0,
    max: 120,
    step: 2,
    suffix: "px",
  },
];

const sharedDefaults = {
  ...defaultCurtainLook,
};

export const transitionDefinitions: TransitionDefinition[] = [
  {
    id: "editorial-wipe",
    title: "Editorial Wipe",
    eyebrow: "Collection → Product",
    engine: "css",
    dependencies: ["React", "CSS custom properties"],
    defaults: {
      ...sharedDefaults,
      duration: 560,
      intensity: 72,
      stagger: 80,
      radius: 8,
      curtains: 6,
    },
    controls: sharedControls,
  },
  {
    id: "product-shelf-slide",
    title: "Product Shelf Slide",
    eyebrow: "Category → Category",
    engine: "css",
    dependencies: ["React", "CSS custom properties"],
    defaults: {
      ...sharedDefaults,
      duration: 460,
      intensity: 52,
      stagger: 40,
      radius: 12,
      curtains: 6,
    },
    controls: sharedControls,
  },
  {
    id: "spotlight-iris",
    title: "Spotlight Iris",
    eyebrow: "Campaign → Feature",
    engine: "css",
    dependencies: ["React", "CSS clip-path"],
    defaults: {
      ...sharedDefaults,
      duration: 620,
      intensity: 76,
      stagger: 60,
      radius: 100,
      curtains: 6,
    },
    controls: sharedControls,
  },
  {
    id: "receipt-lift",
    title: "Receipt Lift",
    eyebrow: "Cart → Checkout",
    engine: "css",
    dependencies: ["React", "CSS custom properties"],
    defaults: {
      ...sharedDefaults,
      duration: 520,
      intensity: 64,
      stagger: 30,
      radius: 22,
      curtains: 6,
    },
    controls: sharedControls,
  },
  {
    id: "soft-crossfade-blur",
    title: "Soft Crossfade Blur",
    eyebrow: "Utility → Utility",
    engine: "css",
    dependencies: ["React", "CSS filter"],
    defaults: {
      ...sharedDefaults,
      duration: 320,
      intensity: 28,
      stagger: 0,
      radius: 10,
      curtains: 6,
    },
    controls: sharedControls,
  },
  {
    id: "curtain-fall",
    title: "Curtain Fall",
    eyebrow: "Destination reveal",
    engine: "three",
    dependencies: ["React", "three", "WebGL"],
    defaults: {
      duration: 900,
      intensity: 70,
      stagger: 70,
      radius: 0,
      curtains: 8,
      curtainColorA: "#071018",
      curtainColorB: "#10a4ff",
      curtainGradient: "vertical",
    },
    controls: [
      {
        key: "curtains",
        label: "Curtains",
        min: 3,
        max: 16,
        step: 1,
      },
      {
        key: "duration",
        label: "Duration",
        min: 400,
        max: 1600,
        step: 20,
        suffix: "ms",
      },
      {
        key: "stagger",
        label: "Stagger",
        min: 20,
        max: 180,
        step: 5,
        suffix: "ms",
      },
      {
        key: "intensity",
        label: "Drop depth",
        min: 20,
        max: 100,
        step: 2,
      },
      {
        type: "color",
        key: "curtainColorA",
        label: "Color A",
      },
      {
        type: "color",
        key: "curtainColorB",
        label: "Color B",
      },
      {
        type: "select",
        key: "curtainGradient",
        label: "Fill",
        options: [
          { value: "solid", label: "Solid (A)" },
          { value: "vertical", label: "Vertical gradient" },
          { value: "horizontal", label: "Horizontal gradient" },
        ],
      },
    ],
  },
];

export function getTransitionDefinition(id: TransitionId) {
  return transitionDefinitions.find((transition) => transition.id === id);
}
