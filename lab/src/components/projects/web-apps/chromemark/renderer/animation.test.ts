import { describe, expect, it } from "vitest";
import { ANIMATION_DEFAULTS } from "../defaults";
import { rotationForFrame, sequenceFrameCount } from "./animation";
import { Quaternion } from "three";

describe("ChromeMark sequence sampling", () => {
  it("uses fps * duration frames with no duplicate wrap", () => {
    expect(sequenceFrameCount(30, 8)).toBe(240);
    expect(sequenceFrameCount(24, 1)).toBe(24);
  });

  it("places the last frame just before a full turn", () => {
    const start = new Quaternion();
    const first = rotationForFrame({
      start,
      settings: { ...ANIMATION_DEFAULTS, turns: 1, easing: "linear" },
      frameIndex: 0,
      totalFrames: 240,
    });
    const last = rotationForFrame({
      start,
      settings: { ...ANIMATION_DEFAULTS, turns: 1, easing: "linear" },
      frameIndex: 239,
      totalFrames: 240,
    });
    const remaining = (2 * Math.PI) / 240;
    expect(first.angleTo(start)).toBeLessThan(1e-6);
    expect(last.angleTo(start)).toBeGreaterThan(remaining * 0.5);
    expect(last.angleTo(start)).toBeCloseTo(remaining, 4);
  });
});
