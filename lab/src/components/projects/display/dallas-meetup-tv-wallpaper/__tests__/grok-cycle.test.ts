import { describe, expect, it } from "vitest";
import { grokBodySd, mixedBodySd } from "../grok-bodies";
import {
  GROK_CHROMATIC_FILLS,
  GROK_SHAPE_FILL,
  GROK_SHAPE_WALK,
  VER02_ORBIT_HUES,
  DALLAS_GLOBE_BLACK,
  DALLAS_GROK_BLUE,
  DALLAS_GROK_GOLD,
  DALLAS_GROK_GRAY,
  DALLAS_GROK_GREEN,
  DALLAS_GROK_MAGENTA,
  DALLAS_GROK_ORANGE,
  DALLAS_GROK_ORANGE_RED,
  DALLAS_GROK_RED,
  DALLAS_GROK_TEAL,
  DALLAS_GROK_VIOLET,
  grokCyclePose,
  lerpHex,
} from "../grok-cycle";

describe("official picker SDFs", () => {
  it("keeps the origin inside all eight official bodies", () => {
    for (const id of [1, 2, 3, 4, 5, 6, 7, 8] as const) {
      expect(grokBodySd(id, 0, 0)).toBeLessThan(0);
    }
  });

  it("makes circle geometrically round and rest oval not a circle", () => {
    expect(grokBodySd(1, 1, 0)).toBeCloseTo(0, 2);
    expect(grokBodySd(1, 0, 1)).toBeCloseTo(0, 2);
    expect(Math.abs(grokBodySd(2, 1, 0) - grokBodySd(2, 0, 1))).toBeGreaterThan(0.05);
  });

  it("blends SDFs instead of cutting", () => {
    expect(mixedBodySd(2, 3, 0, 0, 0)).toBeCloseTo(grokBodySd(2, 0, 0));
    expect(mixedBodySd(2, 3, 1, 0, 0)).toBeCloseTo(grokBodySd(3, 0, 0));
    const mid = mixedBodySd(2, 3, 0.5, 0.4, 0.2);
    const a = grokBodySd(2, 0.4, 0.2);
    const b = grokBodySd(3, 0.4, 0.2);
    expect(mid).toBeCloseTo((a + b) * 0.5);
  });
});

describe("family-tree shape→color pairing", () => {
  it("starts at irregular oval + ink (cold-start rest)", () => {
    expect(GROK_SHAPE_WALK[0]).toBe(2);
    const rest = grokCyclePose(1, 8, 0.6, false);
    expect(rest.fromShape).toBe(2);
    expect(rest.morphT).toBe(0);
    expect(rest.fill).toBe(DALLAS_GLOBE_BLACK);
    expect(rest.phase).toBe("rest");
  });

  it("pairs each picker body to its tree HEX and skips green/gray as body fills", () => {
    expect(GROK_SHAPE_FILL[1]).toBe(DALLAS_GROK_BLUE);
    expect(GROK_SHAPE_FILL[2]).toBe(DALLAS_GROK_ORANGE_RED);
    expect(GROK_SHAPE_FILL[3]).toBe(DALLAS_GROK_TEAL);
    expect(GROK_SHAPE_FILL[4]).toBe(DALLAS_GROK_RED);
    expect(GROK_SHAPE_FILL[5]).toBe(DALLAS_GROK_MAGENTA);
    expect(GROK_SHAPE_FILL[6]).toBe(DALLAS_GROK_VIOLET);
    expect(GROK_SHAPE_FILL[7]).toBe(DALLAS_GROK_ORANGE);
    expect(GROK_SHAPE_FILL[8]).toBe(DALLAS_GROK_GOLD);
    expect(Object.values(GROK_SHAPE_FILL)).not.toContain(DALLAS_GROK_GREEN);
    expect(Object.values(GROK_SHAPE_FILL)).not.toContain(DALLAS_GROK_GRAY);
  });

  it("snaps fill and blends SDF during settle, not during the 0.6s whip", () => {
    const rest = grokCyclePose(1, 8, 0.6, false);
    expect(rest.fill).toBe(DALLAS_GLOBE_BLACK);
    expect(rest.morphT).toBe(0);
    expect(rest.phase).toBe("rest");
    expect(rest.fromShape).toBe(2);

    const whip = grokCyclePose(6.7, 8, 0.6, false);
    expect(whip.phase).toBe("whip");
    expect(whip.fromShape).toBe(2);
    expect(whip.morphT).toBe(0);
    expect(whip.fill).toBe(DALLAS_GLOBE_BLACK);

    const settleStart = grokCyclePose(7.02, 8, 0.6, false);
    expect(settleStart.phase).toBe("settle");
    expect(settleStart.fromShape).toBe(2);
    expect(settleStart.toShape).toBe(3);
    expect(settleStart.fill).toBe(DALLAS_GROK_TEAL);
    expect(settleStart.morphT).toBeGreaterThan(0);
    expect(settleStart.morphT).toBeLessThan(0.5);

    const settleMid = grokCyclePose(7.5, 8, 0.6, false);
    expect(settleMid.phase).toBe("settle");
    expect(settleMid.fill).toBe(DALLAS_GROK_TEAL);
    expect(settleMid.morphT).toBeGreaterThan(0.4);
    expect(settleMid.morphT).toBeLessThan(1);
    expect(settleMid.fill).not.toBe(lerpHex(DALLAS_GLOBE_BLACK, DALLAS_GROK_TEAL, settleMid.morphT));

    const nextRest = grokCyclePose(8.2, 8, 0.6, false);
    expect(nextRest.phase).toBe("rest");
    expect(nextRest.fromShape).toBe(3);
    expect(nextRest.fill).toBe(DALLAS_GROK_TEAL);
    expect(nextRest.morphT).toBe(0);
  });

  it("does not rainbow-lerp the body (lerpHex stays a util, unused on fill)", () => {
    expect(lerpHex(DALLAS_GLOBE_BLACK, DALLAS_GROK_TEAL, 0.5)).not.toBe(DALLAS_GROK_TEAL);
    const settle = grokCyclePose(7.5, 8, 0.6, false);
    expect(settle.fill).toBe(DALLAS_GROK_TEAL);
  });

  it("returns to oval with orange-red, not black", () => {
    const nextRest = grokCyclePose(8.2, 8, 0.6, false);
    expect(nextRest.fromShape).toBe(3);
    expect(nextRest.fill).toBe(DALLAS_GROK_TEAL);

    const ovalAgain = grokCyclePose(8 * 8 + 0.2, 8, 0.6, false);
    expect(ovalAgain.fromShape).toBe(2);
    expect(ovalAgain.fill).toBe(DALLAS_GROK_ORANGE_RED);
  });

  it("keeps green available for the Working-stream ribbons only", () => {
    expect(GROK_CHROMATIC_FILLS).toContain(DALLAS_GROK_GREEN);
    expect(VER02_ORBIT_HUES).toContain(DALLAS_GROK_GREEN);
    expect(VER02_ORBIT_HUES).toHaveLength(4);
    expect(VER02_ORBIT_HUES).not.toContain(DALLAS_GROK_GRAY);
  });

  it("freezes cold-start rest for reduced motion", () => {
    const pose = grokCyclePose(7.5, 8, 0.6, true);
    expect(pose.fromShape).toBe(2);
    expect(pose.fill).toBe(DALLAS_GLOBE_BLACK);
    expect(pose.morphT).toBe(0);
    expect(pose.phase).toBe("rest");
  });
});
