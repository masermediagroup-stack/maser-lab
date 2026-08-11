"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function isConvexConfigured(): boolean {
  return Boolean(convexUrl);
}

type BrandCaseConvexProviderProps = {
  children: ReactNode;
};

export function BrandCaseConvexProvider({ children }: BrandCaseConvexProviderProps) {
  if (!convexClient) {
    return children;
  }
  return <ConvexProvider client={convexClient}>{children}</ConvexProvider>;
}
