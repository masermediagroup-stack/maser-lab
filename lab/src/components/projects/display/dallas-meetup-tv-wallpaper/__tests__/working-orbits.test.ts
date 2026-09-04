import { describe, expect, it } from "vitest";
import { GROK_LEFT_EYE, GROK_RIGHT_EYE, IDLE_EYE, eyePoseAt } from "../grok-eyes";
import { GROK_CHROMATIC_FILLS, DALLAS_GROK_GRAY, kickRibbonHues } from "../grok-cycle";
import {
  ORBIT_PLANE_DEG,
  ORBIT_RADIUS_FACE,
  ORBIT_STROKE_FACE_RATIO,
  ORBIT_Y_FACE,
  orbitRadius,
  orbitStrokePx,
  WORKING_ORBIT_COUNT,
  drawWorkingOrbits,
} from "../working-orbits";

describe("Idle / planted black stadiums", () => {
  it("plants two inward-tilted black stadiums, asymmetric, on the product face", () => {
    expect(GROK_LEFT_EYE.cx).toBeLessThan(0);
    expect(GROK_RIGHT_EYE.cx).toBeGreaterThan(0);
    expect(GROK_LEFT_EYE.tilt).toBeGreaterThan(0);
    expect(GROK_RIGHT_EYE.tilt).toBeLessThan(0);
    expect(GROK_LEFT_EYE.cy).not.toBeCloseTo(GROK_RIGHT_EYE.cy, 3);
  });

  it("keeps the same planted seat at rest, kick, settle, and reduced motion", () => {
    for (const t of [1, 6.39, 6.7, 7.01, 7.5, 7.9]) {
      const pose = eyePoseAt(t, 8, 0.6, false);
      expect(pose.cx).toBeCloseTo(IDLE_EYE.cx);
      expect(pose.cy).toBeCloseTo(IDLE_EYE.cy);
    }
    const frozen = eyePoseAt(6.55, 8, 0.6, true);
    expect(frozen).toEqual(IDLE_EYE);
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

  it("hugs the head so clipped front bands paint, and sits on the eye line", () => {
    expect(ORBIT_PLANE_DEG).toBe(-15);
    expect(ORBIT_Y_FACE).toBeCloseTo(IDLE_EYE.cy);
    expect(ORBIT_RADIUS_FACE).toBeGreaterThan(0.75);
    expect(ORBIT_RADIUS_FACE).toBeLessThanOrEqual(1);
    expect(orbitRadius(150, 300)).toBeCloseTo(135);
  });

  it("strokes chromatic round-cap bands at full kick energy and skips Idle", () => {
    const strokes: Array<{ color: string; width: number; cap: string }> = [];
    const ctx = {
      save() {},
      restore() {},
      beginPath() {},
      moveTo() {},
      lineTo() {},
      stroke() {
        strokes.push({
          color: String(this.strokeStyle),
          width: this.lineWidth,
          cap: String(this.lineCap),
        });
      },
      strokeStyle: "",
      globalAlpha: 1,
      lineWidth: 0,
      lineCap: "",
      lineJoin: "",
    } as unknown as CanvasRenderingContext2D;

    const hues = kickRibbonHues(6.7, 8, WORKING_ORBIT_COUNT);
    drawWorkingOrbits(ctx, 150, 300, 0, Math.PI, "front", hues);
    expect(strokes).toHaveLength(0);

    drawWorkingOrbits(ctx, 150, 300, 1, Math.PI, "front", hues);
    expect(strokes.length).toBe(WORKING_ORBIT_COUNT);
    for (const s of strokes) {
      expect(s.width).toBeCloseTo(24);
      expect(s.cap).toBe("round");
      expect(hues).toContain(s.color);
    }
  });
});
