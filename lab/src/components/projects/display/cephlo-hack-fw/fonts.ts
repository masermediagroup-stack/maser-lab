import { IBM_Plex_Sans_Condensed } from "next/font/google";

/**
 * Wallpaper type: Universal Sans on the 1920×1080 frame.
 * Demo chrome: IBM Plex Sans Condensed.
 */
export const cephloPlexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-ibm-plex-sans-condensed",
  display: "swap",
});

export const CEPHLO_SANS_FAMILY =
  '"UniversalSansGrokTest Display Trial", "UniversalSansGrokTest Display Trial 400", ui-sans-serif, system-ui, sans-serif';

export const CEPHLO_DEFAULT_HEADLINE = "Cephlo Hack FW";
export const CEPHLO_DEFAULT_UP_NEXT = "Up next";
