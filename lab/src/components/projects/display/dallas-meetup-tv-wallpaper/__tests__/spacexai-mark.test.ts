import { describe, expect, it } from "vitest";
import { DEFAULT_LOOP_SECONDS, DEFAULT_WHIP_SECONDS, restSeconds } from "../globe-motion";
import {
  GROK_Y_NUDGE_PX,
  spacexaiSweepEase,
  spacexaiSwipeState,
} from "../spacexai-mark";

describe("spacexaiSweepEase", () => {
  it("eases slow to fast (cubic ease-in)", () => {
    expect(spacexaiSweepEase(0)).toBe(0);
    expect(spacexaiSweepEase(1)).toBe(1);
    expect(spacexaiSweepEase(0.5)).toBeCloseTo(0.125, 5);
    expect(spacexaiSweepEase(0.5)).toBeLessThan(0.5);
  });
});

describe("spacexaiSwipeState", () => {
  const loopSeconds = DEFAULT_LOOP_SECONDS;
  const whipSeconds = DEFAULT_WHIP_SECONDS;
  const rest = restSeconds(loopSeconds, whipSeconds);

  it("is inactive during rest with a full logo", () => {
    const state = spacexaiSwipeState(1, loopSeconds, whipSeconds, false);
    expect(state.active).toBe(false);
    expect(state.alphaIn).toBe(1);
    expect(state.alphaOut).toBe(1);
  });

  it("sweeps the edge left-to-right across the whip", () => {
    const start = spacexaiSwipeState(rest + 0.01, loopSeconds, whipSeconds, false);
    const end = spacexaiSwipeState(
      rest + whipSeconds - 0.01,
      loopSeconds,
      whipSeconds,
      false,
    );
    expect(start.active).toBe(true);
    expect(end.active).toBe(true);
    expect(start.edgeFrac).toBeLessThan(end.edgeFrac);
    expect(end.edgeFrac).toBeLessThanOrEqual(1.1);
  });

  it("crossfades outgoing right side into incoming left side", () => {
    const mid = spacexaiSwipeState(
      rest + whipSeconds * 0.5,
      loopSeconds,
      whipSeconds,
      false,
    );
    expect(mid.alphaIn).toBeGreaterThan(0);
    expect(mid.alphaIn).toBeLessThanOrEqual(1);
    expect(mid.alphaOut).toBeGreaterThan(0);
    expect(mid.alphaOut).toBeLessThan(1);
  });

  it("is inactive in settle and under reduced motion", () => {
    expect(
      spacexaiSwipeState(rest + whipSeconds + 0.5, loopSeconds, whipSeconds, false)
        .active,
    ).toBe(false);
    expect(
      spacexaiSwipeState(rest + 0.1, loopSeconds, whipSeconds, true).active,
    ).toBe(false);
  });
});

describe("grok alignment", () => {
  it("drops the Grok disc to the wordmark optical middle", () => {
    expect(GROK_Y_NUDGE_PX).toBeGreaterThan(0);
  });
});
