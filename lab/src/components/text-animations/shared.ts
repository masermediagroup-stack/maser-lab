"use client";

import { useEffect, useState } from "react";

export type EaseOption =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "cubic-bezier(0.22, 1, 0.36, 1)";

export const EASE_OPTIONS: { value: EaseOption; label: string }[] = [
  { value: "linear", label: "Linear" },
  { value: "ease", label: "Ease" },
  { value: "ease-in", label: "Ease In" },
  { value: "ease-out", label: "Ease Out" },
  { value: "ease-in-out", label: "Ease In Out" },
  { value: "cubic-bezier(0.22, 1, 0.36, 1)", label: "Smooth Out" },
];

export type BaseAnimationProps = {
  text: string;
  playKey?: number;
  compact?: boolean;
  className?: string;
};

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function splitWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

export function splitChars(text: string): string[] {
  return [...text];
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
