/**
 * Curated chroma themes for TYPE WORLD — gradient + orb body + in-orb invert.
 * Randomize picks from this list (dither-engine style), not raw hex noise.
 */

export type TypeWorldColorPalette = {
  id: string;
  label: string;
  description: string;
  gradientColor1: string;
  gradientColor2: string;
  gradientColor3: string;
  orbColorLight: string;
  orbColorDark: string;
  orbTextColor: string;
  orbTextColor2: string;
  orbInvertText: boolean;
  gradientAngle?: number;
};

export const TYPE_WORLD_COLOR_PALETTES: TypeWorldColorPalette[] = [
  {
    id: "royal-signal",
    label: "Royal Signal",
    description: "Lab default — royal blue through violet to magenta.",
    gradientColor1: "#1047C9",
    gradientColor2: "#6B42FF",
    gradientColor3: "#E052A0",
    orbColorLight: "#000000",
    orbColorDark: "#FFFFFF",
    orbTextColor: "#FFFFFF",
    orbTextColor2: "#000000",
    orbInvertText: false,
    gradientAngle: 25,
  },
  {
    id: "aurora",
    label: "Aurora",
    description: "Teal shelf, violet mid, mint highlight.",
    gradientColor1: "#1A4A6E",
    gradientColor2: "#6B42FF",
    gradientColor3: "#88E0C0",
    orbColorLight: "#0A1628",
    orbColorDark: "#E8FFF6",
    orbTextColor: "#E8FFF6",
    orbTextColor2: "#0A1628",
    orbInvertText: false,
    gradientAngle: 32,
  },
  {
    id: "ocean",
    label: "Ocean",
    description: "Abyss navy into teal foam.",
    gradientColor1: "#062030",
    gradientColor2: "#28A8C0",
    gradientColor3: "#B8E8F4",
    orbColorLight: "#031018",
    orbColorDark: "#F0FAFF",
    orbTextColor: "#F0FAFF",
    orbTextColor2: "#031018",
    orbInvertText: false,
    gradientAngle: 18,
  },
  {
    id: "sunset",
    label: "Sunset",
    description: "Deep coral through rose to gold.",
    gradientColor1: "#C43A5C",
    gradientColor2: "#E052A0",
    gradientColor3: "#F0B040",
    orbColorLight: "#1A0A10",
    orbColorDark: "#FFF4E8",
    orbTextColor: "#FFF8F0",
    orbTextColor2: "#1A0A10",
    orbInvertText: false,
    gradientAngle: 40,
  },
  {
    id: "electric",
    label: "Electric Blue",
    description: "Ink blue core with cyan and violet edges.",
    gradientColor1: "#0A3D8C",
    gradientColor2: "#2EB0FF",
    gradientColor3: "#8B5CF6",
    orbColorLight: "#000000",
    orbColorDark: "#E8F4FF",
    orbTextColor: "#E8F4FF",
    orbTextColor2: "#000000",
    orbInvertText: false,
    gradientAngle: 12,
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    description: "Magenta pulse on violet-black.",
    gradientColor1: "#6B1A8C",
    gradientColor2: "#E052A0",
    gradientColor3: "#00E5C8",
    orbColorLight: "#120818",
    orbColorDark: "#F8E8FF",
    orbTextColor: "#00E5C8",
    orbTextColor2: "#120818",
    orbInvertText: false,
    gradientAngle: 55,
  },
  {
    id: "forest",
    label: "Forest",
    description: "Pine shadow to sage and amber leaf.",
    gradientColor1: "#1A4A32",
    gradientColor2: "#4A9A68",
    gradientColor3: "#D4A84A",
    orbColorLight: "#0C1A12",
    orbColorDark: "#F0F8EC",
    orbTextColor: "#F0F8EC",
    orbTextColor2: "#0C1A12",
    orbInvertText: false,
    gradientAngle: 28,
  },
  {
    id: "heat-map",
    label: "Heat Map",
    description: "Cool indigo through hot magenta to amber.",
    gradientColor1: "#2A1A6E",
    gradientColor2: "#E052A0",
    gradientColor3: "#F0A030",
    orbColorLight: "#0A0818",
    orbColorDark: "#FFF0E8",
    orbTextColor: "#FFF0E8",
    orbTextColor2: "#0A0818",
    orbInvertText: false,
    gradientAngle: 48,
  },
  {
    id: "pearl",
    label: "Pearl",
    description: "Soft lilac through rose quartz.",
    gradientColor1: "#7A6A9A",
    gradientColor2: "#C8A8D8",
    gradientColor3: "#F0E8F8",
    orbColorLight: "#2A2438",
    orbColorDark: "#FAFAF7",
    orbTextColor: "#FAFAF7",
    orbTextColor2: "#2A2438",
    orbInvertText: false,
    gradientAngle: 22,
  },
  {
    id: "terminal",
    label: "Terminal",
    description: "Phosphor green on deep charcoal.",
    gradientColor1: "#0A2818",
    gradientColor2: "#2AD878",
    gradientColor3: "#B8F0D0",
    orbColorLight: "#000000",
    orbColorDark: "#D8FFE8",
    orbTextColor: "#D8FFE8",
    orbTextColor2: "#000000",
    orbInvertText: false,
    gradientAngle: 8,
  },
  {
    id: "velvet",
    label: "Velvet",
    description: "Wine depth to plum and soft mauve.",
    gradientColor1: "#4A1838",
    gradientColor2: "#8B3A6E",
    gradientColor3: "#D8A8C8",
    orbColorLight: "#180810",
    orbColorDark: "#F8E8F0",
    orbTextColor: "#F8E8F0",
    orbTextColor2: "#180810",
    orbInvertText: false,
    gradientAngle: 35,
  },
  {
    id: "chrome",
    label: "Chrome",
    description: "Steel blue through silver to ice.",
    gradientColor1: "#3A4A5A",
    gradientColor2: "#8AA8C8",
    gradientColor3: "#E8F0F8",
    orbColorLight: "#1A2028",
    orbColorDark: "#F4F8FC",
    orbTextColor: "#F4F8FC",
    orbTextColor2: "#1A2028",
    orbInvertText: false,
    gradientAngle: 15,
  },
  {
    id: "acid",
    label: "Acid",
    description: "Chartreuse punch on deep violet.",
    gradientColor1: "#3A1888",
    gradientColor2: "#B8F020",
    gradientColor3: "#E8FF80",
    orbColorLight: "#0A0818",
    orbColorDark: "#F0FFE8",
    orbTextColor: "#F0FFE8",
    orbTextColor2: "#0A0818",
    orbInvertText: false,
    gradientAngle: 62,
  },
  {
    id: "paper-ink",
    label: "Paper Ink",
    description: "Warm editorial ink on cream stock.",
    gradientColor1: "#2A241C",
    gradientColor2: "#6A5E4E",
    gradientColor3: "#A89880",
    orbColorLight: "#1A1612",
    orbColorDark: "#F2EEE4",
    orbTextColor: "#F2EEE4",
    orbTextColor2: "#1A1612",
    orbInvertText: false,
    gradientAngle: 20,
  },
  {
    id: "infrared",
    label: "Infrared",
    description: "Crimson core bleeding into violet haze.",
    gradientColor1: "#8C1028",
    gradientColor2: "#E04060",
    gradientColor3: "#9A4AD8",
    orbColorLight: "#140608",
    orbColorDark: "#FFE8F0",
    orbTextColor: "#FFE8F0",
    orbTextColor2: "#140608",
    orbInvertText: false,
    gradientAngle: 44,
  },
  {
    id: "blueprint",
    label: "Blueprint",
    description: "Drafting cyan on navy plate.",
    gradientColor1: "#061828",
    gradientColor2: "#1A5A88",
    gradientColor3: "#9AD8FF",
    orbColorLight: "#040C14",
    orbColorDark: "#E8F6FF",
    orbTextColor: "#E8F6FF",
    orbTextColor2: "#040C14",
    orbInvertText: false,
    gradientAngle: 10,
  },
];

export function pickRandomTypeWorldPalette(): TypeWorldColorPalette {
  const index = Math.floor(Math.random() * TYPE_WORLD_COLOR_PALETTES.length);
  return TYPE_WORLD_COLOR_PALETTES[index]!;
}

export type TypeWorldColorPalettePatch = {
  gradientColor1: string;
  gradientColor2: string;
  gradientColor3: string;
  orbColorLight: string;
  orbColorDark: string;
  orbTextColor: string;
  orbTextColor2: string;
  orbInvertText: boolean;
  gradientAngle?: number;
};

export function paletteToPatch(palette: TypeWorldColorPalette): TypeWorldColorPalettePatch {
  const patch: TypeWorldColorPalettePatch = {
    gradientColor1: palette.gradientColor1,
    gradientColor2: palette.gradientColor2,
    gradientColor3: palette.gradientColor3,
    orbColorLight: palette.orbColorLight,
    orbColorDark: palette.orbColorDark,
    orbTextColor: palette.orbTextColor,
    orbTextColor2: palette.orbTextColor2,
    orbInvertText: palette.orbInvertText,
  };
  if (palette.gradientAngle != null) {
    patch.gradientAngle = palette.gradientAngle;
  }
  return patch;
}
