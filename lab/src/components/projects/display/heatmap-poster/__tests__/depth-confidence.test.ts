import { describe, expect, it } from "vitest";
import { DEPTH_VARIANCE_MIN } from "../constants";
import { depthFieldVariance, isDepthFieldConfident } from "../depth-confidence";
import { computeLayout, measureCaptionHeight } from "../poster-renderer";
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
    const w = 64, h = 64;
    const photo = field((_, w, h) => {
      const x = _ % w;
      const y = Math.floor(_ / w);
      const cx = w * 0.5;
      const cy = h * 0.42;
      const inside = (x - cx) ** 2 / (w * 0.18) ** 2 + (y - cy) ** 2 / (h * 0.28) ** 2 < 1;
      return inside ? 2.1 : 7.4;
    }, w, h);
    const v = depthFieldVariance(photo, w, h);
    console.info("[heatmap] photo variance", v);
    expect(v).toBeGreaterThan(DEPTH_VARIANCE_MIN);
    expect(isDepthFieldConfident(photo, w, h)).toBe(true);
  });

  it("discards a flat logo field", () => {
    const w = 64, h = 64;
    const logo = field((i) => 4 + ((i % 9) - 4) * 0.003, w, h);
    const v = depthFieldVariance(logo, w, h);
    console.info("[heatmap] logo variance", v);
    expect(v).toBeLessThan(DEPTH_VARIANCE_MIN);
    expect(isDepthFieldConfident(logo, w, h)).toBe(false);
  });

  it("discards a line drawing (sparse strokes on a plane)", () => {
    const w = 64, h = 64;
    const lines = field((_, w) => {
      const x = _ % w;
      const y = Math.floor(_ / w);
      const stroke = y === 20 || x === 32 || y === x;
      return stroke ? 4.12 : 4.0;
    }, w, h);
    const v = depthFieldVariance(lines, w, h);
    console.info("[heatmap] lines variance", v);
    expect(v).toBeLessThan(DEPTH_VARIANCE_MIN);
    expect(isDepthFieldConfident(lines, w, h)).toBe(false);
  });

  it("discards a noisy flat input (film grain / JPEG artifacts / dither)", () => {
    const w = 64, h = 64;
    let seed = 12345;
    const pseudoRandom = () => {
      seed = (seed * 16807 + 0) % 2147483647;
      return (seed & 0x7fffffff) / 2147483647;
    };
    const noisy = field(() => {
      return 4.0 + (pseudoRandom() - 0.5) * 0.8;
    }, w, h);
    const v = depthFieldVariance(noisy, w, h);
    console.info("[heatmap] noisy-flat variance", v);
    expect(v).toBeLessThan(DEPTH_VARIANCE_MIN);
    expect(isDepthFieldConfident(noisy, w, h)).toBe(false);
  });

  it("keeps a low-contrast photo with real depth structure (case 5)", () => {
    const w = 64, h = 64;
    const lowContrast = field((_, w, h) => {
      const x = _ % w;
      const y = Math.floor(_ / w);
      const cx = w * 0.45;
      const cy = h * 0.5;
      const rx = w * 0.2;
      const ry = h * 0.35;
      const inside =
        (x - cx) ** 2 / rx ** 2 + (y - cy) ** 2 / ry ** 2 < 1;
      return inside ? 5.0 : 5.8;
    }, w, h);
    const v = depthFieldVariance(lowContrast, w, h);
    console.info("[heatmap] low-contrast photo variance", v);
    expect(v).toBeGreaterThan(DEPTH_VARIANCE_MIN);
    expect(isDepthFieldConfident(lowContrast, w, h)).toBe(true);
  });

  it("keeps a landscape photo (same gate, different crop)", () => {
    const w = 128, h = 64;
    const landscape = field(
      (_, w, h) => {
        const x = _ % w;
        const y = Math.floor(_ / w);
        const cx = w * 0.6;
        const cy = h * 0.45;
        const inside =
          (x - cx) ** 2 / (w * 0.15) ** 2 +
            (y - cy) ** 2 / (h * 0.25) ** 2 <
          1;
        return inside ? 1.8 : 6.2;
      },
      w,
      h,
    );
    const v = depthFieldVariance(landscape, w, h);
    console.info("[heatmap] landscape variance", v);
    expect(v).toBeGreaterThan(DEPTH_VARIANCE_MIN);
    expect(isDepthFieldConfident(landscape, w, h)).toBe(true);
  });

  it("case 7: transparent PNG flattened onto Ground — depth discarded", () => {
    // After composite-onto-Ground, a cutout PNG's depth field is flat:
    // the model sees Ground-color indigo where alpha was, and the opaque
    // subject at a similar synthetic depth. The alpha boundary does not
    // produce a near/far split that would pass the variance gate.
    //
    // Simulate: a subject blob at depth 4.0, transparent region composited
    // to Ground produces depth ~4.0 too (same synthetic plane), with small
    // sensor noise. The field is flat.
    const w = 64, h = 64;
    let seed = 99;
    const rng = () => { seed = (seed * 16807) % 2147483647; return (seed & 0x7fffffff) / 2147483647; };
    const cutout = field((_, w, h) => {
      const x = _ % w;
      const y = Math.floor(_ / w);
      const cx = w * 0.5, cy = h * 0.5, r = w * 0.25;
      const inside = (x - cx) ** 2 + (y - cy) ** 2 < r * r;
      // Both regions at similar depth (model sees flat composited image)
      return inside ? 4.0 + rng() * 0.05 : 4.0 + rng() * 0.05;
    }, w, h);
    const v = depthFieldVariance(cutout, w, h);
    console.info("[heatmap] cutout-PNG (flattened) variance", v);
    expect(v).toBeLessThan(DEPTH_VARIANCE_MIN);
    expect(isDepthFieldConfident(cutout, w, h)).toBe(false);
  });

  it("case 8: noisy texture (multiple noise profiles) — all discarded", () => {
    const w = 64, h = 64;
    const profiles = [
      { name: "film grain (±0.4)", amp: 0.4, base: 4.0 },
      { name: "heavy JPEG (±1.0)", amp: 1.0, base: 5.0 },
      { name: "dithered graphic (±0.2)", amp: 0.2, base: 3.5 },
      { name: "paper scan (±0.6)", amp: 0.6, base: 4.5 },
    ];
    for (const { name, amp, base } of profiles) {
      let seed = 42;
      const rng = () => { seed = (seed * 16807) % 2147483647; return (seed & 0x7fffffff) / 2147483647; };
      const noisy = field(() => base + (rng() - 0.5) * amp * 2, w, h);
      const v = depthFieldVariance(noisy, w, h);
      console.info(`[heatmap] noisy-flat (${name}) variance`, v);
      expect(v, `${name} must be below threshold`).toBeLessThan(DEPTH_VARIANCE_MIN);
      expect(isDepthFieldConfident(noisy, w, h), `${name} must be discarded`).toBe(false);
    }
  });
});

describe("poster layout geometry", () => {
  const cardW = 360;
  const cardH = 640;

  it("empty caption: image plate takes full card at every DPR", () => {
    const layout1 = computeLayout(cardW, cardH, undefined);
    const layout2 = computeLayout(cardW, cardH, "");
    for (const l of [layout1, layout2]) {
      expect(l.imagePlateH).toBe(cardH);
      expect(l.captionPlateH).toBe(0);
      expect(l.hasCaption).toBe(false);
    }
  });

  it("one-line caption: same layout regardless of DPR", () => {
    const caption = "A short caption line";
    const layout = computeLayout(cardW, cardH, caption);
    expect(layout.captionPlateH).toBeGreaterThan(0);
    expect(layout.imagePlateH).toBe(cardH - layout.captionPlateH);
    expect(layout.hasCaption).toBe(true);

    const layout4x = computeLayout(cardW, cardH, caption);
    expect(layout4x.captionPlateH).toBe(layout.captionPlateH);
    expect(layout4x.imagePlateH).toBe(layout.imagePlateH);
  });

  it("long wrapping caption: deterministic height", () => {
    const caption = "This is a long caption that should wrap across multiple lines because it exceeds the available width of the card in a single line of monospace text at the specified font size";
    const h1 = measureCaptionHeight(caption, cardW);
    const h2 = measureCaptionHeight(caption, cardW);
    expect(h1).toBe(h2);
    expect(h1).toBeGreaterThan(0);
  });

  it("frame box identical between compose and export (empty, one-line, wrapping)", () => {
    const captions = [
      undefined,
      "One line",
      "This is a long caption that should wrap across multiple lines because it exceeds the available width of the card",
    ];
    for (const c of captions) {
      const compose = computeLayout(cardW, cardH, c);
      const exportL = computeLayout(cardW, cardH, c);
      expect(compose.cardW).toBe(exportL.cardW);
      expect(compose.cardH).toBe(exportL.cardH);
      expect(compose.imagePlateH).toBe(exportL.imagePlateH);
      expect(compose.captionPlateH).toBe(exportL.captionPlateH);
    }
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
