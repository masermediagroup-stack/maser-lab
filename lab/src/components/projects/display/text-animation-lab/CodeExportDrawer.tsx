"use client";

import { useMemo, useState } from "react";
import {
  generateTetrisExport,
  type TetrisExportTab,
  type TetrisPixelSettings,
} from "@/components/text-animations";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { AnimationDefinition, AnimationSettings, ExportPhase } from "./types";
import {
  generateExportCode,
  generateSettingsSummary,
} from "./code-generators";
import { copyToClipboard } from "./utils";

type CodeExportDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  definition: AnimationDefinition;
  text: string;
  settings: AnimationSettings;
};

const TETRIS_TABS: { id: TetrisExportTab; label: string }[] = [
  { id: "component", label: "Component" },
  { id: "styles", label: "Styles" },
  { id: "usage", label: "Usage" },
  { id: "setup", label: "Setup" },
];

export function CodeExportDrawer({
  open,
  onOpenChange,
  definition,
  text,
  settings,
}: CodeExportDrawerProps) {
  const isTetris = definition.id === "tetris-pixel-text";
  const supportsOut = definition.supportsOutAnimation !== false;
  const [phase, setPhase] = useState<ExportPhase>("in");
  const [tetrisTab, setTetrisTab] = useState<TetrisExportTab>("component");
  const [copied, setCopied] = useState(false);

  const activePhase: ExportPhase = supportsOut ? phase : "in";

  const tetrisBundle = useMemo(() => {
    if (!isTetris) return null;
    return generateTetrisExport(text, settings as unknown as TetrisPixelSettings);
  }, [isTetris, text, settings]);

  const code = isTetris && tetrisBundle
    ? tetrisBundle[tetrisTab]
    : generateExportCode(definition, text, settings, activePhase);

  const summary = isTetris && tetrisBundle
    ? tetrisBundle.summary
    : generateSettingsSummary(settings);

  const handleCopy = async () => {
    const ok = await copyToClipboard(code);
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-white/10 bg-neutral-950 text-white sm:max-w-xl"
      >
        <SheetHeader>
          <SheetTitle className="text-white">{definition.title}</SheetTitle>
          <SheetDescription className="text-neutral-400">
            {isTetris
              ? "Export a self-contained Canvas component with your live seeds and settings."
              : "Export In and Out component usage separately. Lab chrome is excluded."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <section className="space-y-2">
            <h3 className="text-xs font-medium tracking-[0.14em] text-neutral-400 uppercase">
              Current settings
            </h3>
            <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black p-3 text-xs text-neutral-300">
              {summary}
            </pre>
          </section>

          {definition.dependencies?.length ? (
            <section className="space-y-2">
              <h3 className="text-xs font-medium tracking-[0.14em] text-neutral-400 uppercase">
                Dependencies
              </h3>
              <p className="text-sm text-neutral-300">
                {definition.dependencies.join(", ")}
              </p>
            </section>
          ) : null}

          {definition.exportNotes ? (
            <p className="text-sm text-neutral-400">{definition.exportNotes}</p>
          ) : null}

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-medium tracking-[0.14em] text-neutral-400 uppercase">
                {isTetris ? "Export" : "Component usage"}
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="border-white/15 bg-transparent text-white hover:bg-white/5"
                onClick={handleCopy}
              >
                {copied ? "Copied" : "Copy code"}
              </Button>
            </div>

            {isTetris ? (
              <div className="flex flex-wrap gap-2">
                {TETRIS_TABS.map((tab) => (
                  <Button
                    key={tab.id}
                    size="sm"
                    variant={tetrisTab === tab.id ? "default" : "outline"}
                    className={
                      tetrisTab === tab.id
                        ? "bg-white text-black hover:bg-neutral-200"
                        : "border-white/15 bg-transparent text-white hover:bg-white/5"
                    }
                    onClick={() => setTetrisTab(tab.id)}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            ) : supportsOut ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={activePhase === "in" ? "default" : "outline"}
                  className={
                    activePhase === "in"
                      ? "bg-white text-black hover:bg-neutral-200"
                      : "border-white/15 bg-transparent text-white hover:bg-white/5"
                  }
                  onClick={() => setPhase("in")}
                >
                  In animation
                </Button>
                <Button
                  size="sm"
                  variant={activePhase === "out" ? "default" : "outline"}
                  className={
                    activePhase === "out"
                      ? "bg-white text-black hover:bg-neutral-200"
                      : "border-white/15 bg-transparent text-white hover:bg-white/5"
                  }
                  onClick={() => setPhase("out")}
                >
                  Out animation
                </Button>
              </div>
            ) : (
              <p className="text-xs text-neutral-500">
                This effect exports a single entrance snippet.
              </p>
            )}

            <ScrollArea className="h-[min(50vh,420px)] rounded-lg border border-white/10">
              <pre className="p-4 text-xs leading-relaxed whitespace-pre-wrap text-neutral-200">
                {code}
              </pre>
            </ScrollArea>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
