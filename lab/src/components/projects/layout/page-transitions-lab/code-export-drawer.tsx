"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  generateSettingsSummary,
  generateTransitionCode,
} from "./code-generators";
import { copyToClipboard } from "./hooks";
import type { TransitionDefinition, TransitionSettings } from "./types";

type CodeExportDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  definition: TransitionDefinition;
  settings: TransitionSettings;
};

export function CodeExportDrawer({
  open,
  onOpenChange,
  definition,
  settings,
}: CodeExportDrawerProps) {
  const [copied, setCopied] = useState(false);
  const code = generateTransitionCode(definition, settings);

  const handleCopy = async () => {
    const ok = await copyToClipboard(code);
    setCopied(ok);
    if (ok) window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-[var(--ptl-blue)]/25 bg-black text-white sm:max-w-2xl"
      >
        <SheetHeader>
          <SheetTitle className="text-white">{definition.title}</SheetTitle>
          <SheetDescription className="text-white">
            Current settings + starter code.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <section className="space-y-2">
            <h3 className="text-xs font-medium tracking-[0.14em] text-[var(--ptl-blue)] uppercase">
              Settings
            </h3>
            <pre className="overflow-x-auto rounded-lg border border-[var(--ptl-blue)]/20 bg-[#02060a] p-3 text-xs text-white/80">
              {generateSettingsSummary(settings)}
            </pre>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-medium tracking-[0.14em] text-[var(--ptl-blue)] uppercase">
              Dependencies
            </h3>
            <p className="text-sm text-white/70">
              {definition.dependencies.join(", ")}
            </p>
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-medium tracking-[0.14em] text-[var(--ptl-blue)] uppercase">
                Code
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="border-[var(--ptl-blue)]/40 bg-transparent text-white hover:bg-[var(--ptl-blue)]/10"
                onClick={handleCopy}
              >
                <Copy className="size-4" />
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <ScrollArea className="h-[min(52vh,520px)] rounded-lg border border-[var(--ptl-blue)]/20">
              <pre className="p-4 text-xs leading-relaxed whitespace-pre-wrap text-white/85">
                {code}
              </pre>
            </ScrollArea>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
