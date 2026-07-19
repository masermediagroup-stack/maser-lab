"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DemoControlBar,
  DemoLabBrand,
  DemoViewportFrame,
  LabButton,
  ViewportModeToggle,
} from "@/components/lab/demo-chrome";
import type { ViewportMode } from "@/components/projects/sign-up/summitpath-sign-up/summitpath-sign-up-section";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
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
  const [controlsOpen, setControlsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Desktop: open by default. Mobile: collapsed so the preview stays visible.
  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px)");
    const sync = () => setControlsOpen(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

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
        <DemoControlBar
          className={cn(
            "left-4 right-4 top-4 flex-col items-stretch gap-2",
            controlsOpen &&
              "max-h-[min(70vh,560px)] overflow-y-auto sm:max-h-none",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <DemoLabBrand />
            <LabButton
              type="button"
              variant={controlsOpen ? "accent" : "ghost"}
              onClick={() => setControlsOpen((open) => !open)}
              className="shrink-0"
            >
              {controlsOpen ? "Hide controls" : "Controls"}
            </LabButton>
          </div>

          {controlsOpen ? (
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <ViewportModeToggle mode={viewportMode} onChange={setViewportMode} />
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

                <div className="grid gap-3 rounded-[var(--lab-radius-sm)] border border-[var(--lab-border)] bg-[var(--lab-surface)] p-3 sm:grid-cols-2 lg:grid-cols-3">
                  <ControlField label="Active tab">
                    <Select
                      value={activeId}
                      onValueChange={(value) => {
                        if (value) setActiveId(value);
                      }}
                    >
                      <SelectTrigger
                        size="sm"
                        className="h-8 border-[var(--lab-border)] bg-[var(--lab-bg)] font-mono text-xs text-[var(--lab-text-primary)]"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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
                        className="h-8 border-[var(--lab-border)] bg-[var(--lab-bg)] font-mono text-xs text-[var(--lab-text-primary)]"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (from data)</SelectItem>
                        <SelectItem value="comparison">Force comparison</SelectItem>
                        <SelectItem value="image">Force normal image</SelectItem>
                      </SelectContent>
                    </Select>
                  </ControlField>

                  <ControlField label="Animations enabled">
                    <div className="flex h-8 items-center gap-2">
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

                  <ControlField label={`Panel duration ${panelDurationMs}ms`}>
                    <Slider
                      min={SS_RANGES.panelDurationMs.min}
                      max={SS_RANGES.panelDurationMs.max}
                      step={SS_RANGES.panelDurationMs.step}
                      value={[panelDurationMs]}
                      onValueChange={(value) => {
                        const next = Array.isArray(value) ? value[0] : value;
                        if (typeof next === "number") setPanelDurationMs(next);
                      }}
                      className="py-2"
                    />
                  </ControlField>

                  <ControlField label={`Border radius ${borderRadiusPx}px`}>
                    <Slider
                      min={SS_RANGES.borderRadiusPx.min}
                      max={SS_RANGES.borderRadiusPx.max}
                      step={SS_RANGES.borderRadiusPx.step}
                      value={[borderRadiusPx]}
                      onValueChange={(value) => {
                        const next = Array.isArray(value) ? value[0] : value;
                        if (typeof next === "number") setBorderRadiusPx(next);
                      }}
                      className="py-2"
                    />
                  </ControlField>

                  <ControlField label={`Spacing scale ${spacingScale.toFixed(2)}`}>
                    <Slider
                      min={SS_RANGES.spacingScale.min}
                      max={SS_RANGES.spacingScale.max}
                      step={SS_RANGES.spacingScale.step}
                      value={[spacingScale]}
                      onValueChange={(value) => {
                        const next = Array.isArray(value) ? value[0] : value;
                        if (typeof next === "number") setSpacingScale(next);
                      }}
                      className="py-2"
                    />
                  </ControlField>
                </div>

                <p className="font-mono text-[10px] leading-relaxed text-[var(--lab-text-muted)]">
                  Export: copy the portable files listed in{" "}
                  <code className="text-[var(--lab-text-secondary)]">
                    projects/marketing/service-showcase/TRANSFER.md
                  </code>
                  . Do not ship{" "}
                  <code className="text-[var(--lab-text-secondary)]">
                    service-showcase-demo.tsx
                  </code>
                  .
                </p>
              </div>
            </div>
          ) : (
            <p className="font-mono text-[10px] text-[var(--lab-text-muted)] sm:hidden">
              Controls collapsed — tap Controls to tune the preview.
            </p>
          )}
        </DemoControlBar>
      ) : null}

      <div
        className={cn(
          "flex min-h-screen flex-col items-center px-4 pb-16",
          minimal ? "pt-8" : "pt-[calc(var(--lab-control-bar-bottom,5.5rem)+1rem)]",
        )}
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
