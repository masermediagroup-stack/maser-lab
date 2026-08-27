"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Shared demo viewport modes — keep out of product project slugs (rule/project-isolation). */
export type ViewportMode = "desktop" | "mobile" | "responsive";

type DemoBackButtonProps = {
  className?: string;
};

export function DemoBackButton({ className }: DemoBackButtonProps) {
  return (
    <Link href="/" className={className}>
      <LabButton variant="ghost">← Lab</LabButton>
    </Link>
  );
}

type DemoLabBrandProps = {
  className?: string;
};

export function DemoLabBrand({ className }: DemoLabBrandProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <DemoBackButton />
      <Image
        src="/brand/masermedia-logo-bold-blue.png"
        alt="MaserMedia"
        width={120}
        height={28}
        className="hidden h-7 w-auto sm:block"
      />
    </div>
  );
}

type LabButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: "ghost" | "accent" | "outline";
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-pressed"?: boolean;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
};

export function LabButton({
  children,
  className,
  variant = "ghost",
  type = "button",
  onClick,
  disabled,
  "aria-label": ariaLabel,
  "aria-pressed": ariaPressed,
  "aria-expanded": ariaExpanded,
  "aria-controls": ariaControls,
}: LabButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      className={cn(
        "min-h-11 shrink-0 whitespace-nowrap rounded-[var(--lab-radius-sm)] border px-3 py-2 font-mono text-sm transition-[color,background-color,box-shadow,transform] duration-150 max-sm:px-2.5 max-sm:text-xs disabled:cursor-not-allowed disabled:opacity-50",
        variant === "ghost" &&
          "border-[var(--lab-border)] bg-[var(--lab-surface)] text-[var(--lab-text-primary)] hover:bg-[rgba(16,164,255,0.08)] hover:text-[var(--lab-accent-primary)]",
        variant === "accent" &&
          "border-[var(--lab-accent-primary)] bg-[rgba(16,164,255,0.12)] text-[var(--lab-accent-primary)]",
        variant === "outline" &&
          "border-[var(--lab-border-strong)] bg-transparent text-[var(--lab-text-secondary)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--lab-text-primary)]",
        className,
      )}
    >
      {children}
    </button>
  );
}

type ReducedMotionToggleProps = {
  enabled: boolean;
  onToggle: () => void;
  className?: string;
};

type LabRangeProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
  className?: string;
};

/** Shared demo range — 44px hit target, mono type. Use only in demo chrome. */
export function LabRange({
  id,
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
  className,
}: LabRangeProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <div className="flex items-baseline justify-between gap-2 font-mono text-xs text-[var(--lab-text-secondary)]">
        <label htmlFor={id}>{label}</label>
        <span className="tabular-nums text-[var(--lab-text-muted)]">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-11 w-full min-w-0 accent-[var(--lab-accent-primary)]"
      />
    </div>
  );
}

type LabColorProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function LabColor({ id, label, value, onChange, className }: LabColorProps) {
  return (
    <div className={cn("flex min-h-11 items-center justify-between gap-2", className)}>
      <label htmlFor={id} className="font-mono text-xs text-[var(--lab-text-secondary)]">
        {label}
      </label>
      <input
        id={id}
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-11 shrink-0 cursor-pointer rounded-[var(--lab-radius-sm)] border border-[var(--lab-border)] bg-[var(--lab-surface)] p-1"
      />
    </div>
  );
}

type LabSelectProps = {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
};

export function LabSelect({
  id,
  label,
  value,
  options,
  onChange,
  className,
}: LabSelectProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <label htmlFor={id} className="font-mono text-xs text-[var(--lab-text-secondary)]">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full rounded-[var(--lab-radius-sm)] border border-[var(--lab-border)] bg-[var(--lab-surface)] px-2 font-mono text-xs text-[var(--lab-text-primary)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type LabControlGroupProps = {
  label?: string;
  children: ReactNode;
  className?: string;
};

export function LabControlGroup({ label, children, className }: LabControlGroupProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-t border-[var(--lab-border)] pt-2",
        className,
      )}
      role="group"
      aria-label={label}
    >
      {label ? (
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--lab-text-muted)]">
          {label}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export function ReducedMotionToggle({
  enabled,
  onToggle,
  className,
}: ReducedMotionToggleProps) {
  return (
    <LabButton
      type="button"
      variant={enabled ? "accent" : "ghost"}
      onClick={onToggle}
      className={className}
      aria-label="Toggle reduced motion"
      aria-pressed={enabled}
    >
      <span className="sm:hidden">RM: {enabled ? "on" : "off"}</span>
      <span className="hidden sm:inline">
        Reduced motion: {enabled ? "on" : "off"}
      </span>
    </LabButton>
  );
}

type ViewportModeToggleProps = {
  mode: ViewportMode;
  onChange: (mode: ViewportMode) => void;
  className?: string;
};

const VIEWPORT_OPTIONS: { id: ViewportMode; label: string }[] = [
  { id: "desktop", label: "Desktop 1920" },
  { id: "mobile", label: "Mobile 452" },
  { id: "responsive", label: "Responsive" },
];

export function ViewportModeToggle({ mode, onChange, className }: ViewportModeToggleProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-[var(--lab-radius-sm)] border border-[var(--lab-border)] bg-[var(--lab-surface)] p-1",
        className,
      )}
      role="group"
      aria-label="Viewport frame mode"
    >
      {VIEWPORT_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "min-h-11 rounded px-2 py-1 font-mono text-xs transition-colors",
            mode === option.id
              ? "bg-[rgba(16,164,255,0.15)] text-[var(--lab-accent-primary)]"
              : "text-[var(--lab-text-muted)] hover:text-[var(--lab-text-secondary)]",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

type DemoControlBarProps = {
  className?: string;
  children: ReactNode;
};

export function DemoControlBar({ className, children }: DemoControlBarProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const root = document.documentElement;

    const syncOffset = () => {
      const rect = node.getBoundingClientRect();
      const open = node.classList.contains("lab-dock-open");
      /* Write onto .maser-lab — that node owns the tokens. html inline vars
         are overwritten by `.maser-lab { --lab-control-dock-top: 0 }`. */
      const tokenRoot: HTMLElement =
        node.closest<HTMLElement>(".maser-lab") ?? root;
      /* Axis is the sm breakpoint — never infer left-rail from height.
         42dvh can exceed 55% of innerHeight, which used to pin dock-left to
         the full strip width and dock-top to 0 (sheet over the product). */
      const desktopRail = window.matchMedia("(min-width: 640px)").matches;
      const leftDock = open && desktopRail ? Math.round(rect.width) : 0;
      const bottomDock = open && !desktopRail ? Math.round(rect.height) : 0;
      /* Desktop collapsed chip sits top-left — pad copy below it.
         Mobile product leads; knobs are a footer — do not pad the top. */
      const typeOffset =
        desktopRail && leftDock === 0 && bottomDock === 0
          ? Math.round(rect.bottom + 12)
          : 12;

      tokenRoot.style.setProperty("--lab-control-bar-bottom", `${bottomDock || typeOffset}px`);
      tokenRoot.style.setProperty("--lab-control-type-offset", `${typeOffset}px`);
      /* Only pin measured dock size. If measurement is 0 while open, leave
         the CSS :has() fallback so the field is not under a sheet. */
      if (leftDock > 0) {
        tokenRoot.style.setProperty("--lab-control-dock-left", `${leftDock}px`);
        tokenRoot.style.setProperty("--lab-control-dock-top", "0px");
        tokenRoot.style.setProperty("--lab-control-dock-bottom", "0px");
      } else if (bottomDock > 0) {
        tokenRoot.style.setProperty("--lab-control-dock-left", "0px");
        tokenRoot.style.setProperty("--lab-control-dock-top", "0px");
        tokenRoot.style.setProperty("--lab-control-dock-bottom", `${bottomDock}px`);
      } else {
        tokenRoot.style.removeProperty("--lab-control-dock-left");
        tokenRoot.style.removeProperty("--lab-control-dock-top");
        tokenRoot.style.removeProperty("--lab-control-dock-bottom");
      }
    };

    syncOffset();
    const observer = new ResizeObserver(syncOffset);
    observer.observe(node);
    const railQuery = window.matchMedia("(min-width: 640px)");
    railQuery.addEventListener("change", syncOffset);
    window.addEventListener("resize", syncOffset);

    return () => {
      observer.disconnect();
      railQuery.removeEventListener("change", syncOffset);
      window.removeEventListener("resize", syncOffset);
      const tokenRoot: HTMLElement =
        node.closest<HTMLElement>(".maser-lab") ?? root;
      tokenRoot.style.removeProperty("--lab-control-bar-bottom");
      tokenRoot.style.removeProperty("--lab-control-type-offset");
      tokenRoot.style.removeProperty("--lab-control-dock-left");
      tokenRoot.style.removeProperty("--lab-control-dock-top");
      tokenRoot.style.removeProperty("--lab-control-dock-bottom");
    };
  }, []);

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Demo controls"
      className={cn(
        /* Opaque strip — never a glass overlay/scrim over the product field. */
        "demo-control-bar fixed z-[60] flex flex-wrap items-center gap-3 rounded-[var(--lab-radius-md)] border border-[var(--lab-border)] bg-[var(--lab-bg)] p-2 max-sm:gap-1.5 max-sm:p-1.5 max-sm:max-h-[min(42dvh,22rem)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function DemoMenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-4 w-4 shrink-0" aria-hidden>
      <span
        className={cn(
          "absolute left-0 block h-0.5 w-4 rounded-full bg-current transition-[transform,top] duration-150 motion-reduce:transition-none",
          open ? "top-1.5 rotate-45" : "top-0",
        )}
      />
      <span
        className={cn(
          "absolute left-0 top-1.5 block h-0.5 w-4 rounded-full bg-current transition-opacity duration-150 motion-reduce:transition-none",
          open && "opacity-0",
        )}
      />
      <span
        className={cn(
          "absolute left-0 block h-0.5 w-4 rounded-full bg-current transition-[transform,top] duration-150 motion-reduce:transition-none",
          open ? "top-1.5 -rotate-45" : "top-3",
        )}
      />
    </span>
  );
}

type DemoControlMenuProps = {
  className?: string;
  children: ReactNode;
  /** When false (default), only the menu toggle shows until opened. */
  defaultOpen?: boolean;
};

/** Collapsible demo controls. Collapsed: small toggle. Open: viewport-edge dock
 *  (footer strip on small screens, left rail from sm up) — opaque strip, not a
 *  dimming overlay or mobile sheet over the product. Product leads on mobile. */
export function DemoControlMenu({
  className,
  children,
  defaultOpen = false,
}: DemoControlMenuProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <DemoControlBar
      className={cn(
        "flex-col items-stretch",
        open
          ? [
              "lab-dock-open flex-nowrap overflow-hidden left-0 right-0 bottom-0 top-auto max-h-[min(42dvh,22rem)] w-full max-w-none rounded-none border-x-0 border-b-0 p-3",
              "sm:top-0 sm:bottom-auto sm:h-dvh sm:max-h-none sm:w-[min(20.5rem,38vw)] sm:max-w-[20.5rem] sm:rounded-none sm:border-b-0 sm:border-l-0 sm:border-r sm:border-t-0",
            ]
          : "left-2 top-2 w-max max-w-none gap-0 p-1.5 sm:left-4 sm:top-4",
        className,
      )}
    >
      <LabButton
        type="button"
        variant="ghost"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close demo menu" : "Open demo menu"}
        onClick={() => setOpen((value) => !value)}
        className="self-start px-2.5"
      >
        <DemoMenuIcon open={open} />
      </LabButton>
      {open ? (
        <div
          id={panelId}
          className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain"
        >
          {children}
        </div>
      ) : null}
    </DemoControlBar>
  );
}

type DemoViewportFrameProps = {
  width: number;
  height: number;
  children: ReactNode;
  className?: string;
};

export function DemoViewportFrame({
  width,
  height,
  children,
  className,
}: DemoViewportFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateScale = () => {
      const available = node.clientWidth;
      const next = Math.min(1, available / width);
      setScale(next);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(node);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div ref={containerRef} className={cn("w-full max-w-full", className)}>
      <div
        className="lab-viewport-frame mx-auto"
        style={{
          width: width * scale,
          height: height * scale,
        }}
      >
        <div
          className="lab-viewport-scaler"
          style={{
            width,
            height,
            transform: `scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>
      <p className="lab-muted mt-3 text-center font-mono text-xs">
        Frame {width}×{height} · scale {(scale * 100).toFixed(0)}%
      </p>
    </div>
  );
}

/** @deprecated Use LabButton in Maser-Lab demos */
export function LegacyDemoBackButton({ className }: DemoBackButtonProps) {
  return (
    <Link href="/" className={className}>
      <Button variant="outline" size="lg" className="text-base font-mono">
        ← Lab
      </Button>
    </Link>
  );
}
