import { IBM_Plex_Sans_Condensed } from "next/font/google";

/**
 * Type split (EPG lock).
 *
 * Display ("Dallas meetup"): Universal Sans trial, exactly once, on the canvas.
 * Family: `UniversalSansGrokTest Display Trial` / 400.
 * Never fetch xAI webfonts. Geist is out.
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

/** Canvas `ctx.font` stack. Same file as `--dallas-font`. */
export const DALLAS_UNIVERSAL_FAMILY =
  '"UniversalSansGrokTest Display Trial", "UniversalSansGrokTest Display Trial 400", ui-sans-serif, system-ui, sans-serif';

export const DALLAS_SANS_FAMILY = DALLAS_UNIVERSAL_FAMILY;
