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
  "aria-label": ariaLabel,
  "aria-pressed": ariaPressed,
  "aria-expanded": ariaExpanded,
  "aria-controls": ariaControls,
}: LabButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      className={cn(
        "min-h-11 shrink-0 whitespace-nowrap rounded-[var(--lab-radius-sm)] border px-3 py-2 font-mono text-sm transition-[color,background-color,box-shadow,transform] duration-150 max-sm:px-2.5 max-sm:text-xs",
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
            "rounded px-2 py-1 font-mono text-xs transition-colors",
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

    const syncOffset = () => {
      const bottom = node.getBoundingClientRect().bottom;
      document.documentElement.style.setProperty(
        "--lab-control-bar-bottom",
        `${bottom + 12}px`,
      );
    };

    syncOffset();
    const observer = new ResizeObserver(syncOffset);
    observer.observe(node);
    window.addEventListener("resize", syncOffset);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncOffset);
      document.documentElement.style.removeProperty("--lab-control-bar-bottom");
    };
  }, []);

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Demo controls"
      className={cn(
        "demo-control-bar fixed z-[60] flex flex-wrap items-center gap-3 rounded-[var(--lab-radius-md)] border border-[var(--lab-border)] bg-[rgba(10,10,11,0.88)] p-2 backdrop-blur-md max-sm:gap-1.5 max-sm:p-1.5",
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

/** Collapsible demo controls — hamburger toggle, panel holds LabButton groups. */
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
        "left-2 top-2 w-[min(20.5rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] flex-col items-stretch sm:left-4 sm:top-4",
        !open && "w-max gap-0 p-1.5",
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
          className="flex max-h-[min(72vh,34rem)] flex-col gap-1.5 overflow-y-auto overscroll-contain"
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
        className="summitpath-signup-viewport-frame mx-auto"
        style={{
          width: width * scale,
          height: height * scale,
        }}
      >
        <div
          className="summitpath-signup-viewport-scaler"
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
