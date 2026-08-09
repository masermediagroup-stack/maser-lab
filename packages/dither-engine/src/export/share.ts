/**
 * Sprint 8 — Shareable scene helpers (local-first, no fake cloud).
 */

import type { MaserDitherExport } from "./types";
import { createExportDoc } from "./schema";

const SCENE_URL_BUDGET = 6000; // conservative hash length

export function buildSceneDoc(
  doc: MaserDitherExport,
): MaserDitherExport {
  return createExportDoc({
    kind: "scene",
    runtime: doc.runtime,
    project: doc.project
      ? {
          name: doc.project.name,
          description: doc.project.description,
          notes: doc.project.notes,
          tags: doc.project.tags ?? [],
          colorLabel: doc.project.colorLabel ?? "none",
          favorite: false,
          thumbnailDataUrl: null,
          createdAt: doc.project.createdAt,
          updatedAt: doc.project.updatedAt,
        }
      : undefined,
    engineVersion: doc.engineVersion,
  });
}

/** Compact URL hash payload — only when under budget. */
export function encodeSceneHash(doc: MaserDitherExport): string | null {
  const scene = buildSceneDoc(doc);
  // Strip heavy fields for URL
  const compact = {
    v: "2.0.0",
    e: scene.engineVersion,
    k: "scene",
    r: scene.runtime,
    n: scene.project?.name,
    d: scene.project?.description,
  };
  try {
    const json = JSON.stringify(compact);
    const b64 =
      typeof btoa !== "undefined"
        ? btoa(unescape(encodeURIComponent(json)))
        : Buffer.from(json, "utf8").toString("base64");
    const encoded = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    if (encoded.length > SCENE_URL_BUDGET) return null;
    return encoded;
  } catch {
    return null;
  }
}

export function decodeSceneHash(encoded: string): MaserDitherExport | null {
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    const json =
      typeof atob !== "undefined"
        ? decodeURIComponent(escape(atob(b64 + pad)))
        : Buffer.from(b64 + pad, "base64").toString("utf8");
    const parsed = JSON.parse(json) as {
      v?: string;
      e?: string;
      r?: MaserDitherExport["runtime"];
      n?: string;
      d?: string;
    };
    if (!parsed.r) return null;
    return createExportDoc({
      kind: "scene",
      runtime: parsed.r,
      engineVersion: parsed.e,
      project: parsed.n
        ? {
            name: parsed.n,
            description: parsed.d ?? "",
            notes: "",
            tags: [],
            colorLabel: "none",
            favorite: false,
            thumbnailDataUrl: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : undefined,
    });
  } catch {
    return null;
  }
}

export function sceneShareUrl(encoded: string | null, origin?: string): string | null {
  if (!encoded) return null;
  const base =
    origin ||
    (typeof window !== "undefined" ? window.location.origin : "");
  if (!base) return `#/scene?c=${encoded}`;
  return `${base}/demos/maser-dither-engine#/scene?c=${encoded}`;
}
