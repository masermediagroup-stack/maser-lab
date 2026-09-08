/**
 * Random letter fade in/out — canvas port of text-animation-lab `random-letter-fade`.
 * Opacity only (no blur or translate) so headline stays anchored on the EPG grid.
 */

export type RandomLetterFadeSettings = {
  fadeSpeedMs: number;
  staggerMs: number;
  randomOrder: boolean;
  randomnessAmount: number;
  playKey: number;
};

/** Matches text-animation-lab defaults for `random-letter-fade`. */
export const DEFAULT_RANDOM_LETTER_FADE: RandomLetterFadeSettings = {
  fadeSpeedMs: 500,
  staggerMs: 40,
  randomOrder: true,
  randomnessAmount: 0.8,
  playKey: 0,
};

export function buildRandomLetterOrder(
  length: number,
  randomOrder: boolean,
  randomnessAmount: number,
  playKey: number,
): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  if (!randomOrder || length <= 1) return indices;

  const seeded = indices.map((i) => {
    const seed = Math.sin(i * 12.9898 + playKey * 78.233) * 43758.5453;
    const rand = seed - Math.floor(seed);
    return { i, sort: rand * randomnessAmount + i * (1 - randomnessAmount) };
  });
  seeded.sort((a, b) => a.sort - b.sort);
  return seeded.map((entry) => entry.i);
}

export function easeOutCubic(t: number): number {
  const u = Math.min(1, Math.max(0, t));
  return 1 - (1 - u) ** 3;
}

export function randomLetterFadePhaseMs(
  charCount: number,
  settings: RandomLetterFadeSettings = DEFAULT_RANDOM_LETTER_FADE,
): number {
  if (charCount <= 0) return 0;
  return (charCount - 1) * settings.staggerMs + settings.fadeSpeedMs;
}

export function randomLetterFadeCycleMs(
  charCount: number,
  settings: RandomLetterFadeSettings = DEFAULT_RANDOM_LETTER_FADE,
): number {
  const phaseMs = randomLetterFadePhaseMs(charCount, settings);
  return phaseMs > 0 ? phaseMs * 2 : 0;
}

export function letterOpacityAt(
  charIndex: number,
  charCount: number,
  order: number[],
  elapsedMs: number,
  settings: RandomLetterFadeSettings = DEFAULT_RANDOM_LETTER_FADE,
): number {
  if (charCount <= 0) return 1;

  const phaseMs = randomLetterFadePhaseMs(charCount, settings);
  const cycleMs = phaseMs * 2;
  if (cycleMs <= 0) return 1;

  const t = ((elapsedMs % cycleMs) + cycleMs) % cycleMs;
  const phase: "in" | "out" = t < phaseMs ? "in" : "out";
  const localMs = phase === "in" ? t : t - phaseMs;

  const orderIndex = order.indexOf(charIndex);
  const delay =
    phase === "out"
      ? (charCount - 1 - orderIndex) * settings.staggerMs
      : orderIndex * settings.staggerMs;

  const letterT = localMs - delay;
  if (letterT <= 0) return phase === "in" ? 0 : 1;
  if (letterT >= settings.fadeSpeedMs) return phase === "in" ? 1 : 0;

  const progress = easeOutCubic(letterT / settings.fadeSpeedMs);
  return phase === "in" ? progress : 1 - progress;
}

export function drawTrackedTextRandomFade(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
  elapsedSeconds: number,
  reducedMotion: boolean,
  settings: RandomLetterFadeSettings = DEFAULT_RANDOM_LETTER_FADE,
): void {
  let cursor = x;
  if (reducedMotion || text.length === 0) {
    for (const glyph of text) {
      ctx.fillText(glyph, cursor, y);
      cursor += ctx.measureText(glyph).width + tracking;
    }
    return;
  }

  const chars = [...text];
  const order = buildRandomLetterOrder(
    chars.length,
    settings.randomOrder,
    settings.randomnessAmount,
    settings.playKey,
  );
  const elapsedMs = elapsedSeconds * 1000;
  const previousAlpha = ctx.globalAlpha;

  for (let i = 0; i < chars.length; i++) {
    ctx.globalAlpha =
      previousAlpha *
      letterOpacityAt(i, chars.length, order, elapsedMs, settings);
    ctx.fillText(chars[i], cursor, y);
    cursor += ctx.measureText(chars[i]).width + tracking;
  }

  ctx.globalAlpha = previousAlpha;
}

/** Rest-position left edge for headline / up-next — not tied to cursor idle float. */
export function headlineTextAnchorX(cursorX: number, cursorWidth: number): number {
  return cursorX - cursorWidth * 0.5;
}
