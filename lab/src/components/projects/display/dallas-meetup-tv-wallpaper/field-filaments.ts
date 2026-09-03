/**
 * Grok 4 field filaments — wallpaper FIELD only.
 *
 * Eight stops sampled from xAI Grok 4 artwork, not published brand tokens.
 * Random assignment per filament (seeded). Never longitude / meridians /
 * parallels on the mark. Hairlines on paper, source-over, no bloom/glow/add.
 * Pale stops that vanish on `--dallas-paper` fall back toward indigo/rose/red.
 */

export const DALLAS_PAPER_HEX = "#F2F1ED";

/** Provenance: sampled from xAI Grok 4 artwork, not published brand tokens. */
export const GROK4_FIELD_STOPS = [
  { id: "rose", hex: "#CF525C" },
  { id: "red", hex: "#F15336" },
  { id: "orange", hex: "#FEB87C" },
  { id: "cream", hex: "#FFE4A6" },
  { id: "icy", hex: "#C4D3E1" },
  { id: "cyan", hex: "#AAD5EA" },
  { id: "blue", hex: "#86A4C6" },
  { id: "indigo", hex: "#7775A5" },
] as const;

export type Grok4FieldStopId = (typeof GROK4_FIELD_STOPS)[number]["id"];

/** Visible-at-1× fallbacks when a sampled stop would read as paper-on-paper. */
export const GROK4_FIELD_FALLBACK = ["#7775A5", "#CF525C", "#F15336"] as const;

export const FIELD_FILAMENT_SEED = 0xda11a5;
export const FIELD_BUNDLE_COUNT = 3;
export const FIELD_FILAMENTS_PER_BUNDLE = [11, 13, 10] as const;

export type FieldFilament = {
  x0: number;
  y0: number;
  cpx: number;
  cpy: number;
  x1: number;
  y1: number;
  width: number;
  hex: string;
  sampledId: Grok4FieldStopId;
};

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function parseHex(hex: string): readonly [number, number, number] {
  const h = hex.replace("#", "");
  return [
    Number.parseInt(h.slice(0, 2), 16),
    Number.parseInt(h.slice(2, 4), 16),
    Number.parseInt(h.slice(4, 6), 16),
  ];
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

/** WCAG contrast vs Dallas paper. Pale cream/icy land near 1.05–1.2. */
export function contrastVsPaper(hex: string, paper = DALLAS_PAPER_HEX): number {
  const a = relativeLuminance(hex);
  const p = relativeLuminance(paper);
  const lighter = Math.max(a, p);
  const darker = Math.min(a, p);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Hairline must hold at 1× on `#F2F1ED` or it is invisible paper-on-paper. */
const VANISH_ON_PAPER = new Set(["#FFE4A6", "#C4D3E1"]);

export function fieldStopHoldsAt1x(hex: string): boolean {
  if (VANISH_ON_PAPER.has(hex.toUpperCase())) return false;
  return contrastVsPaper(hex) >= 1.35;
}

export function assignFieldHex(sampledHex: string, fallbackIndex: number): string {
  if (fieldStopHoldsAt1x(sampledHex)) return sampledHex;
  return GROK4_FIELD_FALLBACK[fallbackIndex % GROK4_FIELD_FALLBACK.length]!;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Near-parallel hairline bundles that fan and compress across the paper field.
 * Coordinates are in canvas pixels. Not meridians — flow is lateral, not polar.
 */
export function generateFieldFilaments(
  width: number,
  height: number,
  seed = FIELD_FILAMENT_SEED,
): FieldFilament[] {
  const rng = mulberry32(seed);
  const filaments: FieldFilament[] = [];

  for (let b = 0; b < FIELD_BUNDLE_COUNT; b += 1) {
    const count = FIELD_FILAMENTS_PER_BUNDLE[b] ?? 14;
    const angle = -0.32 + b * 0.11 + (rng() - 0.5) * 0.03;
    const nx = Math.cos(angle);
    const ny = Math.sin(angle);
    const px = -ny;
    const py = nx;
    const originX = width * (-0.08 + rng() * 0.18);
    const originY = height * (0.08 + rng() * 0.78);
    const length = width * (0.92 + rng() * 0.28);
    const fan = 10 + b * 5 + rng() * 8;
    const compress = 0.35 + rng() * 0.9;

    for (let i = 0; i < count; i += 1) {
      const span = Math.max(1, count - 1);
      const t = i / span - 0.5;
      const spread = fan * (1 + t * 2 * (compress - 0.5));
      const x0 = originX + px * spread * t * 14;
      const y0 = originY + py * spread * t * 14;
      const cpx = x0 + nx * length * 0.48 + px * t * spread * 7 + (rng() - 0.5) * 18;
      const cpy = y0 + ny * length * 0.48 + py * t * spread * 22 + (rng() - 0.5) * 24;
      const x1 = x0 + nx * length + px * t * spread * 5;
      const y1 = y0 + ny * length + py * t * spread * 6;

      const stop = GROK4_FIELD_STOPS[Math.floor(rng() * GROK4_FIELD_STOPS.length)]!;
      const hex = assignFieldHex(stop.hex, Math.floor(rng() * GROK4_FIELD_FALLBACK.length));

      filaments.push({
        x0,
        y0,
        cpx,
        cpy,
        x1,
        y1,
        width: 0.65 + rng() * 0.55,
        hex,
        sampledId: stop.id,
      });
    }
  }

  return filaments;
}

export function drawFieldFilaments(
  ctx: CanvasRenderingContext2D,
  width: number,
  filaments: readonly FieldFilament[],
) {
  const scale = width / 1920;
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const f of filaments) {
    ctx.strokeStyle = f.hex;
    ctx.lineWidth = Math.max(0.55, f.width * scale);
    ctx.beginPath();
    ctx.moveTo(f.x0, f.y0);
    ctx.quadraticCurveTo(f.cpx, f.cpy, f.x1, f.y1);
    ctx.stroke();
  }
  ctx.restore();
}
