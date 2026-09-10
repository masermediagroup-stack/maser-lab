import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const shaderSrc = readFileSync(join(here, "../code-ground.wgsl"), "utf8");
const startSrc = readFileSync(join(here, "../start-code-ground.ts"), "utf8");
const wallpaperSrc = readFileSync(join(here, "../dallas-meetup-tv-wallpaper.tsx"), "utf8");

describe("vgpu code ground", () => {
  it("is a B/W circle-glyph field with no Unicorn SDK", () => {
    expect(shaderSrc).toContain("fn circleGlyph");
    expect(shaderSrc).toContain('from "@vgpu/wgsl-std/hash"');
    expect(shaderSrc).toContain("vec3f(g)");
    expect(shaderSrc).not.toMatch(/blue|0\.062745|0\.643137|#1084FE/i);
    expect(startSrc).toContain('from "vgpu"');
    expect(startSrc).toContain("CODE_GROUND_DPR");
    expect(startSrc).toContain("[1.5, 2]");
    expect(wallpaperSrc).toContain("startCodeGround");
    expect(wallpaperSrc).not.toContain("unicornstudio");
    expect(wallpaperSrc).not.toContain("UnicornGround");
    expect(wallpaperSrc).not.toContain("MovingGradientBackground");
  });

  it("freezes on reduced motion and falls back without WebGPU", () => {
    expect(startSrc).toContain("pausedRef.current");
    expect(startSrc).toContain("paintFallback");
    expect(startSrc).toContain("alphaMode: \"opaque\"");
  });

  it("does not invent extra neo glyph shapes", () => {
    expect(shaderSrc).not.toMatch(/hexagon|squareGlyph|triangleGlyph|diamond/i);
    expect(shaderSrc).toContain("circleGlyph");
  });
});
