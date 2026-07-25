import type {
  CosinePaletteId,
  EdgeProfile,
  PaletteMode,
  QualityMode,
  RevealMode,
  TornTransitionSettings,
} from "./transition-types";

/** sRGB hex → linear-light RGB. Lighting maths only makes sense in linear. */
export function hexToLinear(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.padEnd(6, "0").slice(0, 6);

  const srgb = [0, 1, 2].map((i) => {
    const v = Number.parseInt(full.slice(i * 2, i * 2 + 2), 16) / 255;
    return Number.isFinite(v) ? v : 0;
  });

  return srgb.map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  ) as [number, number, number];
}

export type CosineCoefficients = {
  a: [number, number, number];
  b: [number, number, number];
  c: [number, number, number];
  d: [number, number, number];
};

/**
 * Hand-tuned cosine palettes (Iñigo Quílez form: `a + b·cos(2π(c·t + d))`).
 * Chosen for controlled hue ranges — none of them sweep a full rainbow.
 */
export const COSINE_PALETTES: Record<CosinePaletteId, CosineCoefficients> = {
  aurora: {
    a: [0.44, 0.5, 0.56],
    b: [0.32, 0.3, 0.4],
    c: [1.0, 1.0, 1.0],
    d: [0.56, 0.44, 0.3],
  },
  ember: {
    a: [0.5, 0.32, 0.24],
    b: [0.48, 0.3, 0.2],
    c: [1.0, 0.92, 0.86],
    d: [0.02, 0.14, 0.24],
  },
  ice: {
    a: [0.62, 0.68, 0.74],
    b: [0.24, 0.22, 0.2],
    c: [0.86, 0.9, 0.94],
    d: [0.42, 0.36, 0.28],
  },
  ultraviolet: {
    a: [0.34, 0.28, 0.48],
    b: [0.34, 0.24, 0.42],
    c: [1.0, 1.0, 0.92],
    d: [0.62, 0.5, 0.34],
  },
  sand: {
    a: [0.66, 0.6, 0.54],
    b: [0.22, 0.2, 0.2],
    c: [0.8, 0.84, 0.9],
    d: [0.18, 0.24, 0.34],
  },
  graphite: {
    a: [0.36, 0.37, 0.4],
    b: [0.3, 0.3, 0.32],
    c: [0.9, 0.9, 0.9],
    d: [0.1, 0.14, 0.2],
  },
};

export const COSINE_PALETTE_OPTIONS: {
  value: CosinePaletteId;
  label: string;
}[] = [
  { value: "aurora", label: "Aurora" },
  { value: "ember", label: "Ember" },
  { value: "ice", label: "Ice" },
  { value: "ultraviolet", label: "Ultraviolet" },
  { value: "sand", label: "Sand" },
  { value: "graphite", label: "Graphite" },
];

export const PALETTE_MODE_INDEX: Record<PaletteMode, number> = {
  stops: 0,
  cosine: 1,
  spectral: 2,
  mono: 3,
};

export const REVEAL_MODE_INDEX: Record<RevealMode, number> = {
  sweep: 0,
  reverse: 1,
  iris: 2,
};

export const EDGE_PROFILE_INDEX: Record<EdgeProfile, number> = {
  soft: 0,
  torn: 1,
  bubbled: 2,
  fibrous: 3,
  folded: 4,
  aggressive: 5,
  clean: 6,
};

export type ProfileShape = {
  /** Noise-band weights: low shape, mid tears, fine fibre, directional streak. */
  weights: [number, number, number, number];
  /** Multiplier on the alpha feather, so "clean" can go genuinely crisp. */
  feather: number;
};

/**
 * Each profile is a different *mix* of the same four tear bands rather than a
 * different algorithm, which keeps the shape sliders authoritative — the
 * profile biases the character, the sliders set the magnitude.
 */
export const EDGE_PROFILES: Record<EdgeProfile, ProfileShape> = {
  soft: { weights: [0.72, 0.24, 0.05, 0.08], feather: 2.6 },
  torn: { weights: [0.5, 0.34, 0.24, 0.18], feather: 1.0 },
  bubbled: { weights: [0.64, 0.3, 0.1, 0.1], feather: 1.5 },
  fibrous: { weights: [0.34, 0.26, 0.46, 0.42], feather: 0.7 },
  folded: { weights: [0.6, 0.18, 0.12, 0.36], feather: 1.2 },
  aggressive: { weights: [0.4, 0.52, 0.34, 0.26], feather: 0.45 },
  clean: { weights: [0.06, 0.03, 0.0, 0.0], feather: 0.3 },
};

export const EDGE_PROFILE_OPTIONS: { value: EdgeProfile; label: string }[] = [
  { value: "soft", label: "Soft" },
  { value: "torn", label: "Torn" },
  { value: "bubbled", label: "Bubbled" },
  { value: "fibrous", label: "Fibrous" },
  { value: "folded", label: "Folded" },
  { value: "aggressive", label: "Aggressive" },
  { value: "clean", label: "Clean" },
];

export const REVEAL_MODE_OPTIONS: { value: RevealMode; label: string }[] = [
  { value: "sweep", label: "Sweep through" },
  { value: "reverse", label: "Retreat back" },
  { value: "iris", label: "Iris open" },
];

export const PALETTE_MODE_OPTIONS: { value: PaletteMode; label: string }[] = [
  { value: "stops", label: "Colour stops" },
  { value: "cosine", label: "Cosine palette" },
  { value: "spectral", label: "Spectral" },
  { value: "mono", label: "Two-tone" },
];

/**
 * Quality tiers. `fbmOctaves` becomes a `#define`, so switching tiers
 * recompiles the program — which is why it is derived once from the device and
 * exposed as an explicit control rather than adapting every frame.
 */
export const QUALITY_PROFILES: Record<
  QualityMode,
  { fbmOctaves: number; maxDpr: number; label: string }
> = {
  high: { fbmOctaves: 4, maxDpr: 2, label: "High" },
  balanced: { fbmOctaves: 3, maxDpr: 1.75, label: "Balanced" },
  mobile: { fbmOctaves: 2, maxDpr: 1.5, label: "Mobile" },
};

export function detectQuality(): QualityMode {
  if (typeof window === "undefined") return "balanced";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 820px)").matches;
  if (coarse || narrow) return "mobile";
  const cores = navigator.hardwareConcurrency ?? 4;
  return cores >= 8 ? "high" : "balanced";
}

/** Screen margin the sheet needs beyond the viewport so tears never clip. */
export function edgeMargin(settings: TornTransitionSettings): number {
  return settings.bandWidth + settings.tearAmplitude * 1.6 + 0.1;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function downloadFile(
  filename: string,
  contents: string,
  type = "application/json",
) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export const roundTo = (value: number, step: number) => {
  const decimals = Math.max(0, Math.ceil(-Math.log10(step)));
  return Number.parseFloat(value.toFixed(decimals));
};
