import { describe, expect, it } from "vitest";
import { IDLE_EYE, WORKING_EYE, eyeWhipAt } from "../grok-eyes";
import {
  ORBIT_PLANE_DEG,
  orbitBleedPx,
  orbitStrokePx,
  WORKING_ORBIT_COUNT,
} from "../working-orbits";

describe("Idle / planted eyes", () => {
  it("plants Idle eyes higher-right and more diagonal than the unused Working pump", () => {
    expect(IDLE_EYE.cx).toBeGreaterThan(WORKING_EYE.cx);
    expect(IDLE_EYE.cy).toBeLessThan(WORKING_EYE.cy);
    expect(Math.abs(IDLE_EYE.tilt)).toBeGreaterThan(Math.abs(WORKING_EYE.tilt));
  });

  it("keeps stadiums planted in face-space through rest, whip, settle, and reduced motion", () => {
    for (const t of [1, 6.58, 6.7, 7.5, 7.9]) {
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

    const compare = eyeWhipAt(4, 8, 0.6, true, false);
    expect(compare.cx).toBeCloseTo(IDLE_EYE.cx);
    expect(compare.visible).toBe(true);
  });
});

describe("Working-kick stream", () => {
  it("uses 2–4 thick bands (~4–5% of face, 12–15px at 300px)", () => {
    expect(WORKING_ORBIT_COUNT).toBeGreaterThanOrEqual(2);
    expect(WORKING_ORBIT_COUNT).toBeLessThanOrEqual(4);
    const stroke = orbitStrokePx(300);
    expect(stroke).toBeGreaterThanOrEqual(12);
    expect(stroke).toBeLessThanOrEqual(15);
  });

  it("keeps a shallow ~−15° plane and bleed past the silhouette", () => {
    expect(ORBIT_PLANE_DEG).toBeGreaterThanOrEqual(-20);
    expect(ORBIT_PLANE_DEG).toBeLessThanOrEqual(-15);
    const bleed = orbitBleedPx(300);
    expect(bleed).toBeGreaterThanOrEqual(40);
    expect(bleed).toBeLessThanOrEqual(70);
  });
});
