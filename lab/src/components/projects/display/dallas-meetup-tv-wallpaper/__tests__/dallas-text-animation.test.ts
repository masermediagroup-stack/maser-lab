import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOOP_SECONDS,
  DEFAULT_WHIP_SECONDS,
  SETTLE_SECONDS,
  restSeconds,
} from "../globe-motion";
import {
  DEFAULT_RANDOM_LETTER_FADE,
  buildRandomLetterOrder,
  headlineTextAnchorX,
  letterOpacityAtLoop,
  randomLetterFadePhaseMs,
  scaleFadeSettingsForWindow,
} from "../dallas-text-animation";

describe("buildRandomLetterOrder", () => {
  it("is deterministic for the same play key", () => {
    const a = buildRandomLetterOrder(8, true, 0.8, 0);
    const b = buildRandomLetterOrder(8, true, 0.8, 0);
    expect(a).toEqual(b);
    expect(a.sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it("returns sequential indices when random order is off", () => {
    expect(buildRandomLetterOrder(5, false, 0.8, 0)).toEqual([0, 1, 2, 3, 4]);
  });
});

describe("loop-synced random letter fade", () => {
  const text = "abc";
  const order = buildRandomLetterOrder(
    text.length,
    DEFAULT_RANDOM_LETTER_FADE.randomOrder,
    DEFAULT_RANDOM_LETTER_FADE.randomnessAmount,
    DEFAULT_RANDOM_LETTER_FADE.playKey,
  );
  const loopSeconds = DEFAULT_LOOP_SECONDS;
  const whipSeconds = DEFAULT_WHIP_SECONDS;
  const rest = restSeconds(loopSeconds, whipSeconds);

  it("matches lab stagger + fade speed for one phase", () => {
    expect(randomLetterFadePhaseMs(3, DEFAULT_RANDOM_LETTER_FADE)).toBe(580);
  });

  it("starts the rest beat at zero opacity", () => {
    expect(
      letterOpacityAtLoop(0, text.length, order, 0, loopSeconds, whipSeconds, false),
    ).toBe(0);
  });

  it("holds full opacity mid-rest without micro-cycling", () => {
    const midRest = rest * 0.5;
    expect(
      letterOpacityAtLoop(0, text.length, order, midRest, loopSeconds, whipSeconds, false),
    ).toBe(1);
    expect(
      letterOpacityAtLoop(0, text.length, order, midRest + 1.1, loopSeconds, whipSeconds, false),
    ).toBe(1);
  });

  it("fades out during the whip beat", () => {
    const whipMid = rest + whipSeconds * 0.5;
    expect(
      letterOpacityAtLoop(0, text.length, order, whipMid, loopSeconds, whipSeconds, false),
    ).toBeLessThan(0.5);
  });

  it("stays hidden during settle", () => {
    const settleMid = rest + whipSeconds + SETTLE_SECONDS * 0.5;
    expect(
      letterOpacityAtLoop(0, text.length, order, settleMid, loopSeconds, whipSeconds, false),
    ).toBe(0);
  });

  it("returns full opacity when reduced motion is on", () => {
    expect(
      letterOpacityAtLoop(0, text.length, order, 0, loopSeconds, whipSeconds, true),
    ).toBe(1);
  });
});

describe("scaleFadeSettingsForWindow", () => {
  it("compresses timing to fit a short whip window", () => {
    const scaled = scaleFadeSettingsForWindow(12, 500, DEFAULT_RANDOM_LETTER_FADE);
    expect(randomLetterFadePhaseMs(12, scaled)).toBeLessThanOrEqual(500);
  });
});

describe("headlineTextAnchorX", () => {
  it("uses rest cursor center, not floated draw position", () => {
    const cursorX = 400;
    const cursorW = 200;
    const floatedDrawX = cursorX + 12;
    expect(headlineTextAnchorX(cursorX, cursorW)).toBe(300);
    expect(headlineTextAnchorX(floatedDrawX, cursorW)).not.toBe(
      headlineTextAnchorX(cursorX, cursorW),
    );
  });
});
