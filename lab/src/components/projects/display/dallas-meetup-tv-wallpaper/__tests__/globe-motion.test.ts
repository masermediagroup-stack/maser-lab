import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOOP_SECONDS,
  DEFAULT_WHIP_SECONDS,
  IDLE_ORBIT_ENERGY,
  SETTLE_SECONDS,
  kickEase,
  kickWobbleRad,
  loopBeat,
  restSeconds,
  settleEaseOut,
  settleSeconds,
  streamPhase,
  whipEnergy,
} from "../globe-motion";

describe("look-lock motion", () => {
  it("names an 8s cycle with 6.4s rest, 0.6s whip, 1s settle — loop stays 8s", () => {
    expect(DEFAULT_LOOP_SECONDS).toBe(8);
    expect(DEFAULT_WHIP_SECONDS).toBe(0.6);
    expect(SETTLE_SECONDS).toBe(1);
    expect(restSeconds(8, 0.6)).toBeCloseTo(6.4);
    expect(settleSeconds(8, 0.6)).toBeCloseTo(1);
    expect(restSeconds(8, 0.6) + DEFAULT_WHIP_SECONDS + SETTLE_SECONDS).toBe(8);
  });

  it("labels rest / whip / settle without shrinking rest", () => {
    expect(loopBeat(1, 8, 0.6, false)).toBe("rest");
    expect(loopBeat(6.39, 8, 0.6, false)).toBe("rest");
    expect(loopBeat(6.41, 8, 0.6, false)).toBe("whip");
    expect(loopBeat(6.99, 8, 0.6, false)).toBe("whip");
    expect(loopBeat(7.01, 8, 0.6, false)).toBe("settle");
    expect(loopBeat(7.9, 8, 0.6, false)).toBe("settle");
    expect(loopBeat(7.5, 8, 0.6, true)).toBe("rest");
  });

  it("holds stream phase at 0 during rest and settle (no residual spin)", () => {
    expect(streamPhase(0, 8, 0.6, false, false)).toBe(0);
    expect(streamPhase(6.39, 8, 0.6, false, false)).toBe(0);
    expect(streamPhase(7.05, 8, 0.6, false, false)).toBe(0);
    expect(streamPhase(7.9, 8, 0.6, false, false)).toBe(0);
  });

  it("whips one stream turn during the 0.6s traveling bit, then lands face-forward", () => {
    const rest = restSeconds(8, 0.6);
    const mid = streamPhase(rest + 0.3, 8, 0.6, false, false);
    expect(mid).toBeCloseTo(Math.PI, 5);
    const end = streamPhase(rest + 0.6, 8, 0.6, false, false);
    expect(end).toBe(0);
  });

  it("uses hard cubic ease-in-out on the whip and ease-out on settle", () => {
    expect(kickEase(0.25)).toBeCloseTo(0.0625);
    expect(kickEase(0.5)).toBeCloseTo(0.5);
    expect(kickEase(0.75)).toBeCloseTo(0.9375);
    expect(settleEaseOut(0)).toBe(0);
    expect(settleEaseOut(1)).toBe(1);
    expect(settleEaseOut(0.5)).toBeCloseTo(0.875);
  });

  it("freezes reduced motion and uses constant ω only in compare mode", () => {
    expect(streamPhase(4, 8, 0.6, false, true)).toBe(0);
    expect(streamPhase(4, 8, 0.6, true, false)).toBeCloseTo(Math.PI);
  });

  it("keeps Idle orbits quiet and Working orbits at full energy", () => {
    expect(whipEnergy(1, 8, 0.6, false, false)).toBe(IDLE_ORBIT_ENERGY);
    expect(whipEnergy(6.5, 8, 0.6, false, false)).toBe(1);
    expect(whipEnergy(7.5, 8, 0.6, false, false)).toBeLessThan(1);
    expect(whipEnergy(7.5, 8, 0.6, false, false)).toBeGreaterThan(IDLE_ORBIT_ENERGY);
    expect(whipEnergy(6.5, 8, 0.6, false, true)).toBe(IDLE_ORBIT_ENERGY);
    expect(whipEnergy(1, 8, 0.6, true, false)).toBe(1);
  });

  it("adds no idle bob or kick wobble", () => {
    expect(kickWobbleRad(0, 0.5)).toBe(0);
    expect(kickWobbleRad(1, 0.5)).toBe(0);
    expect(kickWobbleRad(1, 1)).toBe(0);
  });
});
