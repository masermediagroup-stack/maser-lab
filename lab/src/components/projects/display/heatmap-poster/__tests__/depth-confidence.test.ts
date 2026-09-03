import { describe, expect, it } from "vitest";
import { DEPTH_VARIANCE_MIN } from "../constants";
import { depthFieldVariance, isDepthFieldConfident } from "../depth-confidence";
import { readStatusAfterDepth } from "../read-status";
import { HEATMAP_COPY } from "../copy";

function field(fill: (i: number, w: number, h: number) => number, w = 64, h = 64): Float32Array {
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      out[y * w + x] = fill(y * w + x, w, h);
    }
  }
  return out;
}

describe("depth field variance gate", () => {
  it("keeps a photo-like subject/background split", () => {
    const photo = field((_, w, h) => {
      const x = _ % w;
      const y = Math.floor(_ / w);
      const cx = w * 0.5;
      const cy = h * 0.42;
      const inside = (x - cx) ** 2 / (w * 0.18) ** 2 + (y - cy) ** 2 / (h * 0.28) ** 2 < 1;
      return inside ? 2.1 : 7.4;
    });
    const v = depthFieldVariance(photo);
    console.info("[heatmap] photo variance", v);
    expect(v).toBeGreaterThan(DEPTH_VARIANCE_MIN);
    expect(isDepthFieldConfident(photo)).toBe(true);
  });

  it("discards a flat logo field", () => {
    const logo = field((i) => 4 + ((i % 9) - 4) * 0.003);
    const v = depthFieldVariance(logo);
    console.info("[heatmap] logo variance", v);
    expect(v).toBeLessThan(DEPTH_VARIANCE_MIN);
    expect(isDepthFieldConfident(logo)).toBe(false);
  });

  it("discards a line drawing (sparse strokes on a plane)", () => {
    const lines = field((_, w) => {
      const x = _ % w;
      const y = Math.floor(_ / w);
      const stroke = y === 20 || x === 32 || y === x;
      return stroke ? 4.12 : 4.0;
    });
    const v = depthFieldVariance(lines);
    console.info("[heatmap] lines variance", v);
    expect(v).toBeLessThan(DEPTH_VARIANCE_MIN);
    expect(isDepthFieldConfident(lines)).toBe(false);
  });
});

describe("Reading the image. always resolves", () => {
  it("goes silent on unavailable and discarded", () => {
    expect(readStatusAfterDepth("unavailable")).toBe("idle");
    expect(readStatusAfterDepth("discarded")).toBe("idle");
    expect(readStatusAfterDepth("ok")).toBe("idle");
  });

  it("uses the rough-read line only on model error", () => {
    expect(readStatusAfterDepth("error")).toBe("rough-read");
    expect(HEATMAP_COPY.roughRead).toBe(
      "Rough read. Depth is off on this browser.",
    );
    expect(HEATMAP_COPY.reading).toBe("Reading the image.");
  });
});
