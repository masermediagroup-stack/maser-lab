import type { TimelineLoopMode, TimelineState } from "./types";
import { DEFAULT_TIMELINE } from "./types";

/**
 * Engine timeline — playhead with loop / ping-pong / reverse / speed / scale.
 * Designed to grow into a fuller timeline without changing consumers.
 */
export class Timeline {
  private state: TimelineState;
  /** Absolute playhead (seconds). Can decrease when reversed. */
  private time = 0;
  /** Ping-pong travel direction (independent of reverse flag). */
  private pingDirection = 1;

  constructor(initial?: Partial<TimelineState>) {
    this.state = { ...DEFAULT_TIMELINE, ...initial };
  }

  getState(): Readonly<TimelineState> {
    return this.state;
  }

  getTime(): number {
    return this.time;
  }

  setPlaying(playing: boolean): void {
    this.state = { ...this.state, playing };
  }

  togglePlay(): void {
    this.setPlaying(!this.state.playing);
  }

  restart(): void {
    this.time = 0;
    this.pingDirection = 1;
  }

  setReversed(reversed: boolean): void {
    this.state = {
      ...this.state,
      direction: reversed ? -1 : 1,
    };
  }

  toggleReverse(): void {
    this.setReversed(this.state.direction === 1);
  }

  setLoopMode(loopMode: TimelineLoopMode): void {
    this.state = { ...this.state, loopMode };
  }

  setPlaybackSpeed(playbackSpeed: number): void {
    this.state = {
      ...this.state,
      playbackSpeed: Math.max(0, Math.min(4, playbackSpeed)),
    };
  }

  setTimeScale(timeScale: number): void {
    this.state = {
      ...this.state,
      timeScale: Math.max(0, Math.min(4, timeScale)),
    };
  }

  setTime(time: number): void {
    this.time = Math.max(0, time);
  }

  patch(partial: Partial<TimelineState>): void {
    this.state = { ...this.state, ...partial };
  }

  /**
   * Advance playhead. Returns absolute time for shaders.
   */
  tick(dtSeconds: number): number {
    if (!this.state.playing) return this.time;

    const rate =
      this.state.playbackSpeed *
      this.state.timeScale *
      this.state.direction *
      (this.state.loopMode === "pingpong" ? this.pingDirection : 1);

    let next = this.time + dtSeconds * rate;

    if (this.state.loopMode === "pingpong") {
      const period = 8;
      if (next > period) {
        next = period - (next - period);
        this.pingDirection = -1;
      } else if (next < 0) {
        next = -next;
        this.pingDirection = 1;
      }
    } else if (this.state.loopMode === "once") {
      if (next < 0) {
        next = 0;
        this.state = { ...this.state, playing: false };
      }
      // once forward: unbounded until consumer restarts — no hard seam
    }
    // loop: unbounded monotonic (or decreasing if reversed) — no hard seam

    this.time = next;
    return next;
  }
}
