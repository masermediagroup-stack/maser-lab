"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  EXPORT_TABS,
  generateExport,
  generatePresetJson,
  generatePresetTs,
  type ExportTab,
} from "../lib/code-generators";
import type { TornTransitionSettings } from "../lib/transition-types";
import { copyToClipboard, downloadFile } from "../lib/transition-utils";

type ExportPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: TornTransitionSettings;
  presetName: string;
  shareUrl: string;
  onResetToPreset: () => void;
  onSaveCustomPreset: (name: string) => void;
};

export function TransitionExportPanel({
  open,
  onOpenChange,
  settings,
  presetName,
  shareUrl,
  onResetToPreset,
  onSaveCustomPreset,
}: ExportPanelProps) {
  const [tab, setTab] = useState<ExportTab>("provider");
  const [copied, setCopied] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(null), 1800);
    return () => clearTimeout(id);
  }, [copied]);

  const { code, filename } = generateExport(tab, settings, presetName);

  const copy = async (label: string, text: string) => {
    const ok = await copyToClipboard(text);
    setCopied(ok ? label : "failed");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="tgt-sheet">
        <SheetHeader>
          <SheetTitle className="text-white">Export</SheetTitle>
          <SheetDescription className="text-neutral-400">
            Every snippet below is generated from the controls you are looking
            at right now — no placeholder values.
          </SheetDescription>
        </SheetHeader>

        <div className="tgt-export">
          <div className="tgt-export__tabs" role="tablist" aria-label="Export target">
            {EXPORT_TABS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={tab === entry.id}
                className="tgt-export__tab"
                onClick={() => setTab(entry.id)}
              >
                {entry.label}
              </button>
            ))}
          </div>

          <ScrollArea className="tgt-export__scroll">
            <pre className="tgt-export__code">
              <code>{code}</code>
            </pre>
          </ScrollArea>

          <div className="tgt-export__actions">
            <Button size="sm" onClick={() => copy("code", code)}>
              {copied === "code" ? "Copied" : "Copy code"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadFile(filename, code, "text/plain")}
            >
              Download file
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                copy("ts", generatePresetTs(presetName, settings))
              }
            >
              {copied === "ts" ? "Copied" : "Preset as TS"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                copy("json", generatePresetJson(presetName, settings))
              }
            >
              {copied === "json" ? "Copied" : "Preset as JSON"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                downloadFile(
                  "torn-preset.json",
                  generatePresetJson(presetName, settings),
                )
              }
            >
              Download config
            </Button>
            <Button size="sm" variant="outline" onClick={() => copy("url", shareUrl)}>
              {copied === "url" ? "Copied" : "Copy share URL"}
            </Button>
            <Button size="sm" variant="ghost" onClick={onResetToPreset}>
              Reset to preset defaults
            </Button>
          </div>

          <form
            className="tgt-export__save"
            onSubmit={(event) => {
              event.preventDefault();
              const name = customName.trim();
              if (!name) return;
              onSaveCustomPreset(name);
              setCustomName("");
            }}
          >
            <Label htmlFor="tgt-custom-name" className="tgt-control__label">
              Save current settings as a preset
            </Label>
            <div className="tgt-export__save-row">
              <Input
                id="tgt-custom-name"
                value={customName}
                onChange={(event) => setCustomName(event.target.value)}
                placeholder="Preset name"
                className="tgt-input"
              />
              <Button size="sm" type="submit" variant="outline">
                Save
              </Button>
            </div>
            <p className="tgt-control__hint">
              Saved presets live in this browser only. Use “Preset as TS” to
              commit one to the codebase.
            </p>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
