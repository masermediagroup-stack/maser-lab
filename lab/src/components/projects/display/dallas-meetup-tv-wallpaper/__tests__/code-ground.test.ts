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
    expect(shaderSrc).toContain("vec3f(luma)");
    expect(shaderSrc).not.toMatch(/blue|0\.062745|0\.643137|#1084FE/i);
    expect(startSrc).toContain('from "vgpu"');
    expect(startSrc).toContain("CODE_GROUND_DPR");
    expect(startSrc).toContain("[1.5, 2]");
    expect(wallpaperSrc).toContain("startCodeGround");
    expect(wallpaperSrc).not.toContain("unicornstudio");
    expect(wallpaperSrc).not.toContain("UnicornGround");
    expect(wallpaperSrc).not.toContain("MovingGradientBackground");
    expect(wallpaperSrc).not.toContain("tpUiHuNcrr2hbUdSbHSq");
  });

  it("is a dense circular module lattice, not a ramp or vignette", () => {
    expect(shaderSrc).toContain("fn lattice");
    expect(shaderSrc).toContain("fn ring");
    expect(shaderSrc).toContain("gutterEvery");
    expect(shaderSrc).toContain("max(fine, pack)");
    expect(shaderSrc).toContain("18.0");
    expect(shaderSrc).toContain("pulse");
    expect(shaderSrc).not.toContain("length(centered)");
    expect(shaderSrc).not.toContain("uvQuiet");
    expect(shaderSrc).not.toMatch(/PEAK/);
    expect(shaderSrc).not.toMatch(/mix\(0\.38,\s*1\.0/);
    expect(shaderSrc).not.toMatch(/smoothstep\(0\.1,\s*0\.52/);
    expect(startSrc).not.toContain("uvQuiet");
    expect(startSrc).toContain("paintLattice");
    expect(startSrc).toContain("circleGlyph");
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

  it("renders a B/W circular lattice, not a vignette or ramp", async () => {
    let init: typeof import("vgpu/node").init;
    let effect: typeof import("vgpu/node").effect;
    let target: typeof import("vgpu/node").target;
    let resolveShader: typeof import("@vgpu/wgsl/runtime").resolveShader;
    try {
      ({ init, effect, target } = await import("vgpu/node"));
      ({ resolveShader } = await import("@vgpu/wgsl/runtime"));
    } catch {
      return;
    }

    const resolved = await resolveShader({
      entry: join(here, "../code-ground.wgsl"),
    });

    let gpu: Awaited<ReturnType<typeof init>>;
    try {
      gpu = await init();
    } catch {
      return;
    }

    const width = 320;
    const height = 180;
    try {
      const colorTarget = target(gpu, { size: [width, height] });
      const shader = effect(gpu, resolved.wgsl, { set: { params: { time: 2.4 } } });
      shader.draw(colorTarget);
      const pixels = await colorTarget.read();

      let chroma = 0;
      let bright = 0;
      let dark = 0;
      let neighbor = 0;
      let neighborN = 0;
      let centerSum = 0;
      let centerN = 0;
      let cornerSum = 0;
      let cornerN = 0;
      const n = width * height;
      const cx0 = Math.floor(width * 0.35);
      const cx1 = Math.floor(width * 0.65);
      const cy0 = Math.floor(height * 0.35);
      const cy1 = Math.floor(height * 0.65);

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const i = (y * width + x) * 4;
          const r = pixels[i] ?? 0;
          const g = pixels[i + 1] ?? 0;
          const b = pixels[i + 2] ?? 0;
          chroma = Math.max(chroma, Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
          const luma = r;
          if (luma > 140) bright += 1;
          if (luma < 20) dark += 1;
          if (x >= cx0 && x < cx1 && y >= cy0 && y < cy1) {
            centerSum += luma;
            centerN += 1;
          }
          if (
            x < width * 0.12 ||
            x > width * 0.88 ||
            y < height * 0.12 ||
            y > height * 0.88
          ) {
            cornerSum += luma;
            cornerN += 1;
          }
          if (x + 1 < width) {
            neighbor += Math.abs(luma - (pixels[i + 4] ?? 0));
            neighborN += 1;
          }
        }
      }

      const centerMean = centerSum / centerN;
      const cornerMean = cornerSum / cornerN;
      expect(chroma).toBe(0);
      expect(bright / n).toBeGreaterThan(0.15);
      expect(dark / n).toBeGreaterThan(0.15);
      expect(neighbor / neighborN).toBeGreaterThan(12);
      expect(Math.abs(centerMean - cornerMean)).toBeLessThan(12);
    } finally {
      gpu.dispose();
    }
  }, 20_000);
});

