import { describe, expect, it } from "vitest";
import { layoutTriangleAnchors, triangularRowCount } from "../anchors";
import { generateMovementCycle } from "../choreography";
import { applyCycle, occupancyValid } from "../permutation";
import { createCyclePrng, createPrng } from "../prng";
import { generateBezierPath, sampleCubic } from "../path";

describe("agent-swarm engine", () => {
  it("lays out a 10-node 1/2/3/4 triangle centered on the origin", () => {
    const anchors = layoutTriangleAnchors({
      count: 10,
      horizontalSpacing: 64,
      verticalSpacing: 55.424,
    });
    expect(anchors).toHaveLength(10);
    expect(triangularRowCount(10)).toBe(4);
    expect(anchors.filter((a) => a.row === 0)).toHaveLength(1);
    expect(anchors.filter((a) => a.row === 1)).toHaveLength(2);
    expect(anchors.filter((a) => a.row === 2)).toHaveLength(3);
    expect(anchors.filter((a) => a.row === 3)).toHaveLength(4);
    const minY = Math.min(...anchors.map((a) => a.y));
    const maxY = Math.max(...anchors.map((a) => a.y));
    const minX = Math.min(...anchors.map((a) => a.x));
    const maxX = Math.max(...anchors.map((a) => a.x));
    expect((minX + maxX) / 2).toBeCloseTo(0, 5);
    expect((minY + maxY) / 2).toBeCloseTo(0, 5);
  });

  it("replays the same PRNG sequence for a seed", () => {
    const a = createPrng("18427");
    const b = createPrng("18427");
    const seqA = [a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
    expect(createPrng("18428")()).not.toEqual(seqA[0]);
  });

  it("keeps occupancy a permutation after swap and shuffle cycles", () => {
    const anchors = layoutTriangleAnchors({
      count: 10,
      horizontalSpacing: 60,
      verticalSpacing: 52,
    });
    let occupancy = anchors.map((_, i) => i);
    for (let cycle = 0; cycle < 40; cycle++) {
      const swap = generateMovementCycle({
        occupancy,
        anchors,
        mode: "swap",
        rng: createCyclePrng("18427", cycle),
        movementDistance: 0.3,
        activePercentage: 0.4,
        curvature: 0.3,
        stagger: 0.16,
        travelDuration: 800,
        randomness: 0.7,
      });
      expect(occupancyValid(swap.occupancy)).toBe(true);
      occupancy = swap.occupancy;
    }
    occupancy = anchors.map((_, i) => i);
    for (let cycle = 0; cycle < 20; cycle++) {
      const shuffle = generateMovementCycle({
        occupancy,
        anchors,
        mode: "shuffle",
        rng: createCyclePrng("99", cycle),
        movementDistance: 0.5,
        activePercentage: 0.7,
        curvature: 0.3,
        stagger: 0.1,
        travelDuration: 700,
        randomness: 0.8,
      });
      expect(occupancyValid(shuffle.occupancy)).toBe(true);
      occupancy = shuffle.occupancy;
    }
  });

  it("applyCycle keeps a bijection of agents to anchors", () => {
    const occupancy = [0, 1, 2, 3, 4];
    const swapped = applyCycle(occupancy, [1, 3]);
    expect(occupancyValid(swapped)).toBe(true);
    expect(swapped).toEqual([0, 3, 2, 1, 4]);
    const triple = applyCycle(occupancy, [0, 2, 4]);
    expect(occupancyValid(triple)).toBe(true);
    expect(triple).toEqual([2, 1, 4, 3, 0]);
  });

  it("bows reversed swap paths to opposite sides of the chord", () => {
    const left = generateBezierPath({ x: 0, y: 0 }, { x: 10, y: 0 }, 0.4, 1);
    const right = generateBezierPath({ x: 10, y: 0 }, { x: 0, y: 0 }, 0.4, 1);
    const midL = sampleCubic(left, 0.5);
    const midR = sampleCubic(right, 0.5);
    expect(midL.y > 0).toBe(true);
    expect(midR.y < 0).toBe(true);
  });
});
