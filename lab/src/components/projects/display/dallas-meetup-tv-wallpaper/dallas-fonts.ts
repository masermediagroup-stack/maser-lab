import { IBM_Plex_Sans_Condensed } from "next/font/google";

/**
 * Type split (EPG lock).
 *
 * Display ("Dallas meetup"): Geist Sans, exactly once, on the canvas.
 * Never fetch xAI webfonts.
 * Body / labels / info: IBM Plex Sans Condensed. Largest Plex ≤ 40% of the
 * display's rendered size; if a label creeps up, cut or shrink it — never
 * enlarge the display.
 */
export const dallasPlexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-sans-condensed",
  display: "swap",
});

/** Geist is loaded on <html> as `--font-geist-sans` (lab/src/app/layout.tsx). */
export const DALLAS_GEIST_FAMILY =
  'var(--font-geist-sans), Geist, "Geist Sans", ui-sans-serif, system-ui, sans-serif';

export const DALLAS_SANS_FAMILY = DALLAS_GEIST_FAMILY;
