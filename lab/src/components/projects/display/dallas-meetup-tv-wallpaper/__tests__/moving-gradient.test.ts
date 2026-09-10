import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const shaderSrc = readFileSync(join(here, "../moving-gradient.wgsl"), "utf8");
const startSrc = readFileSync(join(here, "../start-moving-gradient.ts"), "utf8");
const webglSrc = readFileSync(join(here, "../start-silk-webgl.ts"), "utf8");
const configSrc = readFileSync(join(here, "../moving-gradient-config.ts"), "utf8");
const wallpaperSrc = readFileSync(
  join(here, "../dallas-meetup-tv-wallpaper.tsx"),
  "utf8",
);
const tokensSrc = readFileSync(join(here, "../tokens.css"), "utf8");

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
    expect(startSrc).toContain("GRADIENT_MOTION");
    expect(startSrc).toContain("autoResize: false");
    expect(startSrc).toContain("GRADIENT_STAGE_W");
    expect(wallpaperSrc).toContain("startMovingGradient");
    expect(wallpaperSrc).not.toContain("unicornstudio");
    expect(wallpaperSrc).not.toContain("UnicornGround");
    expect(wallpaperSrc).not.toContain("startCodeGround");
    expect(wallpaperSrc).not.toContain("MovingGradientBackground");
    expect(wallpaperSrc).not.toMatch(/from ["']next\/image["']/);
  });

  it("pins the GPU buffer to 1920×1080 and never stretches the CSS stage", () => {
    expect(configSrc).toContain("export const GRADIENT_STAGE_W = 1920");
    expect(configSrc).toContain("export const GRADIENT_STAGE_H = 1080");
    expect(configSrc).toContain("export const GRADIENT_DPR = 1");
    expect(startSrc).toContain("size: [GRADIENT_STAGE_W, GRADIENT_STAGE_H]");
    expect(tokensSrc).toContain("width: 1920px");
    expect(tokensSrc).toContain("height: 1080px");
    expect(tokensSrc).toContain("--dallas-fit-scale");
    expect(tokensSrc).toContain(".dallas-demo__fit > .dallas-wallpaper-stack");
    expect(tokensSrc).not.toContain("overflow: auto");
  });

  it("keeps a live shader when WebGPU is missing", () => {
    expect(startSrc).toContain("pausedRef.current");
    expect(startSrc).toContain("startSilkWebgl");
    expect(startSrc).toContain("startSilkCpu");
    expect(startSrc).toContain('alphaMode: "opaque"');
    expect(startSrc).not.toContain("createRadialGradient");
    expect(startSrc).not.toContain("paintFallback");
    expect(webglSrc).toContain("uTime");
    expect(webglSrc).toContain("requestAnimationFrame");
    expect(webglSrc).toContain("snoise");
    expect(webglSrc).toContain("vec2 warp(");
    expect(webglSrc).not.toContain("circleGlyph");
  });

  it("does not invent neo glyph shapes or a watermark layer", () => {
    expect(shaderSrc).not.toMatch(/hexagon|squareGlyph|triangleGlyph|diamond|circleGlyph/i);
    expect(shaderSrc).not.toMatch(/watermark|pointer|uMouse/i);
    expect(startSrc).not.toMatch(/Unicorn/i);
    expect(webglSrc).not.toMatch(/Unicorn/i);
  });
});
