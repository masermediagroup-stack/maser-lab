import { describe, expect, it } from "vitest";
import {
  bodyOutline,
  grokBodySd,
  markLayout,
  minOutlineRadius,
  mixedBodySd,
  outlineAabb,
  outlineFitScale,
  sdContainsDisc,
} from "../grok-bodies";
import { FACE_DISC_R } from "../grok-eyes";
import {
  DALLAS_EYE_WHITE,
  DALLAS_GLOBE_BLACK,
  DALLAS_GROK_BLACK,
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
  DALLAS_INK,
  GROK_CHROMATIC_FILLS,
  GROK_DROPPED_FILLS,
  GROK_SHAPE_FILL,
  GROK_SHAPE_WALK,
  type GrokShapeId,
  grokCyclePose,
  lerpHex,
} from "../grok-cycle";

const KEPT_IDS: readonly GrokShapeId[] = [1, 2, 3, 5, 6];
const DROPPED_IDS = [4, 7, 8] as const;

describe("official picker SDFs", () => {
  it("keeps the origin inside every kept body", () => {
    for (const id of KEPT_IDS) {
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

  it("keeps the face disc inside every kept body and every mid-blend", () => {
    for (const id of KEPT_IDS) {
      expect(sdContainsDisc(id, id, 0, FACE_DISC_R)).toBe(true);
      expect(minOutlineRadius(bodyOutline(id, id, 0))).toBeGreaterThanOrEqual(
        FACE_DISC_R - 0.02,
      );
    }
    for (let i = 0; i < GROK_SHAPE_WALK.length; i += 1) {
      const from = GROK_SHAPE_WALK[i]!;
      const to = GROK_SHAPE_WALK[(i + 1) % GROK_SHAPE_WALK.length]!;
      expect(sdContainsDisc(from, to, 0.5, FACE_DISC_R)).toBe(true);
      expect(
        minOutlineRadius(bodyOutline(from, to, 0.5)),
      ).toBeGreaterThanOrEqual(FACE_DISC_R - 0.02);
    }
  });
});

describe("shared mark box", () => {
  it("walks the five kept silhouettes and never the dropped three", () => {
    expect(GROK_SHAPE_WALK).toEqual([2, 3, 5, 6, 1]);
    expect(GROK_SHAPE_WALK).toHaveLength(5);
    for (const dropped of DROPPED_IDS) {
      expect(GROK_SHAPE_WALK).not.toContain(dropped);
    }
  });

  it("fits every kept body and mid-blend inside the unit square", () => {
    const check = (from: GrokShapeId, to: GrokShapeId, morphT: number) => {
      const radii = bodyOutline(from, to, morphT);
      const fit = outlineFitScale(radii);
      const { halfW, halfH } = outlineAabb(radii);
      expect(halfW * fit).toBeLessThanOrEqual(1 + 1e-6);
      expect(halfH * fit).toBeLessThanOrEqual(1 + 1e-6);
    };
    for (const id of KEPT_IDS) {
      check(id, id, 0);
    }
    for (let i = 0; i < GROK_SHAPE_WALK.length; i += 1) {
      const from = GROK_SHAPE_WALK[i]!;
      const to = GROK_SHAPE_WALK[(i + 1) % GROK_SHAPE_WALK.length]!;
      check(from, to, 0.5);
    }
  });

  it("shrinks the magenta triangle instead of overflowing the cube-height box", () => {
    const radii = bodyOutline(5, 5, 0);
    const { halfH } = outlineAabb(radii);
    expect(halfH).toBeGreaterThan(1);
    expect(halfH * outlineFitScale(radii)).toBeLessThanOrEqual(1 + 1e-6);
  });

  it("points the magenta triangle down (wide top) and pulls optical mass in vs the circle", () => {
    // Wide at +y (canvas top / base), narrower toward the apex at -y.
    expect(grokBodySd(5, 0.5, 0.35)).toBeLessThan(grokBodySd(5, 0.5, -0.35));

    const circle = markLayout(1, 1, 0);
    const triangle = markLayout(5, 5, 0);
    const oval = markLayout(2, 2, 0);
    expect(circle.massScale).toBe(1);
    expect(oval.massScale).toBe(1);
    expect(triangle.massScale).toBeCloseTo(0.9);
    expect(triangle.faceLift).toBeLessThan(-0.2);
    expect(triangle.eyeScale).toBeLessThan(1);
    expect(triangle.eyeScale).toBeGreaterThan(0.8);
    expect(triangle.gazeTravel).toBeLessThan(1);

    const mid = markLayout(3, 5, 0.5);
    expect(mid.massScale).toBeGreaterThan(0.9);
    expect(mid.massScale).toBeLessThan(1);
  });
});

describe("family-tree shape→color pairing", () => {
  it("starts at irregular oval + black (cold-start rest)", () => {
    expect(GROK_SHAPE_WALK[0]).toBe(2);
    const rest = grokCyclePose(1, 8, 0.6, false);
    expect(rest.fromShape).toBe(2);
    expect(rest.morphT).toBe(0);
    expect(rest.fill).toBe(DALLAS_GLOBE_BLACK);
    expect(rest.fill).toBe(DALLAS_GROK_BLACK);
    expect(rest.inKick).toBe(false);
    expect(DALLAS_EYE_WHITE).toBe("#FFFFFF");
    expect(DALLAS_INK).toBe("#111111");
    expect(DALLAS_GROK_BLACK).not.toBe(DALLAS_INK);
  });

  it("pairs each kept body to its tree HEX and never fills dropped or skipped colors", () => {
    expect(GROK_SHAPE_FILL[1]).toBe(DALLAS_GROK_BLUE);
    expect(GROK_SHAPE_FILL[2]).toBe(DALLAS_GROK_ORANGE_RED);
    expect(GROK_SHAPE_FILL[3]).toBe(DALLAS_GROK_TEAL);
    expect(GROK_SHAPE_FILL[5]).toBe(DALLAS_GROK_MAGENTA);
    expect(GROK_SHAPE_FILL[6]).toBe(DALLAS_GROK_VIOLET);
    expect(Object.keys(GROK_SHAPE_FILL)).toHaveLength(5);
    expect(Object.values(GROK_SHAPE_FILL)).not.toContain(DALLAS_GROK_GREEN);
    expect(Object.values(GROK_SHAPE_FILL)).not.toContain(DALLAS_GROK_GRAY);
    expect(Object.values(GROK_SHAPE_FILL)).not.toContain(DALLAS_GROK_RED);
    expect(Object.values(GROK_SHAPE_FILL)).not.toContain(DALLAS_GROK_ORANGE);
    expect(Object.values(GROK_SHAPE_FILL)).not.toContain(DALLAS_GROK_GOLD);
    expect(GROK_DROPPED_FILLS).toEqual([
      DALLAS_GROK_RED,
      DALLAS_GROK_ORANGE,
      DALLAS_GROK_GOLD,
    ]);
    expect(GROK_CHROMATIC_FILLS).toContain(DALLAS_GROK_GREEN);
    expect(GROK_CHROMATIC_FILLS).not.toContain(DALLAS_GROK_GRAY);
    expect(GROK_CHROMATIC_FILLS).toHaveLength(9);
  });

  it("never lands on pill, cloud, or teardrop across many loops", () => {
    for (let cycle = 0; cycle < 20; cycle += 1) {
      const rest = grokCyclePose(cycle * 8 + 0.2, 8, 0.6, false);
      const kick = grokCyclePose(cycle * 8 + 6.7, 8, 0.6, false);
      for (const pose of [rest, kick]) {
        expect(DROPPED_IDS).not.toContain(pose.fromShape);
        expect(DROPPED_IDS).not.toContain(pose.toShape);
        expect(GROK_DROPPED_FILLS).not.toContain(pose.fill);
      }
    }
  });

  it("blends oval+black → squircle+teal during the first kick, then holds Idle", () => {
    const rest = grokCyclePose(1, 8, 0.6, false);
    expect(rest.fill).toBe(DALLAS_GLOBE_BLACK);
    expect(rest.morphT).toBe(0);

    const kick = grokCyclePose(6.7, 8, 0.6, false);
    expect(kick.inKick).toBe(true);
    expect(kick.fromShape).toBe(2);
    expect(kick.toShape).toBe(3);
    expect(kick.morphT).toBeGreaterThan(0.4);
    expect(kick.morphT).toBeLessThan(1);
    expect(kick.fill).not.toBe(DALLAS_GLOBE_BLACK);
    expect(kick.fill).not.toBe(DALLAS_GROK_TEAL);
    expect(kick.fill.startsWith("#")).toBe(true);

    const after = grokCyclePose(7.5, 8, 0.6, false);
    expect(after.inKick).toBe(false);
    expect(after.fromShape).toBe(3);
    expect(after.toShape).toBe(3);
    expect(after.fill).toBe(DALLAS_GROK_TEAL);
    expect(after.morphT).toBe(1);
  });

  it("lerps only the two locked pair stops (no off-sheet rainbow)", () => {
    expect(lerpHex(DALLAS_GLOBE_BLACK, DALLAS_GROK_TEAL, 0)).toBe(DALLAS_GLOBE_BLACK);
    expect(lerpHex(DALLAS_GLOBE_BLACK, DALLAS_GROK_TEAL, 1)).toBe(DALLAS_GROK_TEAL);
    const mid = lerpHex(DALLAS_GLOBE_BLACK, DALLAS_GROK_TEAL, 0.5);
    expect(mid).toBe("#005E53");
  });

  it("returns to oval with orange-red, not black", () => {
    const nextRest = grokCyclePose(8.2, 8, 0.6, false);
    expect(nextRest.fromShape).toBe(3);
    expect(nextRest.fill).toBe(DALLAS_GROK_TEAL);

    const ovalAgain = grokCyclePose(5 * 8 + 0.2, 8, 0.6, false);
    expect(ovalAgain.fromShape).toBe(2);
    expect(ovalAgain.fill).toBe(DALLAS_GROK_ORANGE_RED);
  });

  it("freezes cold-start rest for reduced motion", () => {
    const pose = grokCyclePose(7.5, 8, 0.6, true);
    expect(pose.fromShape).toBe(2);
    expect(pose.fill).toBe(DALLAS_GLOBE_BLACK);
    expect(pose.morphT).toBe(0);
    expect(pose.inKick).toBe(false);
  });
});
