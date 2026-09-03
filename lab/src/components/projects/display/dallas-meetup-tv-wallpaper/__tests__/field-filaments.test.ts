import { describe, expect, it } from "vitest";
import {
  FIELD_SWOOSH_HUES,
  contrastVsPaper,
  fieldStopHoldsAt1x,
  generateFieldFilaments,
} from "../field-filaments";
import {
  DALLAS_GROK_GRAY,
  DALLAS_GROK_GREEN,
  GROK_CHROMATIC_FILLS,
} from "../grok-cycle";

describe("Ver 02 9-hue field swooshes", () => {
  it("locks the nine chromatic hues in order and never includes gray", () => {
    expect(FIELD_SWOOSH_HUES.map((s) => s.hex)).toEqual([...GROK_CHROMATIC_FILLS]);
    expect(FIELD_SWOOSH_HUES.map((s) => s.id)).toEqual([
      "gold",
      "red",
      "orange-red",
      "orange",
      "green",
      "teal",
      "blue",
      "violet",
      "magenta",
    ]);
    expect(FIELD_SWOOSH_HUES).toHaveLength(9);
    expect(FIELD_SWOOSH_HUES.map((s) => s.hex)).not.toContain(DALLAS_GROK_GRAY);
    expect(FIELD_SWOOSH_HUES.map((s) => s.hex)).toContain(DALLAS_GROK_GREEN);
  });

  it("holds every hue at 1× on paper", () => {
    for (const stop of FIELD_SWOOSH_HUES) {
      expect(fieldStopHoldsAt1x(stop.hex)).toBe(true);
      expect(contrastVsPaper(stop.hex)).toBeGreaterThanOrEqual(1.35);
    }
    expect(fieldStopHoldsAt1x(DALLAS_GROK_GRAY)).toBe(false);
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

  it("assigns from the nine Ver 02 hues and never gray", () => {
    const filaments = generateFieldFilaments(1920, 1080);
    const hexes = new Set(filaments.map((f) => f.hex));
    expect(hexes.has(DALLAS_GROK_GRAY)).toBe(false);
    expect(hexes.size).toBeGreaterThanOrEqual(4);
    for (const hex of hexes) {
      expect((GROK_CHROMATIC_FILLS as readonly string[]).includes(hex)).toBe(true);
      expect(fieldStopHoldsAt1x(hex)).toBe(true);
    }
  });
});
