import { COLOR_PALETTES, WARNING_TINT } from "../constants";
import type { AgentSwarmColorMode } from "../types";
import { createPrng } from "./prng";

export function paletteFor(
  colorMode: AgentSwarmColorMode,
  customPalette: string[],
): string[] {
  if (colorMode === "custom" && customPalette.length > 0) return customPalette;
  if (colorMode === "custom") return COLOR_PALETTES.spectral;
  return COLOR_PALETTES[colorMode];
}

export function assignAgentColors(
  count: number,
  seed: string | number,
  colorMode: AgentSwarmColorMode,
  customPalette: string[],
): string[] {
  const palette = paletteFor(colorMode, customPalette);
  const rng = createPrng(`${seed}:colors`);
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    if (colorMode === "white" || rng() < 0.55) {
      colors.push(palette[0] ?? "#ffffff");
      continue;
    }
    const index = Math.min(palette.length - 1, Math.floor(rng() * palette.length));
    colors.push(palette[index] ?? "#ffffff");
  }
  return colors;
}

export function errorTint(base: string, agentId: number, accentCount: number): string {
  if (agentId < accentCount) return WARNING_TINT;
  return base;
}
