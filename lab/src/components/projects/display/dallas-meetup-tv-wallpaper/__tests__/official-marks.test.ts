import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  CURSOR_FILL_RULE,
  CURSOR_PATH,
  GROK_FACE_SRC,
  GROK_HEAD_PATH,
} from "../official-marks";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, "../../../../../../public/assets/dallas-meetup-tv-wallpaper");
const wallpaperSrc = readFileSync(join(here, "../dallas-meetup-tv-wallpaper.tsx"), "utf8");
const cubeSvg = readFileSync(join(publicDir, "CUBE_2D_DARK.svg"), "utf8");

describe("official marks", () => {
  it("ships the full Cursor path with the hole subpath and evenodd fill", () => {
    expect(CURSOR_FILL_RULE).toBe("evenodd");
    expect(CURSOR_PATH).toContain("M444.05");
    expect(CURSOR_PATH).toContain("M457.43");
    expect(cubeSvg).toContain("evenodd");
    expect(cubeSvg).toContain("M444.05");
    expect(wallpaperSrc).toContain("CURSOR_FILL_RULE");
    expect(wallpaperSrc).not.toMatch(/"nonzero"/);
  });

  it("ships the official Grok PNG and clips ribbons to the organic head, not a disc", () => {
    expect(existsSync(join(publicDir, "grok-bot-face-tight.png"))).toBe(true);
    expect(GROK_FACE_SRC).toContain("grok-bot-face-tight.png");
    expect(GROK_HEAD_PATH.startsWith("M ")).toBe(true);
    expect(wallpaperSrc).toContain("GROK_FACE_SRC");
    expect(wallpaperSrc).toContain("GROK_HEAD_PATH");
    expect(wallpaperSrc).toContain("drawImage");
    expect(wallpaperSrc).not.toMatch(/arc\(0, 0, radius/);
  });
});
