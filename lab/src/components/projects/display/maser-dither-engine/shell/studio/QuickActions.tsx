"use client";

import { cn } from "@/lib/utils";

type QuickActionsProps = {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onDuplicate: () => void;
  onReset: () => void;
  onExport: () => void;
  onFavorite: () => void;
  onThumbnail: () => void;
  className?: string;
};

export function QuickActions({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onSaveAs,
  onDuplicate,
  onReset,
  onExport,
  onFavorite,
  onThumbnail,
  className,
}: QuickActionsProps) {
  return (
    <div className={cn("mde-quick", className)} role="toolbar" aria-label="Quick actions">
      <button type="button" className="mde-quick__btn" disabled={!canUndo} onClick={onUndo}>
        Undo
      </button>
      <button type="button" className="mde-quick__btn" disabled={!canRedo} onClick={onRedo}>
        Redo
      </button>
      <button type="button" className="mde-quick__btn" onClick={onSave}>
        Save
      </button>
      <button type="button" className="mde-quick__btn" onClick={onSaveAs}>
        Save As
      </button>
      <button type="button" className="mde-quick__btn" onClick={onDuplicate}>
        Duplicate
      </button>
      <button type="button" className="mde-quick__btn" onClick={onReset}>
        Reset
      </button>
      <button type="button" className="mde-quick__btn" onClick={onExport}>
        Export
      </button>
      <button type="button" className="mde-quick__btn" onClick={onFavorite}>
        Favorite
      </button>
      <button type="button" className="mde-quick__btn" onClick={onThumbnail}>
        Thumbnail
      </button>
    </div>
  );
}
