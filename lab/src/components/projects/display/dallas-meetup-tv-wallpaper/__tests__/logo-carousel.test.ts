import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
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
  drawLogoCarousel,
  logoCenteredRect,
  logoOpacities,
} from "../logo-carousel";

const carouselSrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../logo-carousel.ts"),
  "utf8",
);

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

  it("centers each lockup geometrically with no optical offset", () => {
    expect(logoCenteredRect(GROK_LOCKUP_W, GROK_LOCKUP_H)).toEqual({
      x: 960 - GROK_LOCKUP_W / 2,
      y: 540 - GROK_LOCKUP_H / 2,
      w: 814,
      h: 153,
    });
    expect(logoCenteredRect(SPACEX_LOCKUP_W, SPACEX_LOCKUP_H).x).toBeCloseTo(
      960 - SPACEX_LOCKUP_W / 2,
    );
    expect(logoCenteredRect(SPACEX_LOCKUP_W, SPACEX_LOCKUP_H).y).toBeCloseTo(
      540 - SPACEX_LOCKUP_H / 2,
    );
    expect(logoCenteredRect(CURSOR_LOCKUP_W, CURSOR_LOCKUP_H)).toEqual({
      x: 960 - CURSOR_LOCKUP_W / 2,
      y: 540 - CURSOR_LOCKUP_H / 2,
      w: 645,
      h: 153,
    });
  });

  it("draws the visible logo at native W×H", () => {
    const calls: number[][] = [];
    const ctx = {
      save() {},
      restore() {},
      drawImage(_img: unknown, x: number, y: number, w: number, h: number) {
        calls.push([x, y, w, h]);
      },
      globalAlpha: 1,
    } as unknown as CanvasRenderingContext2D;
    const img = {} as HTMLImageElement;

    drawLogoCarousel(ctx, 1920, 1080, 0, 120, false, {
      grok: img,
      spacex: img,
      cursor: img,
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.[2]).toBe(814);
    expect(calls[0]?.[3]).toBe(153);
    expect(calls[0]?.[0]).toBeCloseTo(960 - 814 / 2);
    expect(calls[0]?.[1]).toBeCloseTo(540 - 153 / 2);

    calls.length = 0;
    const seg = 120 / 3;
    drawLogoCarousel(ctx, 800, 450, seg * 1.5, 120, false, {
      grok: img,
      spacex: img,
      cursor: img,
    });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.[2]).toBeCloseTo(900.886);
    expect(calls[0]?.[3]).toBe(110);
    expect(calls[0]?.[0]).toBeCloseTo(960 - 900.886 / 2);
  });

  it("does not contain-fit or optically shift logos", () => {
    expect(carouselSrc).not.toContain("fitLogoRect");
    expect(carouselSrc).not.toContain("LOGO_MAX_W_PX");
    expect(carouselSrc).not.toContain("LOGO_MAX_H_PX");
    expect(carouselSrc).not.toContain("SPACEX_OPTICAL_CENTER_X");
    expect(carouselSrc).not.toMatch(/width\s*\/\s*1920/);
  });
});
