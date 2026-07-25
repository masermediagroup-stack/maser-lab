"use client";

import { createContext } from "react";
import type { TornTransitionContextValue } from "./transition-types";

export const TornTransitionContext =
  createContext<TornTransitionContextValue | null>(null);
