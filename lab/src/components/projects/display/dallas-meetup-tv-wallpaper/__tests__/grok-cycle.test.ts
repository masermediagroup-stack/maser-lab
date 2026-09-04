import { describe, expect, it } from "vitest";
import {
  GROK_CHROMATIC_FILLS,
  DALLAS_EYE_WHITE,
  DALLAS_GLOBE_BLACK,
  DALLAS_GROK_BLACK,
  DALLAS_GROK_GRAY,
  DALLAS_GROK_GREEN,
  DALLAS_INK,
  kickRibbonHues,
} from "../grok-cycle";

describe("disc fill lock", () => {
  it("keeps the Grok disc Black forever — eyes white, not a light head", () => {
    expect(DALLAS_GROK_BLACK).toBe("#000000");
    expect(DALLAS_GLOBE_BLACK).toBe(DALLAS_GROK_BLACK);
    expect(DALLAS_EYE_WHITE).toBe("#FFFFFF");
    expect(DALLAS_INK).toBe("#111111");
    expect(DALLAS_GROK_BLACK).not.toBe(DALLAS_INK);
    expect(GROK_CHROMATIC_FILLS).not.toContain(DALLAS_GROK_BLACK);
    expect(GROK_CHROMATIC_FILLS).not.toContain(DALLAS_GROK_GRAY);
    expect(GROK_CHROMATIC_FILLS).not.toContain(DALLAS_EYE_WHITE);
  });

  it("assigns distinct chromatic ribbon hues per kick and skips gray", () => {
    const a = kickRibbonHues(1, 8, 3);
    const sameKick = kickRibbonHues(6.7, 8, 3);
    const nextKick = kickRibbonHues(8.2, 8, 3);
    expect(a).toEqual(sameKick);
    expect(a).toHaveLength(3);
    expect(new Set(a).size).toBe(3);
    expect(a).not.toContain(DALLAS_GROK_GRAY);
    expect(a).not.toEqual(nextKick);
    expect(GROK_CHROMATIC_FILLS).toContain(DALLAS_GROK_GREEN);
    expect(GROK_CHROMATIC_FILLS).toHaveLength(9);
  });
});
