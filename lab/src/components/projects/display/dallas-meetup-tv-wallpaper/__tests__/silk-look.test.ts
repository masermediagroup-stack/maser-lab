import { describe, expect, it } from "vitest";
import {
  clampSilkLook,
  DEFAULT_SILK_LOOK,
  SILK_LOOK_RANGES,
} from "../silk-look";

describe("silk look", () => {
  it("defaults match the locked GLSL constants", () => {
    expect(DEFAULT_SILK_LOOK.speed).toBe(1.15);
    expect(DEFAULT_SILK_LOOK.warp).toBe(2.15);
    expect(DEFAULT_SILK_LOOK.grey).toBe(0.48);
    expect(DEFAULT_SILK_LOOK.white).toBe(0.82);
    expect(DEFAULT_SILK_LOOK.ridge).toBe(0.42);
    expect(DEFAULT_SILK_LOOK.rotate).toBe(0.045);
    expect(DEFAULT_SILK_LOOK.drift).toBe(0.09);
    expect(DEFAULT_SILK_LOOK.scale).toBe(1);
  });

  it("clamps each field to the demo range", () => {
    const clamped = clampSilkLook({
      speed: 99,
      scale: 0,
      warp: -4,
      grey: 2,
      white: 0,
      ridge: 9,
      rotate: -1,
      drift: 4,
    });
    expect(clamped.speed).toBe(SILK_LOOK_RANGES.speed.max);
    expect(clamped.scale).toBe(SILK_LOOK_RANGES.scale.min);
    expect(clamped.warp).toBe(SILK_LOOK_RANGES.warp.min);
    expect(clamped.grey).toBe(SILK_LOOK_RANGES.grey.max);
    expect(clamped.white).toBe(SILK_LOOK_RANGES.white.min);
    expect(clamped.ridge).toBe(SILK_LOOK_RANGES.ridge.max);
    expect(clamped.rotate).toBe(SILK_LOOK_RANGES.rotate.min);
    expect(clamped.drift).toBe(SILK_LOOK_RANGES.drift.max);
  });
});
