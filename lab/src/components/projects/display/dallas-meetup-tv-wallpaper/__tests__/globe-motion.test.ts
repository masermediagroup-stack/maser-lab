import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOOP_SECONDS,
  LOOP_MAX_SECONDS,
  clampLoopSeconds,
  kickEase,
  loopBeatAt,
  restSeconds,
} from "../globe-motion";

const wallpaperSrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../dallas-meetup-tv-wallpaper.tsx"),
  "utf8",
);

describe("globe-motion (idle wallpaper)", () => {
  it("defaults to 120s loop", () => {
    expect(DEFAULT_LOOP_SECONDS).toBe(120);
    expect(LOOP_MAX_SECONDS).toBe(120);
    expect(clampLoopSeconds(45)).toBe(45);
    expect(restSeconds(120, 0.5)).toBeCloseTo(118.5);
  });

  it("labels legacy beats for unused kick model", () => {
    expect(loopBeatAt(1, 30, 0.6)).toBe("rest");
    expect(loopBeatAt(29, 30, 0.6)).toBe("settle");
    expect(kickEase(0.75)).toBeCloseTo(0.9375);
  });
});

describe("idle wallpaper render contract", () => {
  it("uses logo carousel and moving gradient stack", () => {
    expect(wallpaperSrc).toContain("drawLogoCarousel");
    expect(wallpaperSrc).toContain("MovingGradientBackground");
    expect(wallpaperSrc).toContain("dallas-wallpaper-stack");
    expect(wallpaperSrc).not.toContain("drawSpacexaiMark");
    expect(wallpaperSrc).not.toContain("drawGrokBody");
    expect(wallpaperSrc).not.toContain("drawTextRandomFade");
  });

  it("anchors copy bottom-left in Universal Sans", () => {
    expect(wallpaperSrc).toContain("TEXT_LEFT_PX");
    expect(wallpaperSrc).toContain("TEXT_TOP_PX");
    expect(wallpaperSrc).toContain("DALLAS_DISPLAY_FONT_PX");
    expect(wallpaperSrc).toContain("DALLAS_SUBLINE_FONT_PX");
  });
});
