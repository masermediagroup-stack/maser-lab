"use client";

import { Instrument_Serif } from "next/font/google";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { CaseIndex } from "./components/case-index";
import { CaseIntake } from "./components/case-intake";
import { CasePresentation } from "./components/case-presentation";
import { BCS_DEFAULTS } from "./constants";
import { BrandCaseConvexProvider } from "./convex-provider";
import { SAMPLE_CASES } from "./data";
import { buildShareSlug, shareUrl } from "./share-slug";
import { createEmptyCaseStudy, normalizeCaseStudy } from "./normalize";
import {
  exportCasesJson,
  importCasesJson,
  loadCaseStore,
  saveCaseStore,
} from "./storage";
import {
  parseCloudCaseData,
  useCloudCaseRecords,
  useCloudCaseSync,
  useCloudCaseStudiesEnabled,
} from "./use-cloud-cases";
import type {
  AppMode,
  BrandCaseStudioAppProps,
  CaseStore,
  CaseStudy,
} from "./types";
import "./tokens.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument-serif",
  display: "swap",
});

type Notice = { kind: "success" | "error"; message: string };

function BrandCaseStudioAppInner({
  initialCases = SAMPLE_CASES,
  forceReducedMotion = false,
  defaultMode = "index",
  className,
}: BrandCaseStudioAppProps) {
  const importRef = useRef<HTMLInputElement>(null);
  const cloudEnabled = useCloudCaseStudiesEnabled();
  const { syncCase, publishCase } = useCloudCaseSync();
  const { records: cloudRecords } = useCloudCaseRecords();
  const cloudMergedRef = useRef(false);
  const [mode, setMode] = useState<AppMode>(defaultMode);
  const [store, setStore] = useState<CaseStore>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CaseStudy>(() => createEmptyCaseStudy());
  const [notice, setNotice] = useState<Notice | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const saved = loadCaseStore();
      if (Object.keys(saved).length > 0) {
        setStore(saved);
      } else {
        setStore(Object.fromEntries(initialCases.map((c) => [c.id, c])));
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [initialCases]);

  useEffect(() => {
    if (!hydrated) return;
    saveCaseStore(store);
  }, [store, hydrated]);

  useEffect(() => {
    if (!hydrated || !cloudEnabled || cloudRecords === undefined || cloudMergedRef.current) {
      return;
    }
    cloudMergedRef.current = true;
    if (cloudRecords.length === 0) return;

    setStore((prev) => {
      const next = { ...prev };
      for (const record of cloudRecords) {
        const parsed = parseCloudCaseData(record.data);
        if (!parsed) continue;
        const local = next[parsed.id];
        if (!local || record.updatedAt > local.updatedAt) {
          next[parsed.id] = normalizeCaseStudy({
            ...parsed,
            shareSlug: record.shareSlug,
            published: record.published,
            cloudSyncedAt: record.updatedAt,
          });
        }
      }
      return next;
    });
  }, [hydrated, cloudEnabled, cloudRecords]);

  const cases = Object.values(store);

  const showNotice = useCallback((next: Notice) => {
    setNotice(next);
    window.setTimeout(() => setNotice(null), 3200);
  }, []);

  const openCreate = () => {
    const empty = createEmptyCaseStudy();
    setDraft(empty);
    setActiveId(empty.id);
    setMode("intake");
  };

  const openEdit = (id: string) => {
    const item = store[id];
    if (!item) return;
    setDraft(structuredClone(item));
    setActiveId(id);
    setMode("intake");
  };

  const openPresent = (id: string) => {
    setActiveId(id);
    setMode("present");
  };

  const persistCase = (study: CaseStudy) => {
    const normalized = normalizeCaseStudy({ ...study, updatedAt: Date.now() });
    setStore((prev) => ({ ...prev, [normalized.id]: normalized }));
    setDraft(normalized);
    return normalized;
  };

  const saveDraft = () => {
    persistCase(draft);
    showNotice({ kind: "success", message: "Case study saved locally." });
  };

  const syncDraftToCloud = async () => {
    const normalized = persistCase(draft);
    const slug = normalized.shareSlug ?? buildShareSlug(normalized.client, normalized.projectTitle, normalized.id);
    try {
      await syncCase({ ...normalized, shareSlug: slug });
      const synced = { ...normalized, shareSlug: slug, cloudSyncedAt: Date.now() };
      setStore((prev) => ({ ...prev, [synced.id]: synced }));
      setDraft(synced);
      showNotice({ kind: "success", message: "Synced to cloud." });
    } catch {
      showNotice({ kind: "error", message: "Cloud sync failed — is Convex running?" });
    }
  };

  const publishActiveCase = async () => {
    const item = activeId ? store[activeId] : null;
    if (!item) return;
    const slug = item.shareSlug ?? buildShareSlug(item.client, item.projectTitle, item.id);
    try {
      await publishCase(item, slug, true);
      const published = {
        ...item,
        shareSlug: slug,
        published: true,
        cloudSyncedAt: Date.now(),
        updatedAt: Date.now(),
      };
      setStore((prev) => ({ ...prev, [published.id]: published }));
      showNotice({ kind: "success", message: "Published — share link is live." });
    } catch {
      showNotice({ kind: "error", message: "Publish failed — sync to cloud first." });
    }
  };

  const copyShareLink = async () => {
    const item = activeId ? store[activeId] : null;
    if (!item?.shareSlug) return;
    try {
      await navigator.clipboard.writeText(shareUrl(item.shareSlug));
      showNotice({ kind: "success", message: "Share link copied." });
    } catch {
      showNotice({ kind: "error", message: "Could not copy link." });
    }
  };

  const exportPdf = () => {
    document.body.classList.add("bcs-printing");
    window.print();
    window.setTimeout(() => document.body.classList.remove("bcs-printing"), 500);
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const imported = importCasesJson(text);
      const next: CaseStore = { ...store };
      for (const item of imported) {
        next[item.id] = normalizeCaseStudy(item);
      }
      setStore(next);
      showNotice({
        kind: "success",
        message: `Imported ${imported.length} case ${imported.length === 1 ? "study" : "studies"}.`,
      });
    } catch {
      showNotice({ kind: "error", message: "Import failed — check JSON format." });
    }
  };

  const handleExport = () => {
    const blob = new Blob([exportCasesJson(store)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "brand-case-studies.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const style = {
    "--bcs-space-scale": String(BCS_DEFAULTS.spacingScale),
  } as CSSProperties;

  const activeCase = activeId ? store[activeId] : null;
  const normalizedActive = activeCase ? normalizeCaseStudy(activeCase) : null;
  const activeShareUrl =
    activeCase?.shareSlug && activeCase.published ? shareUrl(activeCase.shareSlug) : null;

  if (!hydrated) {
    return (
      <div
        className={cn("brand-case-studio min-h-screen", instrumentSerif.variable, className)}
        style={style}
        aria-busy="true"
        aria-label="Loading case studies"
      />
    );
  }

  return (
    <div
      className={cn("brand-case-studio min-h-screen", instrumentSerif.variable, className)}
      style={style}
      data-reduced-motion={forceReducedMotion ? "true" : undefined}
    >
      <input
        ref={importRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleImportFile(file);
          e.target.value = "";
        }}
      />

      {notice && mode !== "intake" ? (
        <p
          className={`bcs-no-print fixed bottom-4 left-1/2 z-50 -translate-x-1/2 bcs-notice shadow-lg ${
            notice.kind === "success" ? "bcs-notice--success" : "bcs-notice--error"
          }`}
          role="status"
        >
          {notice.message}
        </p>
      ) : null}

      {mode === "index" ? (
        <>
          <CaseIndex
            cases={cases}
            cloudEnabled={cloudEnabled}
            onCreate={openCreate}
            onEdit={openEdit}
            onPresent={openPresent}
            onImport={() => importRef.current?.click()}
          />
          {cases.length > 0 ? (
            <div className="mx-auto max-w-5xl px-[var(--bcs-pad)] pb-12">
              <button type="button" className="bcs-btn" onClick={handleExport}>
                Export all as JSON
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {mode === "intake" ? (
        <CaseIntake
          draft={draft}
          onChange={setDraft}
          onSave={saveDraft}
          onSyncCloud={cloudEnabled ? syncDraftToCloud : undefined}
          onCancel={() => setMode("index")}
          onPreview={() => {
            persistCase(draft);
            setActiveId(draft.id);
            setMode("present");
          }}
          notice={notice}
        />
      ) : null}

      {mode === "present" && normalizedActive ? (
        <CasePresentation
          study={normalizedActive}
          onBack={() => setMode("index")}
          onEdit={() => openEdit(normalizedActive.id)}
          shareUrl={activeShareUrl}
          onPublish={cloudEnabled ? publishActiveCase : undefined}
          onCopyShareLink={activeShareUrl ? copyShareLink : undefined}
          onExportPdf={exportPdf}
          reducedMotion={forceReducedMotion}
        />
      ) : null}
    </div>
  );
}

export function BrandCaseStudioApp(props: BrandCaseStudioAppProps) {
  return (
    <BrandCaseConvexProvider>
      <BrandCaseStudioAppInner {...props} />
    </BrandCaseConvexProvider>
  );
}
