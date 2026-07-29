/**
 * Scroll influence field — maps page/container scroll into 0…1 phase.
 */
export class ScrollField {
  progress = 0;

  fromWindow(): void {
    if (typeof window === "undefined") return;
    const max = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    this.progress = Math.min(1, Math.max(0, window.scrollY / max));
  }

  setProgress(value: number): void {
    this.progress = Math.min(1, Math.max(0, value));
  }
}
