import { describe, expect, it } from "vitest";
import {
  clampSilkLook,
  DEFAULT_SILK_LOOK,
  SILK_LOOK_RANGES,
} from "../silk-look";

function onStep(value: number, min: number, step: number) {
  const n = (value - min) / step;
  expect(n).toBeCloseTo(Math.round(n), 6);
}

describe("silk look", () => {
  it("defaults match the 2026-09-11 TV tune", () => {
    expect(DEFAULT_SILK_LOOK.speed).toBe(0.15);
    expect(DEFAULT_SILK_LOOK.scale).toBe(0.5);
    expect(DEFAULT_SILK_LOOK.warp).toBe(0.55);
    expect(DEFAULT_SILK_LOOK.grey).toBe(0.45);
    expect(DEFAULT_SILK_LOOK.white).toBe(0.95);
    expect(DEFAULT_SILK_LOOK.ridge).toBe(0.8);
    expect(DEFAULT_SILK_LOOK.rotate).toBe(0.015);
    expect(DEFAULT_SILK_LOOK.drift).toBe(0.09);
    expect(DEFAULT_SILK_LOOK.grain).toBe(0.75);
  });

  it("uses coarse 0.05 steps on point sliders and 0.05× on speed", () => {
    expect(SILK_LOOK_RANGES.speed.step).toBe(0.05);
    expect(SILK_LOOK_RANGES.speed.min).toBe(0.05);
    expect(SILK_LOOK_RANGES.speed.max).toBe(0.8);
    expect(SILK_LOOK_RANGES.scale.step).toBe(0.05);
    expect(SILK_LOOK_RANGES.warp.step).toBe(0.05);
    expect(SILK_LOOK_RANGES.grey.step).toBe(0.05);
    expect(SILK_LOOK_RANGES.white.step).toBe(0.05);
    expect(SILK_LOOK_RANGES.ridge.step).toBe(0.05);
    expect(SILK_LOOK_RANGES.grain.step).toBe(0.05);
    expect(SILK_LOOK_RANGES.rotate.step).toBe(0.005);
    expect(SILK_LOOK_RANGES.drift.step).toBe(0.01);
    for (const key of Object.keys(SILK_LOOK_RANGES) as Array<
      keyof typeof SILK_LOOK_RANGES
    >) {
      const range = SILK_LOOK_RANGES[key];
      onStep(DEFAULT_SILK_LOOK[key], range.min, range.step);
    }
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
      grain: 9,
    });
    expect(clamped.speed).toBe(SILK_LOOK_RANGES.speed.max);
    expect(clamped.scale).toBe(SILK_LOOK_RANGES.scale.min);
    expect(clamped.warp).toBe(SILK_LOOK_RANGES.warp.min);
    expect(clamped.grey).toBe(SILK_LOOK_RANGES.grey.max);
    expect(clamped.white).toBe(SILK_LOOK_RANGES.white.min);
    expect(clamped.ridge).toBe(SILK_LOOK_RANGES.ridge.max);
    expect(clamped.rotate).toBe(SILK_LOOK_RANGES.rotate.min);
    expect(clamped.drift).toBe(SILK_LOOK_RANGES.drift.max);
    expect(clamped.grain).toBe(SILK_LOOK_RANGES.grain.max);
  });
});
