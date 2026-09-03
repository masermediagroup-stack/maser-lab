import { IBM_Plex_Sans_Condensed } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

/**
 * Settled type split — do not re-open.
 *
 * Display ("Dallas meetup"): Geist Sans. The user named Geist sans twice.
 * Body / labels / info: IBM Plex Sans Condensed. Geist does not creep into
 * small type. GeistMono is available for a genuine structural mono need;
 * the display line is never Mono.
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
