import { IBM_Plex_Sans_Condensed } from "next/font/google";

/**
 * Idle wallpaper type split (Figma `11:97`).
 * Headline + subline: Universal Sans on canvas (400 + 300).
 * Demo chrome: IBM Plex Sans Condensed.
 */
export const dallasPlexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-ibm-plex-sans-condensed",
  display: "swap",
});

export const DALLAS_UNIVERSAL_FAMILY =
  '"UniversalSansGrokTest Display Trial", "UniversalSansGrokTest Display Trial 400", ui-sans-serif, system-ui, sans-serif';

export const DALLAS_SANS_FAMILY = DALLAS_UNIVERSAL_FAMILY;

export const DALLAS_PLEX_FAMILY =
  '"IBM Plex Sans Condensed", "Arial Narrow", "Nimbus Sans Narrow", sans-serif';

export const DALLAS_DEFAULT_HEADLINE = "Dallas Meetup";
export const DALLAS_DEFAULT_UP_NEXT =
  "Up Next: Grok Bot Loop Demo - Designer - Tyler Vea";
