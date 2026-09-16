import { describe, expect, it } from "vitest";
import { containScale } from "../fit-stage";

describe("1920×1080 contain letterbox", () => {
  it("is identity on a true HD frame", () => {
    expect(containScale(1920, 1080)).toBe(1);
  });

  it("uses one uniform scale so the board is never stretched", () => {
    expect(containScale(960, 540)).toBe(0.5);
    expect(containScale(1920, 540)).toBeCloseTo(540 / 1080);
    expect(containScale(960, 1080)).toBeCloseTo(960 / 1920);
  });

  it("does not invert or explode on empty viewports", () => {
    expect(containScale(0, 1080)).toBe(1);
    expect(containScale(1920, 0)).toBe(1);
    expect(containScale(Number.NaN, 1080)).toBe(1);
  });
});
