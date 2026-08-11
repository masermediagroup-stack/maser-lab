"use client";

import Image from "next/image";
import { useState } from "react";
import { ASSET_KIND_LABELS } from "../constants";
import type { BrandAsset, BrandAssetKind } from "../types";

type AssetListEditorProps = {
  assets: BrandAsset[];
  onChange: (assets: BrandAsset[]) => void;
  onUpload: () => void;
};

function reorder<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  if (!moved) return items;
  next.splice(to, 0, moved);
  return next;
}

export function AssetListEditor({ assets, onChange, onUpload }: AssetListEditorProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="font-semibold">Deliverable assets</h3>
        <button type="button" className="bcs-btn" onClick={onUpload}>
          Upload assets
        </button>
      </div>
      <ul className="flex flex-col gap-3">
        {assets.map((asset, index) => (
          <li
            key={asset.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragIndex === null || dragIndex === index) return;
              onChange(reorder(assets, dragIndex, index));
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
            className={`bcs-card flex flex-wrap items-center gap-3 p-3 ${
              dragIndex === index ? "opacity-60" : ""
            }`}
          >
            <button
              type="button"
              className="cursor-grab px-1 text-[var(--bcs-fg-soft)] active:cursor-grabbing"
              aria-label={`Drag to reorder ${asset.title}`}
              tabIndex={-1}
            >
              ⠿
            </button>
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-[var(--bcs-border)]">
              {asset.src ? (
                <Image src={asset.src} alt="" fill className="object-cover" sizes="56px" />
              ) : null}
            </div>
            <label className="bcs-field min-w-[120px] flex-1">
              <span className="bcs-label">Title</span>
              <input
                className="bcs-input"
                value={asset.title}
                onChange={(e) => {
                  const next = [...assets];
                  next[index] = { ...asset, title: e.target.value };
                  onChange(next);
                }}
              />
            </label>
            <label className="bcs-field w-32">
              <span className="bcs-label">Kind</span>
              <select
                className="bcs-input"
                value={asset.kind}
                onChange={(e) => {
                  const next = [...assets];
                  next[index] = { ...asset, kind: e.target.value as BrandAssetKind };
                  onChange(next);
                }}
              >
                {Object.entries(ASSET_KIND_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="bcs-btn bcs-btn--ghost text-[var(--bcs-error)]"
              aria-label={`Remove ${asset.title}`}
              onClick={() => onChange(assets.filter((a) => a.id !== asset.id))}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      {assets.length > 1 ? (
        <p className="mt-2 text-xs text-[var(--bcs-fg-soft)]">
          Drag the ⠿ handle to set presentation order.
        </p>
      ) : null}
    </div>
  );
}
