import { DIRECTION_MODE_INDEX } from "./transition-state-machine";
import type { SettingKey, TornTransitionSettings } from "./transition-types";
import {
  COSINE_PALETTES,
  EDGE_PROFILES,
  PALETTE_MODE_INDEX,
  REVEAL_MODE_INDEX,
  edgeMargin,
  hexToLinear,
} from "./transition-utils";

export type ExportTab =
  | "provider"
  | "link"
  | "hook"
  | "preset"
  | "uniforms"
  | "complete";

export const EXPORT_TABS: { id: ExportTab; label: string }[] = [
  { id: "provider", label: "Provider" },
  { id: "link", label: "Link" },
  { id: "hook", label: "Hook" },
  { id: "preset", label: "Preset" },
  { id: "uniforms", label: "Uniforms" },
  { id: "complete", label: "Complete" },
];

const KEY_ORDER: SettingKey[] = [
  "direction",
  "duration",
  "outroDuration",
  "easing",
  "swapMidpoint",
  "startDelay",
  "revealMode",
  "edgeVelocity",
  "overshoot",
  "settleDuration",
  "coveredHold",
  "edgeProfile",
  "bandWidth",
  "tearAmplitude",
  "tearFrequency",
  "edgeRoughness",
  "edgeSharpness",
  "edgeThickness",
  "secondaryEdgeOffset",
  "fragmentAmount",
  "holeAmount",
  "directionalStretch",
  "foldAmount",
  "bubbleAmount",
  "bubbleScale",
  "bubbleVariation",
  "bubbleInflation",
  "bubbleMerge",
  "bubbleSpeed",
  "bubbleEdgeConcentration",
  "pointerInfluence",
  "fiberAmount",
  "fiberLength",
  "fiberDirection",
  "pulpGrain",
  "speckleAmount",
  "wrinkleAmount",
  "wrinkleScale",
  "paperDensity",
  "deckleStrength",
  "surfaceDepth",
  "displacementStrength",
  "lightX",
  "lightY",
  "lightHeight",
  "diffuseStrength",
  "rimStrength",
  "specularStrength",
  "roughness",
  "cavityShadow",
  "castShadowStrength",
  "edgeHighlight",
  "undersideDarkness",
  "paletteMode",
  "cosinePalette",
  "stopCount",
  "color1",
  "color2",
  "color3",
  "color4",
  "gradientAngle",
  "gradientScale",
  "gradientMotion",
  "hueTravel",
  "saturation",
  "brightness",
  "contrast",
  "colorDistortion",
  "iridescence",
  "grain",
  "dither",
  "blur",
  "edgeGlow",
  "chromaticSeparation",
  "vignette",
  "alpha",
  "textureScale",
  "animationSpeed",
];

const SECTION_BREAKS: Partial<Record<SettingKey, string>> = {
  direction: "Motion",
  edgeProfile: "Shape",
  bubbleAmount: "Bubbles",
  fiberAmount: "Paper",
  surfaceDepth: "Depth & lighting",
  paletteMode: "Gradient",
  grain: "Texture & finishing",
};

function literal(value: string | number): string {
  return typeof value === "number" ? String(value) : `"${value}"`;
}

/** Object literal with the same section comments the control panel uses. */
export function settingsLiteral(
  settings: TornTransitionSettings,
  indent = "  ",
): string {
  const lines: string[] = [];
  for (const key of KEY_ORDER) {
    const section = SECTION_BREAKS[key];
    if (section) {
      lines.push(`${lines.length ? "\n" : ""}${indent}// ${section}`);
    }
    lines.push(`${indent}${key}: ${literal(settings[key])},`);
  }
  return lines.join("\n");
}

export function generatePresetTs(
  name: string,
  settings: TornTransitionSettings,
): string {
  const id = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `import type { TornTransitionPreset } from "@/torn-gradient-transitions";

export const ${toCamel(id)}Preset: TornTransitionPreset = {
  id: "${id}",
  name: "${name}",
  description: "Custom preset exported from the Torn Gradient Transitions lab.",
  swatch: ["${settings.color1}", "${settings.color2}"],
  settings: {
${settingsLiteral(settings, "    ")}
  },
};
`;
}

export function generatePresetJson(
  name: string,
  settings: TornTransitionSettings,
): string {
  return JSON.stringify({ name, settings }, null, 2);
}

function toCamel(id: string) {
  return id.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

export function generateProviderCode(
  settings: TornTransitionSettings,
): string {
  return `"use client";

import {
  TornTransitionProvider,
  type TornTransitionSettings,
} from "@/torn-gradient-transitions";

/** Exported from the lab — every value below is the one you are looking at. */
export const tornSettings: TornTransitionSettings = {
${settingsLiteral(settings)}
};

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TornTransitionProvider settings={tornSettings} mode="fixed" quality="balanced">
      {children}
    </TornTransitionProvider>
  );
}
`;
}

export function generateLinkCode(settings: TornTransitionSettings): string {
  return `"use client";

import { useRouter } from "next/navigation";
import { TornTransitionLink } from "@/torn-gradient-transitions";

export function PrimaryNav() {
  const router = useRouter();

  return (
    <nav>
      <TornTransitionLink
        href="/work"
        direction="${settings.direction}"
        focusTargetId="main"
        originFromPointer
        onNavigate={(href) => router.push(href)}
      >
        Work
      </TornTransitionLink>
    </nav>
  );
}
`;
}

export function generateHookCode(settings: TornTransitionSettings): string {
  return `"use client";

import { useTornTransition } from "@/torn-gradient-transitions";

export function ThemeSwapButton({ onSwap }: { onSwap: () => void }) {
  const { startTransition, isTransitioning } = useTornTransition();

  return (
    <button
      type="button"
      disabled={isTransitioning}
      onClick={() =>
        startTransition({
          direction: "${settings.direction}",
          // Fires once the sheet fully hides the viewport (${Math.round(
            settings.swapMidpoint * 100,
          )}% of the intro).
          onCovered: onSwap,
          onComplete: () => document.getElementById("main")?.focus(),
        })
      }
    >
      Swap theme
    </button>
  );
}
`;
}

type UniformValue = number | number[];

/**
 * The exact uniform block the renderer uploads, so shader values can be lifted
 * into another project without re-deriving the mapping by hand.
 */
export function resolveUniforms(
  settings: TornTransitionSettings,
): Record<string, UniformValue> {
  const profile = EDGE_PROFILES[settings.edgeProfile];
  const cos = COSINE_PALETTES[settings.cosinePalette];
  const light = normalize([settings.lightX, settings.lightY, settings.lightHeight]);

  return {
    uDirMode: DIRECTION_MODE_INDEX[settings.direction],
    uRevealMode: REVEAL_MODE_INDEX[settings.revealMode],
    uMargin: round(edgeMargin(settings)),

    uBandWidth: settings.bandWidth,
    uTearAmp: settings.tearAmplitude,
    uTearFreq: settings.tearFrequency,
    uEdgeRough: settings.edgeRoughness,
    uEdgeSharp: settings.edgeSharpness,
    uEdgeThickness: settings.edgeThickness,
    uSecondaryOffset: settings.secondaryEdgeOffset,
    uFragment: settings.fragmentAmount,
    uHole: settings.holeAmount,
    uStretch: settings.directionalStretch,
    uProfileWeights: profile.weights,
    uProfileFeather: profile.feather,
    uDeckle: settings.deckleStrength,

    uBubbleAmount: settings.bubbleAmount,
    uBubbleScale: settings.bubbleScale,
    uBubbleVariation: settings.bubbleVariation,
    uBubbleInflation: settings.bubbleInflation,
    uBubbleMerge: settings.bubbleMerge,
    uBubbleSpeed: settings.bubbleSpeed,
    uBubbleEdge: settings.bubbleEdgeConcentration,
    uPointerInfluence: settings.pointerInfluence,

    uFiberAmount: settings.fiberAmount,
    uFiberLength: settings.fiberLength,
    uFiberDir: settings.fiberDirection,
    uPulpGrain: settings.pulpGrain,
    uSpeckle: settings.speckleAmount,
    uWrinkleAmount: settings.wrinkleAmount,
    uWrinkleScale: settings.wrinkleScale,
    uPaperDensity: settings.paperDensity,
    uFoldAmount: settings.foldAmount,

    uSurfaceDepth: settings.surfaceDepth,
    uDisplacement: settings.displacementStrength,
    uLightDir: light,
    uDiffuse: settings.diffuseStrength,
    uRim: settings.rimStrength,
    uSpecular: settings.specularStrength,
    uRoughness: settings.roughness,
    uCavity: settings.cavityShadow,
    uCastShadow: settings.castShadowStrength,
    uEdgeHighlight: settings.edgeHighlight,
    uUnderside: settings.undersideDarkness,

    uPaletteMode: PALETTE_MODE_INDEX[settings.paletteMode],
    uStopCount: settings.stopCount,
    uColor1: hexToLinear(settings.color1).map(round),
    uColor2: hexToLinear(settings.color2).map(round),
    uColor3: hexToLinear(settings.color3).map(round),
    uColor4: hexToLinear(settings.color4).map(round),
    uCosA: cos.a,
    uCosB: cos.b,
    uCosC: cos.c,
    uCosD: cos.d,
    uSaturation: settings.saturation,
    uBrightness: settings.brightness,
    uContrast: settings.contrast,

    uGradAngle: settings.gradientAngle,
    uGradScale: settings.gradientScale,
    uGradMotion: settings.gradientMotion,
    uHueTravel: settings.hueTravel,
    uColorDistortion: settings.colorDistortion,
    uIridescence: settings.iridescence,

    uGrain: settings.grain,
    uDither: settings.dither,
    uBlur: settings.blur,
    uEdgeGlow: settings.edgeGlow,
    uChroma: settings.chromaticSeparation,
    uVignette: settings.vignette,
    uAlpha: settings.alpha,
    uTextureScale: settings.textureScale,
  };
}

function round(n: number) {
  return Number(n.toFixed(4));
}

function normalize([x, y, z]: number[]): number[] {
  const len = Math.hypot(x, y, z) || 1;
  return [round(x / len), round(y / len), round(z / len)];
}

export function generateUniformCode(
  settings: TornTransitionSettings,
): string {
  const uniforms = resolveUniforms(settings);
  const body = Object.entries(uniforms)
    .map(([key, value]) => {
      const printed = Array.isArray(value)
        ? `[${value.join(", ")}]`
        : String(value);
      return `  ${key}: { value: ${printed} },`;
    })
    .join("\n");

  return `import * as THREE from "three";

/**
 * Resolved uniform block for the current lab settings.
 * Vectors are printed as arrays — spread them into THREE.Vector2/3/4.
 * Colours are already converted from sRGB hex to linear-light RGB.
 */
export const tornUniforms = {
${body}
};

export const tornDefines = { FBM_OCTAVES: 3 };

export function toThreeUniforms() {
  return Object.fromEntries(
    Object.entries(tornUniforms).map(([key, entry]) => {
      const v = entry.value;
      if (!Array.isArray(v)) return [key, { value: v }];
      if (v.length === 2) return [key, { value: new THREE.Vector2(...v) }];
      if (v.length === 3) return [key, { value: new THREE.Vector3(...v) }];
      return [key, { value: new THREE.Vector4(...v) }];
    }),
  );
}
`;
}

export function generateCompleteCode(
  settings: TornTransitionSettings,
): string {
  return `"use client";

import { useRouter } from "next/navigation";
import {
  TornTransitionLink,
  TornTransitionProvider,
  useTornTransition,
  type TornTransitionSettings,
} from "@/torn-gradient-transitions";

const settings: TornTransitionSettings = {
${settingsLiteral(settings)}
};

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <TornTransitionProvider settings={settings} mode="fixed" quality="balanced">
      <Header />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
    </TornTransitionProvider>
  );
}

function Header() {
  const router = useRouter();
  const { isTransitioning, startTransition } = useTornTransition();

  return (
    <header>
      <TornTransitionLink
        href="/work"
        focusTargetId="main"
        originFromPointer
        onNavigate={(href) => router.push(href)}
      >
        Work
      </TornTransitionLink>

      <button
        type="button"
        disabled={isTransitioning}
        onClick={() =>
          startTransition({
            direction: "${settings.direction}",
            onCovered: () => router.push("/contact"),
            onComplete: () => document.getElementById("main")?.focus(),
          })
        }
      >
        Contact
      </button>
    </header>
  );
}
`;
}

export function generateExport(
  tab: ExportTab,
  settings: TornTransitionSettings,
  presetName: string,
): { code: string; language: string; filename: string } {
  switch (tab) {
    case "provider":
      return {
        code: generateProviderCode(settings),
        language: "tsx",
        filename: "torn-transition-provider-setup.tsx",
      };
    case "link":
      return {
        code: generateLinkCode(settings),
        language: "tsx",
        filename: "torn-transition-nav.tsx",
      };
    case "hook":
      return {
        code: generateHookCode(settings),
        language: "tsx",
        filename: "use-torn-transition-example.tsx",
      };
    case "preset":
      return {
        code: generatePresetTs(presetName, settings),
        language: "ts",
        filename: "torn-preset.ts",
      };
    case "uniforms":
      return {
        code: generateUniformCode(settings),
        language: "ts",
        filename: "torn-uniforms.ts",
      };
    default:
      return {
        code: generateCompleteCode(settings),
        language: "tsx",
        filename: "torn-transition-shell.tsx",
      };
  }
}
