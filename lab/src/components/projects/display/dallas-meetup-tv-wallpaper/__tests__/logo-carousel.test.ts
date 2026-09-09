import { describe, expect, it } from "vitest";
import { logoOpacities } from "../logo-carousel";

describe("logo carousel opacities", () => {
  it("shows only Grok under reduced motion", () => {
    expect(logoOpacities(10, 120, true)).toEqual([1, 0, 0]);
  });

  it("cycles three logos over the loop with crossfade", () => {
    const [g0, s0, c0] = logoOpacities(0, 120, false);
    expect(g0).toBeGreaterThan(0.9);
    expect(s0 + c0).toBeLessThan(0.2);

    const seg = 120 / 3;
    const [, sMid, cMid] = logoOpacities(seg + seg * 0.5, 120, false);
    expect(sMid).toBeGreaterThan(0.9);
    expect(cMid).toBeLessThan(0.2);

    const [gWrap, , cWrap] = logoOpacities(120 - 0.01, 120, false);
    expect(cWrap).toBeGreaterThan(0);
    expect(gWrap).toBeGreaterThan(0);
  });

  it("sums opacities near 1 during crossfade windows", () => {
    const seg = 120 / 3;
    const fadeT = seg * 0.05;
    const [g, s, c] = logoOpacities(fadeT, 120, false);
    expect(g + s + c).toBeGreaterThan(0.95);
    expect(g + s + c).toBeLessThanOrEqual(1.01);
  });
});
