import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const wallpaperSrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../dallas-meetup-tv-wallpaper.tsx"),
  "utf8",
);
const demoSrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../dallas-meetup-tv-wallpaper-demo.tsx"),
  "utf8",
);

describe("skyline killed", () => {
  it("does not import or draw a Dallas horizon on the product or demo", () => {
    expect(wallpaperSrc).not.toMatch(/dallas-horizon|HORIZON_SRC|showSkyline|Noun Project|skyline/i);
    expect(demoSrc).not.toMatch(/showSkyline|Noun Project|skyline/i);
  });
});
