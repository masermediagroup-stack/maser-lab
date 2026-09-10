import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const shaderSrc = readFileSync(join(here, "../moving-gradient.wgsl"), "utf8");
const startSrc = readFileSync(join(here, "../start-moving-gradient.ts"), "utf8");
const wallpaperSrc = readFileSync(
  join(here, "../dallas-meetup-tv-wallpaper.tsx"),
  "utf8",
);

describe("vgpu silk moving gradient", () => {
  it("is a greyscale domain-warped field with no Unicorn SDK", () => {
    expect(shaderSrc).toContain("fn warp");
    expect(shaderSrc).toContain("fn fbm");
    expect(shaderSrc).toContain("params.time");
    expect(shaderSrc).toContain('from "@vgpu/wgsl-std/noise/simplex"');
    expect(shaderSrc).toContain("fbmSimplex2d");
    expect(shaderSrc).toContain("vec3f(g)");
    expect(shaderSrc).toContain("WHITE_HINT");
    expect(shaderSrc).not.toMatch(/blue|0\.062745|0\.643137|#1084FE/i);
    expect(shaderSrc).not.toContain("circleGlyph");
    expect(shaderSrc).not.toMatch(/Unicorn/i);
    expect(startSrc).toContain('from "vgpu"');
    expect(startSrc).toContain("GRADIENT_DPR");
    expect(startSrc).toContain("[1.5, 2]");
    expect(startSrc).toContain("GRADIENT_MOTION");
    expect(wallpaperSrc).toContain("startMovingGradient");
    expect(wallpaperSrc).not.toContain("unicornstudio");
    expect(wallpaperSrc).not.toContain("UnicornGround");
    expect(wallpaperSrc).not.toContain("startCodeGround");
    expect(wallpaperSrc).not.toContain("MovingGradientBackground");
  });

  it("freezes on reduced motion and falls back without WebGPU", () => {
    expect(startSrc).toContain("pausedRef.current");
    expect(startSrc).toContain("paintFallback");
    expect(startSrc).toContain('alphaMode: "opaque"');
    expect(startSrc).toContain("createRadialGradient");
    expect(startSrc).not.toContain("circleGlyph");
  });

  it("does not invent neo glyph shapes or a watermark layer", () => {
    expect(shaderSrc).not.toMatch(/hexagon|squareGlyph|triangleGlyph|diamond|circleGlyph/i);
    expect(shaderSrc).not.toMatch(/watermark|pointer|uMouse/i);
    expect(startSrc).not.toMatch(/Unicorn/i);
  });
});
