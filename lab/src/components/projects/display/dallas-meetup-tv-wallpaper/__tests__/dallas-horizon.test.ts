import { describe, expect, it } from "vitest";
import {
  HORIZON_SRC,
  ditherHorizonImageData,
  isFoliagePixel,
  isSkyPixel,
} from "../dallas-horizon";
import { DALLAS_INK } from "../grok-cycle";

function pixel(
  data: Uint8ClampedArray,
  width: number,
  x: number,
  y: number,
): [number, number, number, number] {
  const i = (y * width + x) * 4;
  return [data[i]!, data[i + 1]!, data[i + 2]!, data[i + 3]!];
}

describe("Trammell Crow horizon source", () => {
  it("points at the CC0 photograph, not Noun Project or the teal illustration", () => {
    expect(HORIZON_SRC).toBe("/images/dallas-trammell-crow.png");
    expect(HORIZON_SRC).not.toMatch(/noun|illustration|3583788/i);
  });
});

describe("skyline paper/ink dither", () => {
  it("drops blue sky and foliage, stamps dark towers as ink", () => {
    expect(isSkyPixel(120, 170, 230)).toBe(true);
    expect(isFoliagePixel(70, 160, 60)).toBe(true);
    expect(isSkyPixel(70, 72, 80)).toBe(false);

    const width = 32;
    const height = 32;
    const data = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = (y * width + x) * 4;
        if (y < 6) {
          data[i] = 130;
          data[i + 1] = 175;
          data[i + 2] = 235;
        } else if (x > 20 && y > 22) {
          data[i] = 60;
          data[i + 1] = 170;
          data[i + 2] = 55;
        } else {
          data[i] = 55;
          data[i + 1] = 58;
          data[i + 2] = 62;
        }
        data[i + 3] = 255;
      }
    }

    ditherHorizonImageData({ data, width, height }, 0.18);

    const sky = pixel(data, width, 4, 1);
    expect(sky[3]).toBe(0);

    const foliage = pixel(data, width, 28, 28);
    expect(foliage[3]).toBe(0);

    let inkHits = 0;
    for (let y = 12; y < 22; y += 1) {
      for (let x = 4; x < 16; x += 1) {
        const [, , , a] = pixel(data, width, x, y);
        if (a === 255) {
          inkHits += 1;
          const [r, g, b] = pixel(data, width, x, y);
          expect(r).toBe(0x11);
          expect(g).toBe(0x11);
          expect(b).toBe(0x11);
        }
      }
    }
    expect(inkHits).toBeGreaterThan(20);
    expect(DALLAS_INK).toBe("#111111");
  });
});
