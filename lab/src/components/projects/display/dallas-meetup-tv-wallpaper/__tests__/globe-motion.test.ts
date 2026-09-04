import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOOP_SECONDS,
  DEFAULT_WHIP_SECONDS,
  SETTLE_SECONDS,
  WHIP_BAND_IN,
  WHIP_BAND_LEAVE,
  cursorWhipRad,
  kickEase,
  kickWobbleRad,
  loopBeat,
  restSeconds,
  settleEaseOut,
  settleSeconds,
  streamPhase,
  whipEnergy,
} from "../globe-motion";

const wallpaperSrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../dallas-meetup-tv-wallpaper.tsx"),
  "utf8",
);
const marksSrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../official-marks.ts"),
  "utf8",
);

describe("look-lock motion", () => {
  it("names an 8s cycle with 6.4s rest, 0.6s whip, 1s settle — loop stays 8s", () => {
    expect(DEFAULT_LOOP_SECONDS).toBe(8);
    expect(DEFAULT_WHIP_SECONDS).toBe(0.6);
    expect(SETTLE_SECONDS).toBe(1);
    expect(restSeconds(8, 0.6)).toBeCloseTo(6.4);
    expect(settleSeconds(8, 0.6)).toBeCloseTo(1);
    expect(restSeconds(8, 0.6) + DEFAULT_WHIP_SECONDS + SETTLE_SECONDS).toBe(8);
  });

  it("labels rest / whip / settle without shrinking rest", () => {
    expect(loopBeat(1, 8, 0.6, false)).toBe("rest");
    expect(loopBeat(6.39, 8, 0.6, false)).toBe("rest");
    expect(loopBeat(6.41, 8, 0.6, false)).toBe("whip");
    expect(loopBeat(6.99, 8, 0.6, false)).toBe("whip");
    expect(loopBeat(7.01, 8, 0.6, false)).toBe("settle");
    expect(loopBeat(7.9, 8, 0.6, false)).toBe("settle");
    expect(loopBeat(7.5, 8, 0.6, true)).toBe("rest");
  });

  it("holds stream phase at 0 during rest and settle (no residual spin)", () => {
    expect(streamPhase(0, 8, 0.6, false)).toBe(0);
    expect(streamPhase(6.39, 8, 0.6, false)).toBe(0);
    expect(streamPhase(7.05, 8, 0.6, false)).toBe(0);
    expect(streamPhase(7.9, 8, 0.6, false)).toBe(0);
  });

  it("spins the cube one revolution during the kick; settle needs no spin", () => {
    const rest = restSeconds(8, 0.6);
    const mid = streamPhase(rest + 0.3, 8, 0.6, false);
    expect(mid).toBeCloseTo(Math.PI, 5);
    const end = streamPhase(rest + 0.6, 8, 0.6, false);
    expect(end).toBe(0);
    expect(streamPhase(7.2, 8, 0.6, false)).toBe(0);
  });

  it("uses hard cubic ease-in-out on the whip and ease-out on settle", () => {
    expect(kickEase(0.25)).toBeCloseTo(0.0625);
    expect(kickEase(0.5)).toBeCloseTo(0.5);
    expect(kickEase(0.75)).toBeCloseTo(0.9375);
    expect(settleEaseOut(0)).toBe(0);
    expect(settleEaseOut(1)).toBe(1);
    expect(settleEaseOut(0.5)).toBeCloseTo(0.875);
  });

  it("freezes reduced motion", () => {
    expect(streamPhase(4, 8, 0.6, true)).toBe(0);
  });

  it("kills band energy at rest, settle, and reduced motion", () => {
    expect(whipEnergy(1, 8, 0.6, false)).toBe(0);
    expect(whipEnergy(6.39, 8, 0.6, false)).toBe(0);
    expect(whipEnergy(7.01, 8, 0.6, false)).toBe(0);
    expect(whipEnergy(7.5, 8, 0.6, false)).toBe(0);
    expect(whipEnergy(7.9, 8, 0.6, false)).toBe(0);
    expect(whipEnergy(6.5, 8, 0.6, true)).toBe(0);
  });

  it("wraps at full energy mid-kick then leaves before settle", () => {
    const rest = restSeconds(8, 0.6);
    const whip = DEFAULT_WHIP_SECONDS;
    const mid = rest + whip * 0.45;
    const leaving = rest + whip * (WHIP_BAND_LEAVE + 0.14);
    const late = rest + whip * 0.97;
    expect(mid).toBeGreaterThan(rest + whip * WHIP_BAND_IN);
    expect(whipEnergy(mid, 8, 0.6, false)).toBe(1);
    expect(whipEnergy(leaving, 8, 0.6, false)).toBeLessThan(1);
    expect(whipEnergy(leaving, 8, 0.6, false)).toBeGreaterThan(0.02);
    expect(whipEnergy(late, 8, 0.6, false)).toBeLessThan(0.15);
  });

  it("does not export a globe yaw — the disc stays planted", async () => {
    const motion = await import("../globe-motion");
    expect("globeYaw" in motion).toBe(false);
    expect("AXIS_TILT_DEG" in motion).toBe(false);
  });

  it("spins the Cursor cube 360 on kick and keeps the Grok disc planted", () => {
    const rest = restSeconds(8, 0.6);
    expect(cursorWhipRad(1, 8, 0.6, false)).toBe(0);
    expect(cursorWhipRad(rest + 0.3, 8, 0.6, false)).toBeCloseTo(Math.PI, 5);
    expect(cursorWhipRad(rest + 0.3, 8, 0.6, true)).toBe(0);
    expect(wallpaperSrc).toContain("cursorWhipRad");
    expect(wallpaperSrc).toMatch(/ctx\.rotate\(cursorWhipRad/);
    expect(wallpaperSrc).not.toMatch(/globeYaw/);
    expect(wallpaperSrc).not.toMatch(/dallas-horizon/);
    expect(wallpaperSrc).not.toMatch(/eyeWhipAt/);
    expect(wallpaperSrc).not.toMatch(/drawWorkingOrbits/);
    expect(wallpaperSrc).not.toMatch(/kickRibbonPlan/);
    expect(wallpaperSrc).toContain("CURSOR_FILL_RULE");
    expect(wallpaperSrc).toContain("traceBodyPath");
    expect(wallpaperSrc).toContain("grokCyclePose");
    expect(wallpaperSrc).toContain("bodyOutline");
    expect(marksSrc).toContain("evenodd");
    expect(marksSrc).toContain("M444.05");
    expect(wallpaperSrc).not.toMatch(/fill\(new Path2D\(CURSOR_PATH\),\s*"nonzero"\)/);
    expect(wallpaperSrc).not.toMatch(/drawImage/);
    expect(wallpaperSrc).not.toMatch(/GROK_FACE_SRC/);
  });

  it("adds no idle bob or kick wobble", () => {
    expect(kickWobbleRad(0, 0.5)).toBe(0);
    expect(kickWobbleRad(1, 0.5)).toBe(0);
    expect(kickWobbleRad(1, 1)).toBe(0);
  });
});
