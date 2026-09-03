import { describe, expect, it } from "vitest";
import { IDLE_EYE, WORKING_EYE, eyeWhipAt } from "../grok-eyes";
import {
  ORBIT_PLANE_DEG,
  orbitBleedPx,
  orbitStrokePx,
  WORKING_ORBIT_COUNT,
} from "../working-orbits";

describe("Idle / eye-whip", () => {
  it("plants Idle eyes higher-right and more diagonal than the mid-kick pump", () => {
    expect(IDLE_EYE.cx).toBeGreaterThan(WORKING_EYE.cx);
    expect(IDLE_EYE.cy).toBeLessThan(WORKING_EYE.cy);
    expect(Math.abs(IDLE_EYE.tilt)).toBeGreaterThan(Math.abs(WORKING_EYE.tilt));
  });

  it("holds planted Idle at rest, occludes on the back mid-kick, lands Idle", () => {
    const rest = eyeWhipAt(1, 8, 0.6, false, false);
    expect(rest.visible).toBe(true);
    expect(rest.cx).toBeCloseTo(IDLE_EYE.cx);
    expect(rest.cy).toBeCloseTo(IDLE_EYE.cy);
    expect(rest.tilt).toBeCloseTo(IDLE_EYE.tilt);

    const back = eyeWhipAt(6.7, 8, 0.6, false, false);
    expect(back.visible).toBe(false);
    expect(back.z).toBeLessThan(0);

    const land = eyeWhipAt(7.9, 8, 0.6, false, false);
    expect(land.visible).toBe(true);
    expect(land.cx).toBeCloseTo(IDLE_EYE.cx);
    expect(land.tilt).toBeCloseTo(IDLE_EYE.tilt);

    const frozen = eyeWhipAt(6.55, 8, 0.6, false, true);
    expect(frozen.visible).toBe(true);
    expect(frozen.cx).toBeCloseTo(IDLE_EYE.cx);
  });

  it("moves the pair off the planted Idle seat while visible on the kick", () => {
    const early = eyeWhipAt(6.58, 8, 0.6, false, false);
    if (early.visible) {
      expect(Math.abs(early.cx - IDLE_EYE.cx)).toBeGreaterThan(0.02);
    }
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
