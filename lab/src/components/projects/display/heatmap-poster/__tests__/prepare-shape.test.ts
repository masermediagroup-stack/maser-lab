import { describe, expect, it } from "vitest";
import { applyWave, heatFromPaperPack } from "../field";
import {
  classifyImageKind,
  silhouetteLogo,
  silhouettePhoto,
} from "../prepare-shape";

function fillRgba(
  w: number,
  h: number,
  pixel: (x: number, y: number) => [number, number, number, number],
): { data: Uint8ClampedArray; width: number; height: number } {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4;
      const [r, g, b, a] = pixel(x, y);
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = a;
    }
  }
  return { data, width: w, height: h };
}

describe("heatmap field pack", () => {
  it("treats a few-color cutout as a logo", () => {
    const image = fillRgba(24, 24, (x, y) => {
      const ink = x > 6 && x < 18 && y > 6 && y < 18;
      return ink ? [12, 12, 12, 255] : [255, 255, 255, 0];
    });
    expect(classifyImageKind(image)).toBe("logo");
    const sil = silhouetteLogo(image);
    const cx = (12 * 24 + 12) * 4;
    const edge = (0 * 24 + 0) * 4;
    expect(sil.data[cx]).toBe(0);
    expect(sil.data[edge]).toBe(255);
  });

  it("inks a photo blob after a white-border flood, not the JPEG texture", () => {
    const image = fillRgba(32, 32, (x, y) => {
      const border = x === 0 || y === 0 || x === 31 || y === 31;
      const inside = (x - 16) ** 2 + (y - 16) ** 2 < 8 ** 2;
      if (border) return [248, 250, 252, 255];
      if (inside) {
        const p = y * 32 + x;
        return [(p * 3) % 220, (p * 5) % 200, (p * 7) % 180, 255];
      }
      return [240 + (x % 4), 242 + (y % 3), 245, 255];
    });
    expect(classifyImageKind(image)).toBe("photo");
    const sil = silhouettePhoto(image);
    const center = (16 * 32 + 16) * 4;
    const rim = (1 * 32 + 1) * 4;
    expect(sil.data[center]).toBe(0);
    expect(sil.data[rim]).toBe(255);
    expect(sil.data[center + 1]).toBe(0);
  });

  it("keeps white paper at heat 0 (Ground) and ink interior hot", () => {
    expect(heatFromPaperPack(1, 1, 1)).toBeCloseTo(0, 5);
    const ink = heatFromPaperPack(0, 0.4, 0.2);
    expect(ink).toBeGreaterThan(0.3);
  });

  it("does not lift Ground when the wave band peaks", () => {
    expect(applyWave(0, 1)).toBe(0);
    expect(applyWave(0.5, 1)).toBeGreaterThan(0.4);
  });
});
