import type { AnimationDefinition, AnimationSettings } from "./types";

function formatProp(key: string, value: string | number | boolean): string {
  if (typeof value === "string") return `  ${key}="${value.replace(/"/g, '\\"')}"`;
  if (typeof value === "boolean") return `  ${key}={${value}}`;
  return `  ${key}={${value}}`;
}

function buildProps(settings: AnimationSettings, excludeKeys: string[] = ["text"]): string {
  return Object.entries(settings)
    .filter(([key]) => !excludeKeys.includes(key))
    .map(([key, value]) => formatProp(key, value))
    .join("\n");
}

const COMPONENT_IMPORTS: Record<string, string> = {
  typing: "TypingAnimation",
  "letter-flip-frame": "LetterFlipFrame",
  "poured-text": "PouredTextAnimation",
  "stroke-fill-glow": "StrokeFillGlowAnimation",
  "random-letter-fade": "RandomLetterFadeAnimation",
  "directional-letter-flip": "DirectionalLetterFlip",
  "cursor-ascii-reveal": "CursorAsciiReveal",
  "glide-text": "GlideTextAnimation",
  "scale-anchor": "ScaleAnchorTextAnimation",
  "scroll-line-reveal": "ScrollLineRevealAnimation",
};

export function generateExportCode(
  definition: AnimationDefinition,
  text: string,
  settings: AnimationSettings,
): string {
  const componentName = COMPONENT_IMPORTS[definition.id] ?? "AnimationComponent";
  const props = buildProps(settings);
  const deps = definition.dependencies?.length
    ? `\n// Dependencies: ${definition.dependencies.join(", ")}\n`
    : "";

  return `${deps}import { ${componentName} } from "@/components/text-animations";

export function HeroTitle() {
  return (
    <${componentName}
      text="${text.replace(/"/g, '\\"')}"
${props}
    />
  );
}`;
}

export function generateSettingsSummary(settings: AnimationSettings): string {
  return Object.entries(settings)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n");
}
