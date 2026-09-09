import { describe, expect, it } from "vitest";
import {
  CURSOR_LOCKUP_H,
  CURSOR_LOCKUP_W,
  FIGMA_FRAME_H,
  FIGMA_FRAME_W,
  GROK_LOCKUP_H,
  GROK_LOCKUP_W,
  LOGO_FADE_FRACTION,
  SPACEX_LOCKUP_H,
  SPACEX_LOCKUP_W,
  logoOpacities,
} from "../logo-carousel";

describe("logo carousel opacities", () => {
  it("shows only Grok under reduced motion", () => {
    expect(logoOpacities(10, 120, true)).toEqual([1, 0, 0]);
  });

  it("starts on Grok and holds SpaceX mid-segment", () => {
    const [g0, s0, c0] = logoOpacities(0, 120, false);
    expect(g0).toBe(1);
    expect(s0).toBe(0);
    expect(c0).toBe(0);

    const seg = 120 / 3;
    const [gMid, sMid, cMid] = logoOpacities(seg * 1.5, 120, false);
    expect(sMid).toBe(1);
    expect(gMid).toBe(0);
    expect(cMid).toBe(0);
  });

  it("never overlaps two logos", () => {
    const samples = 600;
    for (let i = 0; i <= samples; i += 1) {
      const t = (i / samples) * 120;
      const ops = logoOpacities(t, 120, false);
      const visible = ops.filter((o) => o > 0.001).length;
      expect(visible).toBeLessThanOrEqual(1);
    }
  });

  it("fades out then in at segment boundaries without a double fade", () => {
    const seg = 120 / 3;
    const fade = LOGO_FADE_FRACTION;
    const outT = seg * (1 - 1.5 * fade);
    const inT = seg * (1 - 0.5 * fade);

    const [gOut, sOut] = logoOpacities(outT, 120, false);
    expect(gOut).toBeGreaterThan(0);
    expect(sOut).toBe(0);

    const [gIn, sIn] = logoOpacities(inT, 120, false);
    expect(gIn).toBe(0);
    expect(sIn).toBeGreaterThan(0);
  });

  it("wraps Cursor → Grok at the loop seam with only one logo", () => {
    const [gWrap, sWrap, cWrap] = logoOpacities(120 - 0.01, 120, false);
    expect(sWrap).toBe(0);
    expect(gWrap + cWrap).toBeGreaterThan(0);
    expect((gWrap > 0.001 ? 1 : 0) + (cWrap > 0.001 ? 1 : 0)).toBe(1);
  });
});

describe("logo Figma native sizes", () => {
  it("keeps lockup dimensions from the 1920×1080 frame", () => {
    expect(FIGMA_FRAME_W).toBe(1920);
    expect(FIGMA_FRAME_H).toBe(1080);
    expect(GROK_LOCKUP_W).toBe(814);
    expect(GROK_LOCKUP_H).toBe(153);
    expect(SPACEX_LOCKUP_W).toBeCloseTo(900.886);
    expect(SPACEX_LOCKUP_H).toBe(110);
    expect(CURSOR_LOCKUP_W).toBe(645);
    expect(CURSOR_LOCKUP_H).toBe(153);
  });
});
