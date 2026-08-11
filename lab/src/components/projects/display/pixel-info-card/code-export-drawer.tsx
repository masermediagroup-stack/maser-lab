"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { PixelInfoTheme, PixelInfoTuning } from "./types";

type CodeExportDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: PixelInfoTheme;
  tuning: PixelInfoTuning;
  title: string;
  body: string;
};

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function generateUsage(
  theme: PixelInfoTheme,
  tuning: PixelInfoTuning,
  title: string,
  body: string,
): string {
  const escaped = body.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
  return `import { PixelInfoCard } from "@/components/projects/display/pixel-info-card";

export function Example() {
  return (
    <PixelInfoCard
      theme="${theme}"
      title="${title}"
      body={\`${escaped}\`}
      tuning={{
        pixelSize: ${tuning.pixelSize},
        snakeDensity: ${tuning.snakeDensity},
        assembleMs: ${tuning.assembleMs},
        dissipateMs: ${tuning.dissipateMs},
        cardRadius: ${tuning.cardRadius},
      }}
    />
  );
}
`;
}

function generateSettingsSummary(
  theme: PixelInfoTheme,
  tuning: PixelInfoTuning,
): string {
  return [
    `theme: ${theme}`,
    `pixelSize: ${tuning.pixelSize}`,
    `snakeDensity: ${tuning.snakeDensity}`,
    `assembleMs: ${tuning.assembleMs}`,
    `dissipateMs: ${tuning.dissipateMs}`,
    `cardRadius: ${tuning.cardRadius}`,
  ].join("\n");
}

export function CodeExportDrawer({
  open,
  onOpenChange,
  theme,
  tuning,
  title,
  body,
}: CodeExportDrawerProps) {
  const [copied, setCopied] = useState(false);
  const code = generateUsage(theme, tuning, title, body);

  const handleCopy = async () => {
    const ok = await copyToClipboard(code);
    setCopied(ok);
    if (ok) window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto overscroll-contain border-[rgba(16,164,255,0.25)] bg-black text-white sm:max-w-2xl"
      >
        <SheetHeader className="sticky top-0 z-10 border-b border-[rgba(16,164,255,0.15)] bg-black/95 backdrop-blur-sm">
          <SheetTitle className="text-white">Pixel Info Card</SheetTitle>
          <SheetDescription className="text-white/80">
            Current settings + starter usage.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4 pt-5 pb-[max(2.5rem,calc(env(safe-area-inset-bottom,0px)+5.5rem))]">
          <section className="space-y-2">
            <h3 className="text-xs font-medium tracking-[0.14em] text-[#10a4ff] uppercase">
              Settings
            </h3>
            <pre className="overflow-x-auto rounded-lg border border-[rgba(16,164,255,0.2)] bg-[#02060a] p-3 text-xs text-white/80">
              {generateSettingsSummary(theme, tuning)}
            </pre>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-medium tracking-[0.14em] text-[#10a4ff] uppercase">
              Dependencies
            </h3>
            <p className="text-sm text-white/70">lucide-react</p>
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-medium tracking-[0.14em] text-[#10a4ff] uppercase">
                Code
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="border-[rgba(16,164,255,0.4)] bg-transparent text-white hover:bg-[rgba(16,164,255,0.1)]"
                onClick={handleCopy}
              >
                <Copy className="size-4" />
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <pre className="overflow-x-auto rounded-lg border border-[rgba(16,164,255,0.2)] bg-[#02060a] p-4 text-xs leading-relaxed whitespace-pre-wrap text-white/85">
              {code}
            </pre>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
