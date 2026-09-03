import { describe, expect, it } from "vitest";
import {
  CENTRE_TIEBREAK,
  FRAME_CONTACT_MAX,
  FRAME_CONTACT_REFUSAL,
  NEAR_BAND_THIN_COMPACTNESS,
  NEAR_FIELD_BAND_START,
} from "../constants";
import {
  applyNearFieldMass,
  compactness,
  connectedComponents,
  pickWinner,
  type BlobStats,
} from "../subject-mass";

function fillRect(
  binary: Uint8Array,
  w: number,
  h: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
) {
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (x >= 0 && y >= 0 && x < w && y < h) binary[y * w + x] = 1;
    }
  }
}

function fillDisk(binary: Uint8Array, w: number, h: number, cx: number, cy: number, r: number) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r) binary[y * w + x] = 1;
    }
  }
}

describe("compactness 4πA/P²", () => {
  it("is near 1 for a filled disk and near 0 for a long thin strap", () => {
    const w = 80;
    const h = 80;
    const disk = new Uint8Array(w * h);
    fillDisk(disk, w, h, 40, 40, 18);
    const strap = new Uint8Array(w * h);
    fillRect(strap, w, h, 10, 8, 12, 72);

    const d = connectedComponents(disk, w, h).blobs[0]!;
    const s = connectedComponents(strap, w, h).blobs[0]!;
    expect(d.compactness).toBeGreaterThan(0.55);
    expect(s.compactness).toBeLessThan(0.2);
    expect(d.score).toBeGreaterThan(s.score);
    expect(compactness(d.area, d.perimeter)).toBeCloseTo(d.compactness, 10);
  });
});

describe("frame-contact 0.40 vs 0.25 refusal", () => {
  it("keeps a bottom-kiss body at 0.40 and would drop it at 0.25", () => {
    const w = 90;
    const h = 160;
    const binary = new Uint8Array(w * h);
    // Body fills the bottom of 9:16, kisses the bottom edge, not the sides.
    // Wide enough that contact sits on ~0.25–0.30 — the 0.25 refusal case.
    fillRect(binary, w, h, 6, 100, 84, h);
    const body = connectedComponents(binary, w, h).blobs[0]!;
    expect(body.frameContact).toBeGreaterThan(0.2);
    expect(body.frameContact).toBeLessThan(FRAME_CONTACT_MAX);
    expect(body.frameContact).toBeGreaterThanOrEqual(FRAME_CONTACT_REFUSAL);
    const kept = pickWinner([body], { dropFrameContact: true, frameContactMax: FRAME_CONTACT_MAX });
    expect(kept.winner?.label).toBe(body.label);
    expect(kept.fallbackFired).toBe(false);
    const refused = pickWinner([body], {
      dropFrameContact: true,
      frameContactMax: FRAME_CONTACT_REFUSAL,
    });
    expect(refused.winner?.label).toBe(body.label);
    expect(refused.fallbackFired).toBe(true);
  });

  it("drops a ceiling that eats two sides, without a which-side heuristic", () => {
    const w = 90;
    const h = 160;
    const binary = new Uint8Array(w * h);
    fillRect(binary, w, h, 0, 0, w, 36);
    const ceiling = connectedComponents(binary, w, h).blobs[0]!;
    expect(ceiling.frameContact).toBeGreaterThan(FRAME_CONTACT_MAX);
    const picked = pickWinner([ceiling], {
      dropFrameContact: true,
      frameContactMax: FRAME_CONTACT_MAX,
    });
    expect(picked.fallbackFired).toBe(true);
  });
});

describe("centre-bias is a tiebreak only", () => {
  it("prefers the nearer-centre blob when scores are within 15%", () => {
    const a: BlobStats = {
      label: 1,
      area: 100,
      perimeter: 40,
      frameEdges: 0,
      frameContact: 0,
      compactness: 1,
      score: 100,
      centroid: { cx: 0.15, cy: 0.15 },
    };
    const b: BlobStats = {
      label: 2,
      area: 92,
      perimeter: 40,
      frameEdges: 0,
      frameContact: 0,
      compactness: 1,
      score: 92,
      centroid: { cx: 0.5, cy: 0.5 },
    };
    expect((a.score - b.score) / a.score).toBeLessThanOrEqual(CENTRE_TIEBREAK);
    const picked = pickWinner([a, b]);
    expect(picked.winner?.label).toBe(2);
  });

  it("does not use centre as a prior when one mass is clearly larger", () => {
    const a: BlobStats = {
      label: 1,
      area: 200,
      perimeter: 50,
      frameEdges: 0,
      frameContact: 0,
      compactness: 1,
      score: 200,
      centroid: { cx: 0.2, cy: 0.8 },
    };
    const b: BlobStats = {
      label: 2,
      area: 80,
      perimeter: 40,
      frameEdges: 0,
      frameContact: 0,
      compactness: 1,
      score: 80,
      centroid: { cx: 0.5, cy: 0.5 },
    };
    const picked = pickWinner([a, b]);
    expect(picked.winner?.label).toBe(1);
  });
});

describe("near-field band widening", () => {
  it("starts at 30% and does not crown a thin-only band", () => {
    expect(NEAR_FIELD_BAND_START).toBe(0.3);
    const w = 64;
    const h = 64;
    const depth = new Float32Array(w * h);
    // Far field
    depth.fill(0.1);
    // Compact torso in the mid-near band (below the first 30% cut of 0.70)
    for (let y = 24; y < 48; y++) {
      for (let x = 20; x < 44; x++) {
        depth[y * w + x] = 0.62;
      }
    }
    // Thin near strap in the nearest 30%
    for (let y = 4; y < 60; y++) {
      depth[y * w + 8] = 0.95;
      depth[y * w + 9] = 0.95;
    }
    const result = applyNearFieldMass(depth, w, h);
    expect(result.crowned).toBe(true);
    expect(result.report.winner).not.toBeNull();
    expect(result.report.winner!.compactness).toBeGreaterThanOrEqual(NEAR_BAND_THIN_COMPACTNESS);
    expect(result.report.path).not.toBe("near-band-0.30");
    expect(result.report.band).toBeGreaterThan(NEAR_FIELD_BAND_START);
  });

  it("falls through to luma when every band is thin", () => {
    const w = 48;
    const h = 48;
    const depth = new Float32Array(w * h);
    depth.fill(0.05);
    for (let y = 2; y < 46; y++) {
      depth[y * w + 24] = 0.9;
    }
    const result = applyNearFieldMass(depth, w, h);
    expect(result.crowned).toBe(false);
    expect(result.report.path).toBe("luma-fallback");
  });
});
