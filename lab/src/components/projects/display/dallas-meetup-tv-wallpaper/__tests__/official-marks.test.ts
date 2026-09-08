import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CURSOR_FILL_RULE, CURSOR_PATH } from "../official-marks";
import { SPACEXAI_ASPECT, SPACEXAI_MARK_SRC } from "../spacexai-mark";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, "../../../../../../public/assets/dallas-meetup-tv-wallpaper");
const wallpaperSrc = readFileSync(join(here, "../dallas-meetup-tv-wallpaper.tsx"), "utf8");
const markSrc = readFileSync(join(here, "../spacexai-mark.ts"), "utf8");
const cubeSvg = readFileSync(join(publicDir, "CUBE_2D_DARK.svg"), "utf8");

describe("spacexai mark (replaces Cursor cube)", () => {
  it("ships the wordmark asset with matching aspect", () => {
    expect(SPACEXAI_ASPECT).toBeCloseTo(834 / 318, 5);
    expect(SPACEXAI_MARK_SRC).toBe(
      "/assets/dallas-meetup-tv-wallpaper/spacexai-logo.png",
    );
    expect(existsSync(join(publicDir, "spacexai-logo.png"))).toBe(true);
  });

  it("draws the wordmark planted (no float, no spin) with a loop-synced sweep", () => {
    expect(wallpaperSrc).toContain("spacexaiLogoImage");
    expect(wallpaperSrc).toContain("drawSpacexaiMark");
    expect(wallpaperSrc).toContain("preloadSpacexaiLogo");
    expect(wallpaperSrc).not.toContain("CURSOR_PATH");
    expect(wallpaperSrc).not.toContain("CURSOR_FILL_RULE");
    expect(wallpaperSrc).not.toMatch(/new Path2D/);
    expect(wallpaperSrc).not.toMatch(/rotate\(cursorWhipRad/);
    expect(wallpaperSrc).not.toContain("cursorWhipRad");
  });

  it("sweeps the wordmark left-to-right with an edge-rim shine, never the full fill", () => {
    expect(markSrc).toContain("spacexaiSwipeState");
    expect(markSrc).toContain("spacexaiSweepEase");
    expect(markSrc).toContain("destination-in");
    expect(markSrc).toContain("destination-out");
    expect(markSrc).toContain("drawSpacexaiMark");
    expect(markSrc).toContain("GROK_Y_NUDGE_PX");
  });
  it("keeps the retired Cursor path intact in official-marks", () => {
    expect(CURSOR_FILL_RULE).toBe("evenodd");
    expect(CURSOR_PATH).toContain("M444.05");
    expect(CURSOR_PATH).toContain("M457.43");
    expect(cubeSvg).toContain("evenodd");
    expect(cubeSvg).toContain("M444.05");
    expect(wallpaperSrc).not.toMatch(/"nonzero"/);
  });

  it("draws Grok as an SDF picker body + white stadiums, not a PNG face", () => {
    expect(existsSync(join(publicDir, "CUBE_2D_DARK.svg"))).toBe(true);
    expect(wallpaperSrc).toContain("traceBodyPath");
    expect(wallpaperSrc).toContain("FACE_DISC_R");
    expect(wallpaperSrc).toContain("grokCyclePose");
    expect(wallpaperSrc).toContain("bodyOutline");
    expect(wallpaperSrc).toContain("outlineFitScale");
    expect(wallpaperSrc).toContain("pickRedBody");
    expect(wallpaperSrc).toMatch(/MARK_BOX_PX = CURSOR_H_PX/);
    expect(wallpaperSrc).not.toMatch(/GROK_FACE_PX/);
    expect(wallpaperSrc).toContain("DALLAS_EYE_WHITE");
    expect(wallpaperSrc).toContain("eyesAt");
    expect(wallpaperSrc).not.toMatch(/GROK_FACE_SRC|grok-bot-face-tight/);
    expect(wallpaperSrc).not.toMatch(/GROK_HEAD_PATH/);
    expect(wallpaperSrc).not.toMatch(/traceDisc/);
  });
});
