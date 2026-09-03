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

describe("Idle / Working eye pump", () => {
  it("plants Idle eyes higher-right and more diagonal than the Working pump", () => {
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

  it("pumps more upright for the whole whip beat, still planted in face-space", () => {
    for (const t of [6.41, 6.58, 6.7, 6.95]) {
      const pose = eyeWhipAt(t, 8, 0.6, false, false);
      expect(pose.visible).toBe(true);
      expect(pose.cx).toBeCloseTo(WORKING_EYE.cx);
      expect(pose.cy).toBeCloseTo(WORKING_EYE.cy);
      expect(pose.tilt).toBeCloseTo(WORKING_EYE.tilt);
      expect(pose.squashX).toBe(1);
    }
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
