import type { ReactNode } from "react";
import type { FrostNavIconProps, FrostNavId, FrostNavItem } from "./types";

export const FROST_NAV_ITEMS: readonly FrostNavItem[] = [
  { id: "home", href: "/", label: "Home" },
  { id: "work", href: "/work", label: "Work" },
  { id: "contact", href: "/contact", label: "Contact" },
];

/** Top-arc wedges, CSS degrees (0 = 3 o'clock, clockwise). */
export const SLOT_ARCS: Record<
  FrostNavId,
  { start: number; end: number; iconX: string; iconY: string; clipPath: string }
> = {
  home: {
    start: 180,
    end: 240,
    iconX: "15.79%",
    iconY: "30.25%",
    clipPath: sectorClip(180, 240),
  },
  work: {
    start: 240,
    end: 300,
    iconX: "50%",
    iconY: "10.5%",
    clipPath: sectorClip(240, 300),
  },
  contact: {
    start: 300,
    end: 360,
    iconX: "84.21%",
    iconY: "30.25%",
    clipPath: sectorClip(300, 360),
  },
};

export const LEAVE_MS = 75;

function sectorClip(startDeg: number, endDeg: number, steps = 10): string {
  const pts = ["50% 50%"];
  for (let i = 0; i <= steps; i += 1) {
    const t = startDeg + ((endDeg - startDeg) * i) / steps;
    const rad = (t * Math.PI) / 180;
    const x = 50 + 50 * Math.cos(rad);
    const y = 50 + 50 * Math.sin(rad);
    pts.push(`${x.toFixed(3)}% ${y.toFixed(3)}%`);
  }
  return `polygon(${pts.join(", ")})`;
}

export function IconHome({ solid }: FrostNavIconProps) {
  if (solid) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4.5 10.75 12 4.5l7.5 6.25V19a1.25 1.25 0 0 1-1.25 1.25h-3.5V14.5h-5.5v5.75h-3.5A1.25 1.25 0 0 1 4.5 19V10.75Z" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.5 10.75 12 4.5l7.5 6.25V19a1.25 1.25 0 0 1-1.25 1.25h-3.5V14.5h-5.5v5.75h-3.5A1.25 1.25 0 0 1 4.5 19V10.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconWork({ solid }: FrostNavIconProps) {
  if (solid) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M10 4.5h4A2 2 0 0 1 16 6.5v.75h2.25A1.5 1.5 0 0 1 19.75 8.75v10.75a1.5 1.5 0 0 1-1.5 1.5H5.75a1.5 1.5 0 0 1-1.5-1.5V8.75A1.5 1.5 0 0 1 5.75 7.25H8V6.5A2 2 0 0 1 10 4.5Zm0 1.5a.5.5 0 0 0-.5.5v.75h5V6.5a.5.5 0 0 0-.5-.5h-4Z" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 7.25V6.5A2 2 0 0 1 10 4.5h4A2 2 0 0 1 16 6.5v.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="3.75"
        y="7.25"
        width="16.5"
        height="12.25"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M3.75 12.5h16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconContact({ solid }: FrostNavIconProps) {
  if (solid) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M5.25 5.75h13.5A1.5 1.5 0 0 1 20.25 7.25v9.5a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-9.5a1.5 1.5 0 0 1 1.5-1.5Zm.35 1.6v.2l6.4 4.48 6.4-4.48v-.2H5.6Z" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3.75"
        y="5.75"
        width="16.5"
        height="12.5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m4.5 7.5 7.5 5.25L19.5 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const FROST_NAV_ICONS: Record<FrostNavId, (props: FrostNavIconProps) => ReactNode> = {
  home: IconHome,
  work: IconWork,
  contact: IconContact,
};

export function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname || "/";
}
