/** Seeded 0..1. Never Math.random. */
function hash(n: number): number {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

export type SparkleWeights = {
  /** 0..~0.32 multiply dip. Occupancy stays 1. */
  dim: number;
  /** 0..1 white flash on glyphs that remain present. */
  flash: number;
};

const SLOTS = 3;

/**
 * Clustered burst twinkle. Glyphs never punch out — intensity only.
 * Burst centers and timing are hashed from slot + generation index.
 */
export function sparkleAt(
  column: number,
  row: number,
  columns: number,
  rows: number,
  timeSec: number,
): SparkleWeights {
  let flash = 0;
  let dim = 0;
  for (let slot = 0; slot < SLOTS; slot++) {
    const period = 1.55 + slot * 0.38;
    const shifted = timeSec + slot * 0.61;
    const generation = Math.floor(shifted / period);
    const u = shifted / period - generation;
    const life = 0.18 + hash(generation * 19.1 + slot * 4.7) * 0.1;
    if (u > life) continue;
    const env = Math.sin((u / life) * Math.PI);
    const cx = hash(generation * 13.7 + slot * 4.1) * columns;
    const cy = hash(generation * 29.3 + slot * 8.7) * rows;
    const radius = 3.4 + hash(generation * 5.9 + slot) * 5.8;
    const dist = Math.hypot(column - cx, row - cy);
    if (dist > radius) continue;
    const fall = 1 - dist / radius;
    const fall2 = fall * fall;
    const member = hash(column * 17.2 + row * 9.4 + generation * 3.1 + slot);
    if (member < 0.22) continue;
    const rate = 18 + hash(generation + slot * 11) * 14;
    const flick =
      0.5 +
      0.5 *
        Math.sin(timeSec * rate + column * 1.7 + row * 2.3 + slot * 0.8);
    const mag = env * fall2;
    flash = Math.max(flash, mag * (0.35 + 0.65 * flick));
    dim = Math.max(dim, mag * (1 - flick) * 0.32);
  }
  return { dim, flash };
}

export function paintSparkleLayer(
  image: ImageData,
  columns: number,
  rows: number,
  timeSec: number,
  mode: "dim" | "flash",
) {
  const data = image.data;
  let i = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const sparkle = sparkleAt(x, y, columns, rows, timeSec);
      if (mode === "dim") {
        const g = Math.round(255 * (1 - sparkle.dim));
        data[i] = g;
        data[i + 1] = g;
        data[i + 2] = g;
        data[i + 3] = 255;
      } else {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = Math.round(255 * Math.min(1, sparkle.flash * 0.58));
      }
      i += 4;
    }
  }
}
