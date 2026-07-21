import type { TetrisPixelSettings } from "./types";

export type TetrisExportTab = "component" | "styles" | "usage" | "setup";

export type TetrisExportBundle = {
  component: string;
  styles: string;
  usage: string;
  setup: string;
  summary: string;
};

function formatProp(key: string, value: string | number | boolean): string {
  if (typeof value === "string") return `  ${key}="${value.replace(/"/g, '\\"')}"`;
  if (typeof value === "boolean") return `  ${key}={${value}}`;
  return `  ${key}={${value}}`;
}

export function generateTetrisExport(
  text: string,
  settings: TetrisPixelSettings,
): TetrisExportBundle {
  const lines = [text, settings.line2].filter((l) => l.trim());
  const displayText = lines.join("\\n");

  const summary = [
    `text: ${JSON.stringify(text)}`,
    settings.line2 ? `line2: ${JSON.stringify(settings.line2)}` : null,
    `colorMode: ${settings.colorMode}`,
    `color: ${settings.color}`,
    `background: ${settings.background}`,
    `cellSize: ${settings.cellSize}`,
    `fallDuration: ${settings.fallDuration}`,
    `stagger: ${settings.stagger}`,
    `horizontalMovement: ${settings.horizontalMovement}`,
    `rotationAmount: ${settings.rotationAmount}`,
    `glowIntensity: ${settings.glowIntensity}`,
    `layoutSeed: ${settings.layoutSeed}`,
    `motionSeed: ${settings.motionSeed}`,
    `revealOutDirection: ${settings.revealOutDirection}`,
    `fontVariant: ${settings.fontVariant}`,
  ]
    .filter(Boolean)
    .join("\n");

  const usageProps = [
    formatProp("text", text),
    settings.line2 ? formatProp("line2", settings.line2) : null,
    formatProp("colorMode", settings.colorMode),
    formatProp("color", settings.color),
    formatProp("background", settings.background),
    formatProp("cellSize", settings.cellSize),
    formatProp("fallDuration", settings.fallDuration),
    formatProp("stagger", settings.stagger),
    formatProp("horizontalMovement", settings.horizontalMovement),
    formatProp("rotationAmount", settings.rotationAmount),
    formatProp("glowIntensity", settings.glowIntensity),
    formatProp("layoutSeed", settings.layoutSeed),
    formatProp("motionSeed", settings.motionSeed),
    formatProp("revealOutDirection", settings.revealOutDirection),
    formatProp("fontVariant", settings.fontVariant),
    formatProp("autoPlay", true),
    formatProp("loop", settings.loop),
  ]
    .filter(Boolean)
    .join("\n");

  const usage = `import { TetrisPixelText } from "./TetrisPixelText";

export function HeroTitle() {
  return (
    <div style={{ width: "100%", height: 420 }}>
      <TetrisPixelText
${usageProps}
      />
    </div>
  );
}
`;

  const setup = `# Tetris Pixel Text — Setup

## Install

No animation libraries required. Peer dependency:

\`\`\`bash
npm install react react-dom
\`\`\`

TypeScript recommended.

## Font

Load Geist Pixel (Square or Grid) before mounting:

\`\`\`html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Geist+Pixel:wght@400&display=swap"
  rel="stylesheet"
/>
\`\`\`

Or via CSS:

\`\`\`css
@import url("https://fonts.googleapis.com/css2?family=Geist+Pixel:wght@400&display=swap");
\`\`\`

## Files

1. Copy \`TetrisPixelText.tsx\` into your project.
2. Copy \`tetris-pixel-text.css\` (optional — component is mostly inline).
3. Import and render with your seeds/settings.

## Seeds

Current layout seed: ${settings.layoutSeed}
Current motion seed: ${settings.motionSeed}

Same seeds reproduce the same piece partition and motion paths.

## Accessibility

The component exposes \`role="img"\` and a visually hidden text label.
Honor \`prefers-reduced-motion\` (completed text shown immediately).

## Preview text

"${displayText.replace(/\\n/g, " / ")}"
`;

  const styles = `/* Optional host styles for Tetris Pixel Text */
.tetris-pixel-text-host {
  width: 100%;
  min-height: 320px;
  background: ${settings.background};
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .tetris-pixel-text-host {
    /* Component already snaps to final grid when reduced motion is on */
  }
}
`;

  const component = generatePortableComponent(text, settings);

  return { component, styles, usage, setup, summary };
}

function generatePortableComponent(text: string, settings: TetrisPixelSettings): string {
  return `/**
 * TetrisPixelText — portable Canvas 2D text reveal
 * Exported from Maser-Lab Text Animation Lab
 * layoutSeed=${settings.layoutSeed} motionSeed=${settings.motionSeed}
 */
"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

export type ColorMode = "solid" | "rainbow" | "animated-rainbow" | "gradient";
export type RevealOutDirection =
  | "fall-down"
  | "lift-up"
  | "scatter-vertical"
  | "reverse-assembly";
export type FontVariant = "geist-pixel-square" | "geist-pixel-grid";
export type RotationDeg = 0 | 90 | 180 | 270;

export type TetrisPixelTextProps = {
  text?: string;
  line2?: string;
  colorMode?: ColorMode;
  color?: string;
  background?: string;
  cellSize?: number;
  fallDuration?: number;
  stagger?: number;
  horizontalMovement?: number;
  rotationAmount?: number;
  glowIntensity?: number;
  glowRadius?: number;
  glowDuration?: number;
  landingBounce?: number;
  impactFlash?: number;
  finalWordGlow?: number;
  layoutSeed?: number;
  motionSeed?: number;
  fontVariant?: FontVariant;
  fontSize?: number;
  revealOutDirection?: RevealOutDirection;
  phase?: "in" | "out";
  autoPlay?: boolean;
  loop?: boolean;
  paused?: boolean;
  playKey?: number;
  className?: string;
  style?: CSSProperties;
};

type Cell = { x: number; y: number };
type Piece = {
  id: string;
  cells: Cell[];
  targetX: number;
  targetY: number;
  spawnX: number;
  spawnY: number;
  startRotation: number;
  rotationSteps: number;
  horizontalWaypoints: number[];
  delay: number;
  duration: number;
  color: string;
  glowColor: string;
  x: number;
  y: number;
  rotation: number;
  landed: boolean;
  glowAlpha: number;
  impactFlash: number;
  bounceScaleY: number;
  visible: boolean;
};

const DEFAULTS = {
  text: ${JSON.stringify(text)},
  line2: ${JSON.stringify(settings.line2)},
  colorMode: ${JSON.stringify(settings.colorMode)} as ColorMode,
  color: ${JSON.stringify(settings.color)},
  background: ${JSON.stringify(settings.background)},
  cellSize: ${settings.cellSize},
  fallDuration: ${settings.fallDuration},
  stagger: ${settings.stagger},
  staggerRandomness: ${settings.staggerRandomness},
  horizontalMovement: ${settings.horizontalMovement},
  horizontalCorrections: ${settings.horizontalCorrections},
  rotationAmount: ${settings.rotationAmount},
  maxQuarterTurns: ${settings.maxQuarterTurns},
  rotationSpeed: ${settings.rotationSpeed},
  glowIntensity: ${settings.glowIntensity},
  glowRadius: ${settings.glowRadius},
  glowDuration: ${settings.glowDuration},
  landingBounce: ${settings.landingBounce},
  impactFlash: ${settings.impactFlash},
  finalWordGlow: ${settings.finalWordGlow},
  layoutSeed: ${settings.layoutSeed},
  motionSeed: ${settings.motionSeed},
  fontVariant: ${JSON.stringify(settings.fontVariant)} as FontVariant,
  fontSize: ${settings.fontSize},
  letterSpacing: ${settings.letterSpacing},
  lineHeight: ${settings.lineHeight},
  textAlign: ${JSON.stringify(settings.textAlign)} as CanvasTextAlign,
  gridPadding: ${settings.gridPadding},
  pieceSizePreference: ${settings.pieceSizePreference},
  tetrominoFrequency: ${settings.tetrominoFrequency},
  triominoFrequency: ${settings.triominoFrequency},
  shapeVariety: ${settings.shapeVariety},
  spawnHeightMin: ${settings.spawnHeightMin},
  spawnHeightMax: ${settings.spawnHeightMax},
  pieceSpacing: ${settings.pieceSpacing},
  landingDensity: ${settings.landingDensity},
  edgeDetail: ${settings.edgeDetail},
  revealOutDirection: ${JSON.stringify(settings.revealOutDirection)} as RevealOutDirection,
  revealOutSpeed: ${settings.revealOutSpeed},
  rainbowSaturation: ${settings.rainbowSaturation},
  rainbowBrightness: ${settings.rainbowBrightness},
  rainbowSpread: ${settings.rainbowSpread},
  hueSpeed: ${settings.hueSpeed},
  gradientAxis: ${JSON.stringify(settings.gradientAxis)},
  phase: "in" as const,
  paused: false,
};

const SHAPES: Array<{ id: string; cells: Cell[] }> = [
  { id: "I", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }] },
  { id: "O", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] },
  { id: "T", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }] },
  { id: "L", cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }] },
  { id: "J", cells: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 0, y: 2 }] },
  { id: "S", cells: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] },
  { id: "Z", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }] },
  { id: "I3", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }] },
  { id: "V3", cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] },
  { id: "D2", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }] },
  { id: "P5", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 2 }] },
];

function mulberry32(seed: number) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function key(x: number, y: number) {
  return x + "," + y;
}

function normalize(cells: Cell[]) {
  const minX = Math.min(...cells.map((c) => c.x));
  const minY = Math.min(...cells.map((c) => c.y));
  return cells
    .map((c) => ({ x: c.x - minX, y: c.y - minY }))
    .sort((a, b) => a.y - b.y || a.x - b.x);
}

function rotate90(cells: Cell[]) {
  return normalize(cells.map((c) => ({ x: -c.y, y: c.x })));
}

function rotate(cells: Cell[], deg: RotationDeg) {
  let r = normalize(cells);
  for (let i = 0; i < deg / 90; i++) r = rotate90(r);
  return r;
}

function hslToHex(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, "0");
  return "#" + to(r) + to(g) + to(b);
}

function hexToRgb(hex: string) {
  const v = hex.replace("#", "");
  const n = parseInt(v.length === 3 ? v.split("").map((c) => c + c).join("") : v, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

async function buildMask(
  text: string,
  line2: string,
  w: number,
  h: number,
  cellSize: number,
  fontFamily: string,
  fontSize: number,
  letterSpacing: number,
  lineHeight: number,
  textAlign: CanvasTextAlign,
  gridPadding: number,
) {
  const lines = [text, line2].map((l) => l.trim()).filter(Boolean);
  const resolved = lines.length ? lines : ["A"];
  if (document.fonts?.load) {
    try { await document.fonts.load("400 " + fontSize + "px " + fontFamily); } catch { /* ignore */ }
  }
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(w * scale));
  canvas.height = Math.max(1, Math.floor(h * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#fff";
  ctx.textAlign = textAlign;
  ctx.textBaseline = "middle";
  ctx.font = "400 " + fontSize * scale + "px " + fontFamily;
  const lh = fontSize * lineHeight * scale;
  const startY = canvas.height / 2 - ((resolved.length - 1) * lh) / 2;
  const ax = textAlign === "left" ? canvas.width * 0.08 : textAlign === "right" ? canvas.width * 0.92 : canvas.width / 2;
  resolved.forEach((line, i) => ctx.fillText(line, ax, startY + i * lh));
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const step = Math.max(1, Math.round(cellSize * scale));
  const raw: Cell[] = [];
  for (let py = 0; py < canvas.height; py += step) {
    for (let px = 0; px < canvas.width; px += step) {
      if ((data[(py * canvas.width + px) * 4 + 3] ?? 0) >= 40) {
        raw.push({ x: Math.floor(px / step), y: Math.floor(py / step) });
      }
    }
  }
  if (!raw.length) return { width: 1, height: 1, cells: new Set<string>(), occupied: [] as Cell[] };
  const minX = Math.min(...raw.map((c) => c.x));
  const minY = Math.min(...raw.map((c) => c.y));
  const maxX = Math.max(...raw.map((c) => c.x));
  const maxY = Math.max(...raw.map((c) => c.y));
  const cells = new Set<string>();
  const occupied: Cell[] = [];
  for (const c of raw) {
    const x = c.x - minX + gridPadding;
    const y = c.y - minY + gridPadding;
    const k = key(x, y);
    if (cells.has(k)) continue;
    cells.add(k);
    occupied.push({ x, y });
  }
  return {
    width: maxX - minX + 1 + gridPadding * 2,
    height: maxY - minY + 1 + gridPadding * 2,
    cells,
    occupied,
  };
}

function partition(mask: { cells: Set<string>; occupied: Cell[] }, seed: number) {
  const rand = mulberry32(seed);
  const remaining = new Set(mask.cells);
  const placements: Array<{ cells: Cell[]; ox: number; oy: number }> = [];
  const orients = (cells: Cell[]) => {
    const out: Cell[][] = [];
    const seen = new Set<string>();
    let cur = normalize(cells);
    for (let i = 0; i < 4; i++) {
      const k = cur.map((c) => key(c.x, c.y)).join("|");
      if (!seen.has(k)) { seen.add(k); out.push(cur); }
      cur = rotate90(cur);
    }
    return out;
  };

  const tryPlace = () => {
    const starts = [...remaining].map((k) => {
      const [x, y] = k.split(",").map(Number);
      return { x: x!, y: y! };
    }).sort(() => rand() - 0.5).slice(0, 40);
    const shapes = [...SHAPES].sort(() => rand() - 0.5);
    let best: { cells: Cell[]; ox: number; oy: number; score: number } | null = null;
    for (const start of starts) {
      for (const shape of shapes) {
        for (const orient of orients(shape.cells)) {
          for (const local of orient) {
            const ox = start.x - local.x;
            const oy = start.y - local.y;
            const world = orient.map((c) => ({ x: c.x + ox, y: c.y + oy }));
            if (!world.every((c) => remaining.has(key(c.x, c.y)))) continue;
            const score = world.length * 2 + rand();
            if (!best || score > best.score) best = { cells: world, ox, oy, score };
          }
        }
      }
    }
    return best;
  };

  let guard = 0;
  while (remaining.size && guard++ < mask.occupied.length + 40) {
    const placed = tryPlace();
    if (!placed) break;
    for (const c of placed.cells) remaining.delete(key(c.x, c.y));
    placements.push(placed);
  }
  while (remaining.size) {
    const k0 = remaining.values().next().value as string;
    const [sx, sy] = k0.split(",").map(Number);
    const stack = [{ x: sx!, y: sy! }];
    const group: Cell[] = [];
    remaining.delete(k0);
    while (stack.length) {
      const cur = stack.pop()!;
      group.push(cur);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const nk = key(cur.x + dx, cur.y + dy);
        if (!remaining.has(nk)) continue;
        remaining.delete(nk);
        stack.push({ x: cur.x + dx, y: cur.y + dy });
      }
    }
    for (let i = 0; i < group.length; i += 4) {
      const chunk = group.slice(i, i + 4);
      const minX = Math.min(...chunk.map((c) => c.x));
      const minY = Math.min(...chunk.map((c) => c.y));
      placements.push({ cells: chunk, ox: minX, oy: minY });
    }
  }

  return placements.map((p, i) => {
    const minX = Math.min(...p.cells.map((c) => c.x));
    const minY = Math.min(...p.cells.map((c) => c.y));
    const local = p.cells.map((c) => ({ x: c.x - minX, y: c.y - minY }));
    return { id: "p-" + i, cells: local, targetX: minX, targetY: minY };
  });
}

function assignMotion(
  base: Array<{ id: string; cells: Cell[]; targetX: number; targetY: number }>,
  gridW: number,
  gridH: number,
  cfg: typeof DEFAULTS,
) {
  const rand = mulberry32(cfg.motionSeed);
  const ordered = [...base].sort((a, b) => {
    const ay = Math.max(...a.cells.map((c) => c.y + a.targetY));
    const by = Math.max(...b.cells.map((c) => c.y + b.targetY));
    return by - ay;
  });
  return ordered.map((piece, seq) => {
    const move = cfg.horizontalMovement;
    const drift = Math.max(1, Math.round(gridW * 0.22 * move));
    const waypoints: number[] = [];
    let col = Math.max(0, Math.min(gridW - 1, piece.targetX + Math.floor(rand() * (drift * 2 + 1) - drift)));
    const corrections = Math.max(0, Math.round(cfg.horizontalCorrections * (0.5 + move * 0.5)));
    for (let i = 0; i < corrections; i++) {
      col = Math.max(0, Math.min(gridW - 1, piece.targetX + Math.floor(rand() * (drift - 1) * 2 - (drift - 1))));
      waypoints.push(col);
    }
    waypoints.push(piece.targetX);
    let steps = 0;
    if (cfg.rotationAmount > 0.05 && rand() < cfg.rotationAmount) {
      steps = 1 + Math.floor(rand() * Math.max(1, cfg.maxQuarterTurns));
      steps = Math.min(steps, cfg.maxQuarterTurns);
    }
    const spawnX = move < 0.15 ? piece.targetX : Math.max(0, Math.min(gridW - 1, piece.targetX + Math.floor(rand() * drift * 2 - drift)));
    const spawnY = -Math.ceil(gridH * (cfg.spawnHeightMin + rand() * (cfg.spawnHeightMax - cfg.spawnHeightMin)));
    const delay = Math.max(0, seq * cfg.stagger + cfg.stagger * cfg.staggerRandomness * (rand() * 2 - 1));
    const duration = cfg.fallDuration * (0.88 + rand() * 0.24);
    const n = ordered.length;
    let color = cfg.color;
    if (cfg.colorMode === "rainbow" || cfg.colorMode === "animated-rainbow") {
      color = hslToHex(((seq / n) * 360 * cfg.rainbowSpread) % 360, cfg.rainbowSaturation, cfg.rainbowBrightness * 0.5);
    } else if (cfg.colorMode === "gradient") {
      color = hslToHex((piece.targetX / Math.max(gridW - 1, 1)) * 280, cfg.rainbowSaturation, cfg.rainbowBrightness * 0.5);
    }
    return {
      ...piece,
      spawnX,
      spawnY,
      startRotation: steps * 90,
      rotationSteps: steps,
      horizontalWaypoints: waypoints,
      delay,
      duration,
      color,
      glowColor: color,
      x: spawnX,
      y: spawnY,
      rotation: steps * 90,
      landed: false,
      glowAlpha: 0,
      impactFlash: 0,
      bounceScaleY: 1,
      visible: true,
    } satisfies Piece;
  });
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function horiz(spawnX: number, waypoints: number[], targetX: number, t: number) {
  const pts = [spawnX, ...waypoints];
  if (pts[pts.length - 1] !== targetX) pts.push(targetX);
  const travel = Math.min(1, t / 0.82);
  const segs = pts.length - 1;
  const f = travel * segs;
  const i = Math.min(segs - 1, Math.floor(f));
  const local = f - i;
  const slide = local < 0.2 ? (local / 0.2) ** 3 : 1;
  return lerp(pts[i]!, pts[i + 1]!, slide);
}

function rotAt(start: number, steps: number, t: number) {
  if (steps <= 0) return 0;
  const u = Math.max(0, Math.min(1, (t - 0.15) / 0.6));
  const current = Math.min(steps, Math.floor(u * steps + 1e-6));
  return start - current * 90;
}

function drawnCells(p: Piece) {
  const snapped = ((((Math.round(p.rotation / 90) % 4) + 4) % 4) * 90) as RotationDeg;
  return rotate(p.cells, snapped).map((c) => ({
    x: Math.round(p.x) + c.x,
    y: Math.round(p.y) + c.y,
  }));
}

export function TetrisPixelText(props: TetrisPixelTextProps) {
  const cfg = { ...DEFAULTS, ...props };
  const text = props.text ?? DEFAULTS.text;
  const reduced = usePrefersReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const piecesRef = useRef<Piece[]>([]);
  const gridRef = useRef({ w: 1, h: 1 });
  const phaseRef = useRef<"in" | "out" | "hold">(cfg.phase);
  const elapsedRef = useRef(0);
  const wordGlowRef = useRef(0);
  const rafRef = useRef(0);
  const playKey = props.playKey ?? 0;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    let cancelled = false;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrap.clientWidth || 640;
      const h = wrap.clientHeight || 420;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      return { w, h };
    };

    const fontFamily =
      cfg.fontVariant === "geist-pixel-grid"
        ? '"Geist Pixel Grid", "Geist Pixel", monospace'
        : '"Geist Pixel", "Geist Pixel Square", monospace';

    const build = async () => {
      const { w, h } = resize();
      const mask = await buildMask(
        text,
        cfg.line2,
        w,
        h,
        cfg.cellSize,
        fontFamily,
        cfg.fontSize,
        cfg.letterSpacing,
        cfg.lineHeight,
        cfg.textAlign,
        cfg.gridPadding,
      );
      if (cancelled) return;
      gridRef.current = { w: mask.width, h: mask.height };
      const parts = partition(mask, cfg.layoutSeed);
      const pieces = assignMotion(parts, mask.width, mask.height, { ...cfg, text });
      if (reduced || cfg.phase === "out") {
        for (const p of pieces) {
          p.x = p.targetX; p.y = p.targetY; p.rotation = 0; p.landed = true;
        }
        phaseRef.current = cfg.phase === "out" ? "out" : "hold";
      } else {
        phaseRef.current = "in";
      }
      piecesRef.current = pieces;
      elapsedRef.current = 0;
      wordGlowRef.current = 0;
    };

    let last = performance.now();
    const frame = (ts: number) => {
      if (cancelled) return;
      const dt = Math.min(48, ts - last);
      last = ts;
      if (!document.hidden && !cfg.paused) {
        elapsedRef.current += dt;
        const pieces = piecesRef.current;
        const { w: gw, h: gh } = gridRef.current;
        const cssW = wrap.clientWidth || 640;
        const cssH = wrap.clientHeight || 420;
        const cell = cfg.cellSize;
        const ox = Math.floor((cssW - gw * cell) / 2);
        const oy = Math.floor((cssH - gh * cell) / 2);

        if (phaseRef.current === "in") {
          let landed = 0;
          for (let i = 0; i < pieces.length; i++) {
            const p = pieces[i]!;
            const local = elapsedRef.current - p.delay;
            if (cfg.colorMode === "animated-rainbow") {
              p.color = hslToHex((((i / pieces.length) * 360 * cfg.rainbowSpread) + elapsedRef.current * cfg.hueSpeed * 0.06) % 360, cfg.rainbowSaturation, cfg.rainbowBrightness * 0.5);
              p.glowColor = p.color;
            }
            if (local < 0) continue;
            if (p.landed) {
              landed++;
              const since = local - p.duration;
              p.glowAlpha = Math.max(0, 1 - since / cfg.glowDuration) * cfg.glowIntensity;
              p.impactFlash = Math.max(0, 1 - since / 120) * cfg.impactFlash;
              const bt = Math.min(1, since / 180);
              p.bounceScaleY = 1 - Math.sin(bt * Math.PI) * cfg.landingBounce * 0.12;
              continue;
            }
            const t = Math.min(1, local / p.duration);
            const yT = t < 0.85 ? t / 0.85 : 1;
            p.y = lerp(p.spawnY, p.targetY, yT * yT);
            p.x = horiz(p.spawnX, p.horizontalWaypoints, p.targetX, t);
            p.rotation = rotAt(p.startRotation, p.rotationSteps, t);
            if (t >= 1) {
              p.landed = true; p.x = p.targetX; p.y = p.targetY; p.rotation = 0;
              p.glowAlpha = cfg.glowIntensity; p.impactFlash = cfg.impactFlash;
              landed++;
            }
          }
          if (landed === pieces.length && pieces.length) {
            phaseRef.current = "hold";
            wordGlowRef.current = cfg.finalWordGlow;
          }
        } else if (phaseRef.current === "out") {
          const speed = Math.max(0.35, cfg.revealOutSpeed);
          const ordered = [...pieces].sort((a, b) =>
            Math.min(...a.cells.map((c) => c.y + a.targetY)) - Math.min(...b.cells.map((c) => c.y + b.targetY)),
          );
          for (let seq = 0; seq < ordered.length; seq++) {
            const p = ordered[seq]!;
            const local = elapsedRef.current - seq * (cfg.stagger / speed) * 0.85;
            if (local < 0) continue;
            const t = Math.min(1, local / ((cfg.fallDuration * 0.65) / speed));
            const exit = gh + 6;
            let dy = p.targetY + exit;
            let dx = p.targetX;
            let dr = 90;
            if (cfg.revealOutDirection === "lift-up") { dy = p.targetY - exit; dr = -90; }
            if (cfg.revealOutDirection === "scatter-vertical") {
              dy = seq % 2 === 0 ? p.targetY + exit : p.targetY - exit;
              dx = p.targetX + ((seq % 5) - 2);
            }
            if (cfg.revealOutDirection === "reverse-assembly") { dy = p.spawnY; dx = p.spawnX; dr = p.startRotation; }
            const ease = t * t * t;
            p.x = lerp(p.targetX, dx, ease);
            p.y = lerp(p.targetY, dy, ease);
            p.rotation = lerp(0, dr, ease);
            p.landed = false;
            p.visible = t < 1;
            p.glowAlpha = t < 0.08 ? cfg.glowIntensity * (1 - t / 0.08) : 0;
          }
        } else {
          wordGlowRef.current = cfg.finalWordGlow * (0.75 + 0.25 * Math.sin(elapsedRef.current / 600));
          if (cfg.colorMode === "animated-rainbow") {
            for (let i = 0; i < pieces.length; i++) {
              const p = pieces[i]!;
              p.color = hslToHex((((i / pieces.length) * 360 * cfg.rainbowSpread) + elapsedRef.current * cfg.hueSpeed * 0.06) % 360, cfg.rainbowSaturation, cfg.rainbowBrightness * 0.5);
            }
          }
        }

        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = cfg.background;
        ctx.fillRect(0, 0, cssW, cssH);
        for (const p of pieces) {
          if (!p.visible) continue;
          const cells = drawnCells(p);
          if (p.glowAlpha > 0.01 || wordGlowRef.current > 0.02) {
            const rgb = hexToRgb(p.glowColor);
            const intensity = Math.max(p.glowAlpha, wordGlowRef.current * 0.35);
            for (const c of cells) {
              const px = ox + c.x * cell;
              const py = oy + c.y * cell;
              const r = cell * (0.6 + cfg.glowRadius * 0.35);
              const g = ctx.createRadialGradient(px + cell / 2, py + cell / 2, cell * 0.15, px + cell / 2, py + cell / 2, r);
              g.addColorStop(0, "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + 0.55 * intensity + ")");
              g.addColorStop(1, "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ",0)");
              ctx.fillStyle = g;
              ctx.fillRect(px - r, py - r, cell + r * 2, cell + r * 2);
            }
          }
          ctx.fillStyle = p.color;
          for (const c of cells) {
            const h = cell * p.bounceScaleY;
            ctx.fillRect(Math.round(ox + c.x * cell), Math.round(oy + c.y * cell + (cell - h) / 2), cell, Math.max(1, Math.round(h)));
          }
        }
      }
      rafRef.current = requestAnimationFrame(frame);
    };

    void build().then(() => {
      if (!cancelled) {
        last = performance.now();
        rafRef.current = requestAnimationFrame(frame);
      }
    });

    const ro = new ResizeObserver(() => { void build(); });
    ro.observe(wrap);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [text, cfg.line2, cfg.layoutSeed, cfg.motionSeed, cfg.cellSize, cfg.phase, cfg.colorMode, cfg.color, playKey, reduced]);

  const label = [text, cfg.line2].filter(Boolean).join(" ");

  return (
    <div
      ref={wrapRef}
      className={props.className}
      style={{ position: "relative", width: "100%", height: "100%", minHeight: 320, background: cfg.background, overflow: "hidden", ...props.style }}
      role="img"
      aria-label={label}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} aria-hidden="true" />
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>{label}</span>
    </div>
  );
}

export default TetrisPixelText;
`;
}
