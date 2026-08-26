"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  DemoControlMenu,
  DemoLabBrand,
  DemoViewportFrame,
  LabButton,
  LabControlGroup,
  LabRange,
  ViewportModeToggle,
  type ViewportMode,
} from "@/components/lab/demo-chrome";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DESKTOP_FRAME, MOBILE_FRAME, SS_DEFAULTS, SS_RANGES } from "./constants";
import { SERVICE_ITEMS } from "./data";
import { ServiceShowcase } from "./service-showcase";
import type { ServiceImageMode } from "./types";

type ServiceShowcaseDemoProps = {
  minimal?: boolean;
};

const EXPORT_SNIPPET = `import {
  ServiceShowcase,
  type ServiceItem,
} from "@/components/service-showcase";

const items: ServiceItem[] = [
  // replace with your services
];

export function ServicesSection() {
  return (
    <section>
      <h2>Your section heading</h2>
      <ServiceShowcase items={items} />
    </section>
  );
}`;

export function ServiceShowcaseDemo({ minimal = false }: ServiceShowcaseDemoProps) {
  const [activeId, setActiveId] = useState<string>(SS_DEFAULTS.activeId);
  const [viewportMode, setViewportMode] = useState<ViewportMode>("responsive");
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [imageMode, setImageMode] = useState<ServiceImageMode>("auto");
  const [panelDurationMs, setPanelDurationMs] = useState<number>(
    SS_DEFAULTS.panelDurationMs,
  );
  const [borderRadiusPx, setBorderRadiusPx] = useState<number>(
    SS_DEFAULTS.borderRadiusPx,
  );
  const [spacingScale, setSpacingScale] = useState<number>(
    SS_DEFAULTS.spacingScale,
  );
  const [copied, setCopied] = useState(false);

  const frameSize = useMemo(() => {
    if (viewportMode === "mobile") return MOBILE_FRAME;
    if (viewportMode === "desktop") return DESKTOP_FRAME;
    return null;
  }, [viewportMode]);

  const copyExportSnippet = async () => {
    try {
      await navigator.clipboard.writeText(EXPORT_SNIPPET);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const showcase = (
    <div className="w-full bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6">
        <p className="mb-6 max-w-xl text-sm leading-relaxed text-neutral-500">
          External section heading lives outside the component — only the selector
          and content area below ship for transfer.
        </p>
        <h2 className="mb-8 text-balance text-3xl font-semibold tracking-[-0.03em] text-neutral-900 sm:text-4xl">
          Junk removal for every space
        </h2>
        <ServiceShowcase
          items={SERVICE_ITEMS}
          activeId={activeId}
          onActiveChange={setActiveId}
          animationEnabled={animationEnabled}
          forceReducedMotion={!animationEnabled}
          panelDurationMs={panelDurationMs}
          tabDurationMs={SS_DEFAULTS.tabDurationMs}
          borderRadiusPx={borderRadiusPx}
          spacingScale={spacingScale}
          imageMode={imageMode}
        />
      </div>
    </div>
  );

  return (
    <div className="maser-lab min-h-screen">
      {!minimal ? (
        <DemoControlMenu>
          <DemoLabBrand />
          <ViewportModeToggle mode={viewportMode} onChange={setViewportMode} />
          <div className="flex flex-wrap gap-1.5">
            <LabButton
              type="button"
              variant={animationEnabled ? "ghost" : "accent"}
              onClick={() => setAnimationEnabled((v) => !v)}
            >
              Animations: {animationEnabled ? "on" : "off"}
            </LabButton>
            <LabButton type="button" variant="outline" onClick={copyExportSnippet}>
              {copied ? "Copied export snippet" : "Copy export snippet"}
            </LabButton>
          </div>
          <LabControlGroup label="State">
            <ControlField label="Active tab">
              <Select
                value={activeId}
                onValueChange={(value) => {
                  if (value) setActiveId(value);
                }}
              >
                <SelectTrigger
                  size="sm"
                  className="h-11 border-[var(--lab-border)] bg-[var(--lab-bg)] font-mono text-xs text-[var(--lab-text-primary)] hover:bg-[var(--lab-surface-soft)]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-neutral-950 text-white shadow-lg [--accent:oklch(1_0_0_/_0.16)] [--accent-foreground:oklch(0.98_0_0)]">
                  {SERVICE_ITEMS.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ControlField>
            <ControlField label="Image mode">
              <Select
                value={imageMode}
                onValueChange={(value) => {
                  if (
                    value === "auto" ||
                    value === "comparison" ||
                    value === "image"
                  ) {
                    setImageMode(value);
                  }
                }}
              >
                <SelectTrigger
                  size="sm"
                  className="h-11 border-[var(--lab-border)] bg-[var(--lab-bg)] font-mono text-xs text-[var(--lab-text-primary)] hover:bg-[var(--lab-surface-soft)]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-neutral-950 text-white shadow-lg [--accent:oklch(1_0_0_/_0.16)] [--accent-foreground:oklch(0.98_0_0)]">
                  <SelectItem value="auto">Auto (from data)</SelectItem>
                  <SelectItem value="comparison">Force comparison</SelectItem>
                  <SelectItem value="image">Force normal image</SelectItem>
                </SelectContent>
              </Select>
            </ControlField>
            <ControlField label="Animations enabled">
              <div className="flex h-11 items-center gap-2">
                <Switch
                  checked={animationEnabled}
                  onCheckedChange={setAnimationEnabled}
                  aria-label="Enable animations"
                />
                <span className="font-mono text-xs text-[var(--lab-text-muted)]">
                  {animationEnabled ? "on" : "off"}
                </span>
              </div>
            </ControlField>
          </LabControlGroup>
          <LabControlGroup label="Tuning">
            <LabRange
              id="ss-panel-duration"
              label="Panel duration"
              min={SS_RANGES.panelDurationMs.min}
              max={SS_RANGES.panelDurationMs.max}
              step={SS_RANGES.panelDurationMs.step}
              value={panelDurationMs}
              display={`${panelDurationMs}ms`}
              onChange={setPanelDurationMs}
            />
            <LabRange
              id="ss-radius"
              label="Border radius"
              min={SS_RANGES.borderRadiusPx.min}
              max={SS_RANGES.borderRadiusPx.max}
              step={SS_RANGES.borderRadiusPx.step}
              value={borderRadiusPx}
              display={`${borderRadiusPx}px`}
              onChange={setBorderRadiusPx}
            />
            <LabRange
              id="ss-spacing"
              label="Spacing scale"
              min={SS_RANGES.spacingScale.min}
              max={SS_RANGES.spacingScale.max}
              step={SS_RANGES.spacingScale.step}
              value={spacingScale}
              display={spacingScale.toFixed(2)}
              onChange={setSpacingScale}
            />
          </LabControlGroup>
          <p className="font-mono text-[10px] leading-relaxed text-[var(--lab-text-muted)]">
            Export: copy portable files in{" "}
            <code className="text-[var(--lab-text-secondary)]">
              projects/marketing/service-showcase/TRANSFER.md
            </code>
            . Do not ship the demo.
          </p>
        </DemoControlMenu>
      ) : null}

      <div
        className={
          minimal
            ? "flex min-h-screen flex-col items-center px-4 pb-16 pt-8"
            : "lab-demo-inset flex min-h-screen flex-col items-center px-4 pb-16"
        }
      >
        {viewportMode === "responsive" ? (
          <div className="w-full max-w-6xl overflow-hidden rounded-[28px] border border-[var(--lab-border)] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            {showcase}
          </div>
        ) : frameSize ? (
          <DemoViewportFrame width={frameSize.width} height={frameSize.height}>
            {showcase}
          </DemoViewportFrame>
        ) : null}
      </div>
    </div>
  );
}

function ControlField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--lab-text-muted)]">
        {label}
      </Label>
      {children}
    </div>
  );
}
