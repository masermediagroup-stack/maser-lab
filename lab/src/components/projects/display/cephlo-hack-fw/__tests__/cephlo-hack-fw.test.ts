import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { clampSilkLook, DEFAULT_SILK_LOOK, SILK_LOOK_RANGES } from "../silk-look";

const here = dirname(fileURLToPath(import.meta.url));
const demoSrc = readFileSync(join(here, "../cephlo-hack-fw-demo.tsx"), "utf8");
const logoSrc = readFileSync(join(here, "../logo.ts"), "utf8");
const shaderSrc = readFileSync(join(here, "../start-silk-webgl.ts"), "utf8");

describe("Cephlo Hack FW", () => {
  it("puts Present first and headline / up next second", () => {
    const present = demoSrc.search(/\bPresent\b/);
    const headline = demoSrc.indexOf('id="cephlo-headline"');
    const upNext = demoSrc.indexOf('id="cephlo-up-next"');
    const speed = demoSrc.indexOf('id="cephlo-silk-speed"');
    expect(present).toBeGreaterThan(-1);
    expect(present).toBeLessThan(headline);
    expect(headline).toBeLessThan(upNext);
    expect(upNext).toBeLessThan(speed);
  });

  it("places the dither slider directly above the noise slider", () => {
    const dither = demoSrc.indexOf('id="cephlo-silk-dither"');
    const noise = demoSrc.indexOf('id="cephlo-silk-noise"');
    expect(dither).toBeGreaterThan(-1);
    expect(noise).toBeGreaterThan(dither);
    const between = demoSrc.slice(dither + 'id="cephlo-silk-dither"'.length, noise);
    expect(between).not.toContain('id="cephlo-silk-');
  });

  it("uses the Cephlo lockup and the reference blue ramp", () => {
    expect(logoSrc).toContain("/assets/cephlo-hack-fw/cephlo-lockup.png");
    expect(shaderSrc).toContain("uniform float uDither");
    expect(shaderSrc).toContain("0.2000, 0.4118, 1.0");
    expect(shaderSrc).toContain("0.1647, 0.0627, 0.8392");
    expect(shaderSrc).toContain("applyDither");
  });

  it("clamps dither onto the slider range", () => {
    expect(DEFAULT_SILK_LOOK.dither).toBeGreaterThan(0);
    expect(SILK_LOOK_RANGES.dither).toEqual({ min: 0, max: 1, step: 0.05 });
    expect(clampSilkLook({ ...DEFAULT_SILK_LOOK, dither: 4 }).dither).toBe(1);
    expect(clampSilkLook({ ...DEFAULT_SILK_LOOK, dither: -1 }).dither).toBe(0);
  });
});
