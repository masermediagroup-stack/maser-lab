import { describe, expect, it } from "vitest";
import {
  HORIZON_NOUN_ID,
  HORIZON_SRC,
  HORIZON_SOURCE_CREDIT,
} from "../dallas-horizon";
import { DALLAS_INK } from "../grok-cycle";

describe("Noun Project Dallas horizon", () => {
  it("points at the Noun Project silhouette, not the Trammell Crow photo", () => {
    expect(HORIZON_NOUN_ID).toBe("3583788");
    expect(HORIZON_SRC).toBe("/images/dallas-noun-skyline.svg");
    expect(HORIZON_SRC).not.toMatch(/trammell|illustration/i);
    expect(HORIZON_SOURCE_CREDIT).toMatch(/Noun Project/i);
    expect(HORIZON_SOURCE_CREDIT).toMatch(/3583788/);
    expect(DALLAS_INK).toBe("#111111");
  });
});
