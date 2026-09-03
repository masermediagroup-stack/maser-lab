import { describe, expect, it } from "vitest";
import { IDLE_EYE, WORKING_EYE, eyePoseAt } from "../grok-eyes";
import { GROK_CHROMATIC_FILLS, DALLAS_GROK_GRAY, kickRibbonHues } from "../grok-cycle";
import {
  ORBIT_PLANE_DEG,
  ORBIT_STROKE_FACE_RATIO,
  ORBIT_Y_FACE,
  orbitBleedPx,
  orbitStrokePx,
  WORKING_ORBIT_COUNT,
} from "../working-orbits";

describe("Idle / planted eyes", () => {
  it("plants Idle eyes higher-right and more diagonal than the Working pump", () => {
    expect(IDLE_EYE.cx).toBeGreaterThan(WORKING_EYE.cx);
    expect(IDLE_EYE.cy).toBeLessThan(WORKING_EYE.cy);
    expect(Math.abs(IDLE_EYE.tilt)).toBeGreaterThan(Math.abs(WORKING_EYE.tilt));
  });

  it("keeps Idle stadiums at rest, settle, and reduced motion", () => {
    for (const t of [1, 6.39, 7.01, 7.5, 7.9]) {
      const pose = eyePoseAt(t, 8, 0.6, false);
      expect(pose.cx).toBeCloseTo(IDLE_EYE.cx);
      expect(pose.cy).toBeCloseTo(IDLE_EYE.cy);
      expect(pose.tilt).toBeCloseTo(IDLE_EYE.tilt);
    }

    const frozen = eyePoseAt(6.55, 8, 0.6, true);
    expect(frozen.cx).toBeCloseTo(IDLE_EYE.cx);
    expect(frozen.cy).toBeCloseTo(IDLE_EYE.cy);
    expect(frozen.tilt).toBeCloseTo(IDLE_EYE.tilt);
  });

  it("pumps more upright on the kick without leaving the Idle seat", () => {
    const mid = eyePoseAt(6.7, 8, 0.6, false);
    expect(mid.cx).toBeCloseTo(IDLE_EYE.cx);
    expect(mid.cy).toBeCloseTo(IDLE_EYE.cy);
    expect(Math.abs(mid.tilt)).toBeLessThan(Math.abs(IDLE_EYE.tilt));
    expect(Math.abs(mid.tilt)).toBeGreaterThanOrEqual(Math.abs(WORKING_EYE.tilt) - 0.001);

    const late = eyePoseAt(6.98, 8, 0.6, false);
    expect(late.cx).toBeCloseTo(IDLE_EYE.cx);
    expect(late.cy).toBeCloseTo(IDLE_EYE.cy);
  });
});

describe("Working kick bands", () => {
  it("uses 2–4 article-thick flat Ver 02 bands (~8% of face / ~24px at 300px)", () => {
    expect(WORKING_ORBIT_COUNT).toBeGreaterThanOrEqual(2);
    expect(WORKING_ORBIT_COUNT).toBeLessThanOrEqual(4);
    expect(ORBIT_STROKE_FACE_RATIO).toBeCloseTo(0.08);
    const stroke = orbitStrokePx(300);
    expect(stroke).toBeCloseTo(24);
    expect(kickRibbonHues(1, 8, WORKING_ORBIT_COUNT)).toHaveLength(WORKING_ORBIT_COUNT);
    expect(GROK_CHROMATIC_FILLS).toHaveLength(9);
    expect(GROK_CHROMATIC_FILLS).not.toContain(DALLAS_GROK_GRAY);
  });

  it("keeps a −15° plane, sits on the Idle eye line, and bleeds past the silhouette", () => {
    expect(ORBIT_PLANE_DEG).toBe(-15);
    expect(ORBIT_Y_FACE).toBeCloseTo(IDLE_EYE.cy);
    const bleed = orbitBleedPx(300);
    expect(bleed).toBeGreaterThanOrEqual(40);
    expect(bleed).toBeLessThanOrEqual(70);
  });
});
