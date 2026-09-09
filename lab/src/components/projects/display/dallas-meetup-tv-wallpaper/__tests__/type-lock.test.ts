import { describe, expect, it } from "vitest";
import {
  DALLAS_DISPLAY_FONT_PX,
  DALLAS_SUBLINE_FONT_PX,
  DALLAS_TYPE_DESIGN_WIDTH_PX,
  displayRenderedPx,
  plexMaxPx,
} from "../type-lock";
import * as typeLock from "../type-lock";

describe("dallas type lock math", () => {
  it("keeps Figma sizes on the 1920 design frame", () => {
    expect(DALLAS_DISPLAY_FONT_PX).toBe(48);
    expect(DALLAS_SUBLINE_FONT_PX).toBe(36);
    expect(DALLAS_TYPE_DESIGN_WIDTH_PX).toBe(1920);
    expect(displayRenderedPx(1920)).toBe(48);
  });

  it("caps demo Plex at 40% of display", () => {
    expect(plexMaxPx(48)).toBeCloseTo(19.2);
    expect(plexMaxPx(displayRenderedPx(960))).toBeCloseTo(9.6);
  });

  it("never offers a grow-display helper", () => {
    expect(
      Object.keys(typeLock).some((name) => /enlarge|grow.*display|boost.*display/i.test(name)),
    ).toBe(false);
  });
});
