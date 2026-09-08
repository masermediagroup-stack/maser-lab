import { describe, expect, it } from "vitest";
import {
  DEFAULT_RANDOM_LETTER_FADE,
  buildRandomLetterOrder,
  headlineTextAnchorX,
  letterOpacityAt,
  randomLetterFadeCycleMs,
  randomLetterFadePhaseMs,
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

describe("random letter fade timing", () => {
  const text = "abc";
  const order = buildRandomLetterOrder(
    text.length,
    DEFAULT_RANDOM_LETTER_FADE.randomOrder,
    DEFAULT_RANDOM_LETTER_FADE.randomnessAmount,
    DEFAULT_RANDOM_LETTER_FADE.playKey,
  );

  it("matches lab stagger + fade speed for one phase", () => {
    expect(randomLetterFadePhaseMs(3, DEFAULT_RANDOM_LETTER_FADE)).toBe(580);
    expect(randomLetterFadeCycleMs(3, DEFAULT_RANDOM_LETTER_FADE)).toBe(1160);
  });

  it("starts the in phase at zero opacity", () => {
    expect(letterOpacityAt(0, text.length, order, 0)).toBe(0);
  });

  it("reaches full opacity after the in phase completes", () => {
    const phaseMs = randomLetterFadePhaseMs(text.length);
    expect(letterOpacityAt(0, text.length, order, phaseMs - 1)).toBeGreaterThan(0.9);
  });

  it("cycles into the out phase", () => {
    const phaseMs = randomLetterFadePhaseMs(text.length);
    expect(letterOpacityAt(0, text.length, order, phaseMs)).toBe(1);
    const afterOut = phaseMs * 2 - 1;
    expect(letterOpacityAt(0, text.length, order, afterOut)).toBeLessThan(0.05);
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
