import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  FACE_DISC_R,
  GROK_LEFT_EYE,
  GROK_RIGHT_EYE,
  IDLE_EYE,
  STADIUM_TILT_DEG,
  eyeFitsFaceDisc,
  eyePoseAt,
  eyesAt,
  gazeAt,
  stadiumReach,
  winkEnvelope,
} from "../grok-eyes";

const wallpaperSrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../dallas-meetup-tv-wallpaper.tsx"),
  "utf8",
);

describe("Idle / planted white stadiums", () => {
  it("plants two distinct parallel stadiums, slight left, camera rest not stuck BL or TR", () => {
    expect(GROK_LEFT_EYE.cx).toBeLessThan(GROK_RIGHT_EYE.cx);
    expect(GROK_LEFT_EYE.tilt).toBeCloseTo(GROK_RIGHT_EYE.tilt);
    expect(STADIUM_TILT_DEG).toBeGreaterThanOrEqual(-15);
    expect(STADIUM_TILT_DEG).toBeLessThanOrEqual(-8);
    expect(STADIUM_TILT_DEG).toBeCloseTo(-12);
    const deg = (GROK_LEFT_EYE.tilt * 180) / Math.PI;
    expect(deg).toBeGreaterThanOrEqual(-15);
    expect(deg).toBeLessThanOrEqual(-8);
    expect(deg).toBeGreaterThan(-20);
    const dx = GROK_RIGHT_EYE.cx - GROK_LEFT_EYE.cx;
    const dy = GROK_RIGHT_EYE.cy - GROK_LEFT_EYE.cy;
    expect(Math.hypot(dx, dy)).toBeGreaterThan(0.28);
    expect(Math.abs(IDLE_EYE.cx)).toBeLessThan(0.12);
    expect(Math.abs(IDLE_EYE.cy)).toBeLessThan(0.12);
    expect(GROK_LEFT_EYE.cy).toBeLessThan(0.2);
    expect(GROK_LEFT_EYE.cy).toBeGreaterThan(-0.2);
    expect(GROK_LEFT_EYE.cx).toBeGreaterThan(-0.28);
    expect(GROK_LEFT_EYE.cx).toBeLessThan(0.12);
  });

  it("winks one eye on Idle and keeps the pair planted through the kick", () => {
    const rest = eyesAt(1.73, 8, 0.6, false);
    expect(rest.left.scaleY).toBeLessThan(0.5);
    expect(rest.right.scaleY).toBeCloseTo(1);
    const kick = eyesAt(6.7, 8, 0.6, false);
    expect(kick.left.cx).toBeLessThan(kick.right.cx);
    expect(Math.abs(kick.left.cx)).toBeLessThan(0.95);
    expect(Math.abs(kick.left.cy)).toBeLessThan(0.95);
  });

  it("gazes as a pair to up and side, then returns, and freezes reduced motion", () => {
    const rest = eyesAt(0.2, 8, 0.6, false);
    const up = eyesAt(2.1, 8, 0.6, false);
    const side = eyesAt(3.6, 8, 0.6, false);
    const back = eyesAt(6.5, 8, 0.6, false);

    expect(up.left.cy).toBeLessThan(rest.left.cy - 0.12);
    expect(up.right.cy).toBeLessThan(rest.right.cy - 0.12);
    expect(side.left.cx).toBeGreaterThan(rest.left.cx + 0.12);
    expect(side.right.cx).toBeGreaterThan(rest.right.cx + 0.12);
    expect(back.left.cx).toBeCloseTo(rest.left.cx, 1);
    expect(back.left.cy).toBeCloseTo(rest.left.cy, 1);

    const pairDx = up.left.cx - rest.left.cx;
    const pairDxRight = up.right.cx - rest.right.cx;
    expect(Math.abs(pairDx - pairDxRight)).toBeLessThan(0.08);

    expect(up.left.tilt).toBeCloseTo(rest.left.tilt);
    expect(up.right.tilt).toBeCloseTo(rest.right.tilt);
    expect(side.left.tilt).toBeCloseTo(rest.left.tilt);

    expect(gazeAt(2.1).cy).toBeLessThan(gazeAt(0.2).cy);
    expect(gazeAt(3.6).cx).toBeGreaterThan(gazeAt(0.2).cx);

    const frozen = eyesAt(6.55, 8, 0.6, true);
    expect(frozen.left).toEqual(GROK_LEFT_EYE);
    expect(frozen.right).toEqual(GROK_RIGHT_EYE);
    const seat = eyePoseAt(6.55, 8, 0.6, true);
    expect(seat.cx).toBeCloseTo(IDLE_EYE.cx);
    expect(seat.cy).toBeCloseTo(IDLE_EYE.cy);
  });

  it("shuts then reopens a wink envelope", () => {
    expect(winkEnvelope(-0.01)).toBe(1);
    expect(winkEnvelope(0.08)).toBeLessThan(0.5);
    expect(winkEnvelope(0.16)).toBe(1);
  });

  it("keeps every gaze+wink pose inside the face disc and never clips stadiums to the silhouette", () => {
    expect(stadiumReach(1)).toBeLessThan(FACE_DISC_R);
    const samples = [0.2, 1.65, 1.73, 2.1, 3.6, 4.85, 4.93, 6.5, 6.7];
    for (const t of samples) {
      const pair = eyesAt(t, 8, 0.6, false);
      expect(eyeFitsFaceDisc(pair.left)).toBe(true);
      expect(eyeFitsFaceDisc(pair.right)).toBe(true);
    }
    const frozen = eyesAt(2.1, 8, 0.6, true);
    expect(eyeFitsFaceDisc(frozen.left)).toBe(true);
    expect(eyeFitsFaceDisc(frozen.right)).toBe(true);

    expect(wallpaperSrc).toContain("FACE_DISC_R");
    expect(wallpaperSrc).toMatch(/ctx\.arc\(0, 0, R \* FACE_DISC_R/);
    expect(wallpaperSrc).toContain("pickRedBody");
    expect(wallpaperSrc).toContain("SEEDED_RED_BODY");
    expect(wallpaperSrc).not.toContain("markLayout");
    expect(wallpaperSrc).not.toMatch(
      /traceBodyPath\(ctx, radii, R\);\s*ctx\.clip\(\)/s,
    );
  });
});

describe("no bands on Grok", () => {
  it("never draws Thinking nest, Working ribbons, or colored orbits around the disc", () => {
    expect(wallpaperSrc).not.toMatch(/drawWorkingOrbits/);
    expect(wallpaperSrc).not.toMatch(/working-orbits/);
    expect(wallpaperSrc).not.toMatch(/kickRibbonPlan/);
    expect(wallpaperSrc).not.toMatch(/WORKING_ORBIT/);
    expect(wallpaperSrc).not.toMatch(/drawTaperedRibbon/);
    expect(wallpaperSrc).not.toMatch(/fillStrip/);
    expect(wallpaperSrc).not.toMatch(/whipEnergy/);
    expect(wallpaperSrc).not.toMatch(/streamPhase/);
    expect(wallpaperSrc).toContain("cursorWhipRad");
    expect(wallpaperSrc).toContain("traceBodyPath");
    expect(wallpaperSrc).toContain("FACE_DISC_R");
    expect(wallpaperSrc).toContain("eyesAt");
    expect(wallpaperSrc).toContain("grokCyclePose");
  });
});
