"use client";

type ExportModalProps = {
  open: boolean;
  title: string;
  message: string;
  current?: number;
  total?: number;
  ready?: boolean;
  onCancel: () => void;
  onDownload?: () => void;
};

export function ExportModal({
  open,
  title,
  message,
  current,
  total,
  ready,
  onCancel,
  onDownload,
}: ExportModalProps) {
  if (!open) return null;
  const percent =
    total && total > 0 ? Math.round(((current ?? 0) / total) * 100) : 0;
  return (
    <div className="chromemark-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="chromemark-modal-card">
        <h2 style={{ margin: 0, fontSize: "0.95rem" }}>{title}</h2>
        <p className="chromemark-notice" style={{ marginTop: "0.5rem" }}>
          {message}
        </p>
        {typeof current === "number" && typeof total === "number" ? (
          <>
            <p className="chromemark-meta">
              Rendering {current} / {total} frames
            </p>
            <div className="chromemark-progress" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${percent}%` }} />
            </div>
          </>
        ) : null}
        <div className="chromemark-btn-row">
          {ready && onDownload ? (
            <button type="button" className="chromemark-btn" onClick={onDownload}>
              Download ZIP
            </button>
          ) : (
            <button type="button" className="chromemark-btn" onClick={onCancel}>
              Cancel
            </button>
          )}
          {ready ? (
            <button type="button" className="chromemark-btn" onClick={onCancel}>
              Close
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
