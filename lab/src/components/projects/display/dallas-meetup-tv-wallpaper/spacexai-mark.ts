/**
 * SpaceXAI wordmark. Source: user upload (black on transparent, 834x318).
 * Drawn as raster via drawImage inside the shared mark box — same height as
 * the Grok mark, same idle float + whip spin the Cursor cube had.
 */

export const SPACEXAI_VB_W = 834;
export const SPACEXAI_VB_H = 318;
export const SPACEXAI_ASPECT = SPACEXAI_VB_W / SPACEXAI_VB_H;

export const SPACEXAI_MARK_SRC =
  "/assets/dallas-meetup-tv-wallpaper/spacexai-logo.png";

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
