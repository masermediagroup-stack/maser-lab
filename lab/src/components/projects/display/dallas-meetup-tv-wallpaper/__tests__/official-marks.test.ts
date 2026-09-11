import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  CURSOR_LOCKUP_SRC,
  GROK_LOCKUP_SRC,
  SPACEX_LOCKUP_SRC,
} from "../logo-carousel";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, "../../../../../../public/assets/dallas-meetup-tv-wallpaper");
const wallpaperSrc = readFileSync(join(here, "../dallas-meetup-tv-wallpaper.tsx"), "utf8");

describe("idle wallpaper logo assets", () => {
  it("ships Figma lockup SVGs", () => {
    expect(existsSync(join(publicDir, "grok-bot-lockup.svg"))).toBe(true);
    expect(existsSync(join(publicDir, "spacexai-wordmark-light.svg"))).toBe(true);
    expect(existsSync(join(publicDir, "cursor-lockup-horizontal.svg"))).toBe(true);
  });

  it("keeps SVG aspect so lockups never stretch", () => {
    for (const name of [
      "grok-bot-lockup.svg",
      "spacexai-wordmark-light.svg",
      "cursor-lockup-horizontal.svg",
    ]) {
      const svg = readFileSync(join(publicDir, name), "utf8");
      expect(svg).toContain('preserveAspectRatio="xMidYMid meet"');
      expect(svg).not.toContain('preserveAspectRatio="none"');
    }
  });

  it("wires carousel sources in code", () => {
    expect(GROK_LOCKUP_SRC).toContain("grok-bot-lockup.svg");
    expect(SPACEX_LOCKUP_SRC).toContain("spacexai-wordmark-light.svg");
    expect(CURSOR_LOCKUP_SRC).toContain("cursor-lockup-horizontal.svg");
    expect(wallpaperSrc).toContain("preloadLogoCarousel");
    expect(wallpaperSrc).toContain("GROK_LOCKUP_SRC");
    expect(wallpaperSrc).toContain("CURSOR_LOCKUP_SRC");
    expect(wallpaperSrc).toContain("<img");
    expect(wallpaperSrc).not.toMatch(/from ["']next\/image["']/);
  });
});
