/**
 * Height profile for the architectural bar formation.
 * Short at the front, rising toward a dominant peak, optional soft falloff at the far end.
 */
export function createHeightProfile(
  count: number,
  minHeight: number,
  maxHeight: number,
): Float32Array {
  const heights = new Float32Array(count);
  if (count <= 0) return heights;
  if (count === 1) {
    heights[0] = maxHeight;
    return heights;
  }

  // Peak slightly past center toward the back (architectural silhouette).
  const peakT = 0.72;

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    // Asymmetric bell: steeper rise from front, gentler optional decline after peak.
    const dist = (t - peakT) / (t < peakT ? peakT : 1 - peakT || 1);
    const envelope = Math.exp(-2.4 * dist * dist);
    // Front bias: keep early bars clearly shorter.
    const frontBias = Math.pow(t, 0.85);
    const shaped = envelope * (0.35 + 0.65 * frontBias);
    const normalized = Math.max(0, Math.min(1, shaped));
    heights[i] = minHeight + (maxHeight - minHeight) * normalized;
  }

  return heights;
}

export function barWorldX(
  index: number,
  count: number,
  barWidth: number,
  gap: number,
): number {
  const pitch = barWidth + gap;
  const total = (count - 1) * pitch;
  return -total / 2 + index * pitch;
}
