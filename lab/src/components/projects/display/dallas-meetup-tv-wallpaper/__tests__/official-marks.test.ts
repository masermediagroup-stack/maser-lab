import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CURSOR_FILL_RULE, CURSOR_PATH } from "../official-marks";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, "../../../../../../public/assets/dallas-meetup-tv-wallpaper");
const wallpaperSrc = readFileSync(join(here, "../dallas-meetup-tv-wallpaper.tsx"), "utf8");
const cubeSvg = readFileSync(join(publicDir, "CUBE_2D_DARK.svg"), "utf8");

describe("official Cursor mark", () => {
  it("ships the full Cursor path with the hole subpath and evenodd fill", () => {
    expect(CURSOR_FILL_RULE).toBe("evenodd");
    expect(CURSOR_PATH).toContain("M444.05");
    expect(CURSOR_PATH).toContain("M457.43");
    expect(cubeSvg).toContain("evenodd");
    expect(cubeSvg).toContain("M444.05");
    expect(wallpaperSrc).toContain("CURSOR_FILL_RULE");
    expect(wallpaperSrc).toContain("cursorWhipRad");
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
    expect(wallpaperSrc).not.toMatch(/drawImage/);
    expect(wallpaperSrc).not.toMatch(/GROK_FACE_SRC|grok-bot-face-tight/);
    expect(wallpaperSrc).not.toMatch(/GROK_HEAD_PATH/);
    expect(wallpaperSrc).not.toMatch(/traceDisc/);
  });
});
