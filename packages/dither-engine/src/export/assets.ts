/**
 * Sprint 8 — Image / upload asset handling for portable exports.
 * Never serialize live blob: URLs into production exports.
 */

import type { ComponentContent } from "../content/types";
import type {
  AssetManifest,
  AssetManifestEntry,
  AssetStrategy,
  MaserDitherRuntimeConfig,
} from "./types";

export function isBlobUrl(url: string | null | undefined): boolean {
  return Boolean(url && url.startsWith("blob:"));
}

export function isDataUrl(url: string | null | undefined): boolean {
  return Boolean(url && url.startsWith("data:"));
}

/** Drop blob URLs from content (CTA photo etc.). */
export function sanitizeContentAssets(
  content: ComponentContent,
): ComponentContent {
  const next = { ...content, navItems: [...content.navItems] };
  if (isBlobUrl(next.cardCtaSourceUrl)) {
    next.cardCtaSourceUrl = null;
  }
  return next;
}

export function sanitizeSourceUrl(url: string | null): string | null {
  if (!url || isBlobUrl(url)) return null;
  return url;
}

export function buildAssetManifest(
  runtime: Pick<
    MaserDitherRuntimeConfig,
    "componentId" | "content" | "sourceUrl"
  >,
): AssetManifest {
  const entries: AssetManifestEntry[] = [];

  if (runtime.sourceUrl || runtime.componentId === "image-frame") {
    const blobDropped = isBlobUrl(runtime.sourceUrl);
    entries.push({
      id: "primary-source",
      role: runtime.componentId === "avatar" ? "avatar" : "source",
      strategy: blobDropped
        ? "placeholder"
        : runtime.sourceUrl
          ? isDataUrl(runtime.sourceUrl)
            ? "base64"
            : "reference"
          : "placeholder",
      src: sanitizeSourceUrl(runtime.sourceUrl),
      alt:
        runtime.componentId === "image-frame"
          ? runtime.content.imageCaption || "Dithered image"
          : runtime.content.avatarInitials
            ? `Avatar ${runtime.content.avatarInitials}`
            : "Surface source image",
      requiresReplacement: blobDropped || !runtime.sourceUrl,
    });
  }

  if (runtime.content.cardCtaSourceUrl || runtime.componentId === "card") {
    const cta = runtime.content.cardCtaSourceUrl;
    if (cta || runtime.componentId === "card") {
      // Only list CTA when present or was a blob that got dropped
      if (cta || isBlobUrl(cta)) {
        entries.push({
          id: "card-cta",
          role: "cta",
          strategy: isBlobUrl(cta)
            ? "placeholder"
            : isDataUrl(cta)
              ? "base64"
              : "reference",
          src: sanitizeSourceUrl(cta),
          alt: runtime.content.cardButtonLabel || "Card action",
          requiresReplacement: isBlobUrl(cta),
        });
      }
    }
  }

  return { entries };
}

export function applyAssetStrategy(
  runtime: MaserDitherRuntimeConfig,
  strategy: AssetStrategy,
  publicPath?: string,
): MaserDitherRuntimeConfig {
  const next = structuredClone(runtime);
  next.sourceUrl = sanitizeSourceUrl(next.sourceUrl);
  next.content = sanitizeContentAssets(next.content);

  if (strategy === "placeholder") {
    next.sourceUrl = null;
    next.content.cardCtaSourceUrl = null;
  } else if (strategy === "reference" && publicPath) {
    if (next.sourceUrl && (isDataUrl(next.sourceUrl) || !next.sourceUrl)) {
      next.sourceUrl = publicPath;
    } else if (!next.sourceUrl) {
      next.sourceUrl = publicPath;
    }
  } else if (strategy === "base64") {
    // Keep data URLs; drop anything else that isn't already base64
    if (next.sourceUrl && !isDataUrl(next.sourceUrl)) {
      // leave reference as-is; caller must convert
    }
  }

  next.assets = buildAssetManifest(next);
  if (strategy === "base64" && next.assets) {
    for (const e of next.assets.entries) {
      if (e.src && isDataUrl(e.src)) e.strategy = "base64";
    }
  }

  return next;
}

export function estimateDataUrlBytes(dataUrl: string | null): number {
  if (!dataUrl || !isDataUrl(dataUrl)) return 0;
  const comma = dataUrl.indexOf(",");
  if (comma < 0) return dataUrl.length;
  const b64 = dataUrl.slice(comma + 1);
  return Math.floor((b64.length * 3) / 4);
}
