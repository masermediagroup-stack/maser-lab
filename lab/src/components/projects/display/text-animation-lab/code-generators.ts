import type { AnimationDefinition, AnimationSettings, ExportPhase } from "./types";

function formatProp(key: string, value: string | number | boolean): string {
  if (typeof value === "string") {
    if (/[\n\r<>{}]/.test(value)) return `  ${key}={${JSON.stringify(value)}}`;
    return `  ${key}="${value.replace(/"/g, '\\"')}"`;
  }
  if (typeof value === "boolean") return `  ${key}={${value}}`;
  return `  ${key}={${value}}`;
}

function buildProps(
  settings: AnimationSettings,
  excludeKeys: string[] = ["text", "phase"],
): string {
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
  "glyph-scan-reveal": "GlyphScanReveal",
  "glide-text": "GlideTextAnimation",
  "scale-anchor": "ScaleAnchorTextAnimation",
  "scroll-line-reveal": "ScrollLineRevealAnimation",
  "mask-clip-reveal": "MaskClipRevealAnimation",
  "text-scramble-reveal": "TextScrambleRevealAnimation",
  "blur-focus-reveal": "BlurFocusRevealAnimation",
  "underline-draw-reveal": "UnderlineDrawRevealAnimation",
  "text-flip-3d": "TextFlip3DRevealAnimation",
  "tetris-pixel-text": "TetrisPixelText",
};

export function generateExportCode(
  definition: AnimationDefinition,
  text: string,
  settings: AnimationSettings,
  phase: ExportPhase = "in",
): string {
  const componentName = COMPONENT_IMPORTS[definition.id] ?? "AnimationComponent";
  const props = buildProps(settings);
  const textProp = formatProp("text", text);
  const deps = definition.dependencies?.length
    ? `\n// Dependencies: ${definition.dependencies.join(", ")}\n`
    : "";
  const notes = definition.exportNotes ? `\n// ${definition.exportNotes}\n` : "";
  const phaseComment =
    phase === "out"
      ? "// Out / exit animation\n"
      : "// In / entrance animation\n";

  const phaseProp =
    definition.supportsOutAnimation !== false
      ? `\n${formatProp("phase", phase)}`
      : "";

  const fnName = phase === "out" ? "HeroTitleOut" : "HeroTitleIn";

  return `${phaseComment}${deps}${notes}import { ${componentName} } from "@/components/text-animations";

export function ${fnName}() {
  return (
    <${componentName}
${textProp}${phaseProp}
${props}
    />
  );
}`;
}

export function generateSettingsSummary(settings: AnimationSettings): string {
  return Object.entries(settings)
    .filter(([key]) => key !== "phase")
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n");
}
