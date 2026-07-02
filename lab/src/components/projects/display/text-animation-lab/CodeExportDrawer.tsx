"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { AnimationDefinition, AnimationSettings } from "./types";
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

export function CodeExportDrawer({
  open,
  onOpenChange,
  definition,
  text,
  settings,
}: CodeExportDrawerProps) {
  const [copied, setCopied] = useState(false);
  const code = generateExportCode(definition, text, settings);
  const summary = generateSettingsSummary(settings);

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
            Export component usage with current settings. Lab chrome is excluded.
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

          <section className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-medium tracking-[0.14em] text-neutral-400 uppercase">
                Component usage
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
