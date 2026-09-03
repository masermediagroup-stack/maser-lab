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
  it("keeps the display at 44px on the 1920 design frame", () => {
    expect(DALLAS_DISPLAY_FONT_PX).toBe(44);
    expect(DALLAS_TYPE_DESIGN_WIDTH_PX).toBe(1920);
    expect(displayRenderedPx(1920)).toBe(44);
  });

  it("caps the largest Plex size at 40% of the display", () => {
    expect(DALLAS_PLEX_MAX_RATIO).toBe(0.4);
    expect(plexMaxPx(44)).toBeCloseTo(17.6);
    expect(plexMaxPx(displayRenderedPx(960))).toBeCloseTo(8.8);
  });

  it("scales display with canvas CSS width and never offers a grow-display helper", () => {
    expect(displayRenderedPx(1100)).toBeCloseTo(44 * (1100 / 1920));
    expect(plexMaxPx(displayRenderedPx(1100))).toBeLessThan(12);
    expect(
      Object.keys(typeLock).some((name) => /enlarge|grow.*display|boost.*display/i.test(name)),
    ).toBe(false);
  });
});

describe("dallas family classification", () => {
  it("treats Universal Sans trial as the display face and Geist as a fail", () => {
    expect(
      classifyDallasFamily('"UniversalSansGrokTest Display Trial 400", sans-serif'),
    ).toBe("universal-sans");
    expect(classifyDallasFamily('GeistSans, "Geist Sans", sans-serif')).toBe("geist-sans");
    expect(classifyDallasFamily('"Geist Mono", ui-monospace')).toBe("geist-mono");
  });

  it("treats IBM Plex Sans Condensed as the UI face", () => {
    expect(
      classifyDallasFamily('"IBM Plex Sans Condensed", "Arial Narrow", sans-serif'),
    ).toBe("plex");
  });
});
