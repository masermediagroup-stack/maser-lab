import type { SVGProps } from "react";

/**
 * Placeholder mark — organic multi-lobe ring resembling Twitch Rivals casual quest.
 * Paths use fill only so SVG3DRotator can override via CSS variables.
 */
export function CasualQuestLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M120 36c-14 0-25 11-25 25v8c-22 4-39 22-42 44-4 28 18 52 46 54 3 0 6 0 9 0 3 0 6 0 9 0 28-2 50-26 46-54-3-22-20-40-42-44v-8c0-14-11-25-25-25Z" />
      <path d="M178 88c-10 0-18 8-18 18v6c-16 3-28 16-30 31-2 20 14 37 34 39 2 0 4 0 6 0s4 0 6 0c20-2 36-19 34-39-2-15-14-28-30-31v-6c0-10-8-18-18-18Z" />
      <path d="M62 88c-10 0-18 8-18 18v6c-16 3-28 16-30 31-2 20 14 37 34 39 2 0 4 0 6 0s4 0 6 0c20-2 36-19 34-39-2-15-14-28-30-31v-6c0-10-8-18-18-18Z" />
      <path d="M120 148c-16 0-29 13-29 29s13 29 29 29 29-13 29-29-13-29-29-29Z" />
      <path d="M120 108c-28 0-50 22-50 50 0 7 1.5 13.5 4.2 19.5 1.6 3.4 5.7 4.8 9.1 3.2 3.4-1.6 4.8-5.7 3.2-9.1-2-4.2-3-8.8-3-13.6 0-22 18-40 40-40s40 18 40 40c0 4.8-1 9.4-3 13.6-1.6 3.4-.2 7.5 3.2 9.1 3.4 1.6 7.5.2 9.1-3.2 2.7-6 4.2-12.5 4.2-19.5 0-28-22-50-50-50Z" />
    </svg>
  );
}
