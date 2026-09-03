import { describe, expect, it } from "vitest";
import { IDLE_EYE, WORKING_EYE, eyeWhipAt } from "../grok-eyes";
import { VER02_ORBIT_HUES } from "../grok-cycle";
import {
  ORBIT_PLANE_DEG,
  ORBIT_Y_FACE,
  orbitBleedPx,
  orbitStrokePx,
  WORKING_ORBIT_COUNT,
} from "../working-orbits";

describe("Idle / eye whip around the form", () => {
  it("plants Idle eyes higher-right and more diagonal than the unused Working pump", () => {
    expect(IDLE_EYE.cx).toBeGreaterThan(WORKING_EYE.cx);
    expect(IDLE_EYE.cy).toBeLessThan(WORKING_EYE.cy);
    expect(Math.abs(IDLE_EYE.tilt)).toBeGreaterThan(Math.abs(WORKING_EYE.tilt));
  });

  it("uses Idle stadiums at rest, settle, reduced motion, and linear-spin compare", () => {
    for (const t of [1, 6.39, 7.01, 7.5, 7.9]) {
      const pose = eyeWhipAt(t, 8, 0.6, false, false);
      expect(pose.visible).toBe(true);
      expect(pose.cx).toBeCloseTo(IDLE_EYE.cx);
      expect(pose.cy).toBeCloseTo(IDLE_EYE.cy);
      expect(pose.tilt).toBeCloseTo(IDLE_EYE.tilt);
      expect(pose.squashX).toBe(1);
    }

    const frozen = eyeWhipAt(6.55, 8, 0.6, false, true);
    expect(frozen.visible).toBe(true);
    expect(frozen.cx).toBeCloseTo(IDLE_EYE.cx);
    expect(frozen.tilt).toBeCloseTo(IDLE_EYE.tilt);

    const compare = eyeWhipAt(4, 8, 0.6, true, false);
    expect(compare.cx).toBeCloseTo(IDLE_EYE.cx);
    expect(compare.visible).toBe(true);
  });

  it("whips the pair around the form during the kick, then lands Idle", () => {
    const early = eyeWhipAt(6.55, 8, 0.6, false, false);
    expect(early.cy).toBeCloseTo(IDLE_EYE.cy);
    expect(Math.abs(early.cx - IDLE_EYE.cx)).toBeGreaterThan(0.02);

    const mid = eyeWhipAt(6.7, 8, 0.6, false, false);
    expect(mid.visible).toBe(false);
    expect(mid.z).toBeLessThan(0);

    const late = eyeWhipAt(6.98, 8, 0.6, false, false);
    expect(late.visible).toBe(true);
    expect(late.cx).toBeCloseTo(IDLE_EYE.cx, 1);
  });
});

describe("Working kick bands", () => {
  it("uses 2–4 thick flat Ver 02 bands (~8–14px at 300px)", () => {
    expect(WORKING_ORBIT_COUNT).toBeGreaterThanOrEqual(2);
    expect(WORKING_ORBIT_COUNT).toBeLessThanOrEqual(4);
    const stroke = orbitStrokePx(300);
    expect(stroke).toBeGreaterThanOrEqual(8);
    expect(stroke).toBeLessThanOrEqual(14);
    expect(VER02_ORBIT_HUES).toHaveLength(4);
  });

  it("keeps a −15° plane, sits on the Working eye line, and bleeds past the silhouette", () => {
    expect(ORBIT_PLANE_DEG).toBe(-15);
    expect(ORBIT_Y_FACE).toBeCloseTo(WORKING_EYE.cy);
    const bleed = orbitBleedPx(300);
    expect(bleed).toBeGreaterThanOrEqual(40);
    expect(bleed).toBeLessThanOrEqual(70);
  });
});
