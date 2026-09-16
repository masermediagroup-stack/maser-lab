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
 * First kick: oval+Black → rounded square + Teal (unless square drew Red).
 * When the walk returns to oval, fill is Orange-red (tree color), not black
 * — unless oval drew Red this seed.
 *
 * Cycle is a Ver 02 subset. Pill, Cloud, Teardrop, and Triangle are dropped
 * — never land. Walk: oval → square → hexagon → circle → oval…
 *
 * Red #FF263C does not bring the Pill shape back. At seed, one of the four
 * remaining bodies draws Red for the whole run (overrides that body's tree
 * pair). Other bodies keep their locked pairing.
 *
 * USER OVERRIDE: no bands, no orbits, no nest around Grok. Morph is the kick
 * body. Cursor 360 is separate. Eyes stay white stadiums in face-space
 * on every body — they survive the morph; they are not sheared by the SDF.
 * Every body fits the shared mark box (cube height). Do not scale the cube up.
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

/** Kept picker ids. 4 Pill, 5 Triangle, 7 Cloud, 8 Teardrop never land. */
export type GrokShapeId = 1 | 2 | 3 | 6;

/** Picker order starting at rest (#2 irregular oval). Subset of the Ver 02 tree. */
export const GROK_SHAPE_WALK: readonly GrokShapeId[] = [2, 3, 6, 1];

/**
 * The four remaining morph bodies. Seed picks exactly one to draw Red
 * `#FF263C` for the run. Does not resurrect the Pill silhouette.
 */
export const GROK_RED_CANDIDATES: readonly GrokShapeId[] = [1, 2, 3, 6];

/**
 * Locked Ver 02 pairing for the kept set (before the Red seed override).
 * 1 Circle → Blue
 * 2 Irregular oval / product blob → Orange-red (also REST cold-start with Black)
 * 3 Rounded square → Teal
 * 6 Hexagon → Violet
 */
export const GROK_TREE_FILL: Record<GrokShapeId, string> = {
  1: DALLAS_GROK_BLUE,
  2: DALLAS_GROK_ORANGE_RED,
  3: DALLAS_GROK_TEAL,
  6: DALLAS_GROK_VIOLET,
};

/** Alias: tree pairing with no Red override applied. */
export const GROK_SHAPE_FILL = GROK_TREE_FILL;

/** Named tokens that never fill a body (dropped shapes + skipped Green sibling). */
export const GROK_DROPPED_FILLS = [
  DALLAS_GROK_MAGENTA,
  DALLAS_GROK_ORANGE,
  DALLAS_GROK_GOLD,
] as const;

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

/** Pick which of the four remaining bodies draws Red. Once per wallpaper boot. */
export function pickRedBody(rand: () => number = Math.random): GrokShapeId {
  const span = GROK_RED_CANDIDATES.length;
  const u = rand();
  const i = Math.min(span - 1, Math.max(0, Math.floor(u * span)));
  return GROK_RED_CANDIDATES[i]!;
}

/** Tree HEX, or Red if this body drew the seed override. */
export function fillForSeed(shape: GrokShapeId, redBody: GrokShapeId): string {
  return shape === redBody ? DALLAS_GROK_RED : GROK_TREE_FILL[shape];
}

export function fillForShape(
  shape: GrokShapeId,
  cycles: number,
  redBody: GrokShapeId,
): string {
  if (cycles === 0) return DALLAS_GROK_BLACK;
  return fillForSeed(shape, redBody);
}

export function grokCyclePose(
  elapsed: number,
  loopSeconds: number,
  whipSeconds: number,
  reducedMotion: boolean,
  redBody: GrokShapeId,
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
  const fromFill = fillForShape(fromShape, cycles, redBody);
  const toFill = fillForSeed(toShape, redBody);

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
