import { HEATMAP_COPY } from "./copy";

export type PosterLayout = {
  cardW: number;
  cardH: number;
  imagePlateY: number;
  imagePlateH: number;
  captionPlateY: number;
  captionPlateH: number;
  dividerY: number;
  frameWeight: number;
  hasCaption: boolean;
};

export type PosterColors = {
  page: string;
  ground: string;
  frame: string;
  type: string;
};

const LABEL_SIZE = 10; // 0.625rem = 10px
const LABEL_LINE_HEIGHT = 1.4;
const LABEL_LETTER_SPACING = 0.08;
const LABEL_BOTTOM_GAP = 4; // 0.25rem

const TEXT_SIZE = 14; // 0.875rem = 14px
const TEXT_LINE_HEIGHT = 1.4;

const PAD_X = 16; // 1rem
const PAD_Y = 12; // 0.75rem
const FRAME_WEIGHT = 1;

function makeLabelFont(scale: number): string {
  return `400 ${LABEL_SIZE * scale}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
}

function makeTextFont(scale: number): string {
  return `400 ${TEXT_SIZE * scale}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
}

/**
 * Measure and wrap text in LAYOUT units (independent of DPR).
 * Uses a scratch canvas at 1x for measurement so wrap points are stable.
 */
const measureCtx = typeof document !== "undefined"
  ? document.createElement("canvas").getContext("2d")
  : null;

function wrapText(text: string, maxWidth: number, fontSize: number, letterSpacing: number): string[] {
  if (!measureCtx || maxWidth <= 0) return [text];
  measureCtx.font = `400 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
  (measureCtx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${letterSpacing}em`;
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (measureCtx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

/**
 * Compute caption plate height in LAYOUT units from caption text.
 * This is the single source of truth for caption height in both
 * compose and export — resolution-independent.
 */
export function measureCaptionHeight(caption: string | undefined, cardWidth: number): number {
  if (!caption || caption.length === 0) return 0;
  const contentWidth = cardWidth - PAD_X * 2;
  if (contentWidth <= 0) return 0;

  const labelH = LABEL_SIZE * LABEL_LINE_HEIGHT + LABEL_BOTTOM_GAP;
  const wrappedLines = wrapText(caption, contentWidth, TEXT_SIZE, 0);
  const textH = wrappedLines.length * TEXT_SIZE * TEXT_LINE_HEIGHT;

  return PAD_Y + labelH + textH + PAD_Y;
}

/**
 * Compute poster layout in layout units. Single source of truth.
 */
export function computeLayout(
  cardW: number,
  cardH: number,
  caption: string | undefined,
): PosterLayout {
  const captionPlateH = measureCaptionHeight(caption, cardW);
  const hasCaption = captionPlateH > 0;
  const imagePlateH = cardH - captionPlateH;
  const dividerY = imagePlateH;

  return {
    cardW,
    cardH,
    imagePlateY: 0,
    imagePlateH: Math.max(0, imagePlateH),
    captionPlateY: imagePlateH,
    captionPlateH,
    dividerY,
    frameWeight: FRAME_WEIGHT,
    hasCaption,
  };
}

/**
 * Draw the full poster card onto a canvas context. This is the ONE
 * renderer used by both compose and export. The only difference:
 * export calls this at a higher DPR.
 *
 * @param heatSource - the heat shader's canvas (image plate content)
 * @param ctx - the output canvas 2D context (sized to cardW*dpr × cardH*dpr)
 * @param layout - computed in layout units
 * @param colors - resolved CSS custom property values
 * @param caption - user's text (empty = no caption plate)
 * @param statusText - reading/empty/error label
 * @param dpr - device pixel ratio (1 for preview, 2-4 for export)
 *
 * Placeholder and caption input stay outside this surface (editing chrome).
 */
export function drawPoster(
  heatSource: HTMLCanvasElement | null,
  ctx: CanvasRenderingContext2D,
  layout: PosterLayout,
  colors: PosterColors,
  caption: string | undefined,
  statusText: string,
  dpr: number,
): void {
  const s = dpr;
  const { cardW, cardH, imagePlateH, captionPlateY, captionPlateH, frameWeight } = layout;

  ctx.save();
  ctx.scale(s, s);

  // Page/card background
  ctx.fillStyle = colors.page;
  ctx.fillRect(0, 0, cardW, cardH);

  // Image plate background (Ground)
  ctx.fillStyle = colors.ground;
  ctx.fillRect(0, 0, cardW, imagePlateH);

  // Draw heat canvas into image plate region
  if (heatSource && heatSource.width > 0 && heatSource.height > 0) {
    ctx.drawImage(heatSource, 0, 0, cardW, imagePlateH);
  }

  // Status text (on image plate)
  if (statusText) {
    ctx.font = makeTextFont(1);
    ctx.fillStyle = colors.type;
    ctx.textBaseline = "bottom";
    ctx.fillText(statusText, PAD_X, imagePlateH - PAD_Y);
  }

  // Caption plate (only when real text)
  if (captionPlateH > 0 && caption && caption.length > 0) {
    ctx.fillStyle = colors.page;
    ctx.fillRect(0, captionPlateY, cardW, captionPlateH);

    // Divider
    ctx.fillStyle = colors.frame;
    ctx.fillRect(0, captionPlateY, cardW, frameWeight);

    const contentWidth = cardW - PAD_X * 2;
    let y = captionPlateY + PAD_Y;

    // PROMPT label
    ctx.font = makeLabelFont(1);
    ctx.fillStyle = colors.type;
    ctx.globalAlpha = 0.55;
    ctx.textBaseline = "top";
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${LABEL_LETTER_SPACING}em`;
    ctx.fillText(HEATMAP_COPY.captionLabel.toUpperCase(), PAD_X, y);
    ctx.globalAlpha = 1;
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "0px";
    y += LABEL_SIZE * LABEL_LINE_HEIGHT + LABEL_BOTTOM_GAP;

    // Caption text (wrapped)
    ctx.font = makeTextFont(1);
    ctx.fillStyle = colors.type;
    ctx.textBaseline = "top";
    const lines = wrapText(caption, contentWidth, TEXT_SIZE, 0);
    for (const line of lines) {
      ctx.fillText(line, PAD_X, y);
      y += TEXT_SIZE * TEXT_LINE_HEIGHT;
    }
  }

  // Hairline frame (one stroke around the full card)
  ctx.strokeStyle = colors.frame;
  ctx.lineWidth = frameWeight;
  ctx.strokeRect(frameWeight / 2, frameWeight / 2, cardW - frameWeight, cardH - frameWeight);

  ctx.restore();
}

/**
 * Export the poster at a given DPR. Same routine as compose, higher resolution.
 * Wrap points are resolution-independent (measured at 1x layout units).
 */
export function exportPoster(
  heatSource: HTMLCanvasElement | null,
  cardW: number,
  cardH: number,
  caption: string | undefined,
  statusText: string,
  colors: PosterColors,
  dpr: number,
): HTMLCanvasElement {
  const layout = computeLayout(cardW, cardH, caption);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(cardW * dpr);
  canvas.height = Math.round(cardH * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  drawPoster(heatSource, ctx, layout, colors, caption, statusText, dpr);
  return canvas;
}
