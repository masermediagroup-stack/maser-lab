"use client";

import { Instrument_Serif } from "next/font/google";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { CaseIndex } from "./components/case-index";
import { CaseIntake } from "./components/case-intake";
import { CasePresentation } from "./components/case-presentation";
import { BCS_DEFAULTS } from "./constants";
import { SAMPLE_CASES } from "./data";
import { createEmptyCaseStudy, normalizeCaseStudy } from "./normalize";
import {
  exportCasesJson,
  importCasesJson,
  loadCaseStore,
  saveCaseStore,
} from "./storage";
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

export function BrandCaseStudioApp({
  initialCases = SAMPLE_CASES,
  forceReducedMotion = false,
  defaultMode = "index",
  className,
}: BrandCaseStudioAppProps) {
  const importRef = useRef<HTMLInputElement>(null);
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

  const saveDraft = () => {
    const normalized = normalizeCaseStudy({ ...draft, updatedAt: Date.now() });
    setStore((prev) => ({ ...prev, [normalized.id]: normalized }));
    setDraft(normalized);
    showNotice({ kind: "success", message: "Case study saved." });
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

      {mode === "index" ? (
        <>
          <CaseIndex
            cases={cases}
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
          onCancel={() => setMode("index")}
          onPreview={() => {
            saveDraft();
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
          reducedMotion={forceReducedMotion}
        />
      ) : null}
    </div>
  );
}
