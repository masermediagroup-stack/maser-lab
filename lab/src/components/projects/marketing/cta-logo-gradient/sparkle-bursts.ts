/** Seeded 0..1. Never Math.random. */
function hash(n: number): number {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

const SLOTS = 3;

/**
 * Binary occupancy. A cell is fully on unless a short clustered burst
 * winks it off. Duty cycle is brief; the cell always returns to 1.
 */
export function cellOccupied(
  column: number,
  row: number,
  columns: number,
  rows: number,
  timeSec: number,
): boolean {
  for (let slot = 0; slot < SLOTS; slot++) {
    const period = 1.7 + slot * 0.42;
    const shifted = timeSec + slot * 0.73;
    const generation = Math.floor(shifted / period);
    const elapsed = shifted - generation * period;
    const winkSec = 0.05 + hash(generation * 19.1 + slot * 4.7) * 0.06;
    if (elapsed > winkSec) continue;
    const cx = hash(generation * 13.7 + slot * 4.1) * columns;
    const cy = hash(generation * 29.3 + slot * 8.7) * rows;
    const radius = 2.2 + hash(generation * 5.9 + slot) * 3.1;
    if (Math.hypot(column - cx, row - cy) > radius) continue;
    const member = hash(column * 17.2 + row * 9.4 + generation * 3.1 + slot);
    if (member < 0.32) continue;
    return false;
  }
  return true;
}

/** Cell-resolution 0/1 mask. White+opaque = inked, alpha 0 = wink off. */
export function paintOccupancy(
  image: ImageData,
  columns: number,
  rows: number,
  timeSec: number,
) {
  const data = image.data;
  let i = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const on = cellOccupied(x, y, columns, rows, timeSec);
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = on ? 255 : 0;
      i += 4;
    }
  }
}
