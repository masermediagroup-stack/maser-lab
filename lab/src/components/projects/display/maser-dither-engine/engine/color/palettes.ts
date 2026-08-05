import type {
  ColorMaterialConfig,
  GradientModeId,
  MaterialColors,
  Rgb,
} from "./types";
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
  /** Prefer multi-stop gradients so palettes read dimensional, not 2-flat. */
  gradientMode?: GradientModeId;
};

function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return rgb(
    a.r + (b.r - a.r) * t,
    a.g + (b.g - a.g) * t,
    a.b + (b.b - a.b) * t,
  );
}

/**
 * Build a dimensional palette — every lighting/dither/gradient slot is distinct.
 * Flat 2-stop looks came from dither=highlight and ambient≈mid copies.
 */
function palette(
  id: string,
  label: string,
  description: string,
  hexes: {
    bg: string;
    /** Hot / lit core */
    highlight: string;
    /** Cool / unlit outer */
    shadow: string;
    /** Gradient stop A (often cool) */
    start: string;
    /** Gradient stop B (often hot) */
    end: string;
    /** Gradient mid / plate fill */
    mid?: string;
    /** Midtone accent (lit≠dither) */
    accent?: string;
    /** Additive bloom/glow */
    glow?: string;
    /** Fourth gradient stop (quad ramps) */
    fourth?: string;
    /** Dither ink — must differ from highlight */
    dither?: string;
    /** Edge rim */
    edge?: string;
    /** Noise scatter tint */
    noise?: string;
  },
  opts?: {
    paramsHint?: PaletteDefinition["paramsHint"];
    gradientMode?: GradientModeId;
  },
): PaletteDefinition {
  const bg = hexToRgb(hexes.bg);
  const highlight = hexToRgb(hexes.highlight);
  const shadow = hexToRgb(hexes.shadow);
  const start = hexToRgb(hexes.start);
  const end = hexToRgb(hexes.end);
  const mid = hexToRgb(hexes.mid ?? "#777777");
  const accent = hexToRgb(hexes.accent ?? hexes.end);
  const glow = hexToRgb(hexes.glow ?? hexes.highlight);
  const fourth = hexToRgb(
    hexes.fourth ?? hexes.accent ?? mixHexFallback(hexes.mid, hexes.end),
  );
  const dither = hexToRgb(
    hexes.dither ?? hexes.accent ?? hexes.mid ?? hexes.end,
  );
  const edge = hexToRgb(hexes.edge ?? hexes.accent ?? hexes.end);
  const noise = hexToRgb(hexes.noise ?? hexes.mid ?? hexes.start);

  // Ensure ambient sits between shadow and mid — not a duplicate of either
  const ambient = mixRgb(shadow, mid, 0.55);

  const colors: MaterialColors = {
    background: bg,
    highlight,
    shadow,
    dither,
    bloom: mixRgb(glow, accent, 0.35),
    ambient,
    accent,
    gradientStart: start,
    gradientEnd: end,
    gradientMid: mid,
    gradientFourth: fourth,
    glow,
    edgeTint: edge,
    noiseTint: noise,
  };
  return {
    id,
    label,
    description,
    colors,
    paramsHint: opts?.paramsHint,
    gradientMode: opts?.gradientMode ?? "quad",
  };
}

function mixHexFallback(a?: string, b?: string): string {
  return a ?? b ?? "#888888";
}

export const MATERIAL_PALETTES: PaletteDefinition[] = [
  palette(
    "monochrome",
    "Monochrome",
    "Classic engineered print density — cool plate to warm paper white.",
    {
      bg: "#080809",
      highlight: "#f6f5f0",
      shadow: "#0c0c0e",
      start: "#141416",
      mid: "#5a5a60",
      fourth: "#a8a8a4",
      end: "#ebebe6",
      accent: "#9a9a96",
      dither: "#c8c8c2",
      glow: "#ffffff",
      edge: "#d0d0cc",
      noise: "#6e6e72",
    },
    { gradientMode: "triple" },
  ),
  palette(
    "blueprint",
    "Blueprint",
    "Drafting-table cyan through steel midtones on deep navy.",
    {
      bg: "#040c14",
      highlight: "#e8f6ff",
      shadow: "#031018",
      start: "#061828",
      mid: "#1a5a88",
      fourth: "#3a9ad0",
      end: "#9ad8ff",
      accent: "#2eb0ff",
      dither: "#5ec0e8",
      glow: "#c8ecff",
      edge: "#7ec8ff",
      noise: "#2a6a9a",
    },
    { paramsHint: { contrast: 1.25, bloom: 0.4 }, gradientMode: "quad" },
  ),
  palette(
    "aurora",
    "Aurora",
    "Atmospheric teal → violet → mint curtains.",
    {
      bg: "#060710",
      highlight: "#e8fff6",
      shadow: "#080a16",
      start: "#101828",
      mid: "#4a68c8",
      fourth: "#88e0c0",
      end: "#c4a0ff",
      accent: "#a078f0",
      dither: "#70d8b8",
      glow: "#b8ffe0",
      edge: "#d0b0ff",
      noise: "#3850a0",
    },
    { paramsHint: { bloom: 0.55, grainAmount: 0.06 }, gradientMode: "quad" },
  ),
  palette(
    "ocean",
    "Ocean",
    "Abyss → teal shelf → foam highlight.",
    {
      bg: "#030c12",
      highlight: "#f0faff",
      shadow: "#021018",
      start: "#062030",
      mid: "#0e6880",
      fourth: "#3ab0c8",
      end: "#b8e8f4",
      accent: "#28a8c0",
      dither: "#58c8d8",
      glow: "#d8f4ff",
      edge: "#80d8e8",
      noise: "#1a5a70",
    },
    { gradientMode: "quad" },
  ),
  palette(
    "paper",
    "Paper",
    "Warm fiber stock with soft ink holdout.",
    {
      bg: "#f2eee4",
      highlight: "#1a1612",
      shadow: "#e6e0d2",
      start: "#efe8da",
      mid: "#a89880",
      fourth: "#6a5e4e",
      end: "#2a241c",
      accent: "#5a4e40",
      dither: "#3a3228",
      glow: "#fff8ec",
      edge: "#8a7c68",
      noise: "#c0b49e",
    },
    {
      paramsHint: { contrast: 1.05, softEdge: 0.7, grainAmount: 0.12 },
      gradientMode: "triple",
    },
  ),
  palette(
    "chrome",
    "Chrome",
    "Cool metallic specular — deep steel, silver mid, specular white.",
    {
      bg: "#0a0c10",
      highlight: "#f4f7fc",
      shadow: "#06080c",
      start: "#121820",
      mid: "#6a7a90",
      fourth: "#b0c0d4",
      end: "#e8eef6",
      accent: "#98a8c0",
      dither: "#c8d4e4",
      glow: "#ffffff",
      edge: "#d0dcec",
      noise: "#4a5868",
    },
    { paramsHint: { contrast: 1.35, bloom: 0.5 }, gradientMode: "quad" },
  ),
  palette(
    "sunset",
    "Sunset",
    "Horizon stack — plum → coral → peach → cream.",
    {
      bg: "#10060a",
      highlight: "#fff0dc",
      shadow: "#0c0408",
      start: "#281018",
      mid: "#c04050",
      fourth: "#ff8050",
      end: "#ffd0a0",
      accent: "#e85840",
      dither: "#ff9860",
      glow: "#ffe0b8",
      edge: "#ffb080",
      noise: "#702838",
    },
    { gradientMode: "quad" },
  ),
  palette(
    "heat-map",
    "Heat Map",
    "Thermal ramp — black → violet → crimson → orange → white-hot.",
    {
      bg: "#020108",
      // Core = white-hot
      highlight: "#fff8e8",
      // Outer = cold black-violet
      shadow: "#0a0418",
      // Quad stops: cold → violet → red → orange → (end yellow-white via highlight mix)
      start: "#0c0828",
      mid: "#9010a0",
      fourth: "#ff2818",
      end: "#ffb020",
      accent: "#ff4820",
      dither: "#e04018",
      glow: "#ffe060",
      edge: "#ff9040",
      noise: "#401060",
    },
    { paramsHint: { contrast: 1.35, bloom: 0.55 }, gradientMode: "quad" },
  ),
  palette(
    "terminal",
    "Terminal",
    "Phosphor green stack on CRT black.",
    {
      bg: "#010603",
      highlight: "#d0ffc8",
      shadow: "#010402",
      start: "#021208",
      mid: "#1a6830",
      fourth: "#48c048",
      end: "#a8ff90",
      accent: "#38c038",
      dither: "#60e050",
      glow: "#c0ff90",
      edge: "#80ff70",
      noise: "#145828",
    },
    { paramsHint: { grainAmount: 0.1 }, gradientMode: "triple" },
  ),
  palette(
    "matrix",
    "Matrix",
    "Dense code-rain — abyss, canopy, bright glyph.",
    {
      bg: "#000302",
      highlight: "#90ffa8",
      shadow: "#000201",
      start: "#011208",
      mid: "#0a5030",
      fourth: "#20a050",
      end: "#70ff98",
      accent: "#18a848",
      dither: "#30c860",
      glow: "#a0ffc0",
      edge: "#50e080",
      noise: "#084028",
    },
    { gradientMode: "triple" },
  ),
  palette(
    "pearl",
    "Pearl",
    "Iridescent soft whites with cool lilac undertone.",
    {
      bg: "#f4f2f8",
      highlight: "#221e28",
      shadow: "#e8e4f0",
      start: "#f0ecf6",
      mid: "#b0a0c0",
      fourth: "#8878a0",
      end: "#3a3448",
      accent: "#9888b0",
      dither: "#5a5068",
      glow: "#fff8ff",
      edge: "#c8bcd8",
      noise: "#d8d0e4",
    },
    {
      paramsHint: { softEdge: 0.75, bloom: 0.45 },
      gradientMode: "triple",
    },
  ),
  palette(
    "acid",
    "Acid",
    "Chartreuse punch with olive depth and lime specular.",
    {
      bg: "#0a1002",
      highlight: "#f4ff70",
      shadow: "#060a01",
      start: "#142008",
      mid: "#588018",
      fourth: "#a0d020",
      end: "#e8ff40",
      accent: "#b0e028",
      dither: "#c8f030",
      glow: "#ffff90",
      edge: "#d0ff50",
      noise: "#3a6010",
    },
    { paramsHint: { contrast: 1.4 }, gradientMode: "triple" },
  ),
  palette(
    "infrared",
    "Infrared",
    "False-color heat sensing — indigo → magenta → coral.",
    {
      bg: "#0a0210",
      highlight: "#ffe0f0",
      shadow: "#060210",
      start: "#180830",
      mid: "#901070",
      fourth: "#f02850",
      end: "#ff8090",
      accent: "#e03070",
      dither: "#ff4870",
      glow: "#ffb0c8",
      edge: "#ff6888",
      noise: "#501060",
    },
    { gradientMode: "quad" },
  ),
  palette(
    "smoke",
    "Smoke",
    "Ash plate with warm haze midtones.",
    {
      bg: "#0e0e10",
      highlight: "#e4e4e8",
      shadow: "#0a0a0c",
      start: "#1c1c20",
      mid: "#585860",
      fourth: "#909098",
      end: "#c8c8d0",
      accent: "#787880",
      dither: "#a8a8b0",
      glow: "#f0f0f4",
      edge: "#b0b0b8",
      noise: "#404048",
    },
    {
      paramsHint: { grainAmount: 0.14, softEdge: 0.65 },
      gradientMode: "triple",
    },
  ),
  palette(
    "forest",
    "Forest",
    "Canopy depth — soil, moss, leaf, sun-fleck.",
    {
      bg: "#040c06",
      highlight: "#e4f8d0",
      shadow: "#020804",
      start: "#0c2010",
      mid: "#2a6830",
      fourth: "#68a848",
      end: "#c0e890",
      accent: "#48a040",
      dither: "#78c060",
      glow: "#e8ffc0",
      edge: "#90d070",
      noise: "#1a4820",
    },
    { gradientMode: "quad" },
  ),
  palette(
    "cyberpunk",
    "Cyberpunk",
    "Magenta neon + electric cyan on asphalt.",
    {
      bg: "#06040c",
      highlight: "#ffe8ff",
      shadow: "#04020a",
      start: "#140c28",
      mid: "#c01890",
      fourth: "#40d0ff",
      end: "#ff60d0",
      accent: "#ff2098",
      dither: "#ff50c0",
      glow: "#ff90e8",
      edge: "#60e8ff",
      noise: "#301860",
    },
    { paramsHint: { bloom: 0.6, contrast: 1.3 }, gradientMode: "quad" },
  ),
  palette(
    "electric-blue",
    "Electric Blue",
    "Voltage ramp — navy → cobalt → sky → ice.",
    {
      bg: "#020610",
      highlight: "#e8f4ff",
      shadow: "#01040c",
      start: "#061828",
      mid: "#1850b0",
      fourth: "#40a0ff",
      end: "#b8dcff",
      accent: "#3080f0",
      dither: "#60b0ff",
      glow: "#d0e8ff",
      edge: "#80c8ff",
      noise: "#184080",
    },
    { gradientMode: "quad" },
  ),
  palette(
    "graphite",
    "Graphite",
    "Hard pencil tonal range with warm paper undertone.",
    {
      bg: "#101012",
      highlight: "#ececea",
      shadow: "#0c0c0e",
      start: "#1c1c20",
      mid: "#585860",
      fourth: "#98989c",
      end: "#d8d8d4",
      accent: "#808088",
      dither: "#b0b0ac",
      glow: "#f4f4f0",
      edge: "#c0c0bc",
      noise: "#404048",
    },
    {
      paramsHint: { contrast: 1.2, grainAmount: 0.1 },
      gradientMode: "triple",
    },
  ),
  palette(
    "velvet",
    "Velvet",
    "Plush burgundy with rose mid and soft falloff.",
    {
      bg: "#0c0408",
      highlight: "#f4e0e8",
      shadow: "#080206",
      start: "#200c18",
      mid: "#702040",
      fourth: "#c05070",
      end: "#e8a0b0",
      accent: "#a03858",
      dither: "#d06880",
      glow: "#f0c0d0",
      edge: "#e090a8",
      noise: "#501828",
    },
    {
      paramsHint: { softEdge: 0.8, bloom: 0.4 },
      gradientMode: "triple",
    },
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
    colors: {
      ...p.colors,
      // Keep the user's Black/White component plate as the foundation.
      background: { ...base.colors.background },
    },
    colorEnabled: true,
    paletteId,
    gradientMode: p.gradientMode ?? base.gradientMode,
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
    dither: grayRgb(b * 0.75 + a * 0.25),
    background: grayRgb(Math.min(a * 0.5, 0.08)),
    gradientMid: grayRgb((a + b) * 0.5),
    gradientFourth: grayRgb(a * 0.35 + b * 0.65),
  };
}
