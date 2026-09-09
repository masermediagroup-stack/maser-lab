/**
 * SpaceXAI wordmark. Source: user upload (black on transparent, 834x318).
 *
 * Kick behavior (no 360 spin, no idle float — the mark stays planted):
 * - Swipe fade: a directional crossfade wipes left → right across the whip,
 *   eased slow → fast (cubic ease-in).
 * - Edge shine: a soft highlight band rides the same sweep, confined to the
 *   logo's edge rim (blurred silhouette minus sharp core), never the full fill.
 * Reduced motion: static full logo, no sweep, no shine.
 */

import { kickProgress } from "./globe-motion";

export const SPACEXAI_VB_W = 834;
export const SPACEXAI_VB_H = 318;
export const SPACEXAI_ASPECT = SPACEXAI_VB_W / SPACEXAI_VB_H;

export const SPACEXAI_MARK_SRC =
  "/assets/dallas-meetup-tv-wallpaper/spacexai-logo.png";

/**
 * Grok disc drops to the wordmark's optical middle. The X letterform is
 * bottom-heavy, so its visual-mass centroid sits below the geometric center;
 * verified against a rendered frame (X mass ≈ Grok mass within ~1px after the
 * nudge). Design px @ 1920.
 */
export const GROK_Y_NUDGE_PX = 8;

/** Slow → fast ease for the sweep (cubic ease-in). */
export function spacexaiSweepEase(p: number): number {
  const u = Math.min(1, Math.max(0, p));
  return u * u * u;
}

export type SpacexaiSwipeState = {
  active: boolean;
  /** Eased whip progress 0–1. */
  eased: number;
  /** Sweep edge as a fraction of logo width (-0.1 → 1.1). */
  edgeFrac: number;
  /** Alpha left of the edge (incoming). */
  alphaIn: number;
  /** Alpha right of the edge (outgoing). */
  alphaOut: number;
};

export function spacexaiSwipeState(
  elapsed: number,
  loopSeconds: number,
  whipSeconds: number,
  reducedMotion: boolean,
): SpacexaiSwipeState {
  if (reducedMotion) {
    return { active: false, eased: 0, edgeFrac: -0.1, alphaIn: 1, alphaOut: 1 };
  }
  const p = kickProgress(elapsed, loopSeconds, whipSeconds);
  if (!(p > 0)) {
    return { active: false, eased: 0, edgeFrac: -0.1, alphaIn: 1, alphaOut: 1 };
  }
  const eased = spacexaiSweepEase(p);
  return {
    active: true,
    eased,
    edgeFrac: -0.1 + eased * 1.2,
    alphaIn: Math.min(1, 0.15 + p),
    alphaOut: Math.max(0.12, 1 - p),
  };
}

let cachedLogo: HTMLImageElement | null = null;

/** Preloads the wordmark. Awaits decode so MP4/WebM export never records a blank frame. */
export async function preloadSpacexaiLogo(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!cachedLogo) {
    cachedLogo = new Image();
    cachedLogo.src = SPACEXAI_MARK_SRC;
  }
  try {
    await cachedLogo.decode();
  } catch {
    await new Promise<void>((resolve) => {
      if (!cachedLogo || cachedLogo.complete) {
        resolve();
        return;
      }
      cachedLogo.addEventListener("load", () => resolve(), { once: true });
      cachedLogo.addEventListener("error", () => resolve(), { once: true });
    });
  }
}

/** Returns the logo only when fully decoded — renderFrame skips otherwise (no partial draw). */
export function spacexaiLogoImage(): HTMLImageElement | null {
  if (
    cachedLogo &&
    cachedLogo.complete &&
    cachedLogo.naturalWidth > 0 &&
    cachedLogo.naturalHeight > 0
  ) {
    return cachedLogo;
  }
  if (typeof window !== "undefined" && !cachedLogo) {
    cachedLogo = new Image();
    cachedLogo.src = SPACEXAI_MARK_SRC;
  }
  return null;
}

const scratch: HTMLCanvasElement[] = [];

function fitScratch(index: number, w: number, h: number): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  let canvas = scratch[index];
  if (!canvas) {
    canvas = document.createElement("canvas");
    scratch[index] = canvas;
  }
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  return canvas;
}

/** Edge-rim shine band riding the sweep. Confined to the logo rim, not the fill. */
function drawSpacexaiEdgeShine(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  iw: number,
  ih: number,
  edgeFrac: number,
): void {
  const white = fitScratch(1, iw, ih);
  const rim = fitScratch(2, iw, ih);
  if (!white || !rim) return;
  const whiteCtx = white.getContext("2d");
  const rimCtx = rim.getContext("2d");
  if (!whiteCtx || !rimCtx) return;

  whiteCtx.globalCompositeOperation = "source-over";
  whiteCtx.clearRect(0, 0, iw, ih);
  whiteCtx.drawImage(logo, 0, 0, iw, ih);
  whiteCtx.globalCompositeOperation = "source-in";
  whiteCtx.fillStyle = "#ffffff";
  whiteCtx.fillRect(0, 0, iw, ih);
  whiteCtx.globalCompositeOperation = "source-over";

  rimCtx.globalCompositeOperation = "source-over";
  rimCtx.clearRect(0, 0, iw, ih);
  let blurred = false;
  try {
    rimCtx.filter = `blur(${Math.max(1, Math.round(iw * 0.004))}px)`;
    blurred = rimCtx.filter !== "none";
  } catch {
    blurred = false;
  }
  rimCtx.drawImage(white, 0, 0);
  try {
    rimCtx.filter = "none";
  } catch {
    /* filter unsupported — fall through to the soft full-shape band */
  }
  if (blurred) {
    rimCtx.globalCompositeOperation = "destination-out";
    rimCtx.drawImage(white, 0, 0);
    rimCtx.globalCompositeOperation = "source-over";
  }

  const edge = edgeFrac * iw;
  const half = Math.max(10, iw * 0.1);
  const band = rimCtx.createLinearGradient(edge - half, 0, edge + half, 0);
  band.addColorStop(0, "rgba(0,0,0,0)");
  band.addColorStop(0.5, blurred ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.35)");
  band.addColorStop(1, "rgba(0,0,0,0)");
  rimCtx.globalCompositeOperation = "destination-in";
  rimCtx.fillStyle = band;
  rimCtx.fillRect(0, 0, iw, ih);
  rimCtx.globalCompositeOperation = "source-over";

  ctx.drawImage(rim, x - w * 0.5, y - h * 0.5, w, h);
}

/**
 * Draws the wordmark centered at (x, y). Outside the whip (or reduced motion)
 * it is a plain planted draw. During the whip it crossfades left → right with
 * an edge-rim shine riding the sweep.
 */
export function drawSpacexaiMark(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  elapsed: number,
  loopSeconds: number,
  whipSeconds: number,
  reducedMotion: boolean,
): void {
  const swipe = spacexaiSwipeState(elapsed, loopSeconds, whipSeconds, reducedMotion);
  if (!swipe.active) {
    ctx.drawImage(logo, x - w * 0.5, y - h * 0.5, w, h);
    return;
  }

  const iw = Math.max(1, Math.round(w));
  const ih = Math.max(1, Math.round(h));
  const base = fitScratch(0, iw, ih);
  if (!base) {
    ctx.drawImage(logo, x - w * 0.5, y - h * 0.5, w, h);
    return;
  }
  const baseCtx = base.getContext("2d");
  if (!baseCtx) {
    ctx.drawImage(logo, x - w * 0.5, y - h * 0.5, w, h);
    return;
  }

  baseCtx.globalCompositeOperation = "source-over";
  baseCtx.clearRect(0, 0, iw, ih);
  baseCtx.drawImage(logo, 0, 0, iw, ih);
  const edge = swipe.edgeFrac * iw;
  const feather = Math.max(8, iw * 0.22);
  const mask = baseCtx.createLinearGradient(edge - feather, 0, edge, 0);
  mask.addColorStop(0, `rgba(0,0,0,${swipe.alphaIn})`);
  mask.addColorStop(1, `rgba(0,0,0,${swipe.alphaOut})`);
  baseCtx.globalCompositeOperation = "destination-in";
  baseCtx.fillStyle = mask;
  baseCtx.fillRect(0, 0, iw, ih);
  baseCtx.globalCompositeOperation = "source-over";

  ctx.drawImage(base, x - w * 0.5, y - h * 0.5, w, h);
  drawSpacexaiEdgeShine(ctx, logo, x, y, w, h, iw, ih, swipe.edgeFrac);
}
