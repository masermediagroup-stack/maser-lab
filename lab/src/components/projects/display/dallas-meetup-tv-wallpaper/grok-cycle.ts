/**
 * Named tokens. Disc fill is Black forever. Eyes are white stadiums.
 * Chromatic HEX stay named. They are never drawn as orbits on Grok.
 *
 * USER OVERRIDE: no light organic head, no PNG face, no shape→color pairs.
 * Gray is never a body fill and never a ribbon.
 */

import { DEFAULT_LOOP_SECONDS } from "./globe-motion";

export const DALLAS_PAPER = "#F2F1ED";
/** Type and Cursor cube fill. */
export const DALLAS_INK = "#111111";
export const DALLAS_MARK_INK = DALLAS_INK;
/** Article Grok disc. Forever. */
export const DALLAS_GROK_BLACK = "#000000";
/** Alias kept so older tests that say "globe black" still mean the disc. */
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
/** Named token. Never a disc fill. Never a ribbon. */
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

function loopLength(loopSeconds: number): number {
  return loopSeconds > 0 ? loopSeconds : DEFAULT_LOOP_SECONDS;
}

export function cycleIndex(elapsed: number, loopSeconds: number): number {
  const loop = loopLength(loopSeconds);
  if (!Number.isFinite(elapsed) || elapsed < 0) return 0;
  return Math.floor(elapsed / loop);
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type KickRibbonPlan = {
  hue: string;
  phaseJitter: number;
  planeJitter: number;
  azimJitter: number;
  radiusJitter: number;
  yJitter: number;
  arcJitter: number;
};

/**
 * Distinct Ver 02 chromatic hues. Named tokens only — never drawn as orbits.
 * Stable for a whole loop. Skip gray. Never used as a body fill.
 */
export function kickRibbonPlan(
  elapsed: number,
  loopSeconds: number,
  count: number,
): KickRibbonPlan[] {
  const n = Math.max(0, Math.floor(count));
  const rand = mulberry32(0xda11a5 ^ (cycleIndex(elapsed, loopSeconds) + 1) * 0x9e3779b9);
  const pool = [...GROK_CHROMATIC_FILLS];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const a = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = a;
  }
  const plan: KickRibbonPlan[] = [];
  for (let i = 0; i < n; i += 1) {
    plan.push({
      hue: pool[i % pool.length]!,
      phaseJitter: (rand() - 0.5) * 1.35,
      planeJitter: (rand() - 0.5) * 0.5,
      azimJitter: (rand() - 0.5) * 1.15,
      radiusJitter: (rand() - 0.5) * 0.12,
      yJitter: (rand() - 0.5) * 0.1,
      arcJitter: (rand() - 0.5) * 0.7,
    });
  }
  return plan;
}

/** Hue list for this kick (tests / callers that only need color). */
export function kickRibbonHues(
  elapsed: number,
  loopSeconds: number,
  count: number,
): string[] {
  return kickRibbonPlan(elapsed, loopSeconds, count).map((band) => band.hue);
}
