import { IBM_Plex_Sans_Condensed } from "next/font/google";

/**
 * Type split (settled).
 *
 * Display ("Dallas meetup"): self-hosted Universal Sans trial 400, exactly
 * once, on the canvas. Do not fetch xAI's webfonts.
 * Body / labels / info: IBM Plex Sans Condensed. Largest Plex ≤ 40% of the
 * display's rendered size; if a label creeps up, cut or shrink it — never
 * enlarge the display.
 * Geist is out. Geist Mono is unused on this demo.
 */
export const dallasPlexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-sans-condensed",
  display: "swap",
});

export const DALLAS_UNIVERSAL_SANS_FAMILY =
  '"UniversalSansGrokTest Display Trial 400", "UniversalSansGrokTest Display Trial"';

export const DALLAS_SANS_FAMILY = DALLAS_UNIVERSAL_SANS_FAMILY;
