"use client";

import Image from "next/image";
import type { BrandAsset } from "../types";
import { ASSET_KIND_LABELS } from "../constants";

type AssetGridProps = {
  assets: BrandAsset[];
  accentColor?: string;
};

export function AssetGrid({ assets, accentColor }: AssetGridProps) {
  if (assets.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {assets.map((asset) => (
        <figure
          key={asset.id}
          className="bcs-card overflow-hidden"
          style={{ borderTopColor: accentColor, borderTopWidth: asset.kind === "logo" ? 3 : 0 }}
        >
          <div className="relative aspect-[4/3] bg-[var(--bcs-border)]">
            {asset.src ? (
              <Image
                src={asset.src}
                alt={asset.alt || asset.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-[var(--bcs-fg-soft)]">
                {asset.title}
              </div>
            )}
          </div>
          <figcaption className="border-t border-[var(--bcs-border)] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--bcs-fg-soft)]">
              {ASSET_KIND_LABELS[asset.kind] ?? asset.kind}
            </p>
            <p className="mt-0.5 font-medium">{asset.title}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
