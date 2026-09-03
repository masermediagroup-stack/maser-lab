import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOOP_SECONDS,
  DEFAULT_WHIP_SECONDS,
  SETTLE_SECONDS,
  kickEase,
  kickWobbleRad,
  restSeconds,
  streamPhase,
  whipEnergy,
} from "../globe-motion";

describe("look-lock motion", () => {
  it("names an 8s cycle with 6.4s rest, 0.6s whip, 1s post-kick Idle", () => {
    expect(DEFAULT_LOOP_SECONDS).toBe(8);
    expect(DEFAULT_WHIP_SECONDS).toBe(0.6);
    expect(SETTLE_SECONDS).toBe(1);
    expect(restSeconds(8, 0.6)).toBeCloseTo(6.4);
  });

  it("holds stream phase at 0 during Idle rest and after the kick", () => {
    expect(streamPhase(0, 8, 0.6, false, false)).toBe(0);
    expect(streamPhase(6.39, 8, 0.6, false, false)).toBe(0);
    expect(streamPhase(7.05, 8, 0.6, false, false)).toBe(0);
    expect(streamPhase(7.9, 8, 0.6, false, false)).toBe(0);
  });

  it("whips one stream turn during the kick, then lands", () => {
    const rest = restSeconds(8, 0.6);
    const mid = streamPhase(rest + 0.3, 8, 0.6, false, false);
    expect(mid).toBeCloseTo(Math.PI, 5);
    const end = streamPhase(rest + 0.6, 8, 0.6, false, false);
    expect(end).toBe(0);
  });

  it("uses cubic ease so the wrap reads (not a 7th-power teleport)", () => {
    expect(kickEase(0.25)).toBeCloseTo(0.0625);
    expect(kickEase(0.5)).toBeCloseTo(0.5);
    expect(kickEase(0.75)).toBeCloseTo(0.9375);
  });

  it("freezes reduced motion and uses constant ω only in compare mode", () => {
    expect(streamPhase(4, 8, 0.6, false, true)).toBe(0);
    expect(streamPhase(4, 8, 0.6, true, false)).toBeCloseTo(Math.PI);
  });

  it("keeps ribbons off at rest and after the kick, on during the whip", () => {
    expect(whipEnergy(1, 8, 0.6, false, false)).toBe(0);
    expect(whipEnergy(6.5, 8, 0.6, false, false)).toBe(1);
    expect(whipEnergy(7.5, 8, 0.6, false, false)).toBe(0);
    expect(whipEnergy(6.5, 8, 0.6, false, true)).toBe(0);
    expect(whipEnergy(1, 8, 0.6, true, false)).toBe(1);
  });

  it("keeps wobble to a few degrees, not a disc spin", () => {
    expect(kickWobbleRad(0, 0.5)).toBe(0);
    const mid = kickWobbleRad(1, 0.5);
    expect(Math.abs(mid)).toBeLessThan((5 * Math.PI) / 180);
  });
});
