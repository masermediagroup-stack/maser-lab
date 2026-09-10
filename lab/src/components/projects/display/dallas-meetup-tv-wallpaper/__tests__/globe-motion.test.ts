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
const tokensSrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../tokens.css"),
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
  it("uses a WebGL2 silk shader under a DOM lockup", () => {
    expect(wallpaperSrc).toContain("startMovingGradient");
    expect(wallpaperSrc).toContain("dallas-wallpaper-stack");
    expect(wallpaperSrc).toContain("dallas-wallpaper-stack__lockup");
    expect(wallpaperSrc).toContain("drawLogoCarousel");
    expect(wallpaperSrc).not.toContain("UnicornGround");
    expect(wallpaperSrc).not.toContain("unicornstudio");
    expect(wallpaperSrc).not.toContain("MovingGradientBackground");
    expect(wallpaperSrc).not.toContain("drawFallbackGradient");
    expect(wallpaperSrc).not.toContain("drawSpacexaiMark");
    expect(wallpaperSrc).not.toContain("drawGrokBody");
    expect(wallpaperSrc).not.toContain("drawTextRandomFade");
  });

  it("anchors copy bottom-left in Universal Sans at native px", () => {
    expect(wallpaperSrc).toContain("TEXT_LEFT_PX");
    expect(wallpaperSrc).toContain("TEXT_TOP_PX");
    expect(wallpaperSrc).toContain("DALLAS_DISPLAY_FONT_PX");
    expect(wallpaperSrc).toContain("DALLAS_SUBLINE_FONT_PX");
    expect(wallpaperSrc).not.toContain("DALLAS_DISPLAY_FONT_PX * scale");
    expect(wallpaperSrc).not.toContain("DALLAS_SUBLINE_FONT_PX * scale");
    expect(tokensSrc).toContain("font-size: 48px");
    expect(tokensSrc).toContain("font-size: 36px");
    expect(tokensSrc).toContain("left: 72px");
    expect(tokensSrc).toContain("top: 931px");
  });

  it("keeps a true 1920×1080 CSS stage with no stretch", () => {
    expect(tokensSrc).toContain("width: 1920px");
    expect(tokensSrc).toContain("height: 1080px");
    expect(tokensSrc).not.toContain("aspect-ratio: 16 / 9");
    expect(tokensSrc).not.toMatch(/\.dallas-wallpaper-stack \{[^}]*width: 100%/);
    expect(wallpaperSrc).not.toContain("setTransform(dpr, 0, 0, dpr, 0, 0)");
    expect(wallpaperSrc).not.toContain("Math.round(BASE_WIDTH * clampedDpr)");
    expect(wallpaperSrc).toContain("fillText(headlineText, TEXT_LEFT_PX, TEXT_TOP_PX)");
  });
});
