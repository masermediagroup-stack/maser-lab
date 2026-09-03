import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

/**
 * Geist Sans / Mono (OFL 1.1) — stand-in for Universal Sans.
 * grok.com already pairs Geist Mono on the large display headline with
 * Universal Sans for body. We never load xAI's self-hosted
 * UniversalSans_Display / UniversalSans_Text files.
 *
 * Swap the family in tokens.css (`--dallas-font` / `--dallas-font-mono`)
 * if a Universal Sans licence arrives.
 */
export const dallasGeistSans = GeistSans;
export const dallasGeistMono = GeistMono;

export const DALLAS_SANS_FAMILY = `${GeistSans.style.fontFamily}, "Geist", "Geist Sans", sans-serif`;
export const DALLAS_MONO_FAMILY = `${GeistMono.style.fontFamily}, "Geist Mono", ui-monospace, monospace`;
