import { IBM_Plex_Mono, IBM_Plex_Sans_Condensed } from "next/font/google";

/**
 * IBM Plex is the licensed substitute for Universal Sans (xAI production face).
 * Do not install geist for this project. Do not load xAI's self-hosted
 * UniversalSans_Display / UniversalSans_Text files.
 */
export const dallasPlexSansCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-ibm-plex-sans-condensed",
  display: "swap",
});

export const dallasPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});
