import { IBM_Plex_Sans_Condensed } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

/**
 * Settled type split — do not re-open. Mechanical checks in type-lock.ts.
 *
 * Display ("Dallas meetup"): Geist Sans, exactly once, on the canvas.
 * Body / labels / info: IBM Plex Sans Condensed. Largest Plex ≤ 40% of the
 * display's rendered size; if a label creeps up, cut or shrink it — never
 * enlarge the display.
 * GeistMono is available only if a slug or rule label earns
 * data-dallas-mono="structural". It is not a third voice. Do not apply the
 * Mono variable class just to add texture. The display line is never Mono.
 *
 * Never Universal Sans. Never load xAI's self-hosted
 * UniversalSans_Display / UniversalSans_Text files.
 */
export const dallasGeistSans = GeistSans;
export const dallasGeistMono = GeistMono;

export const dallasPlexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-sans-condensed",
  display: "swap",
});

export const DALLAS_SANS_FAMILY = `${GeistSans.style.fontFamily}, "Geist", "Geist Sans", sans-serif`;
