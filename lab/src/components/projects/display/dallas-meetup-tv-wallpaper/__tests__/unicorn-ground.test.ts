import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const groundSrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../unicorn-ground.tsx"),
  "utf8",
);
const wallpaperSrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../dallas-meetup-tv-wallpaper.tsx"),
  "utf8",
);

describe("unicorn ground embed", () => {
  it("pins the published Unicorn project and SDK 2.2.13", () => {
    expect(groundSrc).toContain('UNICORN_PROJECT_ID = "tpUiHuNcrr2hbUdSbHSq"');
    expect(groundSrc).toContain('UNICORN_SDK_VERSION = "2.2.13"');
    expect(groundSrc).toContain("unicornstudio.js@v${UNICORN_SDK_VERSION}");
    expect(groundSrc).toContain("UNICORN_STAGE_W = 1920");
    expect(groundSrc).toContain("UNICORN_STAGE_H = 1080");
    expect(groundSrc).toContain("UNICORN_DPI = 2");
    expect(groundSrc).toContain("UNICORN_FPS = 60");
  });

  it("embeds production Unicorn at full-bleed 1920×1080", () => {
    expect(groundSrc).toContain("projectId={UNICORN_PROJECT_ID}");
    expect(groundSrc).toContain("production");
    expect(groundSrc).toContain("lazyLoad={false}");
    expect(groundSrc).toContain("scale={1}");
    expect(groundSrc).toContain("dpi={UNICORN_DPI}");
    expect(groundSrc).toContain("fps={UNICORN_FPS}");
    expect(groundSrc).toContain("paused={paused}");
    expect(groundSrc).toContain('from "unicornstudio-react/next"');
  });

  it("does not keep the retired moving-gradient shader on the live path", () => {
    expect(wallpaperSrc).not.toContain("moving-gradient-background");
    expect(wallpaperSrc).toContain("UnicornGround");
    expect(wallpaperSrc).toContain("paused={reducedMotion}");
  });
});
