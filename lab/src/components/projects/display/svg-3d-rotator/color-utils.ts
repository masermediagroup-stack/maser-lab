/** Linear interpolate between two hex colors (0–1). */
export function lerpHex(from: string, to: string, t: number): string {
  const a = parseHex(from);
  const b = parseHex(to);
  const clamped = Math.min(1, Math.max(0, t));

  const r = Math.round(a.r + (b.r - a.r) * clamped);
  const g = Math.round(a.g + (b.g - a.g) * clamped);
  const bch = Math.round(a.b + (b.b - a.b) * clamped);

  return `#${toHex(r)}${toHex(g)}${toHex(bch)}`;
}

/** Darken a hex color toward black by amount 0–1. */
export function darkenHex(hex: string, amount: number): string {
  return lerpHex(hex, "#000000", amount);
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace("#", "").trim();
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized.slice(0, 6);

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function toHex(n: number): string {
  return n.toString(16).padStart(2, "0");
}

export function computeLayerFill(
  index: number,
  depth: number,
  faceColor: string,
  backColor: string,
): string {
  if (depth <= 1 || index === 0) return faceColor;
  const t = index / (depth - 1);
  const base = lerpHex(faceColor, backColor, t);
  return darkenHex(base, t * 0.35);
}
