import { describe, expect, it } from "vitest";
import { GROK_LEFT_EYE, GROK_RIGHT_EYE, IDLE_EYE, eyePoseAt, eyesAt, winkEnvelope } from "../grok-eyes";
import { GROK_CHROMATIC_FILLS, DALLAS_GROK_GRAY, kickRibbonHues, kickRibbonPlan } from "../grok-cycle";
import {
  ORBIT_CAP_SCALE,
  ORBIT_MID_SCALE,
  ORBIT_PHASE_SPREAD,
  ORBIT_PLANE_DEG,
  ORBIT_PLANE_SPREAD,
  ORBIT_RADIUS_FACE,
  ORBIT_STROKE_FACE_RATIO,
  ORBIT_Y_FACE,
  orbitRadius,
  orbitStrokePx,
  WORKING_ORBIT_COUNT,
  drawWorkingOrbits,
} from "../working-orbits";

describe("Idle / planted white stadiums", () => {
  it("plants two distinct inward-tilted white stadiums, asymmetric, on the disc", () => {
    expect(GROK_LEFT_EYE.cx).toBeLessThan(GROK_RIGHT_EYE.cx);
    expect(GROK_LEFT_EYE.cy).toBeGreaterThan(GROK_RIGHT_EYE.cy);
    expect(GROK_LEFT_EYE.tilt).toBeLessThan(0);
    expect(GROK_RIGHT_EYE.tilt).toBeLessThan(0);
    const dx = GROK_RIGHT_EYE.cx - GROK_LEFT_EYE.cx;
    const dy = GROK_RIGHT_EYE.cy - GROK_LEFT_EYE.cy;
    expect(Math.hypot(dx, dy)).toBeGreaterThan(0.28);
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

  it("glances on Idle and freezes reduced motion", () => {
    const a = eyesAt(1, 8, 0.6, false);
    const b = eyesAt(3.2, 8, 0.6, false);
    expect(a.left.cx).not.toBeCloseTo(b.left.cx, 5);
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

  it("spreads bands and tapers mid-arc thicker than the caps", () => {
    expect(ORBIT_PLANE_DEG).toBe(-15);
    expect(ORBIT_Y_FACE).toBeCloseTo(IDLE_EYE.cy);
    expect(ORBIT_RADIUS_FACE).toBeGreaterThan(0.75);
    expect(ORBIT_RADIUS_FACE).toBeLessThanOrEqual(1);
    expect(orbitRadius(150, 300)).toBeCloseTo(135);
    expect(ORBIT_PLANE_SPREAD).toBeGreaterThan(0.12);
    expect(ORBIT_PHASE_SPREAD).toBeGreaterThan(0.5);
    expect(ORBIT_MID_SCALE).toBeGreaterThan(ORBIT_CAP_SCALE);
  });

  it("seeds placement and hue per kick, stable within a loop", () => {
    const a = kickRibbonPlan(1, 8, WORKING_ORBIT_COUNT);
    const same = kickRibbonPlan(6.7, 8, WORKING_ORBIT_COUNT);
    const next = kickRibbonPlan(8.2, 8, WORKING_ORBIT_COUNT);
    expect(a).toEqual(same);
    expect(a.map((b) => b.hue)).not.toEqual(next.map((b) => b.hue));
    expect(new Set(a.map((b) => b.phaseJitter)).size).toBe(WORKING_ORBIT_COUNT);
  });

  it("fills chromatic tapered bands at full kick energy and skips Idle", () => {
    const fills: Array<{ color: string }> = [];
    const ctx = {
      save() {},
      restore() {},
      beginPath() {},
      moveTo() {},
      lineTo() {},
      closePath() {},
      fill() {
        fills.push({ color: String(this.fillStyle) });
      },
      arc() {},
      fillStyle: "",
      globalAlpha: 1,
    } as unknown as CanvasRenderingContext2D;

    const plan = kickRibbonPlan(6.7, 8, WORKING_ORBIT_COUNT);
    drawWorkingOrbits(ctx, 150, 300, 0, Math.PI, "front", plan);
    expect(fills).toHaveLength(0);

    drawWorkingOrbits(ctx, 150, 300, 1, Math.PI, "back", plan);
    drawWorkingOrbits(ctx, 150, 300, 1, Math.PI, "front", plan);
    expect(fills.length).toBeGreaterThanOrEqual(WORKING_ORBIT_COUNT);
    const hues = plan.map((b) => b.hue);
    for (const f of fills) {
      expect(hues).toContain(f.color);
    }
  });
});
