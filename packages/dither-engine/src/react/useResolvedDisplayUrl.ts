"use client";

import { useEffect, useState } from "react";
import {
  isAssetRef,
  resolveDisplayUrl,
} from "../lib/asset-store";

/**
 * Resolve lab `mde-asset:` refs (and pass-through blob/data/http) for <img> / GL.
 * Revokes object URLs on change / unmount.
 */
export function useResolvedDisplayUrl(url: string | null): string | null {
  const needsResolve = Boolean(url && isAssetRef(url));
  const [entry, setEntry] = useState<{
    ref: string;
    display: string | null;
  } | null>(null);

  useEffect(() => {
    if (!needsResolve || !url) {
      return;
    }

    let cancelled = false;
    let revoke: string | undefined;
    void resolveDisplayUrl(url).then((r) => {
      if (cancelled) {
        if (r.revoke) {
          try {
            URL.revokeObjectURL(r.revoke);
          } catch {
            /* ignore */
          }
        }
        return;
      }
      revoke = r.revoke;
      setEntry({ ref: url, display: r.url });
    });

    return () => {
      cancelled = true;
      if (revoke) {
        try {
          URL.revokeObjectURL(revoke);
        } catch {
          /* ignore */
        }
      }
    };
  }, [url, needsResolve]);

  if (!url) return null;
  if (!needsResolve) return url;
  return entry?.ref === url ? entry.display : null;
}
