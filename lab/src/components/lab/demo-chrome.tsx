"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared demo viewport modes — keep out of product project slugs (rule/project-isolation). */
export type ViewportMode = "desktop" | "mobile" | "responsive";

const LAB_EASE = "cubic-bezier(0.2, 0, 0, 1)";

function asSectionTitle(label: string): string {
  const trimmed = label.trim();
  if (trimmed.length === 0) return trimmed;
  const letters = trimmed.replace(/[^A-Za-z]/g, "");
  const isAllCaps =
    letters.length > 0 && letters === letters.toUpperCase();
  if (!isAllCaps) return trimmed;
  return trimmed
    .split(/(\s+|\/)/)
    .map((part) => {
      if (!/[A-Za-z]/.test(part)) return part;
      return part.charAt(0) + part.slice(1).toLowerCase();
    })
    .join("");
}

function cumulativeAncestorScale(node: HTMLElement): number {
  let scale = 1;
  let el: HTMLElement | null = node.parentElement;
  while (el) {
    const transform = getComputedStyle(el).transform;
    if (transform && transform !== "none") {
      const matrix = new DOMMatrixReadOnly(transform);
      scale *= Math.hypot(matrix.a, matrix.b);
    }
    el = el.parentElement;
  }
  return scale;
}

type DemoBackButtonProps = {
  className?: string;
};

export function DemoBackButton({ className }: DemoBackButtonProps) {
  return (
    <Link href="/" className={cn("lab-back-link lab-type-label", className)}>
      Lab
    </Link>
  );
}

type DemoLabBrandProps = {
  className?: string;
};

export function DemoLabBrand({ className }: DemoLabBrandProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
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
        "lab-chrome-btn lab-type-label min-h-11 shrink-0 whitespace-nowrap border px-[12px] py-[12px] disabled:cursor-not-allowed disabled:opacity-40",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lab-focus)]",
        variant === "ghost" &&
          "border-[var(--lab-border)] bg-[var(--lab-surface)] text-[var(--lab-text-primary)]",
        variant === "accent" &&
          "border-[var(--lab-border-strong)] bg-[var(--lab-bg-elevated)] text-[var(--lab-text-primary)]",
        variant === "outline" &&
          "border-[var(--lab-border-strong)] bg-transparent text-[var(--lab-text-secondary)]",
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

/** Shared demo range — 44px hit target. Use only in demo chrome. */
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
    <div className={cn("lab-chrome-control flex min-w-0 flex-col gap-1", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="lab-type-label text-[var(--lab-text-primary)]">
          {label}
        </label>
        <span className="lab-type-value text-[var(--lab-text-muted)]">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="lab-range-input h-11 w-full min-w-0"
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
    <div
      className={cn(
        "lab-chrome-control flex min-h-11 items-center justify-between gap-2",
        className,
      )}
    >
      <label htmlFor={id} className="lab-type-label text-[var(--lab-text-primary)]">
        {label}
      </label>
      <input
        id={id}
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-11 shrink-0 cursor-pointer rounded-[6px] border border-[var(--lab-border)] bg-[var(--lab-surface)] p-1"
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
    <div className={cn("lab-chrome-control flex min-w-0 flex-col gap-1", className)}>
      <label htmlFor={id} className="lab-type-label text-[var(--lab-text-primary)]">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="lab-type-label min-h-11 w-full rounded-[6px] border border-[var(--lab-border)] bg-[var(--lab-surface)] px-[12px] text-[var(--lab-text-primary)]"
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
  const title = label ? asSectionTitle(label) : undefined;
  return (
    <div
      className={cn("flex flex-col gap-3 pt-3", className)}
      role="group"
      aria-label={title}
    >
      {title ? (
        <p className="lab-type-section text-[var(--lab-text-secondary)]">{title}</p>
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
      Reduce motion
    </LabButton>
  );
}

type ViewportModeToggleProps = {
  mode: ViewportMode;
  onChange: (mode: ViewportMode) => void;
  className?: string;
};

const VIEWPORT_OPTIONS: {
  id: ViewportMode;
  label: string;
  ariaLabel: string;
}[] = [
  { id: "desktop", label: "Desktop", ariaLabel: "Desktop, 1920 pixels wide" },
  { id: "mobile", label: "Phone", ariaLabel: "Phone, 452 pixels wide" },
  { id: "responsive", label: "Live", ariaLabel: "Live, responsive" },
];

export function ViewportModeToggle({ mode, onChange, className }: ViewportModeToggleProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-[6px] border border-[var(--lab-border)] bg-[var(--lab-surface)] p-[4px]",
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
          aria-label={option.ariaLabel}
          aria-pressed={mode === option.id}
          className={cn(
            "lab-chrome-seg lab-type-label min-h-11 rounded-[6px] px-[12px] py-[8px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lab-focus)]",
            mode === option.id
              ? "border border-[var(--lab-border-strong)] bg-[var(--lab-bg-elevated)] text-[var(--lab-text-primary)]"
              : "border border-transparent text-[var(--lab-text-muted)]",
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
      const typeOffset =
        !desktopRail
          ? 0
          : leftDock === 0
            ? Math.round(rect.bottom + 12)
            : 12;

      tokenRoot.style.setProperty("--lab-control-bar-bottom", `${typeOffset}px`);
      tokenRoot.style.setProperty("--lab-control-type-offset", `${typeOffset}px`);
      /* Desktop pins the left rail. Mobile open dock is in document flow
         under the fold — never shrink the first screen with dock-bottom. */
      if (leftDock > 0) {
        tokenRoot.style.setProperty("--lab-control-dock-left", `${leftDock}px`);
        tokenRoot.style.setProperty("--lab-control-dock-top", "0px");
        tokenRoot.style.setProperty("--lab-control-dock-bottom", "0px");
      } else {
        tokenRoot.style.removeProperty("--lab-control-dock-left");
        tokenRoot.style.removeProperty("--lab-control-dock-top");
        tokenRoot.style.removeProperty("--lab-control-dock-bottom");
      }

      const ancestorScale = cumulativeAncestorScale(node);
      if (Math.abs(ancestorScale - 1) > 0.02) {
        node.style.zoom = String(1 / ancestorScale);
      } else {
        node.style.removeProperty("zoom");
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
      node.style.removeProperty("zoom");
    };
  }, []);

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Demo controls"
      className={cn(
        /* Opaque strip — never a glass overlay/scrim over the product field.
           Desktop: fixed. Mobile collapsed: fixed chip. Mobile open: in-flow
           (max-sm:relative on lab-dock-open) so knobs sit under the fold. */
        "demo-control-bar z-[60] flex flex-wrap items-center gap-3 border border-[var(--lab-border)] bg-[var(--lab-bg)] p-2 sm:fixed",
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
          "absolute left-0 block h-0.5 w-4 rounded-full bg-current motion-reduce:transition-none",
          open ? "top-1.5 rotate-45" : "top-0",
        )}
        style={{
          transitionDuration: "150ms",
          transitionProperty: "transform, top",
          transitionTimingFunction: LAB_EASE,
        }}
      />
      <span
        className={cn(
          "absolute left-0 top-1.5 block h-0.5 w-4 rounded-full bg-current motion-reduce:transition-none",
          open && "opacity-0",
        )}
        style={{
          transitionDuration: "150ms",
          transitionProperty: "opacity",
          transitionTimingFunction: LAB_EASE,
        }}
      />
      <span
        className={cn(
          "absolute left-0 block h-0.5 w-4 rounded-full bg-current motion-reduce:transition-none",
          open ? "top-1.5 -rotate-45" : "top-3",
        )}
        style={{
          transitionDuration: "150ms",
          transitionProperty: "transform, top",
          transitionTimingFunction: LAB_EASE,
        }}
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

/** Collapsible demo controls. Collapsed: small toggle. Open: left rail from sm
 *  up; on small screens knobs sit in document flow under the fold (scroll).
 *  Opaque strip — not a sheet, sticky footer, or dim overlay.
 *  One menu toggle, always in this bar — never a second control on the field. */
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
              "lab-dock-open flex-nowrap w-full max-w-none rounded-none border-x-0 border-b-0 p-3 max-sm:relative max-sm:inset-auto max-sm:right-auto max-sm:max-h-none",
              "sm:fixed sm:left-0 sm:top-0 sm:right-auto sm:h-dvh sm:max-h-none sm:w-[min(20.5rem,38vw)] sm:max-w-[20.5rem] sm:rounded-none sm:border-b-0 sm:border-l-0 sm:border-r sm:border-t-0",
            ]
          : "fixed left-2 top-2 right-auto w-max max-w-none gap-0 p-1 sm:left-4 sm:top-4",
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
        className="self-start"
      >
        <DemoMenuIcon open={open} />
      </LabButton>
      {open ? (
        <div
          id={panelId}
          className="flex flex-col gap-3 max-sm:overflow-visible sm:min-h-0 sm:flex-1 sm:overflow-y-auto sm:overscroll-contain"
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
      <p className="lab-type-caption lab-muted mt-3 text-center">
        Frame {width}×{height} · scale {(scale * 100).toFixed(0)}%
      </p>
    </div>
  );
}

/** @deprecated Use DemoBackButton in Maser-Lab demos */
export function LegacyDemoBackButton({ className }: DemoBackButtonProps) {
  return (
    <Link href="/" className={cn("lab-back-link lab-type-label", className)}>
      Lab
    </Link>
  );
}
