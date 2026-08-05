"use client";

/**
 * Sprint 8 — Shareable scene viewer (local-first payload).
 */

import { useMemo } from "react";
import { decodeSceneHash, type MaserDitherExport } from "../export";
import { PresentationView } from "./PresentationView";

export type SceneViewerProps = {
  payload?: string;
  fallbackDoc?: MaserDitherExport | null;
  reducedMotion?: boolean;
  onOpenEditor?: (doc: MaserDitherExport) => void;
  onDuplicate?: (doc: MaserDitherExport) => void;
};

export function SceneViewer({
  payload,
  fallbackDoc,
  reducedMotion,
  onOpenEditor,
  onDuplicate,
}: SceneViewerProps) {
  const doc = useMemo(() => {
    if (payload) {
      return decodeSceneHash(payload) ?? fallbackDoc ?? null;
    }
    return fallbackDoc ?? null;
  }, [payload, fallbackDoc]);

  if (!doc) {
    return (
      <div className="mde-page mde-scene-empty">
        <h1>Shareable scene</h1>
        <p>
          No portable scene payload found. Export a <strong>Shareable Scene</strong>{" "}
          from the Export workspace, or open a <code>.maser-scene.json</code> file.
        </p>
        <p className="mde-export-hint">
          Scenes are local-first — there is no cloud persistence in this build.
        </p>
      </div>
    );
  }

  return (
    <PresentationView
      runtime={doc.runtime}
      title={doc.project?.name}
      description={doc.project?.description || doc.project?.notes}
      reducedMotion={reducedMotion}
      onOpenEditor={onOpenEditor ? () => onOpenEditor(doc) : undefined}
      onDuplicate={onDuplicate ? () => onDuplicate(doc) : undefined}
      onFullscreen={() => {
        const el = document.documentElement;
        if (!document.fullscreenElement) {
          void el.requestFullscreen?.();
        } else {
          void document.exitFullscreen?.();
        }
      }}
    />
  );
}
