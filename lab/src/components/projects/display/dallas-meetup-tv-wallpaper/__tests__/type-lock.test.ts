import { describe, expect, it } from "vitest";
import {
  DALLAS_DISPLAY_FONT_PX,
  DALLAS_PLEX_MAX_RATIO,
  DALLAS_TYPE_DESIGN_WIDTH_PX,
  classifyDallasFamily,
  displayRenderedPx,
  plexMaxPx,
} from "../type-lock";
import * as typeLock from "../type-lock";

describe("dallas type lock math", () => {
  it("keeps the display at 56px on the 1920 design frame", () => {
    expect(DALLAS_DISPLAY_FONT_PX).toBe(56);
    expect(DALLAS_TYPE_DESIGN_WIDTH_PX).toBe(1920);
    expect(displayRenderedPx(1920)).toBe(56);
  });

  it("caps the largest Plex size at 40% of the display", () => {
    expect(DALLAS_PLEX_MAX_RATIO).toBe(0.4);
    expect(plexMaxPx(56)).toBeCloseTo(22.4);
    expect(plexMaxPx(displayRenderedPx(960))).toBeCloseTo(11.2);
  });

  it("scales display with canvas CSS width and never offers a grow-display helper", () => {
    expect(displayRenderedPx(1100)).toBeCloseTo(56 * (1100 / 1920));
    expect(plexMaxPx(displayRenderedPx(1100))).toBeLessThan(14);
    expect(
      Object.keys(typeLock).some((name) => /enlarge|grow.*display|boost.*display/i.test(name)),
    ).toBe(false);
  });
});

describe("dallas family classification", () => {
  it("treats Geist Sans as the display face and Geist Mono as a separate cut", () => {
    expect(classifyDallasFamily('GeistSans, "Geist Sans", sans-serif')).toBe("geist-sans");
    expect(classifyDallasFamily("Geist, Geist Fallback")).toBe("geist-sans");
    expect(classifyDallasFamily('"Geist Mono", ui-monospace')).toBe("geist-mono");
  });

  it("treats IBM Plex Sans Condensed as the UI face", () => {
    expect(
      classifyDallasFamily('"IBM Plex Sans Condensed", "Arial Narrow", sans-serif'),
    ).toBe("plex");
  });
});
