/**
 * Shape owns fill. Color is not an independent wrap.
 *
 * Official Ver 02 tree pairing (picker shape → HEX). 1:1, not independent.
 * Green is not on the tree — never a body fill.
 * Gray is never a body fill.
 *
 * Cold start / product rest: shape 2 (irregular oval) + Black #000000.
 * During the SAME 0.6s kick: SDF blend to the next picker body, color lerps
 * between the current pair HEX and the next pair HEX (two stops).
 * First kick: oval+Black → rounded square + Teal.
 * When the walk returns to oval, fill is Orange-red (tree color), not black.
 *
 * USER OVERRIDE: no bands, no orbits, no nest around Grok. Morph is the kick
 * body. Cursor 360 is separate. Eyes stay white stadiums in face-space
 * on every body — they survive the morph; they are not sheared by the SDF.
 */

import {
  DEFAULT_LOOP_SECONDS,
  clampWhipSeconds,
  kickEase,
  restSeconds,
} from "./globe-motion";

export const DALLAS_PAPER = "#F2F1ED";
/** Type and Cursor cube fill. */
export const DALLAS_INK = "#111111";
export const DALLAS_MARK_INK = DALLAS_INK;
/** Cold-start rest fill only. Oval's tree pair is Orange-red after the walk. */
export const DALLAS_GROK_BLACK = "#000000";
/** Alias kept so older tests that say "globe black" still mean cold-start rest. */
export const DALLAS_GLOBE_BLACK = DALLAS_GROK_BLACK;
/** Grok stadium eyes. Not the body. */
export const DALLAS_EYE_WHITE = "#FFFFFF";

export const DALLAS_GROK_GOLD = "#97683D";
export const DALLAS_GROK_RED = "#FF263C";
export const DALLAS_GROK_ORANGE_RED = "#FF6700";
export const DALLAS_GROK_ORANGE = "#FF9800";
export const DALLAS_GROK_GREEN = "#00C972";
export const DALLAS_GROK_TEAL = "#00BCA6";
export const DALLAS_GROK_BLUE = "#1084FE";
export const DALLAS_GROK_VIOLET = "#9159FE";
export const DALLAS_GROK_MAGENTA = "#FF309B";
/** Named token. Never a body fill. Never a ribbon. */
export const DALLAS_GROK_GRAY = "#777777";

export const GROK_CHROMATIC_FILLS = [
  DALLAS_GROK_GOLD,
  DALLAS_GROK_RED,
  DALLAS_GROK_ORANGE_RED,
  DALLAS_GROK_ORANGE,
  DALLAS_GROK_GREEN,
  DALLAS_GROK_TEAL,
  DALLAS_GROK_BLUE,
  DALLAS_GROK_VIOLET,
  DALLAS_GROK_MAGENTA,
] as const;

export type GrokShapeId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/** Picker order starting at rest (#2 irregular oval). */
export const GROK_SHAPE_WALK: readonly GrokShapeId[] = [2, 3, 4, 5, 6, 7, 8, 1];

/**
 * Family-tree pairing. Green is omitted on purpose.
 * 1 Circle → Blue
 * 2 Irregular oval / product blob → Orange-red (also REST cold-start with Black)
 * 3 Rounded square → Teal
 * 4 Pill → Red
 * 5 Rounded triangle → Magenta
 * 6 Hexagon → Violet
 * 7 Cloud → Orange
 * 8 Teardrop → Gold
 */
export const GROK_SHAPE_FILL: Record<GrokShapeId, string> = {
  1: DALLAS_GROK_BLUE,
  2: DALLAS_GROK_ORANGE_RED,
  3: DALLAS_GROK_TEAL,
  4: DALLAS_GROK_RED,
  5: DALLAS_GROK_MAGENTA,
  6: DALLAS_GROK_VIOLET,
  7: DALLAS_GROK_ORANGE,
  8: DALLAS_GROK_GOLD,
};

export type GrokCyclePose = {
  fromShape: GrokShapeId;
  toShape: GrokShapeId;
  morphT: number;
  fill: string;
  inKick: boolean;
};

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    Number.parseInt(h.slice(0, 2), 16),
    Number.parseInt(h.slice(2, 4), 16),
    Number.parseInt(h.slice(4, 6), 16),
  ];
}

function toHex(channel: number): string {
  return Math.max(0, Math.min(255, Math.round(channel)))
    .toString(16)
    .padStart(2, "0");
}

/** Two-stop lerp between locked pair HEX values. No off-sheet rainbow. */
export function lerpHex(from: string, to: string, t: number): string {
  const u = Math.min(1, Math.max(0, t));
  const a = parseHex(from);
  const b = parseHex(to);
  return `#${toHex(a[0]! + (b[0]! - a[0]!) * u)}${toHex(a[1]! + (b[1]! - a[1]!) * u)}${toHex(a[2]! + (b[2]! - a[2]!) * u)}`.toUpperCase();
}

function loopLength(loopSeconds: number): number {
  return loopSeconds > 0 ? loopSeconds : DEFAULT_LOOP_SECONDS;
}

function timeInLoop(elapsed: number, loopSeconds: number): number {
  const loop = loopLength(loopSeconds);
  return ((elapsed % loop) + loop) % loop;
}

export function cycleIndex(elapsed: number, loopSeconds: number): number {
  const loop = loopLength(loopSeconds);
  if (!Number.isFinite(elapsed) || elapsed < 0) return 0;
  return Math.floor(elapsed / loop);
}

export function fillForShape(shape: GrokShapeId, cycles: number): string {
  if (cycles === 0) return DALLAS_GROK_BLACK;
  return GROK_SHAPE_FILL[shape];
}

export function grokCyclePose(
  elapsed: number,
  loopSeconds: number,
  whipSeconds: number,
  reducedMotion: boolean,
): GrokCyclePose {
  if (reducedMotion) {
    return {
      fromShape: 2,
      toShape: 2,
      morphT: 0,
      fill: DALLAS_GROK_BLACK,
      inKick: false,
    };
  }

  const loop = loopLength(loopSeconds);
  const t = timeInLoop(elapsed, loop);
  const whip = clampWhipSeconds(whipSeconds);
  const rest = restSeconds(loop, whip);
  const whipEnd = rest + whip;
  const cycles = cycleIndex(elapsed, loop);
  const fromShape = GROK_SHAPE_WALK[cycles % GROK_SHAPE_WALK.length]!;
  const toShape = GROK_SHAPE_WALK[(cycles + 1) % GROK_SHAPE_WALK.length]!;
  const fromFill = fillForShape(fromShape, cycles);
  const toFill = GROK_SHAPE_FILL[toShape];

  if (t < rest) {
    return {
      fromShape,
      toShape: fromShape,
      morphT: 0,
      fill: fromFill,
      inKick: false,
    };
  }

  if (t < whipEnd) {
    const morphT = kickEase((t - rest) / whip);
    return {
      fromShape,
      toShape,
      morphT,
      fill: lerpHex(fromFill, toFill, morphT),
      inKick: true,
    };
  }

  return {
    fromShape: toShape,
    toShape,
    morphT: 1,
    fill: toFill,
    inKick: false,
  };
}
