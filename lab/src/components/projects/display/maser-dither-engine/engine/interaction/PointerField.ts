/**
 * Normalized pointer field inside a surface element.
 * Writes influence targets — AnimationLoop damps them.
 */
export class PointerField {
  x = 0.5;
  y = 0.5;
  private active = false;

  get isActive(): boolean {
    return this.active;
  }

  /** Update from pointer event relative to element bounds. */
  fromEvent(clientX: number, clientY: number, rect: DOMRect): void {
    this.active = true;
    this.x = Math.min(1, Math.max(0, (clientX - rect.left) / Math.max(rect.width, 1)));
    this.y = Math.min(1, Math.max(0, (clientY - rect.top) / Math.max(rect.height, 1)));
  }

  /** Softly return toward center when pointer leaves. */
  release(): void {
    this.active = false;
    this.x = 0.5;
    this.y = 0.5;
  }

  setNormalized(x: number, y: number): void {
    this.active = true;
    this.x = Math.min(1, Math.max(0, x));
    this.y = Math.min(1, Math.max(0, y));
  }
}
