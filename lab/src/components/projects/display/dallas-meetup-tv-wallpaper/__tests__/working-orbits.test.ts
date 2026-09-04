import { describe, expect, it } from "vitest";
import { GROK_LEFT_EYE, GROK_RIGHT_EYE, IDLE_EYE, eyePoseAt, eyesAt, gazeAt, winkEnvelope } from "../grok-eyes";
import { GROK_CHROMATIC_FILLS, DALLAS_GROK_GRAY, kickRibbonHues, kickRibbonPlan } from "../grok-cycle";
import {
  ORBIT_INCL_SPAN,
  ORBIT_PHASE_SPREAD,
  ORBIT_PLANE_DEG,
  ORBIT_PLANE_SPREAD,
  ORBIT_RADIUS_FACE,
  ORBIT_RADIUS_STEP,
  ORBIT_STROKE_FACE_RATIO,
  ORBIT_Y_FACE,
  orbitRadius,
  orbitStrokePx,
  WORKING_ORBIT_COUNT,
  drawWorkingOrbits,
} from "../working-orbits";

describe("Idle / planted white stadiums", () => {
  it("plants two distinct inward-tilted white stadiums as a camera pair, not stuck BL", () => {
    expect(GROK_LEFT_EYE.cx).toBeLessThan(GROK_RIGHT_EYE.cx);
    expect(GROK_LEFT_EYE.tilt).toBeLessThan(0);
    expect(GROK_RIGHT_EYE.tilt).toBeLessThan(0);
    const dx = GROK_RIGHT_EYE.cx - GROK_LEFT_EYE.cx;
    const dy = GROK_RIGHT_EYE.cy - GROK_LEFT_EYE.cy;
    expect(Math.hypot(dx, dy)).toBeGreaterThan(0.28);
    expect(Math.abs(IDLE_EYE.cx)).toBeLessThan(0.12);
    expect(Math.abs(IDLE_EYE.cy)).toBeLessThan(0.12);
    expect(GROK_LEFT_EYE.cy).toBeLessThan(0.2);
    expect(GROK_LEFT_EYE.cx).toBeGreaterThan(-0.28);
  });

  it("winks one eye on Idle and keeps the pair planted through the kick", () => {
    const rest = eyesAt(1.73, 8, 0.6, false);
    expect(rest.left.scaleY).toBeLessThan(0.5);
    expect(rest.right.scaleY).toBeCloseTo(1);
    const kick = eyesAt(6.7, 8, 0.6, false);
    expect(kick.left.cx).toBeLessThan(kick.right.cx);
    expect(Math.abs(kick.left.cx)).toBeLessThan(0.95);
    expect(Math.abs(kick.left.cy)).toBeLessThan(0.95);
  });

  it("gazes as a pair to up and side, then returns, and freezes reduced motion", () => {
    const rest = eyesAt(0.2, 8, 0.6, false);
    const up = eyesAt(2.1, 8, 0.6, false);
    const side = eyesAt(3.6, 8, 0.6, false);
    const back = eyesAt(6.5, 8, 0.6, false);

    expect(up.left.cy).toBeLessThan(rest.left.cy - 0.12);
    expect(up.right.cy).toBeLessThan(rest.right.cy - 0.12);
    expect(side.left.cx).toBeGreaterThan(rest.left.cx + 0.12);
    expect(side.right.cx).toBeGreaterThan(rest.right.cx + 0.12);
    expect(back.left.cx).toBeCloseTo(rest.left.cx, 1);
    expect(back.left.cy).toBeCloseTo(rest.left.cy, 1);

    const pairDx = up.left.cx - rest.left.cx;
    const pairDxRight = up.right.cx - rest.right.cx;
    expect(Math.abs(pairDx - pairDxRight)).toBeLessThan(0.08);

    expect(gazeAt(2.1).cy).toBeLessThan(gazeAt(0.2).cy);
    expect(gazeAt(3.6).cx).toBeGreaterThan(gazeAt(0.2).cx);

    const frozen = eyesAt(6.55, 8, 0.6, true);
    expect(frozen.left).toEqual(GROK_LEFT_EYE);
    expect(frozen.right).toEqual(GROK_RIGHT_EYE);
    const seat = eyePoseAt(6.55, 8, 0.6, true);
    expect(seat.cx).toBeCloseTo(IDLE_EYE.cx);
    expect(seat.cy).toBeCloseTo(IDLE_EYE.cy);
  });

  it("shuts then reopens a wink envelope", () => {
    expect(winkEnvelope(-0.01)).toBe(1);
    expect(winkEnvelope(0.08)).toBeLessThan(0.5);
    expect(winkEnvelope(0.16)).toBe(1);
  });
});

describe("Thinking kick nest", () => {
  it("uses many thin even Thinking-weight Ver 02 hairlines (~0.7% of face / ~2px at 300px)", () => {
    expect(WORKING_ORBIT_COUNT).toBeGreaterThanOrEqual(8);
    expect(WORKING_ORBIT_COUNT).toBeLessThanOrEqual(10);
    expect(ORBIT_STROKE_FACE_RATIO).toBeCloseTo(0.007);
    const stroke = orbitStrokePx(300);
    expect(stroke).toBeCloseTo(2.1);
    expect(stroke).toBeLessThan(4);
    expect(stroke).toBeGreaterThan(1);
    expect(kickRibbonHues(1, 8, WORKING_ORBIT_COUNT)).toHaveLength(WORKING_ORBIT_COUNT);
    expect(new Set(kickRibbonHues(1, 8, WORKING_ORBIT_COUNT)).size).toBe(WORKING_ORBIT_COUNT);
    expect(GROK_CHROMATIC_FILLS).toHaveLength(9);
    expect(GROK_CHROMATIC_FILLS).not.toContain(DALLAS_GROK_GRAY);
  });

  it("interlaces even hairlines around the whole disc with no mid-arc taper", () => {
    expect(ORBIT_PLANE_DEG).toBe(-15);
    expect(ORBIT_Y_FACE).toBeCloseTo(IDLE_EYE.cy);
    expect(ORBIT_RADIUS_FACE).toBeGreaterThan(0.75);
    expect(ORBIT_RADIUS_FACE).toBeLessThanOrEqual(1);
    expect(orbitRadius(150, 300)).toBeCloseTo(138);
    expect(ORBIT_INCL_SPAN).toBeGreaterThan(1.6);
    expect(ORBIT_PLANE_SPREAD).toBeGreaterThan(0.2);
    expect(ORBIT_PHASE_SPREAD).toBeGreaterThan(0.4);
    expect(ORBIT_RADIUS_STEP).toBeGreaterThan(0.1);
  });

  it("seeds placement and hue per kick, stable within a loop", () => {
    const a = kickRibbonPlan(1, 8, WORKING_ORBIT_COUNT);
    const same = kickRibbonPlan(6.7, 8, WORKING_ORBIT_COUNT);
    const next = kickRibbonPlan(8.2, 8, WORKING_ORBIT_COUNT);
    expect(a).toEqual(same);
    expect(a.map((b) => b.hue)).not.toEqual(next.map((b) => b.hue));
    expect(new Set(a.map((b) => b.phaseJitter)).size).toBe(WORKING_ORBIT_COUNT);
  });

  it("strokes chromatic even lines at full kick energy and skips Idle", () => {
    const strokes: Array<{ color: string; width: number; cap: string }> = [];
    const fills: unknown[] = [];
    const ctx = {
      save() {},
      restore() {},
      beginPath() {},
      moveTo() {},
      lineTo() {},
      closePath() {},
      fill() {
        fills.push(this.fillStyle);
      },
      stroke() {
        strokes.push({
          color: String(this.strokeStyle),
          width: Number(this.lineWidth),
          cap: String(this.lineCap),
        });
      },
      arc() {},
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
      lineCap: "",
      lineJoin: "",
      globalAlpha: 1,
    } as unknown as CanvasRenderingContext2D;

    const plan = kickRibbonPlan(6.7, 8, WORKING_ORBIT_COUNT);
    drawWorkingOrbits(ctx, 150, 300, 0, Math.PI, "front", plan);
    expect(strokes).toHaveLength(0);
    expect(fills).toHaveLength(0);

    drawWorkingOrbits(ctx, 150, 300, 1, Math.PI, "back", plan, IDLE_EYE.cy);
    drawWorkingOrbits(ctx, 150, 300, 1, Math.PI, "front", plan, IDLE_EYE.cy);
    expect(fills).toHaveLength(0);
    expect(strokes.length).toBeGreaterThanOrEqual(WORKING_ORBIT_COUNT);
    const hues = plan.map((b) => b.hue);
    for (const s of strokes) {
      expect(hues).toContain(s.color);
      expect(s.width).toBeCloseTo(2.1);
      expect(s.cap).toBe("round");
    }
  });
});
