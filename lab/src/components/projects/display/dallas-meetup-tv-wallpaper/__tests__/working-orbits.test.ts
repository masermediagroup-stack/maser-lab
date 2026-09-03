import { describe, expect, it } from "vitest";
import { IDLE_EYE, WORKING_EYE, eyePoseAt } from "../grok-eyes";
import { orbitStrokePx, WORKING_ORBIT_COUNT } from "../working-orbits";

describe("Idle / Working eye poses", () => {
  it("plants Idle eyes higher-right and more diagonal than Working", () => {
    expect(IDLE_EYE.cx).toBeGreaterThan(WORKING_EYE.cx);
    expect(IDLE_EYE.cy).toBeLessThan(WORKING_EYE.cy);
    expect(Math.abs(IDLE_EYE.tilt)).toBeGreaterThan(Math.abs(WORKING_EYE.tilt));
  });

  it("holds Idle at rest, pumps toward Working on the whip, returns on settle", () => {
    const rest = eyePoseAt(1, 8, 0.6, false, false);
    expect(rest.cx).toBeCloseTo(IDLE_EYE.cx);
    expect(rest.cy).toBeCloseTo(IDLE_EYE.cy);
    expect(rest.tilt).toBeCloseTo(IDLE_EYE.tilt);

    const whip = eyePoseAt(6.55, 8, 0.6, false, false);
    expect(whip.cy).toBeGreaterThan(IDLE_EYE.cy);
    expect(Math.abs(whip.tilt)).toBeLessThan(Math.abs(IDLE_EYE.tilt));

    const settle = eyePoseAt(7.9, 8, 0.6, false, false);
    expect(settle.cy).toBeLessThan(WORKING_EYE.cy);
    expect(Math.abs(settle.tilt)).toBeGreaterThan(Math.abs(WORKING_EYE.tilt) - 0.02);

    const frozen = eyePoseAt(6.55, 8, 0.6, false, true);
    expect(frozen).toEqual(IDLE_EYE);
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
});
