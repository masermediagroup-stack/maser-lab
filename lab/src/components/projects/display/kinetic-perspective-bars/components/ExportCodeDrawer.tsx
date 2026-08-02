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
import type { KineticBarsParams } from "../types/kinetic-bars";
import {
  generateExportCode,
  generateInstallCommand,
  generateSettingsSummary,
} from "../lib/exportTemplate";

type ExportCodeDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  params: KineticBarsParams;
};

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function ExportCodeDrawer({
  open,
  onOpenChange,
  params,
}: ExportCodeDrawerProps) {
  const [copied, setCopied] = useState(false);
  const code = generateExportCode(params);
  const summary = generateSettingsSummary(params);
  const install = generateInstallCommand();

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
          <SheetTitle className="text-white">Export code</SheetTitle>
          <SheetDescription className="text-neutral-400">
            React Three Fiber scene with your current control values. Lab chrome
            is excluded.
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

          <section className="space-y-2">
            <h3 className="text-xs font-medium tracking-[0.14em] text-neutral-400 uppercase">
              Install
            </h3>
            <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black p-3 text-xs text-neutral-300">
              {install}
            </pre>
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-medium tracking-[0.14em] text-neutral-400 uppercase">
                Component
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
