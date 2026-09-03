import { describe, expect, it } from "vitest";
import {
  FIELD_SWOOSH_HUES,
  contrastVsPaper,
  fieldStopHoldsAt1x,
} from "../field-filaments";
import {
  DALLAS_GROK_GRAY,
  DALLAS_GROK_GREEN,
  GROK_CHROMATIC_FILLS,
} from "../grok-cycle";

describe("Ver 02 hues for mark orbits (not a wallpaper field)", () => {
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
