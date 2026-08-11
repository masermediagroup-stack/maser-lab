/** Demo / product SFX for pixel assemble ↔ collapse. */

export const PIC_SFX = {
  /** Click squircle → assemble card */
  assemble: "/demos/pixel-info-card/assemble-open.mp3",
  /** Pixel collapse → reassemble squircle */
  collapse: "/demos/pixel-info-card/collapse-reassemble.mp3",
} as const;

/**
 * Play a short UI click. Safe on user gestures; failures (autoplay policy,
 * missing file) are swallowed so motion never depends on audio.
 */
export function playPicSfx(src: string, volume = 0.72): void {
  if (typeof window === "undefined") return;
  try {
    const audio = new Audio(src);
    audio.volume = Math.max(0, Math.min(1, volume));
    void audio.play().catch(() => {
      /* ignore blocked / failed playback */
    });
  } catch {
    /* ignore construct errors */
  }
}
