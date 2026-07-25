"use client";

import { use } from "react";
import { TornTransitionContext } from "../lib/transition-context";
import type { TornTransitionContextValue } from "../lib/transition-types";

/**
 * Access the running transition.
 *
 * ```tsx
 * const { startTransition } = useTornTransition();
 * startTransition({ onCovered: () => router.push("/work") });
 * ```
 */
export function useTornTransition(): TornTransitionContextValue {
  const ctx = use(TornTransitionContext);
  if (!ctx) {
    throw new Error(
      "useTornTransition must be used inside a <TornTransitionProvider>.",
    );
  }
  return ctx;
}
