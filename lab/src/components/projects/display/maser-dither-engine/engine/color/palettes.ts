import type { ColorMaterialConfig, MaterialColors, Rgb } from "./types";
import { DEFAULT_COLOR_MATERIAL, DEFAULT_COLORS, hexToRgb, rgb } from "./types";

export type PaletteDefinition = {
  id: string;
  label: string;
  description: string;
  colors: MaterialColors;
  /** Optional material param hints applied when palette is selected. */
  paramsHint?: Partial<{
    contrast: number;
    brightness: number;
    bloom: number;
    grainAmount: number;
    softEdge: number;
  }>;
};

function palette(
  id: string,
  label: string,
  description: string,
  hexes: {
    bg: string;
    highlight: string;
    shadow: string;
    start: string;
    end: string;
    mid?: string;
    accent?: string;
    glow?: string;
  },
  paramsHint?: PaletteDefinition["paramsHint"],
): PaletteDefinition {
  const bg = hexToRgb(hexes.bg);
  const highlight = hexToRgb(hexes.highlight);
  const shadow = hexToRgb(hexes.shadow);
  const start = hexToRgb(hexes.start);
  const end = hexToRgb(hexes.end);
  const mid = hexToRgb(hexes.mid ?? hexes.accent ?? "#777777");
  const accent = hexToRgb(hexes.accent ?? hexes.end);
  const glow = hexToRgb(hexes.glow ?? hexes.highlight);
  const colors: MaterialColors = {
    background: bg,
    highlight,
    shadow,
    dither: highlight,
    bloom: glow,
    ambient: mid,
    accent,
    gradientStart: start,
    gradientEnd: end,
    gradientMid: mid,
    gradientFourth: accent,
    glow,
    edgeTint: accent,
    noiseTint: mid,
  };
  return { id, label, description, colors, paramsHint };
}

export const MATERIAL_PALETTES: PaletteDefinition[] = [
  palette(
    "monochrome",
    "Monochrome",
    "Classic engineered print density.",
    {
      bg: "#0a0a0b",
      highlight: "#f4f4f1",
      shadow: "#0e0e10",
      start: "#121214",
      end: "#ebebe6",
      mid: "#6e6e72",
    },
  ),
  palette(
    "blueprint",
    "Blueprint",
    "Drafting-table cyan on deep navy.",
    {
      bg: "#061018",
      highlight: "#b8e4ff",
      shadow: "#04101a",
      start: "#0a2740",
      end: "#7ec8ff",
      mid: "#2a6a9a",
      accent: "#3db4ff",
      glow: "#9ad8ff",
    },
    { contrast: 1.25, bloom: 0.4 },
  ),
  palette(
    "aurora",
    "Aurora",
    "Atmospheric teal-to-violet curtains.",
    {
      bg: "#070812",
      highlight: "#d9fff2",
      shadow: "#0a0b18",
      start: "#12203a",
      end: "#8ff5c8",
      mid: "#6b7dff",
      accent: "#c084fc",
      glow: "#a5f3d0",
    },
    { bloom: 0.55, grainAmount: 0.06 },
  ),
  palette(
    "ocean",
    "Ocean",
    "Deep water with foam highlights.",
    {
      bg: "#041016",
      highlight: "#e8f7ff",
      shadow: "#021018",
      start: "#0a3a4a",
      end: "#5ec8e0",
      mid: "#1a6a7a",
      accent: "#2bb8d0",
    },
  ),
  palette(
    "paper",
    "Paper",
    "Warm fiber stock and soft ink.",
    {
      bg: "#f3efe6",
      highlight: "#1a1814",
      shadow: "#e8e2d4",
      start: "#efe8da",
      end: "#2a2620",
      mid: "#9a9080",
      accent: "#5a5040",
    },
    { contrast: 1.05, softEdge: 0.7, grainAmount: 0.12 },
  ),
  palette(
    "chrome",
    "Chrome",
    "Cool metallic specular ramp.",
    {
      bg: "#0c0e12",
      highlight: "#f2f5fa",
      shadow: "#080a0e",
      start: "#1a2030",
      end: "#d8e0ec",
      mid: "#8898b0",
      accent: "#c0d0e8",
      glow: "#eef4ff",
    },
    { contrast: 1.35, bloom: 0.5 },
  ),
  palette(
    "sunset",
    "Sunset",
    "Warm horizon wash.",
    {
      bg: "#14080c",
      highlight: "#ffe8d0",
      shadow: "#10060a",
      start: "#3a1020",
      end: "#ffb070",
      mid: "#e06040",
      accent: "#ff8060",
      glow: "#ffd0a0",
    },
  ),
  palette(
    "heat-map",
    "Heat Map",
    "Thermal intensity scale.",
    {
      bg: "#0a0610",
      highlight: "#fff0c0",
      shadow: "#080410",
      start: "#201040",
      end: "#ff6030",
      mid: "#c02060",
      accent: "#ff9040",
    },
    { contrast: 1.3 },
  ),
  palette(
    "terminal",
    "Terminal",
    "Phosphor green on CRT black.",
    {
      bg: "#020804",
      highlight: "#b8ffb0",
      shadow: "#010603",
      start: "#041808",
      end: "#60e050",
      mid: "#208028",
      accent: "#40c038",
      glow: "#80ff70",
    },
    { grainAmount: 0.1 },
  ),
  palette(
    "matrix",
    "Matrix",
    "Dense code-rain emerald.",
    {
      bg: "#010402",
      highlight: "#70ff90",
      shadow: "#000302",
      start: "#021808",
      end: "#20c050",
      mid: "#0a6030",
      accent: "#18a040",
    },
  ),
  palette(
    "pearl",
    "Pearl",
    "Iridescent soft whites.",
    {
      bg: "#f6f4f8",
      highlight: "#2a2830",
      shadow: "#ebe8f0",
      start: "#f0ecf6",
      end: "#c8c0d8",
      mid: "#a898b8",
      accent: "#d8d0e8",
      glow: "#fff8ff",
    },
    { softEdge: 0.75, bloom: 0.45 },
  ),
  palette(
    "acid",
    "Acid",
    "High-chroma chartreuse punch.",
    {
      bg: "#0c1004",
      highlight: "#f0ff60",
      shadow: "#080c02",
      start: "#204010",
      end: "#d0ff20",
      mid: "#80c020",
      accent: "#b0ff40",
    },
    { contrast: 1.4 },
  ),
  palette(
    "infrared",
    "Infrared",
    "False-color heat sensing.",
    {
      bg: "#0c0410",
      highlight: "#ffd0e8",
      shadow: "#080210",
      start: "#280848",
      end: "#ff4060",
      mid: "#a02080",
      accent: "#ff8080",
    },
  ),
  palette(
    "smoke",
    "Smoke",
    "Ash and haze neutrals.",
    {
      bg: "#101012",
      highlight: "#d8d8dc",
      shadow: "#0c0c0e",
      start: "#2a2a30",
      end: "#a8a8b0",
      mid: "#686870",
      accent: "#909098",
    },
    { grainAmount: 0.14, softEdge: 0.65 },
  ),
  palette(
    "forest",
    "Forest",
    "Moss and canopy depth.",
    {
      bg: "#061008",
      highlight: "#d8f0c8",
      shadow: "#040c06",
      start: "#143020",
      end: "#70b060",
      mid: "#386838",
      accent: "#58a048",
    },
  ),
  palette(
    "cyberpunk",
    "Cyberpunk",
    "Magenta neon on asphalt.",
    {
      bg: "#08060e",
      highlight: "#ffe0ff",
      shadow: "#06040c",
      start: "#1a1030",
      end: "#ff40c0",
      mid: "#40e0ff",
      accent: "#ff2080",
      glow: "#ff80e0",
    },
    { bloom: 0.6, contrast: 1.3 },
  ),
  palette(
    "electric-blue",
    "Electric Blue",
    "Voltage-forward brand blue.",
    {
      bg: "#040812",
      highlight: "#e0f0ff",
      shadow: "#020610",
      start: "#0a2048",
      end: "#40a0ff",
      mid: "#2060c0",
      accent: "#60c0ff",
      glow: "#a0d8ff",
    },
  ),
  palette(
    "graphite",
    "Graphite",
    "Hard pencil tonal range.",
    {
      bg: "#121214",
      highlight: "#e8e8ea",
      shadow: "#0e0e10",
      start: "#2a2a2e",
      end: "#c0c0c4",
      mid: "#707078",
    },
    { contrast: 1.2, grainAmount: 0.1 },
  ),
  palette(
    "velvet",
    "Velvet",
    "Plush burgundy with soft falloff.",
    {
      bg: "#10060c",
      highlight: "#f0d8e0",
      shadow: "#0c0408",
      start: "#3a1028",
      end: "#c06080",
      mid: "#702040",
      accent: "#a04060",
      glow: "#e090a8",
    },
    { softEdge: 0.8, bloom: 0.4 },
  ),
];

export function getPalette(id: string): PaletteDefinition | undefined {
  return MATERIAL_PALETTES.find((p) => p.id === id);
}

export function applyPaletteToConfig(
  paletteId: string,
  base: ColorMaterialConfig = DEFAULT_COLOR_MATERIAL,
): ColorMaterialConfig {
  const p = getPalette(paletteId);
  if (!p) return base;
  return {
    ...base,
    colors: { ...p.colors },
    colorEnabled: true,
    paletteId,
  };
}

export function grayRgb(v: number): Rgb {
  return rgb(v, v, v);
}

/** Build grayscale color set from legacy gradient A/B scalars. */
export function colorsFromLegacyGray(a: number, b: number): MaterialColors {
  return {
    ...DEFAULT_COLORS,
    gradientStart: grayRgb(a),
    gradientEnd: grayRgb(b),
    shadow: grayRgb(Math.min(a, 0.15)),
    highlight: grayRgb(Math.max(b, 0.85)),
    dither: grayRgb(b),
    background: grayRgb(Math.min(a * 0.5, 0.08)),
  };
}
