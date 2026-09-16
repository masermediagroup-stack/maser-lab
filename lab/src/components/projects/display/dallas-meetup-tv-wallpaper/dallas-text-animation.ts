/**
 * Random letter fade in/out — canvas port of text-animation-lab `random-letter-fade`.
 * Opacity only (no blur or translate) so copy stays anchored on the EPG grid.
 *
 * One in/out per logo loop: fade in during rest, fade out during whip, hidden in settle.
 */

import {
  DEFAULT_LOOP_SECONDS,
  clampWhipSeconds,
  restSeconds,
} from "./globe-motion";

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

/** Separate shuffle for the up-next line. */
export const DALLAS_SUBHEADING_FADE_PLAY_KEY = 1;

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

/** Compress stagger/fade so a phase fits a beat window (e.g. 0.5s whip). */
export function scaleFadeSettingsForWindow(
  charCount: number,
  windowMs: number,
  base: RandomLetterFadeSettings = DEFAULT_RANDOM_LETTER_FADE,
): RandomLetterFadeSettings {
  const naturalMs = randomLetterFadePhaseMs(charCount, base);
  if (naturalMs <= 0 || windowMs >= naturalMs) return base;

  const scale = windowMs / naturalMs;
  return {
    ...base,
    fadeSpeedMs: Math.max(80, Math.round(base.fadeSpeedMs * scale)),
    staggerMs: Math.max(0, Math.round(base.staggerMs * scale)),
  };
}

function letterOpacityForPhase(
  charIndex: number,
  charCount: number,
  order: number[],
  localMs: number,
  phase: "in" | "out",
  settings: RandomLetterFadeSettings,
): number {
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

/**
 * Per-letter opacity synced to logo loop beats — not a free-running micro-cycle.
 */
export function letterOpacityAtLoop(
  charIndex: number,
  charCount: number,
  order: number[],
  elapsedSeconds: number,
  loopSeconds: number,
  whipSeconds: number,
  reducedMotion: boolean,
  settings: RandomLetterFadeSettings = DEFAULT_RANDOM_LETTER_FADE,
): number {
  if (reducedMotion || charCount <= 0) return 1;

  const loop = loopSeconds > 0 ? loopSeconds : DEFAULT_LOOP_SECONDS;
  const whip = clampWhipSeconds(whipSeconds);
  const rest = restSeconds(loop, whip);
  const t = ((elapsedSeconds % loop) + loop) % loop;

  if (t < rest) {
    const localMs = t * 1000;
    const opacity = letterOpacityForPhase(
      charIndex,
      charCount,
      order,
      localMs,
      "in",
      settings,
    );
    const phaseEnd = randomLetterFadePhaseMs(charCount, settings);
    return localMs >= phaseEnd ? 1 : opacity;
  }

  if (t < rest + whip) {
    const windowMs = whip * 1000;
    const scaled = scaleFadeSettingsForWindow(charCount, windowMs, settings);
    const localMs = (t - rest) * 1000;
    const opacity = letterOpacityForPhase(
      charIndex,
      charCount,
      order,
      localMs,
      "out",
      scaled,
    );
    const phaseEnd = randomLetterFadePhaseMs(charCount, scaled);
    return localMs >= phaseEnd ? 0 : opacity;
  }

  // Settle beat: hold hidden until the next loop's rest fade-in.
  return 0;
}

export function drawTextRandomFade(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
  elapsedSeconds: number,
  loopSeconds: number,
  whipSeconds: number,
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
  const previousAlpha = ctx.globalAlpha;

  for (let i = 0; i < chars.length; i++) {
    ctx.globalAlpha =
      previousAlpha *
      letterOpacityAtLoop(
        i,
        chars.length,
        order,
        elapsedSeconds,
        loopSeconds,
        whipSeconds,
        reducedMotion,
        settings,
      );
    ctx.fillText(chars[i], cursor, y);
    cursor += ctx.measureText(chars[i]).width + tracking;
  }

  ctx.globalAlpha = previousAlpha;
}

/** Rest-position left edge for headline / up-next — not tied to cursor idle float. */
export function headlineTextAnchorX(cursorX: number, cursorWidth: number): number {
  return cursorX - cursorWidth * 0.5;
}
