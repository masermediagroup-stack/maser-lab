import { describe, expect, it } from "vitest";
import { loopShaderTimeMs } from "../moving-gradient-background";

describe("moving gradient loop time", () => {
  it("wraps shader clock at loop boundary", () => {
    expect(loopShaderTimeMs(0, 120)).toBe(0);
    expect(loopShaderTimeMs(120, 120)).toBe(0);
    expect(loopShaderTimeMs(60, 120)).toBe(60000);
    expect(loopShaderTimeMs(119.5, 120)).toBeCloseTo(119500, 0);
  });
});
