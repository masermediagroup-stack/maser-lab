import { describe, expect, it } from "vitest";
import {
  GROK4_FIELD_FALLBACK,
  GROK4_FIELD_STOPS,
  assignFieldHex,
  contrastVsPaper,
  fieldStopHoldsAt1x,
  generateFieldFilaments,
} from "../field-filaments";

describe("Grok 4 field tokens", () => {
  it("keeps all eight sampled stops with provenance hexes", () => {
    expect(GROK4_FIELD_STOPS.map((s) => s.hex)).toEqual([
      "#CF525C",
      "#F15336",
      "#FEB87C",
      "#FFE4A6",
      "#C4D3E1",
      "#AAD5EA",
      "#86A4C6",
      "#7775A5",
    ]);
    expect(GROK4_FIELD_STOPS.map((s) => s.id)).toEqual([
      "rose",
      "red",
      "orange",
      "cream",
      "icy",
      "cyan",
      "blue",
      "indigo",
    ]);
  });

  it("falls pale cream/icy back toward indigo/rose/red instead of paper-on-paper", () => {
    expect(fieldStopHoldsAt1x("#FFE4A6")).toBe(false);
    expect(fieldStopHoldsAt1x("#C4D3E1")).toBe(false);
    expect(fieldStopHoldsAt1x("#CF525C")).toBe(true);
    expect(fieldStopHoldsAt1x("#F15336")).toBe(true);
    expect(fieldStopHoldsAt1x("#7775A5")).toBe(true);
    expect(GROK4_FIELD_FALLBACK).toEqual(["#7775A5", "#CF525C", "#F15336"]);
    expect(assignFieldHex("#FFE4A6", 0)).toBe("#7775A5");
    expect(assignFieldHex("#CF525C", 0)).toBe("#CF525C");
    expect(contrastVsPaper("#FFE4A6")).toBeLessThan(1.35);
    expect(contrastVsPaper("#C4D3E1")).toBeLessThan(1.8);
  });
});

describe("field filament layout", () => {
  it("flows laterally across the paper, not as meridians on a globe", () => {
    const filaments = generateFieldFilaments(1920, 1080);
    expect(filaments.length).toBeGreaterThan(28);
    const lateral = filaments.filter((f) => Math.abs(f.x1 - f.x0) > Math.abs(f.y1 - f.y0) * 0.55);
    expect(lateral.length).toBeGreaterThan(filaments.length * 0.7);

    const centerX = 960;
    const centerY = 540;
    const polar = filaments.filter((f) => {
      const a0 = Math.atan2(f.y0 - centerY, f.x0 - centerX);
      const a1 = Math.atan2(f.y1 - centerY, f.x1 - centerX);
      const da = Math.abs(a0 - a1);
      const wrapped = Math.min(da, Math.PI * 2 - da);
      return wrapped < 0.08;
    });
    expect(polar.length).toBeLessThan(filaments.length * 0.25);
  });

  it("assigns from the eight-stop set and never uses Ver 02 globe fills", () => {
    const filaments = generateFieldFilaments(1920, 1080);
    const hexes = new Set(filaments.map((f) => f.hex));
    expect(hexes.has("#1084FE")).toBe(false);
    expect(hexes.has("#00BCA6")).toBe(false);
    for (const hex of hexes) {
      expect(fieldStopHoldsAt1x(hex)).toBe(true);
    }
  });
});
