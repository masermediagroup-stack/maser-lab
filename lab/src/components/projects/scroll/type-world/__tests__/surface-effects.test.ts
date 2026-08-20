import { describe, expect, it } from "vitest";
import { assembleTypeWorldFragment } from "../shaders/assemble";
import { SURFACE_EFFECT_IDS } from "../shaders/registry";
import { levaControlValue, withLevaFolderPaths } from "../levaSurface";
import { activeSurfaceEffect, TYPE_WORLD_SURFACE_DEFAULTS } from "../surface";

describe("assembleTypeWorldFragment", () => {
  it("keeps typography compositor and omits effect math for none", () => {
    const src = assembleTypeWorldFragment("none");
    expect(src).toContain("void twCompose");
    expect(src).toContain("struct EffectResult");
    expect(src).toContain("fx.mask = 0.0");
    expect(src).not.toContain("twEffect(");
    expect(src).not.toContain("twPerlin3");
    expect(src).not.toContain("twWorley");
    expect(src).not.toContain("twBallShape");
  });

  it("injects only the active effect", () => {
    const orbs = assembleTypeWorldFragment("orbs");
    expect(orbs).toContain("uOrbs[");
    expect(orbs).not.toContain("twPerlin3");
    expect(orbs).not.toContain("twWorley");

    const metaballs = assembleTypeWorldFragment("metaballs");
    expect(metaballs).toContain("twBallShape");
    expect(metaballs).toContain("twFibonacciDir");
    expect(metaballs).toContain("asin(clamp(chord");
    expect(metaballs).toContain("pow(1.0 - r, 1.5)");
    expect(metaballs).not.toContain("uOrbs[i]");

    const waves = assembleTypeWorldFragment("waves");
    expect(waves).toContain("dot(p, axis)");
    expect(waves).not.toContain("zigzag");

    const voronoi = assembleTypeWorldFragment("voronoi");
    expect(voronoi).toContain("twWorley");
    expect(voronoi).toContain("sphereDir");

    const perlin = assembleTypeWorldFragment("perlin");
    expect(perlin).toContain("twPerlin3");
    expect(perlin).toContain("normalize(sphereDir)");
  });

  it("assembles every V1 effect id", () => {
    for (const id of SURFACE_EFFECT_IDS) {
      const src = assembleTypeWorldFragment(id);
      expect(src).toContain("varying vec3 vSphereDir");
      expect(src).toContain("twCompose");
      expect(src).toContain("colorspace_fragment");
    }
  });
});

describe("levaControlValue", () => {
  it("reads folder-prefixed keys used by Leva get()", () => {
    const store: Record<string, unknown> = {
      "Surface Effect.surfaceEnabled": true,
      "Surface Effect.surfaceType": "metaballs",
    };
    const get = (key: string) => store[key];
    expect(levaControlValue(get, "surfaceEnabled")).toBe(true);
    expect(levaControlValue(get, "surfaceType")).toBe("metaballs");
  });

  it("does not treat missing folder keys as disabled", () => {
    const get = (key: string) =>
      key === "surfaceEnabled" ? true : key === "surfaceType" ? "waves" : undefined;
    expect(levaControlValue(get, "surfaceEnabled")).toBe(true);
    expect(levaControlValue(get, "surfaceType")).toBe("waves");
  });
});

describe("withLevaFolderPaths", () => {
  it("dual-writes Surface Effect nested keys", () => {
    const patch = withLevaFolderPaths({
      mbDensity: 9,
      surfaceType: "metaballs",
      theme: "dark",
    });
    expect(patch["Surface Effect.mbDensity"]).toBe(9);
    expect(patch["Surface Effect.surfaceType"]).toBe("metaballs");
    expect(patch["Appearance.theme"]).toBe("dark");
    expect(patch.mbDensity).toBe(9);
  });
});

describe("activeSurfaceEffect", () => {
  it("collapses disabled or none to the none shader", () => {
    expect(
      activeSurfaceEffect({ ...TYPE_WORLD_SURFACE_DEFAULTS, enabled: false }, true),
    ).toBe("none");
    expect(
      activeSurfaceEffect({ ...TYPE_WORLD_SURFACE_DEFAULTS, type: "none" }, true),
    ).toBe("none");
    expect(
      activeSurfaceEffect({ ...TYPE_WORLD_SURFACE_DEFAULTS, type: "orbs" }, false),
    ).toBe("none");
    expect(
      activeSurfaceEffect({ ...TYPE_WORLD_SURFACE_DEFAULTS, type: "metaballs" }, false),
    ).toBe("metaballs");
  });
});
