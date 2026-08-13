"use client";

/**
 * Sprint 8 — Export workspace (monochrome chrome, stepped workflow).
 * Does not remount WebGL — parent keeps the live preview mounted.
 */

import {
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  EXPORT_MODE_CATALOG,
  buildComponentPackage,
  copyToClipboard,
  createExportDoc,
  downloadPackageZip,
  downloadTextFile,
  encodeSceneHash,
  generateExportOutput,
  loadExportHistory,
  parseAndMigrateImport,
  recordExport,
  removeExportHistoryEntry,
  sceneShareUrl,
  validateExportDoc,
  validateGeneratedPackage,
  type AssetStrategy,
  type CodeFormat,
  type Completeness,
  type ExportHistoryEntry,
  type ExportModeId,
  type MaserDitherExport,
  type MaserDitherRuntimeConfig,
  type ReactExportStrategy,
} from "../export";
import { ENGINE_VERSION } from "../constants";
import { cn } from "@/lib/utils";

export type ExportWorkspaceProps = {
  runtime: MaserDitherRuntimeConfig;
  projectMeta?: MaserDitherExport["project"];
  /** Compact / mobile fullscreen sheet layout */
  mobile?: boolean;
  onOpenPresentation?: (doc: MaserDitherExport) => void;
  onClose?: () => void;
};

type StepId = "target" | "type" | "configure" | "validate" | "export";

const STEPS: { id: StepId; label: string }[] = [
  { id: "target", label: "Target" },
  { id: "type", label: "Type" },
  { id: "configure", label: "Configure" },
  { id: "validate", label: "Validate" },
  { id: "export", label: "Export" },
];

export function ExportWorkspace({
  runtime,
  projectMeta,
  mobile = false,
  onOpenPresentation,
  onClose,
}: ExportWorkspaceProps) {
  const [step, setStep] = useState<StepId>("type");
  const [mode, setMode] = useState<ExportModeId>("runtime-config");
  const [format, setFormat] = useState<CodeFormat>("typescript");
  const [completeness, setCompleteness] = useState<Completeness>("minimal");
  const [reactStrategy, setReactStrategy] =
    useState<ReactExportStrategy>("shared-runtime");
  const [includeComponentSettings, setIncludeComponentSettings] =
    useState(false);
  const [includeDocumentation, setIncludeDocumentation] = useState(true);
  const [fileName, setFileName] = useState(
    () => projectMeta?.name || runtime.componentId,
  );
  const [assetStrategy, setAssetStrategy] =
    useState<AssetStrategy>("reference");
  const [assetPublicPath, setAssetPublicPath] = useState(
    "/images/project-image.jpg",
  );
  const [preview, setPreview] = useState("");
  const [filename, setFilename] = useState("export.json");
  const [language, setLanguage] = useState("json");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<ExportHistoryEntry[]>(() =>
    loadExportHistory(),
  );
  const [importSummary, setImportSummary] = useState<string | null>(null);

  const doc = useMemo(
    () =>
      createExportDoc({
        kind:
          mode === "project-file"
            ? "project"
            : mode === "preset-file"
              ? "preset"
              : mode === "shareable-scene"
                ? "scene"
                : "runtime",
        runtime,
        project: projectMeta,
        engineVersion: ENGINE_VERSION,
      }),
    [mode, runtime, projectMeta],
  );

  const validation = useMemo(() => validateExportDoc(doc), [doc]);

  const regenerate = useEffectEvent(() => {
    const out = generateExportOutput(doc, {
      mode,
      format,
      completeness,
      reactStrategy,
      includeComponentSettings,
      includeDocumentation,
      fileName,
      assetStrategy,
      assetPublicPath,
    });
    setPreview(out.code);
    setFilename(out.filename);
    setLanguage(out.language);
  });

  useEffect(() => {
    const t = window.setTimeout(() => regenerate(), 320);
    return () => window.clearTimeout(t);
  }, [
    doc,
    mode,
    format,
    completeness,
    reactStrategy,
    includeComponentSettings,
    includeDocumentation,
    fileName,
    assetStrategy,
    assetPublicPath,
  ]);

  const modeMeta = EXPORT_MODE_CATALOG.find((m) => m.id === mode);

  const onCopy = async () => {
    const ok = await copyToClipboard(preview);
    setStatusMsg(ok ? "Copied to clipboard." : "Clipboard unavailable.");
  };

  const onDownload = async () => {
    if (validation.status === "blocked") {
      setStatusMsg("Export blocked — resolve errors first.");
      return;
    }
    if (mode === "component-package") {
      const pkg = buildComponentPackage(doc, {
        reactStrategy,
        completeness,
        includeDocumentation,
        fileName,
      });
      const pkgValidation = validateGeneratedPackage(pkg);
      if (pkgValidation.status === "blocked") {
        setStatusMsg(
          pkgValidation.issues.find((i) => i.severity === "error")?.message ??
            "Package blocked.",
        );
        return;
      }
      const result = await downloadPackageZip(pkg);
      setStatusMsg(result.error ?? "Package downloaded.");
    } else {
      const mime =
        language === "json"
          ? "application/json"
          : language === "css"
            ? "text/css"
            : language === "md"
              ? "text/markdown"
              : "text/plain";
      downloadTextFile(filename, preview, mime);
      setStatusMsg(`Downloaded ${filename}`);
    }
    recordExport({
      name: fileName || filename,
      projectName: projectMeta?.name ?? null,
      componentId: runtime.componentId,
      exportType: mode,
      runtimeJson: JSON.stringify(runtime),
    });
    setHistory(loadExportHistory());
  };

  const onShare = () => {
    const encoded = encodeSceneHash(doc);
    const url = sceneShareUrl(encoded);
    if (url) {
      void copyToClipboard(url);
      setStatusMsg(
        "Portable scene URL copied (local-first — works where this build is hosted). Download .maser-scene.json for offline share.",
      );
    } else {
      downloadTextFile(
        `${fileName || "scene"}.maser-scene.json`,
        preview,
      );
      setStatusMsg(
        "Scene too large for URL — downloaded .maser-scene.json instead (no cloud persistence).",
      );
    }
  };

  const onImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const summary = parseAndMigrateImport(text);
      setImportSummary(
        [
          `Kind: ${summary.kind}`,
          `Schema: ${summary.schemaVersion}`,
          `Component: ${summary.componentId}`,
          `Migrated: ${summary.migrated ? "yes" : "no"}`,
          `Validation: ${summary.validation.status}`,
          ...summary.migrationNotes.map((n) => `• ${n}`),
          ...summary.validation.issues.map(
            (i) => `• [${i.severity}] ${i.message} — ${i.fix}`,
          ),
        ].join("\n"),
      );
      setStatusMsg(
        "Import parsed. Apply from Studio / Project Browser to load into the editor.",
      );
    } catch (err) {
      setImportSummary(null);
      setStatusMsg(err instanceof Error ? err.message : "Import failed.");
    }
  };

  return (
    <div
      className={cn("mde-export-workspace", mobile && "mde-export-workspace--mobile")}
      data-export-step={step}
    >
      <header className="mde-export-workspace__header">
        <div>
          <p className="mde-export-workspace__eyebrow">Export</p>
          <h2>Production transfer</h2>
          <p className="mde-export-workspace__lede">
            Portable components without Lab editor chrome. Engine v{ENGINE_VERSION}.
          </p>
        </div>
        {onClose ? (
          <button type="button" className="mde-btn" onClick={onClose}>
            Close
          </button>
        ) : null}
      </header>

      <nav className="mde-export-steps" aria-label="Export steps">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={cn(
              "mde-export-steps__item",
              step === s.id && "is-active",
            )}
            onClick={() => setStep(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {step === "target" || step === "type" ? (
        <section className="mde-export-section" aria-label="Export type">
          <h3>Choose export type</h3>
          <p className="mde-export-hint">
            Target: <strong>{runtime.componentId}</strong>
            {projectMeta?.name ? ` · ${projectMeta.name}` : ""}
          </p>
          <ul className="mde-export-modes">
            {EXPORT_MODE_CATALOG.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  className={cn(
                    "mde-export-mode",
                    mode === m.id && "is-active",
                  )}
                  onClick={() => {
                    setMode(m.id);
                    setStep("configure");
                  }}
                >
                  <span className="mde-export-mode__label">{m.label}</span>
                  <span className="mde-export-mode__ext">{m.extension}</span>
                  <span className="mde-export-mode__summary">{m.summary}</span>
                  <span className="mde-export-mode__when">When: {m.when}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {step === "configure" ? (
        <section className="mde-export-section" aria-label="Configure export">
          <h3>{modeMeta?.label ?? "Configure"}</h3>
          <p className="mde-export-hint">{modeMeta?.when}</p>
          <label className="mde-field">
            <span>File name</span>
            <input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              autoComplete="off"
            />
          </label>
          {(mode === "runtime-config" ||
            mode === "css-tokens" ||
            mode === "shader-snapshot") && (
            <fieldset className="mde-fieldset">
              <legend>Format</legend>
              {(["typescript", "javascript", "json"] as CodeFormat[]).map(
                (f) => (
                  <label key={f} className="mde-check">
                    <input
                      type="radio"
                      name="format"
                      checked={format === f}
                      onChange={() => setFormat(f)}
                    />
                    {f}
                  </label>
                ),
              )}
            </fieldset>
          )}
          {(mode === "runtime-config" ||
            mode === "react-component" ||
            mode === "component-package") && (
            <fieldset className="mde-fieldset">
              <legend>Completeness</legend>
              {(["minimal", "complete"] as Completeness[]).map((c) => (
                <label key={c} className="mde-check">
                  <input
                    type="radio"
                    name="completeness"
                    checked={completeness === c}
                    onChange={() => setCompleteness(c)}
                  />
                  {c}
                </label>
              ))}
            </fieldset>
          )}
          {(mode === "react-component" || mode === "component-package") && (
            <fieldset className="mde-fieldset">
              <legend>React strategy</legend>
              <label className="mde-check">
                <input
                  type="radio"
                  name="strategy"
                  checked={reactStrategy === "shared-runtime"}
                  onChange={() => setReactStrategy("shared-runtime")}
                />
                Shared runtime (lightweight — recommended for multiple components)
              </label>
              <label className="mde-check">
                <input
                  type="radio"
                  name="strategy"
                  checked={reactStrategy === "standalone"}
                  onChange={() => setReactStrategy("standalone")}
                />
                Standalone bundle (minimum runtime files for one-off transfer)
              </label>
            </fieldset>
          )}
          {mode === "preset-file" ? (
            <label className="mde-check">
              <input
                type="checkbox"
                checked={includeComponentSettings}
                onChange={(e) =>
                  setIncludeComponentSettings(e.target.checked)
                }
              />
              Include component-specific content settings
            </label>
          ) : null}
          {mode === "component-package" ? (
            <label className="mde-check">
              <input
                type="checkbox"
                checked={includeDocumentation}
                onChange={(e) => setIncludeDocumentation(e.target.checked)}
              />
              Include TRANSFER.md / README
            </label>
          ) : null}
          <fieldset className="mde-fieldset">
            <legend>Image assets</legend>
            {(
              [
                "reference",
                "include",
                "placeholder",
                "base64",
              ] as AssetStrategy[]
            ).map((s) => (
              <label key={s} className="mde-check">
                <input
                  type="radio"
                  name="asset"
                  checked={assetStrategy === s}
                  onChange={() => setAssetStrategy(s)}
                />
                {s}
                {s === "base64" ? " (warn: bundle size)" : ""}
              </label>
            ))}
            {assetStrategy === "reference" ? (
              <label className="mde-field">
                <span>Public path</span>
                <input
                  value={assetPublicPath}
                  onChange={(e) => setAssetPublicPath(e.target.value)}
                />
              </label>
            ) : null}
          </fieldset>
          <button
            type="button"
            className="mde-btn mde-btn--primary"
            onClick={() => setStep("validate")}
          >
            Continue to validation
          </button>
        </section>
      ) : null}

      {step === "validate" || step === "export" ? (
        <section className="mde-export-section" aria-label="Validation">
          <h3>Validation</h3>
          <ValidationBadge status={validation.status} />
          <ul className="mde-export-issues">
            {validation.issues.length === 0 ? (
              <li>No issues — ready for production export.</li>
            ) : (
              validation.issues.map((issue) => (
                <li
                  key={issue.code + issue.message}
                  data-severity={issue.severity}
                >
                  <strong>{issue.severity === "error" ? "Blocked" : "Warning"}</strong>
                  : {issue.message}
                  <br />
                  <span className="mde-export-fix">Fix: {issue.fix}</span>
                </li>
              ))
            )}
          </ul>
          {step === "validate" ? (
            <button
              type="button"
              className="mde-btn mde-btn--primary"
              onClick={() => setStep("export")}
              disabled={validation.status === "blocked"}
            >
              Continue to export
            </button>
          ) : null}
        </section>
      ) : null}

      {step === "export" ? (
        <section className="mde-export-section" aria-label="Code preview">
          <div className="mde-export-preview-toolbar">
            <h3>Preview</h3>
            <div className="mde-export-actions">
              <button type="button" className="mde-btn" onClick={() => void onCopy()}>
                Copy
              </button>
              <button
                type="button"
                className="mde-btn mde-btn--primary"
                onClick={() => void onDownload()}
                disabled={validation.status === "blocked"}
              >
                Download
              </button>
              {mode === "shareable-scene" ? (
                <button type="button" className="mde-btn" onClick={onShare}>
                  Share URL
                </button>
              ) : null}
              {onOpenPresentation ? (
                <button
                  type="button"
                  className="mde-btn"
                  onClick={() => onOpenPresentation(doc)}
                >
                  Presentation
                </button>
              ) : null}
            </div>
          </div>
          <p className="mde-export-hint">
            {filename} · {language}
            {mode === "component-package"
              ? ` · ~${Math.round(buildComponentPackage(doc, { reactStrategy, completeness, includeDocumentation, fileName }).estimatedBytes / 1024)}KB text`
              : ""}
          </p>
          <pre className="mde-export-code" tabIndex={0}>
            <code>{preview}</code>
          </pre>
          {statusMsg ? (
            <p className="mde-export-status" role="status">
              {statusMsg}
            </p>
          ) : null}

          <details className="mde-export-import">
            <summary>Import file</summary>
            <p className="mde-export-hint">
              Parse project / preset / runtime JSON safely. Apply via Studio after review.
            </p>
            <input
              type="file"
              accept=".json,.maser-dither.json,.maser-preset.json,.maser-scene.json,application/json"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onImportFile(f);
              }}
            />
            {importSummary ? (
              <pre className="mde-export-code mde-export-code--sm">{importSummary}</pre>
            ) : null}
          </details>

          <details className="mde-export-history">
            <summary>Export history ({history.length})</summary>
            {history.length === 0 ? (
              <p className="mde-export-hint">No exports recorded yet.</p>
            ) : (
              <ul>
                {history.map((h) => (
                  <li key={h.id}>
                    <strong>{h.name}</strong> · {h.exportType} · {h.componentId}{" "}
                    · {new Date(h.createdAt).toLocaleString()}
                    <button
                      type="button"
                      className="mde-btn"
                      onClick={() =>
                        setHistory(removeExportHistoryEntry(h.id))
                      }
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </details>
        </section>
      ) : null}
    </div>
  );
}

function ValidationBadge({
  status,
}: {
  status: "ready" | "warning" | "blocked";
}): ReactNode {
  const label =
    status === "ready" ? "Ready" : status === "warning" ? "Warning" : "Blocked";
  return (
    <p
      className={cn("mde-export-badge", `mde-export-badge--${status}`)}
      role="status"
    >
      {label}
    </p>
  );
}
