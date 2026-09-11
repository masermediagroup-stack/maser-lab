import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const startSrc = readFileSync(join(here, "../start-moving-gradient.ts"), "utf8");
const webglSrc = readFileSync(join(here, "../start-silk-webgl.ts"), "utf8");
const configSrc = readFileSync(join(here, "../moving-gradient-config.ts"), "utf8");
const wallpaperSrc = readFileSync(
  join(here, "../dallas-meetup-tv-wallpaper.tsx"),
  "utf8",
);
const demoSrc = readFileSync(
  join(here, "../dallas-meetup-tv-wallpaper-demo.tsx"),
  "utf8",
);
const tokensSrc = readFileSync(join(here, "../tokens.css"), "utf8");

describe("WebGL2 silk moving gradient", () => {
  it("is a greyscale domain-warped field with no Unicorn SDK", () => {
    expect(webglSrc).toContain("vec2 warp(");
    expect(webglSrc).toContain("float fbm(");
    expect(webglSrc).toContain("uTime");
    expect(webglSrc).toContain("uScale");
    expect(webglSrc).toContain("uWarp");
    expect(webglSrc).toContain("uGrey");
    expect(webglSrc).toContain("uWhite");
    expect(webglSrc).toContain("uRidge");
    expect(webglSrc).toContain("snoise");
    expect(webglSrc).not.toMatch(/blue|0\.062745|0\.643137|#1084FE/i);
    expect(webglSrc).not.toContain("circleGlyph");
    expect(webglSrc).not.toMatch(/Unicorn/i);
    expect(startSrc).not.toContain('from "vgpu"');
    expect(startSrc).not.toContain("await init");
    expect(startSrc).toContain("startSilkWebgl");
    expect(startSrc).toContain("startSilkCpu");
    expect(startSrc).toContain("lookRef");
    expect(wallpaperSrc).toContain("startMovingGradient");
    expect(wallpaperSrc).toContain("lookRef");
    expect(wallpaperSrc).toMatch(/useEffect\(\(\) => \{[\s\S]*startMovingGradient[\s\S]*\}, \[\]\)/);
    expect(wallpaperSrc).not.toContain("unicornstudio");
    expect(wallpaperSrc).not.toContain("UnicornGround");
    expect(wallpaperSrc).not.toContain("startCodeGround");
    expect(wallpaperSrc).not.toContain("MovingGradientBackground");
    expect(wallpaperSrc).not.toMatch(/from ["']next\/image["']/);
  });

  it("pins the GPU buffer to 1920×1080 and never stretches the CSS stage", () => {
    expect(configSrc).toContain("export const GRADIENT_STAGE_W = 1920");
    expect(configSrc).toContain("export const GRADIENT_STAGE_H = 1080");
    expect(webglSrc).toContain("canvas.width = GRADIENT_STAGE_W");
    expect(webglSrc).toContain("canvas.height = GRADIENT_STAGE_H");
    expect(tokensSrc).toContain("width: 1920px");
    expect(tokensSrc).toContain("height: 1080px");
    expect(tokensSrc).toContain("--dallas-fit-scale");
    expect(tokensSrc).toContain(".dallas-demo__fit > .dallas-wallpaper-stack");
    expect(tokensSrc).not.toContain("overflow: auto");
  });

  it("starts WebGL2 immediately and never uses a static wash", () => {
    expect(startSrc).toContain("pausedRef.current");
    expect(startSrc).toMatch(
      /startSilkWebgl\(canvas, pausedRef, lookRef\) \?\?[\s\S]*startSilkCpu\(canvas, pausedRef, lookRef\)/,
    );
    expect(startSrc).not.toContain("createRadialGradient");
    expect(startSrc).not.toContain("paintFallback");
    expect(startSrc).not.toContain("init(");
    expect(webglSrc).toContain("requestAnimationFrame");
    expect(webglSrc).toContain('dataset.dallasGround = "webgl2"');
    expect(webglSrc).not.toContain("loseContext");
  });

  it("does not invent neo glyph shapes or a watermark layer", () => {
    expect(webglSrc).not.toMatch(/hexagon|squareGlyph|triangleGlyph|diamond|circleGlyph/i);
    expect(webglSrc).not.toMatch(/watermark|pointer|uMouse/i);
    expect(startSrc).not.toMatch(/Unicorn/i);
  });

  it("exposes live silk knobs in demo settings without remounting GL", () => {
    expect(demoSrc).toContain('label="Silk ground"');
    expect(demoSrc).toContain("dallas-silk-speed");
    expect(demoSrc).toContain("dallas-silk-grain");
    expect(webglSrc).toContain("uGrain");
    expect(webglSrc).toContain("hash12");
    expect(demoSrc).toContain("silkLook={silkLook}");
    expect(demoSrc).toContain("Reset silk");
    expect(wallpaperSrc).toContain(
      "return startMovingGradient(canvas, pausedRef, lookRef);\n  }, []);",
    );
  });
});
