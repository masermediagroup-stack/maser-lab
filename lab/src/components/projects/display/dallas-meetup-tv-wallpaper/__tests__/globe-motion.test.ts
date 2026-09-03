import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOOP_SECONDS,
  DEFAULT_WHIP_SECONDS,
  SETTLE_SECONDS,
  globeYaw,
  restSeconds,
  whipEase,
  whipEnergy,
} from "../globe-motion";

describe("globe look-lock motion", () => {
  it("names an 8s cycle with 6.4s rest, 0.6s whip, 1s settle", () => {
    expect(DEFAULT_LOOP_SECONDS).toBe(8);
    expect(DEFAULT_WHIP_SECONDS).toBe(0.6);
    expect(SETTLE_SECONDS).toBe(1);
    expect(restSeconds(8, 0.6)).toBeCloseTo(6.4);
  });

  it("holds face-forward during rest and settle", () => {
    expect(globeYaw(0, 8, 0.6, false, false)).toBe(0);
    expect(globeYaw(6.39, 8, 0.6, false, false)).toBe(0);
    expect(globeYaw(7.05, 8, 0.6, false, false)).toBe(0);
    expect(globeYaw(7.9, 8, 0.6, false, false)).toBe(0);
  });

  it("whips one revolution and lands face-forward", () => {
    const rest = restSeconds(8, 0.6);
    const mid = globeYaw(rest + 0.3, 8, 0.6, false, false);
    expect(mid).toBeCloseTo(Math.PI, 5);
    const end = globeYaw(rest + 0.6, 8, 0.6, false, false);
    expect(end).toBe(0);
  });

  it("spends almost no time at mid-yaw (hard ease)", () => {
    expect(whipEase(0.25)).toBeLessThan(0.02);
    expect(whipEase(0.5)).toBeCloseTo(0.5);
    expect(whipEase(0.75)).toBeGreaterThan(0.98);
  });

  it("freezes at rest for reduced motion and uses constant ω only in compare mode", () => {
    expect(globeYaw(4, 8, 0.6, false, true)).toBe(0);
    expect(globeYaw(4, 8, 0.6, true, false)).toBeCloseTo(Math.PI);
  });

  it("keeps the Idle→Working flourish off at rest and settle, on during the whip", () => {
    expect(whipEnergy(1, 8, 0.6, false, false)).toBe(0);
    expect(whipEnergy(6.5, 8, 0.6, false, false)).toBe(1);
    expect(whipEnergy(7.5, 8, 0.6, false, false)).toBe(0);
    expect(whipEnergy(6.5, 8, 0.6, false, true)).toBe(0);
    expect(whipEnergy(1, 8, 0.6, true, false)).toBe(1);
  });
});
